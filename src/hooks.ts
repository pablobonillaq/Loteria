import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

/** Ejecuta `accion` cuando se presiona el botón "Atrás" de Android (y evita que se cierre la app). */
export function useAtras(accion: () => void) {
  const ref = useRef(accion);
  ref.current = accion;
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      ref.current();
      return true;
    });
    return () => sub.remove();
  }, []);
}
