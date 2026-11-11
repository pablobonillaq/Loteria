# Lotería 🎴

[Español](README.md) | **English**

A **Mexican Lotería** app for Android (phone and Android TV / Fire TV). It draws the 54 cards in random order, calls each one out as loud as possible and shows the current card full size.

> Lotería is a traditional Mexican game similar to bingo, played with picture cards instead of numbers. The app itself is in Spanish.

## Features

On phones, the main menu has two modes:

- **Echar cartas** (call the cards): the app calls out the cards (described below).
- **Jugar** (play): your phone becomes a 4 x 4 game board. Choose **Aleatorio** (16 random cards, with the option to get another board) or **Elegir cartas** (pick 16 of the 54). Tap cards to place a marker; when all 16 are marked, **¡Lotería!!** appears with the options *Jugar de nuevo* (play again) or *Elegir nuevas cartas* (pick new cards).

On Android TV the app opens straight into *Echar cartas*.

### Calling the cards

- **Play / Pause / Resume**: calls each card, then waits the configured number of seconds before the next one. When you resume after a pause, it repeats the current card in case someone missed it.
- **Large current card**, a `12 / 54` counter and a progress bar until the next card.
- **Last 5 cards** drawn.
- **Restart**: reshuffles the deck and starts over.
- **Loud voice**: sets the device volume to 100% and adds an optional extra volume boost (`LoudnessEnhancer`).
- Optional **traditional verses** before each card's name.
- **Android TV / Fire TV**: landscape layout, works with the remote's D-pad, and the remote's Play/Pause buttons work too.
- The screen stays on while a game is running.

### Settings

| Setting (in the app) | Description |
|---|---|
| Segundos entre cartas | Seconds between cards: 1 to 30 (default 3) |
| Decir el verso | Say the traditional verse before the card's name |
| Velocidad de la voz | Voice speed: 0.6 to 1.5 |
| Volumen al máximo | Set the device volume to 100% when pressing Play |
| Refuerzo de volumen | Volume boost: Off / Low / Medium / High |

## How audio works

1. **Recorded audio (recommended)**: `scripts/generar-audios.ps1` records the 54 cards, their verses and the start/end phrases using a Spanish voice installed on Windows. It saves them to `android/app/src/main/res/raw/` as normalized `.wav` files, which are bundled into the APK. This way the app works on any device, including Fire TV.
2. **System voice (fallback)**: if a recording is missing, the app uses Android's Spanish Text-to-Speech engine.

> The `.wav` files are in `.gitignore`. They are generated automatically when you run `generar-apk.bat`.

## Requirements

- Windows (to generate the audio and run `generar-apk.bat`)
- [Node.js](https://nodejs.org) 22.11 or newer
- JDK 17 and the Android SDK (easiest via [Android Studio](https://developer.android.com/studio))
- A Spanish voice on Windows: *Settings → Time & language → Speech → Add voices → Spanish (Mexico)*

## Building the APK

Double-click **`generar-apk.bat`**. The script:

1. Generates any missing audio files (`scripts/generar-audios.ps1`).
2. Runs `npm install`.
3. Builds the release APK (`gradlew assembleRelease`, for `arm64-v8a` and `armeabi-v7a`).
4. Saves the result as **`Loteria.apk`** in the project root.

When it finishes you should see `LISTO: ...\Loteria.apk`. Check that the file's date is today before installing it.

> The APK is signed with the debug key (`debug.keystore`). It's fine for installing on your own devices, but not for publishing on Google Play.

### Installing

- **Phone**: copy `Loteria.apk` to the phone and open it (allow *install unknown apps*).
- **Fire TV / Android TV**: enable *Developer options → Apps from unknown sources* and run `adb install -r Loteria.apk`, or use an app such as *Downloader* or *Send Files to TV*.

### Audio commands

```powershell
# List installed voices
powershell -ExecutionPolicy Bypass -File scripts\generar-audios.ps1 -Listar

# Regenerate all audio files with a specific voice
powershell -ExecutionPolicy Bypass -File scripts\generar-audios.ps1 -Voz Sabina -Forzar
```

If you change card names or verses in `src/data/cartas.ts`, regenerate the audio with `-Forzar`.

## Development

```bash
npm install
npm start            # Metro
npm run android      # install on an emulator or connected device
```

## Project structure

```
App.tsx                         Main screen + settings modal
src/
  data/cartas.ts                The 54 cards (number, name, verse, image) and shuffling
  assets/cartas/                Images of the 54 cards
  screens/InicioScreen.tsx      Menu (phone): Echar cartas / Jugar → Aleatorio or Elegir cartas
  screens/JuegoScreen.tsx       Card caller: card loop, Play/Pause/Restart, phone and TV layouts
  screens/TablaAleatoriaScreen.tsx  Random 16-card board
  screens/ElegirCartasScreen.tsx    Pick 16 of the 54 cards
  screens/TableroScreen.tsx     Board to mark with markers and the ¡Lotería! message
  components/TablaCartas.tsx    Card grid with markers
  screens/ConfiguracionScreen.tsx  Settings screen
  components/CartaVista.tsx     Card drawing
  components/Boton.tsx          Touch button with remote-control focus support
  audio.ts                      Recorded audio → TTS fallback
  ajustes.ts                    Persistent settings
specs/NativeLoteriaAudio.ts     Turbo Module spec (codegen)
android/app/src/main/java/com/loteria/
  NativeLoteriaAudioModule.kt   Audio (MediaPlayer + TTS), volume boost, max volume,
                                keep screen on and settings (SharedPreferences)
  MainActivity.kt               Orientation (portrait on phones) and remote media buttons
scripts/generar-audios.ps1      Records the audio with a Windows voice
generar-apk.bat                 Builds the APK end to end
```

## Notes

- **Card images**: stored in `src/assets/cartas/` (`01_el_gallo.jpg` … `54_la_rana.jpg`), resized to 640 px wide. The high-resolution originals live in `originales/cartas/`, which is not committed.
- **iOS**: the app opens, but the audio module is only implemented for Android.
- **No sound?** Set *Refuerzo de volumen* (volume boost) to *Apagado* (off), since some devices don't support the effect, and check that the `.wav` files exist in `android/app/src/main/res/raw/`.
