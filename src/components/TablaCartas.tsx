import React, { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { cartaPorNumero } from '../data/cartas';
import { COLORES } from '../tema';
import { CartaVista, PROPORCION_CARTA } from './CartaVista';

interface Props {
  /** Números de carta, en el orden en que se acomodan (renglón por renglón). */
  cartas: number[];
  columnas?: number;
  /** Cartas marcadas con ficha (mismo orden que `cartas`). */
  marcadas?: boolean[];
  onPressCarta?: (indice: number) => void;
}

const GAP = 6;

/** Tabla de lotería: acomoda las cartas en una cuadrícula lo más grande que quepa en el espacio disponible. */
export function TablaCartas({
  cartas,
  columnas = 4,
  marcadas,
  onPressCarta,
}: Props) {
  const [area, setArea] = useState({ ancho: 0, alto: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea({ ancho: width, alto: height });
  };

  const filas = Math.ceil(cartas.length / columnas);
  const porAncho = (area.ancho - GAP * (columnas - 1)) / columnas;
  const porAlto = ((area.alto - GAP * (filas - 1)) / filas) * PROPORCION_CARTA;
  const ancho = Math.floor(Math.min(porAncho, porAlto));

  return (
    <View style={styles.area} onLayout={onLayout}>
      {ancho > 0 &&
        Array.from({ length: filas }).map((_, f) => (
          <View key={f} style={[styles.fila, f > 0 && { marginTop: GAP }]}>
            {cartas.slice(f * columnas, (f + 1) * columnas).map((numero, c) => {
              const indice = f * columnas + c;
              const marcada = marcadas?.[indice] ?? false;
              return (
                <Pressable
                  key={numero}
                  disabled={!onPressCarta}
                  onPress={() => onPressCarta?.(indice)}
                  accessibilityState={{ checked: marcada }}
                  style={({ pressed }) => [
                    c > 0 && { marginLeft: GAP },
                    pressed && styles.presionada,
                  ]}
                >
                  <CartaVista carta={cartaPorNumero(numero)} ancho={ancho} />
                  {marcada && <Ficha ancho={ancho} />}
                </Pressable>
              );
            })}
          </View>
        ))}
    </View>
  );
}

/** Ficha (frijolito) que marca una carta. */
function Ficha({ ancho }: { ancho: number }) {
  const d = ancho * 0.55;
  return (
    <View style={styles.velo} pointerEvents="none">
      <View
        style={[
          styles.ficha,
          {
            width: d,
            height: d,
            borderRadius: d / 2,
            borderWidth: Math.max(2, d * 0.07),
          },
        ]}
      >
        <View
          style={[
            styles.brillo,
            { width: d * 0.28, height: d * 0.18, borderRadius: d * 0.1 },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fila: {
    flexDirection: 'row',
  },
  presionada: {
    opacity: 0.8,
  },
  velo: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ficha: {
    backgroundColor: '#8B4A1F',
    borderColor: COLORES.tinta,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '14%',
  },
  brillo: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    transform: [{ rotate: '-30deg' }],
  },
});
