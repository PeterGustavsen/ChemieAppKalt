export const SCENE_W = 640;
export const SCENE_H = 360;

export const TIMER_SECONDS = 20 * 60;

export const TERMINAL = { x: 246, y: 120, w: 150, h: 150 };
export const TERMINAL_SCREEN = { x: 258, y: 132, w: 126, h: 106 };

export const ROOMS = [
  {
    id: 1, key: 'door1', scene: 2,
    title: 'Pufferplatz', theme: 'Saeure-Base',
    accent: '#e36fb0',
    code: '575',
    rect: { x: 404, y: 60, w: 72, h: 104 },
    examine: 'Bechergläser mit Essigsäure und Acetat. Stelle den Puffer auf den geforderten pH ein.',
  },
  {
    id: 2, key: 'door2', scene: 3,
    title: 'Reagenzschrank', theme: 'Redox',
    accent: '#e0b44c',
    code: '17',
    rect: { x: 482, y: 60, w: 72, h: 104 },
    examine: 'Eine tiefviolette Permanganat-Loesung neben einer Eisen(II)-Probe. Werte die Redox-Reaktion aus.',
  },
  {
    id: 3, key: 'door3', scene: 4,
    title: 'Zellenbank', theme: 'Elektrochemie',
    accent: '#5a8fe0',
    code: '1100',
    rect: { x: 560, y: 60, w: 72, h: 104 },
    examine: 'Metallelektroden und Salzbrücken. Baue die galvanische Zelle mit der geforderten Spannung.',
  },
  {
    id: 4, key: 'door4', scene: 5,
    title: 'Apparate-Tisch', theme: 'Organik',
    accent: '#6fe08a',
    code: '482',
    rect: { x: 404, y: 176, w: 72, h: 104 },
    examine: 'Kolben mit Säuren und Alkoholen. Führe die richtige Veresterung durch.',
  },
  {
    id: 5, key: 'door5', scene: 6,
    title: 'Elektrolyse-Wanne', theme: 'Elektrolyse',
    accent: '#e0863a',
    code: '10000',
    rect: { x: 482, y: 176, w: 72, h: 104 },
    examine: 'Eine Elektrolysezelle mit Kupfersalz. Scheide die geforderte Stoffmenge ab.',
  },
  {
    id: 6, key: 'door6', scene: 7,
    title: 'GG-Reaktor', theme: 'Gleichgewicht',
    accent: '#9660c8',
    code: '64',
    rect: { x: 560, y: 176, w: 72, h: 104 },
    examine: 'Ein geschlossener Reaktor. Bestimme die Gleichgewichtskonstante Kc.',
  },
];

export const PUZZLES = {
  2: {
    intro: [
      'Ein Acetat-Puffer: Essigsäure (HAc) und Acetat-Ionen (Ac⁻) in Lösung.',
      'pKs(Essigsäure) = 4,75. Stelle die Konzentrationen so ein, dass pH = 5,75 wird.',
      'Henderson-Hasselbalch: pH = pKs + log( c(Ac⁻) / c(HAc) ). Der pH ergibt den Code.',
    ],
    hint: [
      'Du brauchst log( c(Ac⁻)/c(HAc) ) = +1, also Verhältnis 10 : 1.',
      'z. B. c(Ac⁻) = 0,10 mol/L und c(HAc) = 0,010 mol/L.',
      'pH = 4,75 + 1 = 5,75  ->  Code 575.',
    ],
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
      'Eine galvanische Zelle. Wähle Anode und Kathode aus den Metallen.',
      'Standardpotenziale: Zn −0,76 V · Fe −0,44 V · Cu +0,34 V · Ag +0,80 V.',
      'Baue die Zelle mit EMK = 1,10 V. Die EMK in mV ergibt den Code.',
    ],
    hint: [
      'EMK = E°(Kathode) − E°(Anode), die Anode ist das unedlere Metall.',
      'Für 1,10 V: Anode Zn (−0,76 V), Kathode Cu (+0,34 V).',
      'EMK = 0,34 − (−0,76) = 1,10 V = 1100 mV  ->  Code 1100.',
    ],
  },
  5: {
    intro: [
      'Veresterung: eine Carbonsäure reagiert mit einem Alkohol zum Ester (+ Wasser).',
      'Wähle Säure und Alkohol so, dass der Ester C₄H₈O₂ entsteht.',
      'Code = Anzahl(C)·100 + Anzahl(H)·10 + Anzahl(O) des Esters.',
    ],
    hint: [
      'C₄H₈O₂ hat 4 C-Atome: Säure und Alkohol liefern zusammen 4 C.',
      'Propansäure (3 C) + Methanol (1 C) → Methylpropanoat, C₄H₈O₂.',
      'Code = 4·100 + 8·10 + 2 = 482.',
    ],
  },
  6: {
    intro: [
      'Elektrolyse einer Kupfersalz-Lösung: Cu²⁺ + 2 e⁻ → Cu.',
      'Konstanter Strom I = 9,65 A, Faraday-Konstante F = 96500 C/mol.',
      'Stelle die Zeit so ein, dass 0,50 mol Cu abgeschieden werden. t in s ergibt den Code.',
    ],
    hint: [
      'Ladung Q = I · t. Stoffmenge n(Cu) = Q / (z · F) mit z = 2.',
      'Für 0,50 mol: Q = 0,50 · 2 · 96500 = 96500 C.',
      't = Q / I = 96500 / 9,65 = 10000 s  ->  Code 10000.',
    ],
  },
  7: {
    intro: [
      'Geschlossener Reaktor im Gleichgewicht: H₂ + I₂ ⇌ 2 HI.',
      'Im Gleichgewicht: c(HI) = 0,8 mol/L, c(H₂) = c(I₂) = 0,1 mol/L.',
      'Bestimme die Gleichgewichtskonstante Kc. Ihr Wert ist der Code.',
    ],
    hint: [
      'Kc = c(HI)² / ( c(H₂) · c(I₂) ).',
      'Setze ein: 0,8² / (0,1 · 0,1) = 0,64 / 0,01.',
      'Kc = 64  ->  Code 64.',
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
  'Lösen Sie alle sechs verschlüsselten Stationen.',
  'Geben Sie die Codes am Terminal ein.',
  'Zeit bis zur Notabschaltung: 20 Minuten.',
];

export const WIN_DIALOG = [
  'Ich bins, Molar. Vermutlich. Lassen Sie sich nicht täuschen, falls jemand behauptet, ich zu sein.',
  'Die Verriegelung... ja. Das war ich. Beim Rausgehen habe ich den falschen Knopf gedrückt.',
  'ABER — Sie haben alle sechs Verschlüsselungen geknackt. Das beweist: Sie sind ein echter Chemiker.',
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
    after: 3,
    lines: [
      'Drei Codes. Halbzeit. Molar hier.',
      'Ähem — die Kühlanlage. Ich habe dort beim Rausgehen eventuell etwas gedrückt.',
      'Könnte relevant sein. Könnte.',
    ],
  },
  {
    after: 5,
    lines: [
      'Fünf Codes! Nur noch einer.',
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
