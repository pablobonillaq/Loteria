/**
 * Lotería mexicana.
 *  - Móvil: menú con "Echar cartas" (la app canta las cartas) y "Jugar" (el teléfono es tu tabla).
 *  - Android TV: directo a "Echar cartas".
 *
 * @format
 */

import React, { useState } from 'react';
import { Modal, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAjustes } from './src/ajustes';
import { ES_TV } from './src/components/Boton';
import { tablaAleatoria } from './src/data/cartas';
import { ConfiguracionScreen } from './src/screens/ConfiguracionScreen';
import { ElegirCartasScreen } from './src/screens/ElegirCartasScreen';
import { InicioScreen } from './src/screens/InicioScreen';
import { JuegoScreen } from './src/screens/JuegoScreen';
import { TablaAleatoriaScreen } from './src/screens/TablaAleatoriaScreen';
import { TableroScreen } from './src/screens/TableroScreen';
import { COLORES } from './src/tema';

type Pantalla =
  | { tipo: 'menu'; jugarAbierto: boolean }
  | { tipo: 'echar' }
  | { tipo: 'aleatoria'; tabla: number[] }
  | { tipo: 'elegir' }
  | { tipo: 'tablero'; tabla: number[]; id: number };

function App() {
  const [ajustes, actualizar] = useAjustes();
  const [configAbierta, setConfigAbierta] = useState(false);
  const [pantalla, setPantalla] = useState<Pantalla>(
    ES_TV ? { tipo: 'echar' } : { tipo: 'menu', jugarAbierto: false },
  );

  const abrirConfiguracion = () => setConfigAbierta(true);
  const menuJugar = () => setPantalla({ tipo: 'menu', jugarAbierto: true });
  const jugarCon = (tabla: number[]) =>
    setPantalla({ tipo: 'tablero', tabla, id: Date.now() });

  let contenido: React.ReactNode;
  switch (pantalla.tipo) {
    case 'echar':
      contenido = (
        // El juego se queda montado mientras se abre la configuración, así no se pierde la partida.
        <JuegoScreen
          ajustes={ajustes}
          abrirConfiguracion={abrirConfiguracion}
          onSalir={
            ES_TV
              ? undefined
              : () => setPantalla({ tipo: 'menu', jugarAbierto: false })
          }
        />
      );
      break;
    case 'aleatoria':
      contenido = (
        <TablaAleatoriaScreen
          tabla={pantalla.tabla}
          onOtraTabla={() =>
            setPantalla({ tipo: 'aleatoria', tabla: tablaAleatoria() })
          }
          onJugar={() => jugarCon(pantalla.tabla)}
          onRegresar={menuJugar}
        />
      );
      break;
    case 'elegir':
      contenido = (
        <ElegirCartasScreen onListo={jugarCon} onRegresar={menuJugar} />
      );
      break;
    case 'tablero':
      contenido = (
        <TableroScreen
          key={pantalla.id}
          tabla={pantalla.tabla}
          onNuevasCartas={menuJugar}
        />
      );
      break;
    default:
      contenido = (
        <InicioScreen
          jugarAbierto={pantalla.jugarAbierto}
          onEcharCartas={() => setPantalla({ tipo: 'echar' })}
          onAleatorio={() =>
            setPantalla({ tipo: 'aleatoria', tabla: tablaAleatoria() })
          }
          onElegirCartas={() => setPantalla({ tipo: 'elegir' })}
        />
      );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <View style={styles.contenedor}>{contenido}</View>
      <Modal
        visible={configAbierta}
        animationType="slide"
        onRequestClose={() => setConfigAbierta(false)}
        statusBarTranslucent
        navigationBarTranslucent
      >
        <SafeAreaProvider>
          <ConfiguracionScreen
            ajustes={ajustes}
            actualizar={actualizar}
            cerrar={() => setConfigAbierta(false)}
          />
        </SafeAreaProvider>
      </Modal>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
});

export default App;
