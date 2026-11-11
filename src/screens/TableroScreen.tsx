import React, { useEffect, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from '../audio';
import { Boton } from '../components/Boton';
import { Encabezado } from '../components/Encabezado';
import { TablaCartas } from '../components/TablaCartas';
import { useAtras } from '../hooks';
import { COLORES } from '../tema';

interface Props {
  tabla: number[];
  /** Regresa al menú con las opciones "Aleatorio / Elegir cartas". */
  onNuevasCartas: () => void;
}

/** La tabla del jugador: toca las cartas para ponerles ficha. Al llenar las 16, ¡Lotería! */
export function TableroScreen({ tabla, onNuevasCartas }: Props) {
  const insets = useSafeAreaInsets();
  const [marcadas, setMarcadas] = useState<boolean[]>(() =>
    tabla.map(() => false),
  );
  const [loteria, setLoteria] = useState(false);

  const total = marcadas.filter(Boolean).length;

  // Que el teléfono no se apague mientras se juega.
  useEffect(() => {
    Audio.pantallaEncendida(true);
    return () => Audio.pantallaEncendida(false);
  }, []);

  const alternar = (indice: number) => {
    const nuevas = marcadas.map((m, i) => (i === indice ? !m : m));
    setMarcadas(nuevas);
    if (nuevas.every(Boolean)) {
      setLoteria(true);
      Audio.hablar('¡Lotería!', 1, 0, 'loteria');
    }
  };

  const jugarDeNuevo = () => {
    setLoteria(false);
    setMarcadas(tabla.map(() => false));
  };

  const nuevasCartas = () => {
    setLoteria(false);
    onNuevasCartas();
  };

  const salir = () => {
    if (total === 0 || total === tabla.length) {
      onNuevasCartas();
      return;
    }
    Alert.alert(
      'Salir de la tabla',
      'Se perderán las fichas que llevas. ¿Quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: onNuevasCartas },
      ],
    );
  };
  useAtras(salir);

  return (
    <View
      style={[
        styles.pantalla,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 },
      ]}
    >
      <Encabezado
        titulo="Mi tabla"
        onAtras={salir}
        derecha={
          <Text style={styles.contador}>
            {total} / {tabla.length}
          </Text>
        }
      />
      <Text style={styles.ayuda}>
        Toca una carta para ponerle o quitarle la ficha.
      </Text>

      <TablaCartas cartas={tabla} marcadas={marcadas} onPressCarta={alternar} />

      <Boton
        onPress={jugarDeNuevo}
        disabled={total === 0}
        style={styles.limpiar}
      >
        <Text style={styles.limpiarTexto}>Quitar todas las fichas</Text>
      </Boton>

      <Modal
        visible={loteria}
        transparent
        animationType="fade"
        onRequestClose={() => setLoteria(false)}
      >
        <View style={styles.fondoModal}>
          <View style={styles.tarjeta}>
            <Text style={styles.confeti}>🎉</Text>
            <Text style={styles.loteria}>¡Lotería!!</Text>
            <Text style={styles.felicidades}>¡Llenaste tu tabla!</Text>
            <Boton
              onPress={jugarDeNuevo}
              style={[styles.botonModal, styles.principal]}
            >
              <Text style={styles.principalTexto}>Jugar de nuevo</Text>
            </Boton>
            <Boton
              onPress={nuevasCartas}
              style={[styles.botonModal, styles.secundario]}
            >
              <Text style={styles.secundarioTexto}>Elegir nuevas cartas</Text>
            </Boton>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
    paddingHorizontal: 12,
  },
  contador: {
    color: COLORES.crema,
    fontSize: 20,
    fontWeight: '800',
  },
  ayuda: {
    color: COLORES.textoSuave,
    fontSize: 14,
    marginBottom: 8,
  },
  limpiar: {
    marginTop: 14,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.translucido,
  },
  limpiarTexto: {
    color: COLORES.crema,
    fontSize: 17,
    fontWeight: '700',
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  tarjeta: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORES.crema,
    borderRadius: 24,
    borderWidth: 6,
    borderColor: COLORES.dorado,
    padding: 24,
    alignItems: 'center',
  },
  confeti: {
    fontSize: 56,
  },
  loteria: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORES.rojo,
    marginTop: 4,
  },
  felicidades: {
    fontSize: 18,
    color: COLORES.tinta,
    marginBottom: 16,
  },
  botonModal: {
    alignSelf: 'stretch',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  principal: {
    backgroundColor: COLORES.verde,
  },
  principalTexto: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  secundario: {
    backgroundColor: COLORES.rojo,
  },
  secundarioTexto: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
