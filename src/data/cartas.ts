export interface Carta {
  numero: number;
  nombre: string;
  /** Ícono que se dibuja en la carta (diseño propio de la app). */
  icono: string;
  /** Verso tradicional que el "gritón" puede decir antes del nombre. */
  verso: string;
}

export const CARTAS: Carta[] = [
  { numero: 1, nombre: 'El Gallo', icono: '🐓', verso: 'El que le cantó a San Pedro no le volverá a cantar' },
  { numero: 2, nombre: 'El Diablito', icono: '😈', verso: 'Pórtate bien cuatito, si no te lleva el coloradito' },
  { numero: 3, nombre: 'La Dama', icono: '💃', verso: 'Puliendo el paso, por toda la calle real' },
  { numero: 4, nombre: 'El Catrín', icono: '🎩', verso: 'Don Ferruco en la alameda, su bastón quería tirar' },
  { numero: 5, nombre: 'El Paraguas', icono: '☂️', verso: 'Para el sol y para el agua' },
  { numero: 6, nombre: 'La Sirena', icono: '🧜‍♀️', verso: 'Con los cantos de sirena, no te vayas a marear' },
  { numero: 7, nombre: 'La Escalera', icono: '🪜', verso: 'Súbeme paso a pasito, no quieras pegar brinquitos' },
  { numero: 8, nombre: 'La Botella', icono: '🍾', verso: 'La herramienta del borracho' },
  { numero: 9, nombre: 'El Barril', icono: '🛢️', verso: 'Tanto bebió el albañil, que quedó como barril' },
  { numero: 10, nombre: 'El Árbol', icono: '🌳', verso: 'El que a buen árbol se arrima, buena sombra le cobija' },
  { numero: 11, nombre: 'El Melón', icono: '🍈', verso: 'Me lo das o me lo quitas' },
  { numero: 12, nombre: 'El Valiente', icono: '🗡️', verso: 'Por qué le corres cobarde, trayendo tan buen puñal' },
  { numero: 13, nombre: 'El Gorrito', icono: '👒', verso: 'Ponle su gorrito al nene, no se nos vaya a resfriar' },
  { numero: 14, nombre: 'La Muerte', icono: '⚰️', verso: 'La muerte tilica y flaca' },
  { numero: 15, nombre: 'La Pera', icono: '🍐', verso: 'El que espera, desespera' },
  { numero: 16, nombre: 'La Bandera', icono: '🇲🇽', verso: 'Verde, blanco y colorado, la bandera del soldado' },
  { numero: 17, nombre: 'El Bandolón', icono: '🪕', verso: 'Tocando su bandolón, está el mariachi Simón' },
  { numero: 18, nombre: 'El Violoncello', icono: '🎻', verso: 'Creciendo se fue hasta el cielo, y como no fue violín, tuvo que ser violoncello' },
  { numero: 19, nombre: 'La Garza', icono: '🦢', verso: 'Al otro lado del río tengo mi banco de arena' },
  { numero: 20, nombre: 'El Pájaro', icono: '🐦', verso: 'Tú me traes a puros brincos, como pájaro en la rama' },
  { numero: 21, nombre: 'La Mano', icono: '✋', verso: 'La mano de un criminal' },
  { numero: 22, nombre: 'La Bota', icono: '👢', verso: 'Una bota igual que la otra' },
  { numero: 23, nombre: 'La Luna', icono: '🌙', verso: 'El farol de los enamorados' },
  { numero: 24, nombre: 'El Cotorro', icono: '🦜', verso: 'Cotorro, cotorro, saca la pata y empiézame a platicar' },
  { numero: 25, nombre: 'El Borracho', icono: '🥴', verso: '¡Qué borracho tan necio, ya no lo puedo aguantar!' },
  { numero: 26, nombre: 'El Negrito', icono: '🕺', verso: 'El que se comió el azúcar' },
  { numero: 27, nombre: 'El Corazón', icono: '❤️', verso: 'No me extrañes corazón, que regreso en el camión' },
  { numero: 28, nombre: 'La Sandía', icono: '🍉', verso: 'La barriga que Juan tenía, era empacho de sandía' },
  { numero: 29, nombre: 'El Tambor', icono: '🥁', verso: 'No te arrugues, cuero viejo, que te quiero pa\' tambor' },
  { numero: 30, nombre: 'El Camarón', icono: '🦐', verso: 'Camarón que se duerme, se lo lleva la corriente' },
  { numero: 31, nombre: 'Las Jaras', icono: '🏹', verso: 'Las jaras, donde pegan, dan' },
  { numero: 32, nombre: 'El Músico', icono: '🎺', verso: 'El músico trompas de hule, ya no me quiere tocar' },
  { numero: 33, nombre: 'La Araña', icono: '🕷️', verso: 'Atarántamela a palos, no me la dejes llegar' },
  { numero: 34, nombre: 'El Soldado', icono: '💂', verso: 'Uno, dos y tres, el soldado pa\'l cuartel' },
  { numero: 35, nombre: 'La Estrella', icono: '⭐', verso: 'La guía de los marineros' },
  { numero: 36, nombre: 'El Cazo', icono: '🥘', verso: 'El caso que te hago es poco' },
  { numero: 37, nombre: 'El Mundo', icono: '🌎', verso: 'Este mundo es una bola, y nosotros un bolón' },
  { numero: 38, nombre: 'El Apache', icono: '🪶', verso: '¡Ah, Chihuahua! Cuánto apache con pantalón y huarache' },
  { numero: 39, nombre: 'El Nopal', icono: '🌵', verso: 'Al nopal lo van a ver, nomás cuando tiene tunas' },
  { numero: 40, nombre: 'El Alacrán', icono: '🦂', verso: 'El que con la cola pica, le dan una paliza' },
  { numero: 41, nombre: 'La Rosa', icono: '🌹', verso: 'Rosita, Rosaura, ven que te quiero ahora' },
  { numero: 42, nombre: 'La Calavera', icono: '💀', verso: 'Al pasar por el panteón, me encontré un calaverón' },
  { numero: 43, nombre: 'La Campana', icono: '🔔', verso: 'Tú con la campana y yo con tu hermana' },
  { numero: 44, nombre: 'El Cantarito', icono: '🏺', verso: 'Tanto va el cántaro al agua, que se quiebra' },
  { numero: 45, nombre: 'El Venado', icono: '🦌', verso: 'Saltando va buscando, pero no ve nada' },
  { numero: 46, nombre: 'El Sol', icono: '☀️', verso: 'La cobija de los pobres' },
  { numero: 47, nombre: 'La Corona', icono: '👑', verso: 'El sombrero de los reyes' },
  { numero: 48, nombre: 'La Chalupa', icono: '🛶', verso: 'Rema que rema Lupita, sentada en su chalupita' },
  { numero: 49, nombre: 'El Pino', icono: '🌲', verso: 'Fresco y oloroso, en todo tiempo hermoso' },
  { numero: 50, nombre: 'El Pescado', icono: '🐟', verso: 'El que por la boca muere, aunque mudo fuera' },
  { numero: 51, nombre: 'La Palma', icono: '🌴', verso: 'Palmero, sube a la palma y bájame un coco real' },
  { numero: 52, nombre: 'La Maceta', icono: '🪴', verso: 'El que nace pa\' maceta, no sale del corredor' },
  { numero: 53, nombre: 'El Arpa', icono: '🎼', verso: 'Arpa vieja de mi suegra, ya no sirves pa\' tocar' },
  { numero: 54, nombre: 'La Rana', icono: '🐸', verso: 'Al ver a la verde rana, qué susto se llevó' },
];

export const TOTAL_CARTAS = CARTAS.length; // 54

/** Devuelve los números 1..54 en orden aleatorio (Fisher-Yates). */
export function barajar(): number[] {
  const mazo = CARTAS.map(c => c.numero);
  for (let i = mazo.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
  }
  return mazo;
}

export function cartaPorNumero(numero: number): Carta {
  return CARTAS[numero - 1];
}
