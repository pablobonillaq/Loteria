import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORES } from '../tema';
import { Boton } from './Boton';

interface Props {
  titulo: string;
  onAtras?: () => void;
  /** Contenido opcional a la derecha (contador, botones…). */
  derecha?: React.ReactNode;
}

export function Encabezado({ titulo, onAtras, derecha }: Props) {
  return (
    <View style={styles.encabezado}>
      {onAtras && (
        <Boton
          onPress={onAtras}
          style={styles.atras}
          accessibilityLabel="Regresar"
        >
          <Text style={styles.atrasTexto}>‹</Text>
        </Boton>
      )}
      <Text style={styles.titulo} numberOfLines={1}>
        {titulo}
      </Text>
      {derecha}
    </View>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  atras: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.translucido,
    marginRight: 10,
  },
  atrasTexto: {
    fontSize: 30,
    lineHeight: 34,
    color: COLORES.crema,
    fontWeight: '700',
  },
  titulo: {
    flex: 1,
    fontSize: 24,
    fontWeight: '900',
    color: COLORES.dorado,
  },
});
