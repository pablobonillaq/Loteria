/**
 * Lotería mexicana — "echa" las 54 cartas en voz alta.
 *
 * @format
 */

import React, { useState } from 'react';
import { Modal, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAjustes } from './src/ajustes';
import { ConfiguracionScreen } from './src/screens/ConfiguracionScreen';
import { JuegoScreen } from './src/screens/JuegoScreen';

function App() {
  const [ajustes, actualizar] = useAjustes();
  const [configAbierta, setConfigAbierta] = useState(false);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <View style={styles.contenedor}>
        {/* El juego se queda montado mientras se abre la configuración, así no se pierde la partida. */}
        <JuegoScreen ajustes={ajustes} abrirConfiguracion={() => setConfigAbierta(true)} />
      </View>
      <Modal
        visible={configAbierta}
        animationType="slide"
        onRequestClose={() => setConfigAbierta(false)}
        statusBarTranslucent
        navigationBarTranslucent>
        <SafeAreaProvider>
          <ConfiguracionScreen ajustes={ajustes} actualizar={actualizar} cerrar={() => setConfigAbierta(false)} />
        </SafeAreaProvider>
      </Modal>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#3A0D12',
  },
});

export default App;
