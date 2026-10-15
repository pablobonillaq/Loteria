import { useCallback, useEffect, useState } from 'react';
import { Audio } from './audio';

export interface Ajustes {
  /** Segundos de espera después de cantar cada carta. */
  segundos: number;
  /** Velocidad de la voz (1 = normal). */
  velocidad: number;
  /** Decir el verso tradicional antes del nombre de la carta. */
  decirVerso: boolean;
  /** Subir el volumen del teléfono al 100% al presionar Play. */
  volumenMaximo: boolean;
  /** Nivel de refuerzo extra de volumen (0 = apagado). */
  refuerzo: number;
}

export const AJUSTES_INICIALES: Ajustes = {
  segundos: 3,
  velocidad: 1,
  decirVerso: false,
  volumenMaximo: true,
  refuerzo: 2,
};

export const LIMITES = {
  segundos: { min: 1, max: 30, paso: 1 },
  velocidad: { min: 0.6, max: 1.5, paso: 0.1 },
};

/** Niveles de refuerzo → ganancia en milibeles para el LoudnessEnhancer de Android. */
export const NIVELES_REFUERZO = [
  { etiqueta: 'Apagado', milibeles: 0 },
  { etiqueta: 'Bajo', milibeles: 600 },
  { etiqueta: 'Medio', milibeles: 1200 },
  { etiqueta: 'Alto', milibeles: 2000 },
];

export function milibelesDeRefuerzo(nivel: number): number {
  return NIVELES_REFUERZO[nivel]?.milibeles ?? 0;
}

function limitar(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor));
}

function normalizar(datos: Partial<Ajustes>): Ajustes {
  const a = { ...AJUSTES_INICIALES, ...datos };
  return {
    segundos: limitar(Number(a.segundos) || AJUSTES_INICIALES.segundos, LIMITES.segundos.min, LIMITES.segundos.max),
    velocidad: limitar(Number(a.velocidad) || 1, LIMITES.velocidad.min, LIMITES.velocidad.max),
    decirVerso: Boolean(a.decirVerso),
    volumenMaximo: Boolean(a.volumenMaximo),
    refuerzo: limitar(Math.round(Number(a.refuerzo) || 0), 0, NIVELES_REFUERZO.length - 1),
  };
}

/** Ajustes persistentes (se guardan en el teléfono). */
export function useAjustes(): [Ajustes, (cambios: Partial<Ajustes>) => void] {
  const [ajustes, setAjustes] = useState<Ajustes>(AJUSTES_INICIALES);

  useEffect(() => {
    let activo = true;
    Audio.cargarAjustes().then(json => {
      if (!activo || !json) {
        return;
      }
      try {
        setAjustes(normalizar(JSON.parse(json)));
      } catch {
        // Ajustes corruptos: se quedan los iniciales.
      }
    });
    return () => {
      activo = false;
    };
  }, []);

  const actualizar = useCallback((cambios: Partial<Ajustes>) => {
    setAjustes(prev => {
      const nuevos = normalizar({ ...prev, ...cambios });
      Audio.guardarAjustes(JSON.stringify(nuevos));
      return nuevos;
    });
  }, []);

  return [ajustes, actualizar];
}
