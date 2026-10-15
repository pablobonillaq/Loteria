import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio, clipDeCarta } from '../audio';
import { Ajustes, LIMITES, milibelesDeRefuerzo, NIVELES_REFUERZO } from '../ajustes';
import { Boton, ES_TV } from '../components/Boton';

interface Props {
  ajustes: Ajustes;
  actualizar: (cambios: Partial<Ajustes>) => void;
  cerrar: () => void;
}

function Contador({
  valor,
  texto,
  onMenos,
  onMas,
}: {
  valor: number;
  texto: string;
  onMenos: () => void;
  onMas: () => void;
}) {
  return (
    <View style={styles.contador} accessibilityValue={{ now: valor }}>
      <Boton onPress={onMenos} style={styles.contadorBoton} accessibilityLabel="Menos">
        <Text style={styles.contadorBotonTexto}>−</Text>
      </Boton>
      <Text style={styles.contadorValor}>{texto}</Text>
      <Boton onPress={onMas} style={styles.contadorBoton} accessibilityLabel="Más">
        <Text style={styles.contadorBotonTexto}>+</Text>
      </Boton>
    </View>
  );
}

function Fila({ titulo, detalle, children }: { titulo: string; detalle?: string; children: React.ReactNode }) {
  return (
    <View style={styles.fila}>
      <View style={styles.filaTextos}>
        <Text style={styles.filaTitulo}>{titulo}</Text>
        {detalle ? <Text style={styles.filaDetalle}>{detalle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const redondear = (n: number) => Math.round(n * 10) / 10;

export function ConfiguracionScreen({ ajustes, actualizar, cerrar }: Props) {
  const insets = useSafeAreaInsets();
  const { segundos, velocidad } = LIMITES;

  const probarVoz = () => {
    Audio.detener();
    if (ajustes.volumenMaximo) {
      Audio.volumenAlMaximo();
    }
    const texto = ajustes.decirVerso ? 'El que le cantó a San Pedro no le volverá a cantar... ¡El Gallo!' : 'El Gallo';
    Audio.hablar(texto, ajustes.velocidad, milibelesDeRefuerzo(ajustes.refuerzo), clipDeCarta(1, ajustes.decirVerso));
  };

  return (
    <View
      style={[
        styles.pantalla,
        ES_TV ? styles.pantallaTV : { paddingTop: insets.top + 8, paddingBottom: insets.bottom },
      ]}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Configuración</Text>
        <Boton onPress={cerrar} focoInicial style={styles.listo}>
          <Text style={styles.listoTexto}>Listo</Text>
        </Boton>
      </View>

      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.seccion}>Juego</Text>
        <Fila titulo="Segundos entre cartas" detalle="Tiempo de espera después de cantar cada carta.">
          <Contador
            valor={ajustes.segundos}
            texto={`${ajustes.segundos} s`}
            onMenos={() => actualizar({ segundos: Math.max(segundos.min, ajustes.segundos - segundos.paso) })}
            onMas={() => actualizar({ segundos: Math.min(segundos.max, ajustes.segundos + segundos.paso) })}
          />
        </Fila>
        <Fila titulo="Decir el verso" detalle="Canta el verso tradicional antes del nombre de la carta.">
          <Switch value={ajustes.decirVerso} onValueChange={v => actualizar({ decirVerso: v })} />
        </Fila>

        <Text style={styles.seccion}>Voz y volumen</Text>
        <Fila titulo="Velocidad de la voz" detalle="1.0 es la velocidad normal.">
          <Contador
            valor={ajustes.velocidad}
            texto={ajustes.velocidad.toFixed(1)}
            onMenos={() => actualizar({ velocidad: redondear(Math.max(velocidad.min, ajustes.velocidad - velocidad.paso)) })}
            onMas={() => actualizar({ velocidad: redondear(Math.min(velocidad.max, ajustes.velocidad + velocidad.paso)) })}
          />
        </Fila>
        <Fila titulo="Volumen al máximo" detalle="Sube el volumen del teléfono al 100% al presionar Play.">
          <Switch value={ajustes.volumenMaximo} onValueChange={v => actualizar({ volumenMaximo: v })} />
        </Fila>

        <View style={styles.filaColumna}>
          <Text style={styles.filaTitulo}>Refuerzo de volumen</Text>
          <Text style={styles.filaDetalle}>
            Amplifica la voz por encima del 100%. En "Alto" puede sonar un poco distorsionada en algunos teléfonos.
          </Text>
          <View style={styles.segmentos}>
            {NIVELES_REFUERZO.map((nivel, i) => {
              const activo = ajustes.refuerzo === i;
              return (
                <Boton
                  key={nivel.etiqueta}
                  onPress={() => actualizar({ refuerzo: i })}
                  style={[styles.segmento, activo && styles.segmentoActivo, i > 0 && styles.segmentoSeparado]}>
                  <Text style={[styles.segmentoTexto, activo && styles.segmentoTextoActivo]}>{nivel.etiqueta}</Text>
                </Boton>
              );
            })}
          </View>
        </View>

        <Boton onPress={probarVoz} style={styles.probar}>
          <Text style={styles.probarTexto}>🔊  Probar voz</Text>
        </Boton>

        {!Audio.disponible && (
          <Text style={styles.aviso}>La voz solo está disponible en Android en esta versión.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const CREMA = '#FFF8E7';
const DORADO = '#F6C445';

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#3A0D12' },
  // En TV: márgenes por overscan y ancho limitado para que se lea cómodo.
  pantallaTV: { paddingVertical: 24, paddingHorizontal: '12%' },
  encabezado: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  titulo: { flex: 1, fontSize: 26, fontWeight: '900', color: DORADO },
  listo: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, backgroundColor: '#2E9E5B' },
  listoTexto: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  contenido: { paddingHorizontal: 16, paddingBottom: 32 },
  seccion: { color: DORADO, fontSize: 14, fontWeight: '800', marginTop: 18, marginBottom: 6, letterSpacing: 1 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  filaColumna: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, marginBottom: 8 },
  filaTextos: { flex: 1, marginRight: 12 },
  filaTitulo: { color: CREMA, fontSize: 17, fontWeight: '700' },
  filaDetalle: { color: 'rgba(255,248,231,0.65)', fontSize: 13, marginTop: 2 },
  contador: { flexDirection: 'row', alignItems: 'center' },
  contadorBoton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contadorBotonTexto: { color: CREMA, fontSize: 24, fontWeight: '700', lineHeight: 28 },
  contadorValor: { color: CREMA, fontSize: 18, fontWeight: '800', minWidth: 52, textAlign: 'center' },
  segmentos: { flexDirection: 'row', marginTop: 12 },
  segmento: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  segmentoSeparado: { marginLeft: 6 },
  segmentoActivo: { backgroundColor: DORADO },
  segmentoTexto: { color: CREMA, fontWeight: '700' },
  segmentoTextoActivo: { color: '#3A0D12' },
  probar: { marginTop: 18, paddingVertical: 16, borderRadius: 14, alignItems: 'center', backgroundColor: '#B3202A' },
  probarTexto: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  aviso: { color: 'rgba(255,248,231,0.65)', textAlign: 'center', marginTop: 12 },
});
