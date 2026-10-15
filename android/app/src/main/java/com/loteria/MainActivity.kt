package com.loteria

import android.app.UiModeManager
import android.content.Context
import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.os.Bundle
import android.view.KeyEvent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Loteria"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    // En teléfono: siempre vertical. En Android TV: se deja horizontal.
    if (!esTV()) {
      requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
    }
    super.onCreate(savedInstanceState)
  }

  private fun esTV(): Boolean {
    val uiMode = getSystemService(Context.UI_MODE_SERVICE) as UiModeManager
    return uiMode.currentModeType == Configuration.UI_MODE_TYPE_TELEVISION
  }

  /** Botones Play/Pausa del control remoto (o de audífonos/teclado) → se avisan a JavaScript. */
  override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
    val tecla =
        when (keyCode) {
          KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE,
          KeyEvent.KEYCODE_HEADSETHOOK -> "playpausa"
          KeyEvent.KEYCODE_MEDIA_PLAY -> "play"
          KeyEvent.KEYCODE_MEDIA_PAUSE,
          KeyEvent.KEYCODE_MEDIA_STOP -> "pausa"
          else -> null
        }
    if (tecla != null) {
      val contexto = (application as MainApplication).reactHost.currentReactContext
      if (contexto != null) {
        contexto.emitDeviceEvent("loteriaTeclaMedia", tecla)
        return true
      }
    }
    return super.onKeyUp(keyCode, event)
  }

  override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
    // Consumimos también el "down" de las teclas multimedia para que el sistema no las procese dos veces.
    return when (keyCode) {
      KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE,
      KeyEvent.KEYCODE_HEADSETHOOK,
      KeyEvent.KEYCODE_MEDIA_PLAY,
      KeyEvent.KEYCODE_MEDIA_PAUSE,
      KeyEvent.KEYCODE_MEDIA_STOP -> true
      else -> super.onKeyDown(keyCode, event)
    }
  }
}
