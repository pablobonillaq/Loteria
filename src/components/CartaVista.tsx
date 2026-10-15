import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Carta } from '../data/cartas';

/** Proporción ancho / alto de una carta de lotería. */
export const PROPORCION_CARTA = 0.68;

const FONDOS = ['#F6C445', '#7FC8A9', '#F28C8C', '#8DB5F2', '#C9A0DC', '#F5A65B', '#9AD0EC', '#B5D99C'];

interface Props {
  carta: Carta | null;
  ancho: number;
}

/** Dibuja una carta (diseño propio). Si `carta` es null, dibuja el reverso. */
export function CartaVista({ carta, ancho }: Props) {
  const alto = ancho / PROPORCION_CARTA;
  const borde = Math.max(2, ancho * 0.03);
  const radio = ancho * 0.05;

  if (!carta) {
    return (
      <View style={[styles.carta, styles.reverso, { width: ancho, height: alto, borderWidth: borde, borderRadius: radio }]}>
        <View style={[styles.reversoInterior, { borderRadius: radio * 0.7, borderWidth: Math.max(1, borde / 2) }]}>
          <Text style={[styles.reversoTexto, { fontSize: ancho * 0.16 }]} adjustsFontSizeToFit numberOfLines={1}>
            LOTERÍA
          </Text>
          <Text style={{ fontSize: ancho * 0.3 }}>🎴</Text>
        </View>
      </View>
    );
  }

  const fondo = FONDOS[(carta.numero - 1) % FONDOS.length];

  return (
    <View
      style={[styles.carta, { width: ancho, height: alto, borderWidth: borde, borderRadius: radio }]}
      accessible
      accessibilityLabel={`${carta.numero}, ${carta.nombre}`}>
      <View style={[styles.marco, { padding: ancho * 0.04, borderRadius: radio * 0.6 }]}>
        <Text style={[styles.numero, { fontSize: ancho * 0.12 }]}>{carta.numero}</Text>
        <View style={[styles.dibujo, { backgroundColor: fondo, borderRadius: radio * 0.5 }]}>
          <Text style={{ fontSize: ancho * 0.48, lineHeight: ancho * 0.62, textAlign: 'center' }}>
            {carta.icono}
          </Text>
        </View>
        <View style={[styles.nombreCaja, { paddingVertical: ancho * 0.02 }]}>
          <Text
            style={[styles.nombre, { fontSize: ancho * 0.12 }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.4}>
            {carta.nombre.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carta: {
    backgroundColor: '#FFF8E7',
    borderColor: '#2B1B12',
    overflow: 'hidden',
  },
  marco: {
    flex: 1,
  },
  numero: {
    position: 'absolute',
    top: '2%',
    left: '6%',
    zIndex: 2,
    fontWeight: '900',
    color: '#2B1B12',
  },
  dibujo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2B1B12',
  },
  nombreCaja: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nombre: {
    fontWeight: '900',
    color: '#2B1B12',
    letterSpacing: 1,
    textAlign: 'center',
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
