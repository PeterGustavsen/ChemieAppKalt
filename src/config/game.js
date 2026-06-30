export const SCENE_W = 640;
export const SCENE_H = 360;

export const TIMER_SECONDS = 30 * 60;

// Navigation läuft über die NavBar; der PC ist wieder der große zentrale
// CRT-Monitor (wie vor dem 6-Stationen-Umbau), mit dem Fenster dahinter.
export const TERMINAL        = { x: 246, y: 120, w: 150, h: 150 };
export const TERMINAL_SCREEN = { x: 258, y: 132, w: 126, h: 106 };

export const ROOMS = [
  {
    id: 1, key: 'door1', scene: 2, title: 'Galvanische Zelle', theme: 'Spannungsreihe',
    accent: '#6fd3dd', code: '110', rect: { x: 44, y: 56, w: 104, h: 76 },
    examine: 'Zwei Metallelektroden, Salzbrücke und Voltmeter. Baue die Zelle mit der richtigen Spannung.',
  },
  {
    id: 2, key: 'door2', scene: 3, title: 'Opferanode', theme: 'Korrosionsschutz',
    accent: '#e36fb0', code: '236', rect: { x: 268, y: 56, w: 104, h: 76 },
    examine: 'Ein Eisenrohr im Ferroxyl-Indikator. Wähle das Metall, das das Eisen schützt.',
  },
  {
    id: 3, key: 'door3', scene: 4, title: 'Rosten von Eisen', theme: 'Redox',
    accent: '#e0b44c', code: '2122', rect: { x: 492, y: 56, w: 104, h: 76 },
    examine: 'Feuchtes Eisen an Luft. Stelle die Teilgleichungen und die Gesamtreaktion auf.',
  },
  {
    id: 4, key: 'door4', scene: 5, title: 'Elektrophile Addition', theme: 'Bromonium-Mechanismus',
    accent: '#9660c8', code: '357', rect: { x: 44, y: 158, w: 104, h: 76 },
    examine: 'Ethen trifft Bromwasser. Ordne die Schritte des Bromonium-Mechanismus.',
  },
  {
    id: 5, key: 'door5', scene: 6, title: 'Bromwasser-Test', theme: 'Sättigung der Fette',
    accent: '#6fe08a', code: '285', rect: { x: 268, y: 158, w: 104, h: 76 },
    examine: 'Drei Öle, drei Reagenzgläser Bromwasser. Ordne nach steigender Sättigung.',
  },
  {
    id: 6, key: 'door6', scene: 7, title: 'Isomerie', theme: 'E/Z-Zuordnung',
    accent: '#f0b23a', code: '246', rect: { x: 492, y: 158, w: 104, h: 76 },
    examine: 'Drei Doppelbindungen. Bestimme nach CIP jeweils E oder Z.',
  },
];

// ── Standardpotenziale (Klassensatz, in Volt) ────────────────────────────────
export const E0 = {
  Fe: -0.41, Mg: -2.36, Al: -1.67, Zn: -0.76, Cu: 0.34, O2: 0.40,
};

// ── Reine Hilfsfunktionen (Szenen dürfen sie aufrufen) ───────────────────────
// ΔE = E°(Kathode) − E°(Anode), auf 2 Stellen.
export const cellVoltage = (anode, cathode) =>
  +(E0[cathode] - E0[anode]).toFixed(2);
// Opfermetall schützt Eisen, wenn es unedler ist (E° < E°(Fe)).
export const isProtected = (sym) => E0[sym] < E0.Fe;
// Spannung/Potenzial → Code-String: Betrag, 2 Nachkommastellen, ohne Komma.
//   1,10 → "110"   −2,36 → "236"
export const dropComma = (v, dec = 2) => Math.abs(v).toFixed(dec).replace('.', '');

export const PUZZLES = {
  // ── 1) Galvanische Zelle — Spannungsreihe ──────────────────────────────────
  2: {
    intro: [
      'Zwei Halbzellen, eine Salzbrücke, ein Voltmeter — die klassische Zink-Kupfer-Zelle.',
      'Wähle Anode (Minuspol, unedler) und Kathode (Pluspol, edler).',
      'Code = Zellspannung ΔE in Volt, ohne Komma.',
    ],
    hint: [
      'ΔE = E°(Kathode) − E°(Anode). Die Anode ist das unedlere Metall.',
      'Zn (−0,76 V) als Anode, Cu (+0,34 V) als Kathode.',
      'ΔE = 0,34 − (−0,76) = 1,10 V  →  Code 110.',
    ],
    electrodes: [
      { sym: 'Zn', E: -0.76 }, { sym: 'Cu', E: 0.34 },
      { sym: 'Mg', E: -2.36 }, { sym: 'Fe', E: -0.41 },
    ],
    answer: { anode: 'Zn', cathode: 'Cu' },   // ΔE = E[cathode] − E[anode] = 1.10 V
    deltaE: 1.10, code: '110',
  },

  // ── 2) Opferanode — Korrosionsschutz (Ferroxyl) ────────────────────────────
  3: {
    intro: [
      'Ein Eisenrohr soll vor Korrosion geschützt werden — kathodischer Schutz.',
      'Verbinde es mit einem Opfermetall, das sich anstelle des Eisens auflöst.',
      'Code = Betrag des Standardpotenzials dieses Metalls, ohne Komma/Vorzeichen.',
    ],
    hint: [
      'Das Opfermetall muss unedler sein als Eisen (E° < −0,41 V). Kupfer beschleunigt das Rosten.',
      'Je unedler, desto wirksamer — Magnesium ist am unedelsten.',
      'Mg: E° = −2,36 V  →  Code 236.',
    ],
    metals: [
      { sym: 'Cu', E: 0.34, protects: false }, { sym: 'Zn', E: -0.76, protects: true },
      { sym: 'Mg', E: -2.36, protects: true }, { sym: 'Al', E: -1.67, protects: true },
    ],
    best: 'Mg', code: '236',                  // schützt = E° < Fe; Cu beschleunigt Korrosion
  },

  // ── 3) Rosten von Eisen — Teil- & Gesamtgleichung ──────────────────────────
  4: {
    intro: [
      'Eisen rostet an feuchter Luft — eine elektrochemische Korrosion.',
      'Stelle Anoden- und Kathoden-Teilgleichung auf und gleiche die Gesamtreaktion aus.',
      'Code = Koeffizienten der Gesamtgleichung: Fe, O₂, H₂O, Fe(OH)₂.',
    ],
    hint: [
      'Anode: Fe → Fe²⁺ + 2 e⁻.   Kathode: O₂ + 2 H₂O + 4 e⁻ → 4 OH⁻.',
      'Elektronen ausgleichen: Anode ×2, Kathode ×1.',
      '2 Fe + O₂ + 2 H₂O → 2 Fe(OH)₂  →  Code 2122.',
    ],
    anode: { eq: 'Fe → Fe²⁺ + 2 e⁻', electrons: 2 },
    cathode: { eq: 'O₂ + 2 H₂O + 4 e⁻ → 4 OH⁻', electrons: 4 },
    overall: [2, 1, 2, 2], code: '2122',      // 2 Fe + O₂ + 2 H₂O → 2 Fe(OH)₂
  },

  // ── 4) Elektrophile Addition — Bromonium-Mechanismus ───────────────────────
  5: {
    intro: [
      'Brom (Br₂) addiert an die C=C-Doppelbindung von Ethen — elektrophile Addition.',
      'Bringe die drei Schritte des Mechanismus in die richtige Reihenfolge.',
      'Code = die Ziffern der Schritte in korrekter Reihenfolge.',
    ],
    hint: [
      'Zuerst polarisiert die π-Bindung das Br₂-Molekül.',
      'Dann bildet sich das cyclische Bromonium-Ion, ein Br⁻ wird frei.',
      'Br⁻ greift von der Rückseite an → 1,2-Dibromethan.  →  Code 357.',
    ],
    steps: [
      { id: 'polar',     label: 'Polarisierung des Br₂',                  order: 0, digit: '3' },
      { id: 'bromonium', label: 'Bromonium-Ion + Br⁻',                    order: 1, digit: '5' },
      { id: 'attack',    label: 'Nucleophiler Angriff → 1,2-Dibromethan', order: 2, digit: '7' },
    ],
    code: '357',
  },

  // ── 5) Bromwasser-Test — Sättigung der Fette ───────────────────────────────
  6: {
    intro: [
      'Bromwasser entfärbt sich an ungesättigten Fettsäuren (C=C-Doppelbindungen).',
      'Drei Öle, drei Reagenzgläser — ordne sie nach STEIGENDER Sättigung.',
      'Code = die Ziffern der Öle in dieser Reihenfolge.',
    ],
    hint: [
      'Mehr Doppelbindungen → stärkere Entfärbung → ungesättigter.',
      'Sonnenblumenöl (mehrfach) < Olivenöl (einfach) < Kokosöl (gesättigt).',
      'Reihenfolge steigender Sättigung: 2, 8, 5  →  Code 285.',
    ],
    oils: [
      { name: 'Sonnenblumenöl', unsat: 'poly', decolorizes: true,  order: 0, digit: '2' },
      { name: 'Olivenöl',       unsat: 'mono', decolorizes: true,  order: 1, digit: '8' },
      { name: 'Kokosöl',        unsat: 'none', decolorizes: false, order: 2, digit: '5' },
    ],
    code: '285',                              // order = steigende Sättigung
  },

  // ── 6) Isomerie — E/Z-Zuordnung (CIP) ──────────────────────────────────────
  // handoff #2: Konstantin zeichnet jede Geometrie passend zu `answer`.
  7: {
    intro: [
      'Bei C=C-Doppelbindungen gibt es E/Z-Isomerie (cis/trans).',
      'Bestimme nach den CIP-Regeln für jedes Molekül E oder Z.',
      'Code = die Ziffern der Moleküle in der gezeigten Reihenfolge.',
    ],
    hint: [
      'Auf jedem Doppelbindungs-C die höhere Priorität bestimmen (CIP: höhere Ordnungszahl).',
      'Beide hohen Prioritäten auf gleicher Seite → Z, auf gegenüberliegender → E.',
      'Hier: Z, E, Z  →  Code 246.',
    ],
    molecules: [
      { name: '1-Chlorprop-1-en',           answer: 'Z', digit: '2' },
      { name: '(Ethyl)(Methyl)C=C(Cl)(Br)', answer: 'E', digit: '4' },
      { name: '(F)(Cl)C=C(Br)(I)',          answer: 'Z', digit: '6' },
    ],
    code: '246',
  },
};

// ── Dialoge ──────────────────────────────────────────────────────────────────

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
  'Lösen Sie alle sechs verschlüsselten Stationen.',
  'Geben Sie die Codes am Terminal ein.',
  'Zeit bis zur Notabschaltung: 30 Minuten.',
];

export const WIN_DIALOG = [
  'Ich bins, Molar. Vermutlich. Lassen Sie sich nicht täuschen, falls jemand behauptet, ich zu sein.',
  'Die Verriegelung... ja. Das war ich. Beim Rausgehen habe ich den falschen Knopf gedrückt.',
  'ABER — Sie haben alle sechs Verschlüsselungen geknackt. Das beweist: Sie sind ein echter Chemiker.',
  'Willkommen im Team. Sagen Sie aber niemandem, was Sie hier gesehen haben. Vor allem nicht den Diensten.',
];

// Progress-Calls feuern, wenn solvedIds.length den Wert `after` erreicht (0..5).
// Der finale Panik-Call (after: null) feuert bei 2 min Restzeit.
export const RADIO_CALLS = [
  {
    after: 0,
    lines: [
      'Hier Molar. Empfangen Sie mich?',
      'Ich beobachte die Straße. Jemand läuft verdächtig langsam.',
      '...Das ist eine Katze. Trotzdem verdächtig. Fangen Sie an — die galvanische Zelle.',
    ],
  },
  {
    after: 1,
    lines: [
      'Erster Code bestätigt. Gut.',
      'Misstrauen Sie allen Messwerten — besonders denen, die stimmen.',
      'Weiter zur Opferanode.',
    ],
  },
  {
    after: 2,
    lines: [
      'Zwei Codes. Sie sind doch ein Chemiker. Oder ein sehr guter Spion.',
      'Das Eisen rostet weiter, während wir reden.',
      'Stellen Sie die Gleichungen auf.',
    ],
  },
  {
    after: 3,
    lines: [
      'Drei Codes. Halbzeit. Molar hier.',
      'Ähem — die Kühlanlage. Ich habe dort beim Rausgehen eventuell etwas gedrückt.',
      'Könnte relevant sein. Könnte. Weiter mit der Organik.',
    ],
  },
  {
    after: 4,
    lines: [
      'Vier Codes! Riechen Sie das Brom? Nein? Gut. Sollten Sie auch nicht.',
      'Nur noch die Sättigung und die Isomerie.',
      'Beeilen Sie sich.',
    ],
  },
  {
    after: 5,
    lines: [
      'Fünf Codes! Nur noch einer.',
      'Die Kühlanlage der explosiven Substanzen — sie läuft nicht mehr.',
      'Bitte. BEEILEN. E oder Z. Sie schaffen das.',
    ],
  },
  {
    after: null, // zeitbasiert — feuert bei 2 min Restzeit
    at: 2 * 60,
    lines: [
      'ICH BIN ES, MOLAR. Hören Sie mich?!',
      'Wurscht wer Sie geschickt hat — lösen Sie das JETZT.',
      'Ich drücke hier Knöpfe. Hoffentlich die richtigen.',
    ],
  },
];
