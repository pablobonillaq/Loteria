import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Boton } from '../components/Boton';
import { CartaVista } from '../components/CartaVista';
import { Encabezado } from '../components/Encabezado';
import { CARTAS, CARTAS_POR_TABLA } from '../data/cartas';
import { useAtras } from '../hooks';
import { COLORES } from '../tema';

interface Props {
  onListo: (tabla: number[]) => void;
  onRegresar: () => void;
}

const COLUMNAS = 4;
const GAP = 8;
const PADDING = 12;

/** Muestra las 54 cartas para que el jugador elija las 16 de su tabla (en el orden en que las toca). */
export function ElegirCartasScreen({ onListo, onRegresar }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [elegidas, setElegidas] = useState<number[]>([]);
  const [aviso, setAviso] = useState('');
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  useAtras(onRegresar);
  useEffect(
    () => () => {
      if (temporizador.current) {
        clearTimeout(temporizador.current);
      }
    },
    [],
  );

  const ancho = Math.floor(
    (width - PADDING * 2 - GAP * (COLUMNAS - 1)) / COLUMNAS,
  );
  const completa = elegidas.length === CARTAS_POR_TABLA;

  const mostrarAviso = (texto: string) => {
    setAviso(texto);
    if (temporizador.current) {
      clearTimeout(temporizador.current);
    }
    temporizador.current = setTimeout(() => setAviso(''), 2000);
  };

  const alternar = (numero: number) => {
    if (elegidas.includes(numero)) {
      setElegidas(elegidas.filter(n => n !== numero));
    } else if (completa) {
      mostrarAviso(
        `Ya elegiste ${CARTAS_POR_TABLA} cartas. Toca una elegida para quitarla.`,
      );
    } else {
      setElegidas([...elegidas, numero]);
    }
  };

  return (
    <View style={[styles.pantalla, { paddingTop: insets.top + 8 }]}>
      <View style={styles.relleno}>
        <Encabezado
          titulo="Elige tus cartas"
          onAtras={onRegresar}
          derecha={
            <Text
              style={[styles.contador, completa && styles.contadorCompleto]}
            >
              {elegidas.length} / {CARTAS_POR_TABLA}
            </Text>
          }
        />
      </View>

      <ScrollView contentContainerStyle={styles.cuadricula}>
        {CARTAS.map((carta, i) => {
          const posicion = elegidas.indexOf(carta.numero);
          const elegida = posicion >= 0;
          return (
            <Pressable
              key={carta.numero}
              onPress={() => alternar(carta.numero)}
              accessibilityState={{ selected: elegida }}
              style={[
                styles.celda,
                { width: ancho, marginLeft: i % COLUMNAS === 0 ? 0 : GAP },
                !elegida && completa && styles.atenuada,
              ]}
            >
              <CartaVista carta={carta} ancho={ancho} />
              {elegida && (
                <View style={styles.marcoElegida} pointerEvents="none">
                  <View style={styles.insignia}>
                    <Text style={styles.insigniaTexto}>{posicion + 1}</Text>
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}

      <View style={[styles.barra, { paddingBottom: insets.bottom + 12 }]}>
        <Boton
          onPress={() => setElegidas([])}
          disabled={elegidas.length === 0}
          style={[styles.boton, styles.secundario]}
        >
          <Text style={styles.secundarioTexto}>Limpiar</Text>
        </Boton>
        <Boton
          onPress={() => onListo(elegidas)}
          disabled={!completa}
          style={[styles.boton, styles.principal]}
        >
          <Text style={styles.principalTexto}>
            {completa
              ? '¡Jugar!'
              : `Faltan ${CARTAS_POR_TABLA - elegidas.length}`}
          </Text>
        </Boton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  relleno: {
    paddingHorizontal: PADDING,
  },
  contador: {
    color: COLORES.crema,
    fontSize: 20,
    fontWeight: '800',
  },
  contadorCompleto: {
    color: COLORES.dorado,
  },
  cuadricula: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: PADDING,
    paddingBottom: 16,
  },
  celda: {
    marginBottom: GAP,
  },
  atenuada: {
    opacity: 0.45,
  },
  marcoElegida: {
    ...StyleSheet.absoluteFill,
    borderWidth: 4,
    borderColor: COLORES.dorado,
    borderRadius: 6,
    backgroundColor: 'rgba(246,196,69,0.18)',
  },
  insignia: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 4,
    backgroundColor: COLORES.dorado,
    borderWidth: 2,
    borderColor: COLORES.tinta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insigniaTexto: {
    color: COLORES.tinta,
    fontWeight: '900',
    fontSize: 14,
  },
  aviso: {
    color: COLORES.dorado,
    textAlign: 'center',
    fontWeight: '700',
    paddingHorizontal: PADDING,
    paddingTop: 8,
  },
  barra: {
    flexDirection: 'row',
    paddingHorizontal: PADDING,
    paddingTop: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  boton: {
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secundario: {
    flex: 1,
    backgroundColor: COLORES.translucido,
    marginRight: 10,
  },
  secundarioTexto: {
    color: COLORES.crema,
    fontSize: 18,
    fontWeight: '800',
  },
  principal: {
    flex: 2,
    backgroundColor: COLORES.verde,
  },
  principalTexto: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
});
