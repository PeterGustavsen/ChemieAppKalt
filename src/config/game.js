export const SCENE_W = 640;
export const SCENE_H = 360;

export const TIMER_SECONDS = 20 * 60;

export const TERMINAL = { x: 246, y: 120, w: 150, h: 150 };
export const TERMINAL_SCREEN = { x: 258, y: 132, w: 126, h: 106 };

export const ROOMS = [
  {
    id: 1, key: 'door1', scene: 2,
    title: 'Titrationskammer', theme: 'Saeure / Base',
    accent: '#e36fb0',
    code: '23',
    rect: { x: 440, y: 60, w: 88, h: 104 },
    examine: 'Eine Buerette ueber einem Erlenmeyerkolben. Titriere bis zum Umschlagpunkt.',
  },
  {
    id: 2, key: 'door2', scene: 3,
    title: 'Reagenzschrank', theme: 'Redox',
    accent: '#e0b44c',
    code: '17',
    rect: { x: 540, y: 60, w: 88, h: 104 },
    examine: 'Eine tiefviolette Permanganat-Loesung neben einer Eisen(II)-Probe. Werte die Redox-Reaktion aus.',
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
    examine: 'Glasapparatur ueber einem Bunsenbrenner. Reaktionsmechanismus aufbauen.',
  },
];

export const PUZZLES = {
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
    equivalence: 23.0,
    fineStep: 0.5, coarseStep: 2.0, overshoot: 24.5,
  },
  3: {
    intro: [
      'Kaliumpermanganat — tiefviolett — neben einer Eisen(II)-Loesung. Beide im sauren Milieu.',
      'Redox-Reaktion: MnO₄⁻ + Fe²⁺ → Mn²⁺ + Fe³⁺.',
      'Stelle die Teilgleichungen auf und gleiche aus. Die Zahlen ergeben den Code.',
    ],
    hint: [
      'Reduktion: MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O.',
      'Oxidation: Fe²⁺ → Fe³⁺ + e⁻  — fuenffach, also 5 Elektronen.',
      'CODE = n(H⁺) + n(H₂O) + n(e⁻) = 8 + 4 + 5.',
    ],
  },
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

// ── Dialoge ─────────────────────────────────────────────────────────────────

export const INTRO_DIALOG = [
  'Sie. Ja, SIE. Kommen Sie näher. Aber nicht ZU nahe.',
  'Mein Name ist Professor Doktor Molar. Und nein — ich bin nicht paranoid. Paranoid wäre, wenn sie NICHT hinter mir her wären.',
  'Sie sind also der neue Assistent. Hmpf. Sie könnten auch von DENEN geschickt sein. Den Diensten. Sie wissen schon.',
  'Egal. Ich habe etwas entwickelt. Etwas, das die halbe Welt gern hätte. Deshalb ist alles hier verschlüsselt — nur ein echter Chemiker kommt rein.',
  'Behalten Sie alles im Auge. Vertrauen Sie niemandem. Und fassen Sie meine Reagenzgläser nicht an.',
];

export const FAREWELL_DIALOG = [
  'Ich muss kurz nachsehen, ob mich jemand verfolgt hat.',
  '... Bleiben Sie einfach hier. Rühren Sie nichts an.',
];

export const ALARM_LINES = [
  '[!] SICHERHEITSALARM AUSGELÖST [!]',
  'EINDRINGLING ERKANNT — LABOR VERRIEGELT',
  'Lösen Sie alle vier verschlüsselten Stationen.',
  'Geben Sie die Codes am Terminal ein.',
  'Zeit bis zur Notabschaltung: 20 Minuten.',
];

export const WIN_DIALOG = [
  'Ich bins, Molar. Vermutlich. Lassen Sie sich nicht täuschen, falls jemand behauptet, ich zu sein.',
  'Die Verriegelung... ja. Das war ich. Beim Rausgehen habe ich den falschen Knopf gedrückt.',
  'ABER — Sie haben alle vier Verschlüsselungen geknackt. Das beweist: Sie sind ein echter Chemiker.',
  'Willkommen im Team. Sagen Sie aber niemandem, was Sie hier gesehen haben. Vor allem nicht den Diensten.',
];

// Progress-based calls fire when solvedIds.length reaches `after`.
// The final panic call (after: null) fires at 2 min remaining.
export const RADIO_CALLS = [
  {
    after: 0,
    lines: [
      'Hier Molar. Empfangen Sie mich?',
      'Ich beobachte die Straße. Jemand läuft verdächtig langsam.',
      '...Das ist eine Katze. Trotzdem verdächtig. Fangen Sie an.',
    ],
  },
  {
    after: 1,
    lines: [
      'Erster Code bestätigt. Gut.',
      'Misstrauen Sie allen Messwerten — besonders denen, die stimmen.',
      'Weitermachen.',
    ],
  },
  {
    after: 2,
    lines: [
      'Zwei Codes. Halbzeit. Molar hier.',
      'Ähem — die Kühlanlage. Ich habe dort beim Rausgehen eventuell etwas gedrückt.',
      'Könnte relevant sein. Könnte.',
    ],
  },
  {
    after: 3,
    lines: [
      'Drei Codes! Noch einer.',
      'Die Kühlanlage der explosiven Substanzen — sie läuft nicht mehr.',
      'Bitte. BEEILEN.',
    ],
  },
  {
    after: null, // time-based panic — fires at 2 min remaining
    at: 2 * 60,
    lines: [
      'ICH BIN ES, MOLAR. Hören Sie mich?!',
      'Wurscht wer Sie geschickt hat — lösen Sie das JETZT.',
      'Ich drücke hier Knöpfe. Hoffentlich die richtigen.',
    ],
  },
];
