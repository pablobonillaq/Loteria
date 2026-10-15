import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  DeviceEventEmitter,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio, clipDeCarta } from '../audio';
import { Ajustes, milibelesDeRefuerzo } from '../ajustes';
import { Boton, ES_TV } from '../components/Boton';
import { CartaVista, PROPORCION_CARTA } from '../components/CartaVista';
import { barajar, Carta, cartaPorNumero, TOTAL_CARTAS } from '../data/cartas';

type Estado = 'inicio' | 'cantando' | 'pausa' | 'fin';

const ULTIMAS = 5;

interface Props {
  ajustes: Ajustes;
  abrirConfiguracion: () => void;
}

function textoDeCarta(carta: Carta, ajustes: Ajustes): string {
  return ajustes.decirVerso ? `${carta.verso}... ¡${carta.nombre}!` : carta.nombre;
}

export function JuegoScreen({ ajustes, abrirConfiguracion }: Props) {
  const insets = useSafeAreaInsets();
  const [estado, setEstado] = useState<Estado>('inicio');
  const [salidas, setSalidas] = useState<number[]>([]);
  const [area, setArea] = useState({ ancho: 0, alto: 0 });
  const [anchoFila, setAnchoFila] = useState(0);

  // Referencias para el ciclo asíncrono (no dependen del render).
  const mazoRef = useRef<number[]>(barajar());
  const salidasRef = useRef<number[]>([]);
  const ajustesRef = useRef(ajustes);
  const turnoRef = useRef(0); // cambia cada vez que se pausa/reinicia: cancela el ciclo anterior
  const cancelarEsperaRef = useRef<(() => void) | null>(null);
  const progreso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    ajustesRef.current = ajustes;
  }, [ajustes]);

  // Al salir de la pantalla, detener todo.
  useEffect(() => {
    return () => {
      turnoRef.current++;
      cancelarEsperaRef.current?.();
      Audio.detener();
      Audio.pantallaEncendida(false);
    };
  }, []);

  const sigueVigente = (turno: number) => turnoRef.current === turno;

  const hablar = (texto: string, clip?: string) => {
    const a = ajustesRef.current;
    return Audio.hablar(texto, a.velocidad, milibelesDeRefuerzo(a.refuerzo), clip);
  };

  /** Espera `ms` milisegundos; devuelve false si se canceló (pausa/reinicio). */
  const esperar = (ms: number, turno: number) =>
    new Promise<boolean>(resolve => {
      const t = setTimeout(() => {
        cancelarEsperaRef.current = null;
        resolve(sigueVigente(turno));
      }, ms);
      cancelarEsperaRef.current = () => {
        clearTimeout(t);
        cancelarEsperaRef.current = null;
        resolve(false);
      };
    });

  const iniciarBarra = (ms: number) => {
    progreso.stopAnimation();
    progreso.setValue(0);
    Animated.timing(progreso, {
      toValue: 1,
      duration: ms,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const reiniciarBarra = () => {
    progreso.stopAnimation();
    progreso.setValue(0);
  };

  /** Ciclo principal: saca carta → la canta → espera → repite. */
  const cantar = async (turno: number, repetirActual: boolean) => {
    let repetir = repetirActual && salidasRef.current.length > 0;

    while (sigueVigente(turno)) {
      if (!repetir) {
        if (salidasRef.current.length >= TOTAL_CARTAS) {
          setEstado('fin');
          Audio.pantallaEncendida(false);
          await hablar('¡Se acabaron las cartas!', 'fin');
          return;
        }
        const siguiente = mazoRef.current[salidasRef.current.length];
        salidasRef.current = [...salidasRef.current, siguiente];
        setSalidas(salidasRef.current);
      }
      repetir = false;

      const actual = cartaPorNumero(salidasRef.current[salidasRef.current.length - 1]);
      reiniciarBarra();
      await hablar(
        textoDeCarta(actual, ajustesRef.current),
        clipDeCarta(actual.numero, ajustesRef.current.decirVerso),
      );
      if (!sigueVigente(turno)) {
        return;
      }

      const ms = ajustesRef.current.segundos * 1000;
      iniciarBarra(ms);
      if (!(await esperar(ms, turno))) {
        return;
      }
    }
  };

  const detenerCiclo = () => {
    turnoRef.current++;
    cancelarEsperaRef.current?.();
    Audio.detener();
    reiniciarBarra();
  };

  const play = async () => {
    if (estado === 'fin' || estado === 'cantando') {
      return;
    }
    const turno = ++turnoRef.current;
    const reanudar = estado === 'pausa';
    setEstado('cantando');
    Audio.pantallaEncendida(true);
    if (ajustesRef.current.volumenMaximo) {
      Audio.volumenAlMaximo();
    }
    if (salidasRef.current.length === 0) {
      await hablar('¡Se va y se corre!', 'inicio');
      if (!sigueVigente(turno)) {
        return;
      }
    }
    cantar(turno, reanudar);
  };

  const pausar = () => {
    detenerCiclo();
    setEstado('pausa');
  };

  const reiniciarJuego = () => {
    detenerCiclo();
    Audio.pantallaEncendida(false);
    mazoRef.current = barajar();
    salidasRef.current = [];
    setSalidas([]);
    setEstado('inicio');
  };

  const confirmarReinicio = () => {
    if (salidasRef.current.length === 0) {
      reiniciarJuego();
      return;
    }
    const estabaCantando = estado === 'cantando';
    if (estabaCantando) {
      pausar();
    }
    Alert.alert('Reiniciar juego', '¿Barajar de nuevo y empezar desde cero?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Reiniciar', style: 'destructive', onPress: reiniciarJuego },
    ]);
  };

  const irAConfiguracion = () => {
    if (estado === 'cantando') {
      pausar();
    }
    abrirConfiguracion();
  };

  // --- Control remoto: botones Play/Pausa físicos (Android TV y controles multimedia) ---
  const accionesRef = useRef({ estado, play, pausar });
  accionesRef.current = { estado, play, pausar };
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('loteriaTeclaMedia', (tecla: string) => {
      const { estado: e, play: p, pausar: pa } = accionesRef.current;
      if (tecla === 'pausa' || (tecla === 'playpausa' && e === 'cantando')) {
        if (e === 'cantando') {
          pa();
        }
      } else if (e !== 'cantando' && e !== 'fin') {
        p();
      }
    });
    return () => sub.remove();
  }, []);

  // --- Tamaños ---
  const onLayoutArea = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea({ ancho: width, alto: height });
  };
  const anchoCarta = Math.floor(Math.min(area.ancho, area.alto * PROPORCION_CARTA));

  const GAP = ES_TV ? 12 : 8;
  const anchoMini = anchoFila > 0 ? Math.floor((anchoFila - GAP * (ULTIMAS - 1)) / ULTIMAS) : 0;

  const actual = salidas.length > 0 ? cartaPorNumero(salidas[salidas.length - 1]) : null;
  const anteriores = salidas.slice(0, -1).slice(-ULTIMAS).reverse(); // la más reciente primero

  const anchoBarra = progreso.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  // Un solo botón principal (no se desmonta) para que el foco del control remoto no se pierda.
  const principal =
    estado === 'cantando'
      ? { texto: '❚❚  Pausa', accion: pausar, estilo: styles.botonPausa }
      : estado === 'fin'
      ? { texto: '⟲  Nuevo juego', accion: reiniciarJuego, estilo: null }
      : { texto: estado === 'pausa' ? '▶  Continuar' : '▶  Play', accion: play, estilo: null };

  // --- Piezas de la pantalla ---
  const botonConfig = (
    <Boton onPress={irAConfiguracion} style={styles.botonIcono} accessibilityLabel="Configuración">
      <Text style={styles.botonIconoTexto}>⚙︎</Text>
    </Boton>
  );

  const cartaGrande = (
    <View style={styles.areaCarta} onLayout={onLayoutArea}>
      {anchoCarta > 0 && <CartaVista carta={actual} ancho={anchoCarta} />}
      {estado === 'pausa' && (
        <View style={styles.etiquetaPausa} pointerEvents="none">
          <Text style={styles.etiquetaPausaTexto}>EN PAUSA</Text>
        </View>
      )}
    </View>
  );

  const barraTiempo = (
    <View style={styles.barraFondo}>
      <Animated.View style={[styles.barra, { width: anchoBarra }]} />
    </View>
  );

  const ultimas = (
    <>
      <Text style={styles.subtitulo}>Últimas cartas</Text>
      <View style={styles.filaUltimas} onLayout={e => setAnchoFila(e.nativeEvent.layout.width)}>
        {anchoMini > 0 &&
          Array.from({ length: ULTIMAS }).map((_, i) => {
            const numero = anteriores[i];
            return (
              <View key={i} style={{ width: anchoMini, marginLeft: i === 0 ? 0 : GAP }}>
                {numero ? (
                  <CartaVista carta={cartaPorNumero(numero)} ancho={anchoMini} />
                ) : (
                  <View style={[styles.hueco, { width: anchoMini, height: anchoMini / PROPORCION_CARTA }]} />
                )}
              </View>
            );
          })}
      </View>
    </>
  );

  const controles = (
    <View style={styles.controles}>
      <Boton onPress={confirmarReinicio} style={[styles.boton, styles.botonSecundario]}>
        <Text style={styles.botonSecundarioTexto}>⟲  Reiniciar</Text>
      </Boton>
      <Boton
        onPress={principal.accion}
        focoInicial
        style={[styles.boton, styles.botonPrincipal, principal.estilo]}>
        <Text style={styles.botonPrincipalTexto}>{principal.texto}</Text>
      </Boton>
    </View>
  );

  // --- Android TV: horizontal, carta a la izquierda y todo lo demás a la derecha ---
  if (ES_TV) {
    return (
      <View style={[styles.pantalla, styles.pantallaTV]}>
        <View style={styles.columnaCartaTV}>{cartaGrande}</View>
        <View style={styles.panelTV}>
          <View style={styles.encabezado}>
            <Text style={styles.titulo}>Lotería</Text>
            <Text style={styles.contador}>
              {salidas.length} / {TOTAL_CARTAS}
            </Text>
            {botonConfig}
          </View>
          <Text style={styles.nombreActualTV} numberOfLines={1} adjustsFontSizeToFit>
            {actual
              ? actual.nombre
              : estado === 'inicio'
              ? 'Presiona Play'
              : ''}
          </Text>
          {barraTiempo}
          {ultimas}
          <View style={styles.espaciador} />
          {controles}
        </View>
      </View>
    );
  }

  // --- Teléfono: vertical ---
  return (
    <View style={[styles.pantalla, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Lotería</Text>
        <Text style={styles.contador}>
          {salidas.length} / {TOTAL_CARTAS}
        </Text>
        {botonConfig}
      </View>
      {cartaGrande}
      {barraTiempo}
      {ultimas}
      {controles}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#3A0D12',
    paddingHorizontal: 12,
  },
  // Márgenes amplios en TV: muchas pantallas recortan los bordes (overscan).
  pantallaTV: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    paddingVertical: 24,
  },
  columnaCartaTV: {
    flex: 1,
    marginRight: 32,
  },
  panelTV: {
    flex: 1.25,
  },
  nombreActualTV: {
    color: '#FFF8E7',
    fontSize: 52,
    fontWeight: '900',
    marginTop: 4,
  },
  espaciador: {
    flex: 1,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titulo: {
    flex: 1,
    fontSize: 26,
    fontWeight: '900',
    color: '#F6C445',
    letterSpacing: 1,
  },
  contador: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF8E7',
    marginRight: 12,
  },
  botonIcono: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  botonIconoTexto: {
    fontSize: 24,
    color: '#FFF8E7',
  },
  areaCarta: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etiquetaPausa: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  etiquetaPausaTexto: {
    color: '#FFF8E7',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
  },
  barraFondo: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    marginTop: 10,
  },
  barra: {
    height: '100%',
    backgroundColor: '#F6C445',
  },
  subtitulo: {
    color: '#F6C445',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  filaUltimas: {
    flexDirection: 'row',
  },
  hueco: {
    borderRadius: 6,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  controles: {
    flexDirection: 'row',
    marginTop: 14,
  },
  boton: {
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonPrincipal: {
    flex: 2,
    marginLeft: 10,
    backgroundColor: '#2E9E5B',
  },
  botonPausa: {
    backgroundColor: '#E07A1F',
  },
  botonPrincipalTexto: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  botonSecundario: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  botonSecundarioTexto: {
    color: '#FFF8E7',
    fontSize: 17,
    fontWeight: '700',
  },
});
