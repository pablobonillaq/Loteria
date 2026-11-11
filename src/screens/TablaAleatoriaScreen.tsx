import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Boton } from '../components/Boton';
import { Encabezado } from '../components/Encabezado';
import { TablaCartas } from '../components/TablaCartas';
import { useAtras } from '../hooks';
import { COLORES } from '../tema';

interface Props {
  tabla: number[];
  onOtraTabla: () => void;
  onJugar: () => void;
  onRegresar: () => void;
}

/** Muestra una tabla de 4 x 4 con cartas al azar antes de empezar a jugar. */
export function TablaAleatoriaScreen({
  tabla,
  onOtraTabla,
  onJugar,
  onRegresar,
}: Props) {
  const insets = useSafeAreaInsets();
  useAtras(onRegresar);

  return (
    <View
      style={[
        styles.pantalla,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 },
      ]}
    >
      <Encabezado titulo="Tabla aleatoria" onAtras={onRegresar} />
      <TablaCartas cartas={tabla} />
      <View style={styles.controles}>
        <Boton onPress={onOtraTabla} style={[styles.boton, styles.secundario]}>
          <Text style={styles.secundarioTexto}>🔀 Otra tabla</Text>
        </Boton>
        <Boton onPress={onJugar} style={[styles.boton, styles.principal]}>
          <Text style={styles.principalTexto}>¡Jugar!</Text>
        </Boton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
    paddingHorizontal: 12,
  },
  controles: {
    flexDirection: 'row',
    marginTop: 14,
  },
  boton: {
    flex: 1,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secundario: {
    backgroundColor: COLORES.translucido,
    marginRight: 10,
  },
  secundarioTexto: {
    color: COLORES.crema,
    fontSize: 18,
    fontWeight: '800',
  },
  principal: {
    backgroundColor: COLORES.verde,
  },
  principalTexto: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
});
