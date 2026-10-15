import NativeLoteriaAudio from '../specs/NativeLoteriaAudio';

/** Tiempo estimado de lectura cuando no hay voz nativa disponible (iOS, pruebas). */
function duracionEstimada(texto: string): number {
  return Math.min(6000, 500 + texto.length * 70);
}

function esperar(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const Audio = {
  disponible: NativeLoteriaAudio != null,

  /**
   * Dice un texto. Si se indica `clip` y ese audio grabado existe en la app, se reproduce el audio
   * (funciona en cualquier equipo, p. ej. Fire TV). Si no, se usa la voz del sistema (TTS).
   */
  async hablar(texto: string, velocidad: number, refuerzo: number, clip?: string): Promise<void> {
    if (!NativeLoteriaAudio) {
      return esperar(duracionEstimada(texto));
    }
    if (clip) {
      try {
        if (await NativeLoteriaAudio.playClip(clip, velocidad, refuerzo)) {
          return;
        }
      } catch {
        // si falla el audio grabado, se intenta con la voz del sistema
      }
    }
    try {
      await NativeLoteriaAudio.speak(texto, velocidad, refuerzo);
    } catch {
      // Si la voz falla, al menos respetamos un tiempo para que se vea la carta.
      await esperar(duracionEstimada(texto));
    }
  },

  detener(): void {
    NativeLoteriaAudio?.stop();
  },

  volumenAlMaximo(): void {
    NativeLoteriaAudio?.setMaxVolume();
  },

  pantallaEncendida(encendida: boolean): void {
    NativeLoteriaAudio?.setKeepScreenOn(encendida);
  },

  async cargarAjustes(): Promise<string> {
    if (!NativeLoteriaAudio) {
      return '';
    }
    try {
      return await NativeLoteriaAudio.loadSettings();
    } catch {
      return '';
    }
  },

  guardarAjustes(json: string): void {
    NativeLoteriaAudio?.saveSettings(json);
  },
};

/** Nombre del audio grabado de una carta: carta_07 o verso_07. */
export function clipDeCarta(numero: number, conVerso: boolean): string {
  return `${conVerso ? 'verso' : 'carta'}_${String(numero).padStart(2, '0')}`;
}
