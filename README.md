# Lotería 🎴

**Español** | [English](README.en.md)

App de **Lotería mexicana** para Android (teléfono y Android TV / Fire TV) que "echa" las 54 cartas en orden aleatorio, las canta en voz alta lo más fuerte posible y muestra la carta en grande.

## Funciones

- **Play / Pausa / Continuar**: canta cada carta y espera los segundos configurados antes de la siguiente. Al continuar después de una pausa, repite la carta actual por si alguien no la escuchó.
- **Carta en grande**, contador `12 / 54` y barra de tiempo para la siguiente carta.
- **Últimas 5 cartas** que salieron.
- **Reiniciar**: baraja de nuevo y empieza desde cero.
- **Voz fuerte**: sube el volumen del equipo al 100% y tiene un refuerzo extra de volumen (`LoudnessEnhancer`).
- **Versos tradicionales** opcionales antes del nombre de la carta.
- **Android TV / Fire TV**: pantalla horizontal, se usa con el control remoto (D-pad) y los botones Play/Pausa del control funcionan.
- La pantalla no se apaga mientras se juega.

### Configuración

| Opción | Descripción |
|---|---|
| Segundos entre cartas | 1 a 30 s (3 s por defecto) |
| Decir el verso | Canta el verso tradicional antes del nombre |
| Velocidad de la voz | 0.6 a 1.5 |
| Volumen al máximo | Sube el volumen del equipo al presionar Play |
| Refuerzo de volumen | Apagado / Bajo / Medio / Alto |

## Cómo funciona el audio

1. **Audios grabados (recomendado)**: `scripts/generar-audios.ps1` graba las 54 cartas, sus versos y las frases de inicio y fin con una voz en español instalada en Windows. Los guarda en `android/app/src/main/res/raw/` como `.wav` normalizados y van dentro del APK. Así la app suena en cualquier equipo, incluido el Fire TV.
2. **Voz del sistema (respaldo)**: si un audio no existe, la app usa el motor Text-to-Speech de Android en español.

> Los `.wav` están en `.gitignore`. Se generan solos al ejecutar `generar-apk.bat`.

## Requisitos

- Windows (para generar los audios y usar `generar-apk.bat`)
- [Node.js](https://nodejs.org) 22.11 o superior
- JDK 17 y Android SDK (lo más fácil es instalar [Android Studio](https://developer.android.com/studio))
- Una voz en español en Windows: *Configuración → Hora e idioma → Voz → Agregar voces → Español (México)*

## Generar el APK

Doble clic en **`generar-apk.bat`**. El script:

1. Genera los audios que falten (`scripts/generar-audios.ps1`).
2. Ejecuta `npm install`.
3. Compila el APK release (`gradlew assembleRelease`, para `arm64-v8a` y `armeabi-v7a`).
4. Deja el resultado en **`Loteria.apk`**, en la raíz del proyecto.

Al terminar debe aparecer `LISTO: ...\Loteria.apk`. Revisa que la fecha del archivo sea la de hoy antes de instalarlo.

> El APK se firma con la llave de depuración (`debug.keystore`). Sirve para instalarlo en tus equipos, pero no para publicarlo en Google Play.

### Instalar

- **Teléfono**: copia `Loteria.apk` al teléfono y ábrelo (permite *instalar apps de origen desconocido*).
- **Fire TV / Android TV**: activa *Opciones de desarrollador → Apps de origen desconocido* y usa `adb install -r Loteria.apk`, o una app como *Downloader* o *Send Files to TV*.

### Audios: comandos útiles

```powershell
# Ver las voces instaladas
powershell -ExecutionPolicy Bypass -File scripts\generar-audios.ps1 -Listar

# Regenerar todos los audios con una voz específica
powershell -ExecutionPolicy Bypass -File scripts\generar-audios.ps1 -Voz Sabina -Forzar
```

Si cambias nombres o versos en `src/data/cartas.ts`, vuelve a generar los audios con `-Forzar`.

## Desarrollo

```bash
npm install
npm start            # Metro
npm run android      # instala en un emulador o dispositivo conectado
```

## Estructura

```
App.tsx                         Pantalla principal + modal de configuración
src/
  data/cartas.ts                Las 54 cartas (número, nombre, ícono, verso) y el barajado
  screens/JuegoScreen.tsx       Juego: ciclo de cartas, Play/Pausa/Reiniciar, layout teléfono y TV
  screens/ConfiguracionScreen.tsx
  components/CartaVista.tsx     Dibujo de la carta
  components/Boton.tsx          Botón táctil con foco para control remoto
  audio.ts                      Audio grabado → TTS de respaldo
  ajustes.ts                    Ajustes persistentes
specs/NativeLoteriaAudio.ts     Especificación del Turbo Module (codegen)
android/app/src/main/java/com/loteria/
  NativeLoteriaAudioModule.kt   Audio (MediaPlayer + TTS), refuerzo de volumen, volumen máximo,
                                pantalla encendida y ajustes (SharedPreferences)
  MainActivity.kt               Orientación (vertical en teléfono) y botones multimedia del control
scripts/generar-audios.ps1      Graba los audios con la voz de Windows
generar-apk.bat                 Compila el APK de principio a fin
```

## Notas

- **Emojis**: las cartas usan emojis de Unicode 11 o anteriores, porque el Fire TV no muestra los más nuevos.
- **iOS**: la app abre, pero el módulo de audio solo está implementado para Android.
- **Si no se escucha**: pon el *Refuerzo de volumen* en *Apagado* (algunos equipos no soportan el efecto) y revisa que existan los `.wav` en `android/app/src/main/res/raw/`.
- Los dibujos de las cartas son un diseño propio con emojis; no usan las ilustraciones de la Lotería tradicional.
