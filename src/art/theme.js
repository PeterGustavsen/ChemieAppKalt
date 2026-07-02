/*
 * theme — Farbpalette + kleine Helfer der prozeduralen HD-Grafik.
 * Dunkles Industrielabor: satte Petrol-Wände, warmes Lampenlicht, Stahl, Holz.
 */

export const T = {
  // Wand (Petrol-Fliesen)
  wallTop: '#2c6272',
  wallBot: '#153039',
  wallGrout: 'rgba(6,18,24,0.45)',
  wallSheen: 'rgba(190,240,255,0.05)',

  // Sockel + Lichtleiste
  base: '#3a7480',
  baseDark: '#255057',
  glowWarm: '#ffd980',

  // Boden
  floorTop: '#4c5669',
  floorBot: '#20242f',
  floorJoint: 'rgba(10,12,18,0.55)',

  // Holz (Werkbank)
  wood: '#7c5028',
  woodDark: '#553517',
  woodTop: '#96632f',
  woodGrain: 'rgba(60,34,12,0.35)',

  // Stahl
  steel: '#5d707e',
  steelDark: '#37444e',
  steelLight: '#8fa6b4',

  // Glas
  glassFill: 'rgba(150,215,235,0.14)',
  glassEdge: 'rgba(200,240,250,0.55)',
  glassShine: 'rgba(255,255,255,0.35)',

  // Panels / Bildschirme
  panel: '#080e14',
  panelEdge: '#33434f',
  panelGlow: 'rgba(111,232,122,0.08)',

  // Akzente
  green: '#6fe87a',
  red: '#e82010',
  amber: '#ffb347',
  paper: '#e8dfc2',
};

// '#rrggbb' + Deckkraft -> 'rgba(...)'
export function alpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// '#rrggbb' aufhellen (f>0) / abdunkeln (f<0), f in [-1..1]
export function shade(hex, f) {
  const c = (i) => {
    let v = parseInt(hex.slice(i, i + 2), 16);
    v = f > 0 ? v + (255 - v) * f : v * (1 + f);
    return Math.round(Math.min(255, Math.max(0, v)));
  };
  return `rgb(${c(1)},${c(3)},${c(5)})`;
}

// Deterministischer Pseudozufall (für Fliesen-Variationen, Staub, …)
export function rnd(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Weiches Lampenflackern: Summe zweier Sinus + seltene tiefe Dips.
export function flicker(t, seed = 0) {
  const s = Math.sin(t * 7.3 + seed) * 0.03 + Math.sin(t * 1.7 + seed * 2) * 0.04;
  const dip = Math.sin(t * 0.43 + seed) > 0.992 ? -0.25 : 0;
  return 1 + s + dip;
}
