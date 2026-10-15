package com.loteria

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.audiofx.LoudnessEnhancer
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.view.WindowManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.loteria.specs.NativeLoteriaAudioSpec
import java.util.Locale
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

/**
 * Voz (TTS) lo más fuerte posible, volumen al máximo, pantalla encendida y ajustes persistentes.
 * Todo lo relacionado con TextToSpeech se ejecuta en el hilo principal para evitar condiciones de carrera.
 */
class NativeLoteriaAudioModule(reactContext: ReactApplicationContext) :
    NativeLoteriaAudioSpec(reactContext), TextToSpeech.OnInitListener {

  private val main = Handler(Looper.getMainLooper())
  private val promesas = ConcurrentHashMap<String, Promise>()
  private val pendientes = mutableListOf<() -> Unit>()

  private var tts: TextToSpeech? = null
  private var ttsListo = false
  private var ttsFallo = false

  private var reproductor: MediaPlayer? = null
  private var promesaClip: Promise? = null

  private var refuerzo: LoudnessEnhancer? = null
  private var sesionAudio: Int = 0

  private val audioManager: AudioManager by lazy {
    reactApplicationContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
  }

  private val prefs by lazy {
    reactApplicationContext.getSharedPreferences("loteria", Context.MODE_PRIVATE)
  }

  override fun getName(): String = NAME

  // ---------- TTS ----------

  private fun conTts(accion: () -> Unit) {
    main.post {
      when {
        ttsListo -> accion()
        ttsFallo -> accion() // la acción detecta que no hay TTS y rechaza la promesa
        else -> {
          pendientes.add(accion)
          if (tts == null) {
            tts = TextToSpeech(reactApplicationContext, this)
          }
        }
      }
    }
  }

  override fun onInit(status: Int) {
    main.post {
      val motor = tts
      if (status == TextToSpeech.SUCCESS && motor != null) {
        configurar(motor)
        ttsListo = true
      } else {
        ttsFallo = true
        motor?.shutdown()
        tts = null
      }
      val acciones = pendientes.toList()
      pendientes.clear()
      acciones.forEach { it() }
    }
  }

  private fun configurar(motor: TextToSpeech) {
    // Español de México de preferencia; si no, cualquier español disponible.
    val idiomas = listOf("es-MX", "es-US", "es-419", "es-ES", "es")
    for (etiqueta in idiomas) {
      val locale = Locale.forLanguageTag(etiqueta)
      if (motor.isLanguageAvailable(locale) >= TextToSpeech.LANG_AVAILABLE) {
        motor.language = locale
        break
      }
    }

    motor.setAudioAttributes(
        AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
            .build())

    motor.setOnUtteranceProgressListener(
        object : UtteranceProgressListener() {
          override fun onStart(utteranceId: String?) {}

          override fun onDone(utteranceId: String?) = terminar(utteranceId)

          @Deprecated("Deprecated in Java")
          override fun onError(utteranceId: String?) = terminar(utteranceId)

          override fun onError(utteranceId: String?, errorCode: Int) = terminar(utteranceId)

          override fun onStop(utteranceId: String?, interrupted: Boolean) = terminar(utteranceId)
        })
  }

  private fun terminar(utteranceId: String?) {
    if (utteranceId != null) {
      promesas.remove(utteranceId)?.resolve(null)
    }
  }

  /**
   * Prepara el LoudnessEnhancer (refuerzo por encima del 100%) y devuelve la sesión de audio a la que
   * hay que conectar la voz, o null si no hay refuerzo o el teléfono/TV no lo soporta.
   */
  private fun sesionConRefuerzo(milibeles: Int): Int? {
    if (milibeles <= 0) {
      refuerzo?.enabled = false
      return null
    }
    return try {
      if (refuerzo == null) {
        sesionAudio = audioManager.generateAudioSessionId()
        refuerzo = LoudnessEnhancer(sesionAudio)
      }
      refuerzo?.setTargetGain(milibeles)
      refuerzo?.enabled = true
      sesionAudio
    } catch (e: Exception) {
      // Algunos equipos no soportan el efecto: se reproduce sin refuerzo.
      refuerzo?.release()
      refuerzo = null
      null
    }
  }

  private fun aplicarRefuerzo(milibeles: Int, params: Bundle) {
    sesionConRefuerzo(milibeles)?.let { params.putInt(TextToSpeech.Engine.KEY_PARAM_SESSION_ID, it) }
  }

  // ---------- Audios grabados (res/raw) ----------

  /** Detiene el audio grabado que esté sonando y resuelve su promesa. */
  private fun liberarReproductor() {
    reproductor?.let {
      try {
        it.stop()
      } catch (_: Exception) {}
      it.release()
    }
    reproductor = null
    promesaClip?.resolve(true)
    promesaClip = null
  }

  override fun playClip(name: String, rate: Double, boostMillibels: Double, promise: Promise) {
    main.post {
      val ctx = reactApplicationContext
      val recurso = ctx.resources.getIdentifier(name, "raw", ctx.packageName)
      if (recurso == 0) {
        promise.resolve(false) // no existe el audio: JS usará la voz del sistema
        return@post
      }
      liberarReproductor()
      tts?.stop()
      val mp = MediaPlayer()
      try {
        mp.setAudioAttributes(
            AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build())
        sesionConRefuerzo(boostMillibels.toInt())?.let { mp.audioSessionId = it }
        ctx.resources.openRawResourceFd(recurso).use { afd ->
          mp.setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
        }
        mp.setVolume(1f, 1f)
        mp.setOnCompletionListener {
          if (reproductor === mp) {
            liberarReproductor()
          }
        }
        mp.setOnErrorListener { _, _, _ ->
          if (reproductor === mp) {
            liberarReproductor()
          }
          true
        }
        mp.prepare()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && rate != 1.0) {
          try {
            mp.playbackParams = mp.playbackParams.setSpeed(rate.toFloat())
          } catch (_: Exception) {}
        }
        reproductor = mp
        promesaClip = promise
        mp.start()
      } catch (e: Exception) {
        if (reproductor === mp) {
          reproductor = null
          promesaClip = null
        }
        mp.release()
        promise.resolve(false)
      }
    }
  }

  override fun speak(text: String, rate: Double, boostMillibels: Double, promise: Promise) {
    conTts {
      val motor = tts
      if (motor == null) {
        promise.reject("TTS_NO_DISPONIBLE", "No hay motor de voz disponible en este teléfono")
        return@conTts
      }
      liberarReproductor()
      motor.setSpeechRate(rate.toFloat())
      val params = Bundle()
      params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1.0f)
      aplicarRefuerzo(boostMillibels.toInt(), params)

      val id = UUID.randomUUID().toString()
      promesas[id] = promise
      // QUEUE_FLUSH: si había algo hablando, se corta (y su promesa se resuelve vía onStop).
      val resultado = motor.speak(text, TextToSpeech.QUEUE_FLUSH, params, id)
      if (resultado != TextToSpeech.SUCCESS) {
        promesas.remove(id)
        promise.reject("TTS_ERROR", "No se pudo reproducir la voz")
      }
    }
  }

  override fun stop() {
    main.post {
      liberarReproductor()
      tts?.stop()
      val abiertas = promesas.keys.toList()
      abiertas.forEach { terminar(it) }
    }
  }

  // ---------- Volumen y pantalla ----------

  override fun setMaxVolume() {
    try {
      val max = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
      audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, max, AudioManager.FLAG_SHOW_UI)
    } catch (e: Exception) {
      // p. ej. modo No molestar: se ignora.
    }
  }

  override fun setKeepScreenOn(on: Boolean) {
    val actividad = reactApplicationContext.currentActivity ?: return
    actividad.runOnUiThread {
      if (on) {
        actividad.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
      } else {
        actividad.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
      }
    }
  }

  // ---------- Ajustes ----------

  override fun loadSettings(promise: Promise) {
    promise.resolve(prefs.getString(CLAVE_AJUSTES, "") ?: "")
  }

  override fun saveSettings(json: String) {
    prefs.edit().putString(CLAVE_AJUSTES, json).apply()
  }

  override fun invalidate() {
    super.invalidate()
    main.post {
      liberarReproductor()
      tts?.stop()
      tts?.shutdown()
      tts = null
      ttsListo = false
      refuerzo?.release()
      refuerzo = null
      promesas.values.forEach { it.resolve(null) }
      promesas.clear()
    }
  }

  companion object {
    const val NAME = "NativeLoteriaAudio"
    private const val CLAVE_AJUSTES = "ajustes"
  }
}
