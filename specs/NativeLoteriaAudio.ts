import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Módulo nativo (Android) que:
 *  - Reproduce los audios grabados de cada carta (o, si no existen, usa la voz del sistema - TTS)
 *    al máximo volumen posible.
 *  - Sube el volumen multimedia del teléfono al máximo.
 *  - Mantiene la pantalla encendida mientras se juega.
 *  - Guarda la configuración de la app.
 */
export interface Spec extends TurboModule {
  /** Se resuelve cuando la voz termina (o se detiene). boostMillibels: refuerzo extra de volumen (0 = sin refuerzo). */
  speak(text: string, rate: number, boostMillibels: number): Promise<void>;
  /**
   * Reproduce un audio grabado incluido en la app (android/app/src/main/res/raw/<name>.wav).
   * Se resuelve con true al terminar, o con false si ese audio no existe.
   */
  playClip(name: string, rate: number, boostMillibels: number): Promise<boolean>;
  stop(): void;
  setMaxVolume(): void;
  setKeepScreenOn(on: boolean): void;
  loadSettings(): Promise<string>;
  saveSettings(json: string): void;
}

// `get` (y no `getEnforcing`) para que la app no truene en iOS o en pruebas donde el módulo no existe.
export default TurboModuleRegistry.get<Spec>('NativeLoteriaAudio');
