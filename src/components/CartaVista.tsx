import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { Carta } from '../data/cartas';

/** Proporción ancho / alto de una carta de lotería (con su marco blanco). */
export const PROPORCION_CARTA = 0.62;

/** Proporción de las imágenes de src/assets/cartas (1292 x 2048). */
const PROPORCION_IMAGEN = 1292 / 2048;

interface Props {
  carta: Carta | null;
  ancho: number;
}

/** Dibuja una carta con su imagen. Si `carta` es null, dibuja el reverso. */
export function CartaVista({ carta, ancho }: Props) {
  const alto = ancho / PROPORCION_CARTA;
  const radio = ancho * 0.05;

  if (!carta) {
    const borde = Math.max(2, ancho * 0.03);
    return (
      <View
        style={[
          styles.carta,
          styles.reverso,
          {
            width: ancho,
            height: alto,
            borderWidth: borde,
            borderRadius: radio,
          },
        ]}
      >
        <View
          style={[
            styles.reversoInterior,
            { borderRadius: radio * 0.7, borderWidth: Math.max(1, borde / 2) },
          ]}
        >
          <Text
            style={[styles.reversoTexto, { fontSize: ancho * 0.16 }]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            LOTERÍA
          </Text>
          <Text style={{ fontSize: ancho * 0.3 }}>🎴</Text>
        </View>
      </View>
    );
  }

  // Marco blanco: los márgenes se calculan para que la imagen conserve su proporción exacta.
  const borde = Math.max(1, ancho * 0.012);
  const margenH = ancho * 0.035;
  const altoImagen = (ancho - 2 * borde - 2 * margenH) / PROPORCION_IMAGEN;
  const margenV = Math.max(margenH, (alto - 2 * borde - altoImagen) / 2);

  return (
    <View
      style={[
        styles.carta,
        {
          width: ancho,
          height: alto,
          borderRadius: radio,
          borderWidth: borde,
          paddingHorizontal: margenH,
          paddingVertical: margenV,
        },
      ]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${carta.numero}, ${carta.nombre}`}
    >
      <Image
        source={carta.imagen}
        style={[styles.imagen, { borderRadius: radio * 0.4 }]}
        resizeMode="cover"
        fadeDuration={0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  carta: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2B1B12',
    overflow: 'hidden',
  },
  imagen: {
    flex: 1,
    width: '100%',
  },
  reverso: {
    backgroundColor: '#B3202A',
    padding: '6%',
  },
  reversoInterior: {
    flex: 1,
    borderColor: '#F6C445',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: '4%',
  },
  reversoTexto: {
    color: '#F6C445',
    fontWeight: '900',
    letterSpacing: 2,
  },
});
