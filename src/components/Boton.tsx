import React, { useState } from 'react';
import { Platform, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

export const ES_TV = Platform.isTV;

interface Props {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  /** En TV: este botón recibe el foco del control remoto al aparecer. */
  focoInicial?: boolean;
  accessibilityLabel?: string;
  children: React.ReactNode;
}

/**
 * Botón que funciona con toque (teléfono) y con el control remoto (Android TV):
 * cuando tiene el foco del control se marca con un borde dorado y se agranda un poco.
 */
export function Boton({ onPress, style, disabled, focoInicial, accessibilityLabel, children }: Props) {
  const [enfocado, setEnfocado] = useState(false);
  // `hasTVPreferredFocus` lo entiende la vista nativa de Android; se pasa sin tipar.
  const propsTV = ES_TV && focoInicial ? ({ hasTVPreferredFocus: true } as object) : {};

  return (
    <Pressable
      {...propsTV}
      onPress={onPress}
      disabled={disabled}
      focusable={!disabled}
      onFocus={() => setEnfocado(true)}
      onBlur={() => setEnfocado(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        style,
        enfocado && styles.enfocado,
        pressed && styles.presionado,
        disabled && styles.deshabilitado,
      ]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 3,
    borderColor: 'transparent',
  },
  enfocado: {
    borderColor: '#F6C445',
    transform: [{ scale: 1.06 }],
    elevation: 8,
  },
  presionado: {
    opacity: 0.7,
  },
  deshabilitado: {
    opacity: 0.4,
  },
});
