import React, { useState } from 'react';
import { LayoutAnimation, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Boton } from '../components/Boton';
import { CartaVista } from '../components/CartaVista';
import { cartaPorNumero } from '../data/cartas';
import { COLORES } from '../tema';

interface Props {
  /** Mostrar ya abiertas las opciones de "Jugar" (al regresar de una tabla). */
  jugarAbierto?: boolean;
  onEcharCartas: () => void;
  onAleatorio: () => void;
  onElegirCartas: () => void;
}

/** Menú principal (versión móvil). */
export function InicioScreen({
  jugarAbierto = false,
  onEcharCartas,
  onAleatorio,
  onElegirCartas,
}: Props) {
  const insets = useSafeAreaInsets();
  const [abierto, setAbierto] = useState(jugarAbierto);

  const alternarJugar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAbierto(a => !a);
  };

  return (
    <View
      style={[
        styles.pantalla,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.portada}>
        <View style={styles.abanico}>
          <View style={[styles.cartita, styles.izquierda]}>
            <CartaVista carta={cartaPorNumero(1)} ancho={96} />
          </View>
          <View style={[styles.cartita, styles.centro]}>
            <CartaVista carta={null} ancho={110} />
          </View>
          <View style={[styles.cartita, styles.derecha]}>
            <CartaVista carta={cartaPorNumero(35)} ancho={96} />
          </View>
        </View>
        <Text style={styles.titulo}>LOTERÍA</Text>
        <Text style={styles.subtitulo}>mexicana</Text>
      </View>

      <View style={styles.opciones}>
        <Boton
          onPress={onEcharCartas}
          style={[styles.boton, styles.botonEchar]}
        >
          <Text style={styles.botonTexto}>📢 Echar cartas</Text>
          <Text style={styles.botonDetalle}>
            La app canta las cartas en voz alta
          </Text>
        </Boton>

        <Boton
          onPress={alternarJugar}
          style={[
            styles.boton,
            styles.botonJugar,
            abierto && styles.botonJugarActivo,
          ]}
        >
          <Text style={styles.botonTexto}>🎴 Jugar</Text>
          <Text style={styles.botonDetalle}>Usa tu teléfono como tabla</Text>
        </Boton>

        {abierto && (
          <View style={styles.subopciones}>
            <Boton
              onPress={onAleatorio}
              style={[styles.subboton, styles.subbotonIzq]}
            >
              <Text style={styles.subbotonIcono}>🎲</Text>
              <Text style={styles.subbotonTexto}>Aleatorio</Text>
            </Boton>
            <Boton onPress={onElegirCartas} style={styles.subboton}>
              <Text style={styles.subbotonIcono}>✋</Text>
              <Text style={styles.subbotonTexto}>Elegir cartas</Text>
            </Boton>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
    paddingHorizontal: 20,
  },
  portada: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abanico: {
    width: 260,
    height: 175,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  cartita: {
    position: 'absolute',
    bottom: 0,
  },
  izquierda: {
    left: 10,
    transform: [{ rotate: '-14deg' }],
  },
  centro: {
    zIndex: 2,
  },
  derecha: {
    right: 10,
    transform: [{ rotate: '14deg' }],
  },
  titulo: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORES.dorado,
    letterSpacing: 4,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORES.crema,
    letterSpacing: 2,
  },
  opciones: {
    width: '100%',
  },
  boton: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  botonEchar: {
    backgroundColor: COLORES.rojo,
  },
  botonJugar: {
    backgroundColor: COLORES.verde,
  },
  botonJugarActivo: {
    borderColor: COLORES.dorado,
  },
  botonTexto: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  botonDetalle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  subopciones: {
    flexDirection: 'row',
    marginTop: 12,
  },
  subboton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: COLORES.translucido,
  },
  subbotonIzq: {
    marginRight: 12,
  },
  subbotonIcono: {
    fontSize: 30,
  },
  subbotonTexto: {
    color: COLORES.crema,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
});
