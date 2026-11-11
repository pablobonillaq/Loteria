/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ElegirCartasScreen } from '../src/screens/ElegirCartasScreen';
import { TableroScreen } from '../src/screens/TableroScreen';
import { tablaAleatoria } from '../src/data/cartas';

const metricas = {
  frame: { x: 0, y: 0, width: 390, height: 800 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

jest.setTimeout(60000);

/** Presiona el botón que contiene el texto indicado. */
async function presionar(
  r: ReactTestRenderer.ReactTestRenderer,
  texto: string,
) {
  const nodo = r.root.findAll(n => n.props.children === texto)[0];
  let actual: ReactTestRenderer.ReactTestInstance | null = nodo;
  while (actual && typeof actual.props.onPress !== 'function') {
    actual = actual.parent;
  }
  await ReactTestRenderer.act(() => {
    actual!.props.onPress();
  });
}

const conArea = (el: React.ReactElement) => (
  <SafeAreaProvider initialMetrics={metricas}>{el}</SafeAreaProvider>
);

test('tabla aleatoria: 16 cartas distintas', () => {
  const t = tablaAleatoria();
  expect(t).toHaveLength(16);
  expect(new Set(t).size).toBe(16);
});

test('al marcar las 16 cartas aparece ¡Lotería!! y "Jugar de nuevo" limpia las fichas', async () => {
  const tabla = tablaAleatoria();
  let r!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    r = ReactTestRenderer.create(
      conArea(<TableroScreen tabla={tabla} onNuevasCartas={jest.fn()} />),
    );
  });
  // Simular el tamaño de la cuadrícula para que se dibujen las cartas.
  const areas = r.root.findAll(n => typeof n.props.onLayout === 'function');
  await ReactTestRenderer.act(() => {
    areas.forEach(a =>
      a.props.onLayout({
        nativeEvent: { layout: { width: 380, height: 600 } },
      }),
    );
  });
  const cartas = () =>
    r.root.findAll(
      n =>
        n.props.accessibilityState &&
        'checked' in n.props.accessibilityState &&
        n.props.onPress,
    );
  // Pressable se renderiza en varios niveles: tomamos uno por carta.
  const unicos = () => {
    const vistos = new Set<unknown>();
    return cartas().filter(n =>
      vistos.has(n.props.onPress) ? false : (vistos.add(n.props.onPress), true),
    );
  };
  expect(unicos()).toHaveLength(16);

  for (let i = 0; i < 16; i++) {
    await ReactTestRenderer.act(() => {
      unicos()[i].props.onPress();
    });
  }
  expect(
    r.root.findAll(n => n.props.children === '¡Lotería!!').length,
  ).toBeGreaterThan(0);

  await presionar(r, 'Jugar de nuevo');
  expect(
    unicos().every(n => n.props.accessibilityState.checked === false),
  ).toBe(true);
  await ReactTestRenderer.act(() => r.unmount());
});

test('elegir cartas: no permite más de 16 y entrega la tabla en orden', async () => {
  const onListo = jest.fn();
  let r!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    r = ReactTestRenderer.create(
      conArea(<ElegirCartasScreen onListo={onListo} onRegresar={jest.fn()} />),
    );
  });
  const celdas = () => {
    const vistos = new Set<unknown>();
    return r.root
      .findAll(
        n =>
          n.props.accessibilityState &&
          'selected' in n.props.accessibilityState &&
          n.props.onPress,
      )
      .filter(n =>
        vistos.has(n.props.onPress)
          ? false
          : (vistos.add(n.props.onPress), true),
      );
  };
  expect(celdas()).toHaveLength(54);
  for (let i = 0; i < 17; i++) {
    await ReactTestRenderer.act(() => {
      celdas()[i].props.onPress();
    });
  }
  expect(
    celdas().filter(n => n.props.accessibilityState.selected),
  ).toHaveLength(16);
  await presionar(r, '¡Jugar!');
  expect(onListo).toHaveBeenCalledWith(
    Array.from({ length: 16 }, (_, i) => i + 1),
  );
  await ReactTestRenderer.act(() => r.unmount());
});
