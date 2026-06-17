/*
 * Spiel-Konfiguration: Raeume, Codes, Hotspots, Dialoge.
 * Hotspot-Koordinaten sind DECKUNGSGLEICH mit tools/pixelart/scene_01_lab_hub.py
 * (640x360 Render-Raum).
 */

export const SCENE_W = 640;
export const SCENE_H = 360;

// Terminal-Hotspot + Screen-Innenfeld (siehe draw_terminal im Python-Skript)
export const TERMINAL = { x: 246, y: 120, w: 150, h: 150 };
export const TERMINAL_SCREEN = { x: 258, y: 132, w: 126, h: 106 };

/*
 * Die 4 Raetselraeume. `code` = Loesung, die im jeweiligen Raum erspielt und
 * dann am Haupt-Terminal eingetragen wird. Codes sind vorlaeufig und werden
 * beim Bau der Raeume (Szene 2-5) final verankert.
 */
export const ROOMS = [
  {
    id: 1, key: 'door1', scene: 2,
    title: 'Titrationskammer', theme: 'Saeure / Base',
    accent: '#e36fb0',
    code: '23',
    rect: { x: 440, y: 60, w: 88, h: 104 },
    examine: 'Eine Buerette ueber einem Erlenmeyerkolben. Titriere bis zum Umschlagpunkt — das Volumen ergibt den Code.',
  },
  {
    id: 2, key: 'door2', scene: 3,
    title: 'Reagenzschrank', theme: 'Stoechiometrie',
    accent: '#e0b44c',
    code: '1121',
    rect: { x: 540, y: 60, w: 88, h: 104 },
    examine: 'Reagenzien im Regal. Balanciere die FAEllungsreaktion — die Koeffizienten ergeben den Code.',
  },
  {
    id: 3, key: 'door3', scene: 4,
    title: 'Periodensystem', theme: 'Atombau',
    accent: '#9660c8',
    code: '26',
    rect: { x: 440, y: 176, w: 88, h: 104 },
    examine: 'Die grosse PSE-Wandtafel. Ordne die Elemente nach ihren Eigenschaften zu.',
  },
  {
    id: 4, key: 'door4', scene: 5,
    title: 'Apparate-Tisch', theme: 'Organik',
    accent: '#6fe08a',
    code: '147',
    rect: { x: 540, y: 176, w: 88, h: 104 },
    examine: 'Glasapparatur ueber einem Bunsenbrenner. Setze den Reaktionsmechanismus richtig zusammen.',
  },
];

// Molar-Eroeffnungsdialog (JRPG-Stil, Typewriter)
export const INTRO_DIALOG = [
  'Willkommen in meinem Labor! Ich bin Prof. Dr. Molar.',
  'Die Tuer hat sich verriegelt — Sicherheitsprotokoll. Vier Kammern, vier Codes.',
  'In jeder Kammer loest du ein chemisches Raetsel. Es verraet dir einen Code.',
  'Diesen Code gibst du hier am Terminal in der Mitte ein.',
  'Stimmt der Code, entriegelt sich die naechste Kammer. Tippe eine Kammer an!',
];
