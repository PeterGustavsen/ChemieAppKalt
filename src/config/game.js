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
    code: '2121',
    rect: { x: 540, y: 60, w: 88, h: 104 },
    examine: 'Reagenzien im Regal. Balanciere die Faellungsreaktion — die Koeffizienten ergeben den Code.',
  },
  {
    id: 3, key: 'door3', scene: 4,
    title: 'Periodensystem', theme: 'Atombau',
    accent: '#9660c8',
    code: '109',
    rect: { x: 440, y: 176, w: 88, h: 104 },
    examine: 'Die grosse PSE-Wandtafel. Finde die Elemente nach ihren Eigenschaften.',
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

/*
 * Raetsel-Daten je Kammer. Layout-Koordinaten (Hotspots der Apparaturen)
 * liegen in den jeweiligen Szenen-Komponenten, deckungsgleich mit den
 * Pillow-Generatoren in tools/pixelart/.
 */
export const PUZZLES = {
  // ---- Szene 2: Titration ----  Aequivalenzpunkt bei 23,0 mL -> Code 23
  2: {
    intro: [
      'Salzsaeure unbekannter Konzentration im Kolben, Phenolphthalein als Indikator.',
      'In der Buerette ist 0,1-molare Natronlauge. Titriere bis zum Umschlag!',
      'Beim ersten bleibenden Rosaton ist der Aequivalenzpunkt erreicht. Lies das Volumen ab.',
    ],
    hint: [
      'Phenolphthalein ist im Sauren farblos, im Basischen pink (Umschlag pH ~8,2).',
      'Tropfe langsam — am Aequivalenzpunkt genuegt EIN Tropfen fuer den Umschlag.',
      'Das abgelesene Volumen in mL (ohne Komma) ist dein Code.',
    ],
    equivalence: 23.0,    // mL
    fineStep: 0.5, coarseStep: 2.0, overshoot: 24.5,
  },
  // ---- Szene 3: Stoechiometrie ----  2 AgNO3 + 1 CaCl2 -> 2 AgCl + 1 Ca(NO3)2
  3: {
    intro: [
      'Eine Faellungsreaktion: Silbernitrat trifft auf Calciumchlorid.',
      'Stelle die Koeffizienten so ein, dass die Gleichung ausgeglichen ist.',
      'Die vier Koeffizienten ergeben — der Reihe nach — den Code.',
    ],
    hint: [
      'Zaehle jedes Element auf beiden Seiten: Ag, N, O, Ca, Cl.',
      'Cl: links 2 (in CaCl2) -> rechts 2x AgCl. Ag dann ebenfalls 2.',
      'Loesung: 2, 1, 2, 1.',
    ],
    terms: ['AgNO₃', 'CaCl₂', 'AgCl', 'Ca(NO₃)₂'],
    solution: [2, 1, 2, 1],
  },
  // ---- Szene 4: PSE ----  Neon (10) + Fluor (9) -> Code 109
  4: {
    intro: [
      'Die Wandtafel des Periodensystems. Zwei Elemente sind gesucht.',
      'Tippe das jeweils passende Element an — die Ordnungszahlen ergeben den Code.',
    ],
    hint: [
      'Edelgase stehen in Gruppe 18 (letzte Spalte), Halogene in Gruppe 17.',
      'Die 2. Periode ist die zweite Zeile (Li bis Ne).',
      'Neon = 10, Fluor = 9  ->  Code 109.',
    ],
    clues: [
      { text: 'Edelgas der 2. Periode', symbol: 'Ne', z: 10 },
      { text: 'Leichtestes Halogen', symbol: 'F', z: 9 },
    ],
  },
  // ---- Szene 5: Organik ----  Oxidationsreihe Alkohol<Aldehyd<Saeure -> 147
  5: {
    intro: [
      'Drei C₂-Molekuele. Erkenne die funktionellen Gruppen.',
      'Klicke sie in der Reihenfolge STEIGENDER Oxidationszahl des Kohlenstoffs.',
      'Jedes Molekuel traegt eine Ziffer — die richtige Reihenfolge ergibt den Code.',
    ],
    hint: [
      'Oxidationsreihe: Alkohol  ->  Aldehyd  ->  Carbonsaeure.',
      'Also: Ethanol (-OH), dann Ethanal (-CHO), dann Essigsaeure (-COOH).',
      'Die Ziffern in dieser Reihenfolge: 1, 4, 7.',
    ],
    molecules: [
      { name: 'Ethanol', group: '-OH', formula: 'C₂H₅OH', digit: '1', order: 0 },
      { name: 'Essigsaeure', group: '-COOH', formula: 'CH₃COOH', digit: '7', order: 2 },
      { name: 'Ethanal', group: '-CHO', formula: 'CH₃CHO', digit: '4', order: 1 },
    ],
  },
};

export const TIMER_SECONDS = 20 * 60; // 20 Minuten

// Molar-Eroeffnungsdialog
export const INTRO_DIALOG = [
  'Willkommen! Ich bin Prof. Dr. Molar — aber wir haben ein PROBLEM.',
  'Die Kuehlanlage fuer die explosiven Reagenzien ist ausgefallen!',
  'In 20 Minuten erreichen die Substanzen die kritische Temperatur.',
  'Vier Kammern, vier Codes. Loese die Raetsel und gib die Codes hier ein.',
  'Das entriegelt den Sicherheitsverschluss — dann kannst du fliehen!',
];

// Abschied — Molar verlässt das Labor, Notstrom springt an
export const FAREWELL_DIALOG = [
  'Der Notstromgenerator! Ich muss sofort in den Keller — du bist allein!',
  'Vertrau der Chemie. Beeile dich. Viel Glueck!',
];
