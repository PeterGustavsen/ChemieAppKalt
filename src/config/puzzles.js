/*
 * RAETSEL-KONFIGURATION
 * Hier kannst du Raetsel anpassen: Texte, Codes, Hints, Farben.
 * Codes sind leicht obfuskiert (String.fromCharCode).
 */

export const PUZZLES = [
  {
    id: 1,
    title: 'Arbeitstisch',
    subtitle: 'pH-Analyse',
    navLabel: 'Tisch',
    // Farben fuer diesen Screen
    accent: '#48bb78',       // Chemie-Gruen
    accentDim: '#276749',
    bgTint: 'rgba(72,187,120,0.05)',
    // Story + Aufgabe
    story:
      'Auf dem Arbeitstisch steht ein Becherglas mit einer klaren Fluessigkeit. ' +
      'Das Etikett sagt: "HCl". Daneben ein Display, das einen Code verlangt. ' +
      'Molars Notiz klebt am Bunsenbrenner: "Ohne Logarithmen kein Ausgang."',
    task:
      'Die Salzsaeure (HCl) hat eine Konzentration von c = 0,001 mol/L.\n\n' +
      'Berechne den pH-Wert dieser Loesung.\nDas Ergebnis ist dein Code.',
    formula: 'pH = -log\u2081\u2080[H\u207A]',
    hints: [
      'HCl ist eine starke Saeure \u2014 sie dissoziiert vollstaendig.',
      '[H\u207A] = c(HCl) = 0,001 mol/L = 10\u207B\u00B3 mol/L.',
      'pH = -log\u2081\u2080(10\u207B\u00B3) = 3',
    ],
    // Code: "3"
    code: String.fromCharCode(51),
  },
  {
    id: 2,
    title: 'Chemikalienschrank',
    subtitle: 'Redox-Sperre',
    navLabel: 'Schrank',
    accent: '#f6ad55',       // Bernstein/Orange
    accentDim: '#9c4221',
    bgTint: 'rgba(246,173,85,0.05)',
    story:
      'Der Chemikalienschrank ist mit einem elektronischen Schloss gesichert. ' +
      'Ein Warnschild: "HOCHSPANNUNG \u2014 Oxidationszahl bestimmen!" ' +
      'Auf dem Regal steht eine Flasche Kaliumpermanganat.',
    task:
      'Bestimme die Oxidationszahl von Mangan (Mn) in KMnO\u2084.\n\n' +
      'Der Betrag ist dein Code.',
    formula: 'K: +1  |  O: -2  |  Mn: ?\nSumme = 0',
    hints: [
      'K hat die Oxidationszahl +1.',
      '4 Sauerstoffatome: 4 \u00D7 (-2) = -8.',
      '+1 + Mn + (-8) = 0  \u2192  Mn = +7',
    ],
    // Code: "7"
    code: String.fromCharCode(55),
  },
  {
    id: 3,
    title: 'Destillationsecke',
    subtitle: 'Organische Analyse',
    navLabel: 'Destille',
    accent: '#4299e1',       // Blau
    accentDim: '#2b6cb0',
    bgTint: 'rgba(66,153,225,0.05)',
    story:
      'Die Destillationsapparatur laeuft noch. Im Auffanggefaess: eine klare ' +
      'Fluessigkeit. Das Schild sagt: "Destillat: Propan-1-ol". ' +
      'Molars Krakelschrift daneben: "Zaehlen Sie. Falls Sie das koennen."',
    task:
      'Propan-1-ol hat die Summenformel C\u2083H\u2087OH (= C\u2083H\u2088O).\n\n' +
      'Wie viele Wasserstoffatome (H) enthaelt ein Molekuel?\n' +
      'Diese Zahl ist dein Code.',
    formula: 'C\u2083H\u2087OH = C\u2083H\u2088O\nZaehle die H-Atome!',
    hints: [
      'In C\u2083H\u2087 stecken 7 Wasserstoffatome.',
      'Die OH-Gruppe hat noch 1 weiteres H.',
      '7 + 1 = 8',
    ],
    // Code: "8"
    code: String.fromCharCode(56),
  },
  {
    id: 4,
    title: 'PSE-Wand',
    subtitle: 'Stoechiometrie',
    navLabel: 'Tafel',
    accent: '#e53e3e',       // Rot (Final Boss)
    accentDim: '#9b2c2c',
    bgTint: 'rgba(229,62,62,0.05)',
    story:
      'An der Tafel neben dem Periodensystem steht eine Gleichung. ' +
      'Darunter Molars Notiz: "Mein Meisterwerk. Wer das nicht loest, ' +
      'bleibt hier. Fuer immer."',
    task:
      '4 g Wasserstoff (H\u2082) reagieren vollstaendig mit Sauerstoff:\n\n' +
      '2 H\u2082 + O\u2082 \u2192 2 H\u2082O\n\n' +
      'M(H\u2082) = 2 g/mol  |  M(H\u2082O) = 18 g/mol\n\n' +
      'Wie viele Gramm Wasser entstehen?',
    formula: '2 H\u2082 + O\u2082 \u2192 2 H\u2082O',
    hints: [
      'n(H\u2082) = m / M = 4 / 2 = 2 mol',
      '2 mol H\u2082 \u2192 2 mol H\u2082O (1:1 laut Gleichung)',
      'm(H\u2082O) = 2 \u00D7 18 = 36 g',
    ],
    // Code: "36"
    code: String.fromCharCode(51, 54),
  },
];

// Timer in Sekunden (40 Minuten)
export const TOTAL_TIME = 40 * 60;

// Intro-Dialoge des Professors
export const DIALOG_LINES = [
  'Sie. Ja, SIE. Kommen Sie naeher.\nAber nicht ZU nahe.',
  'Meine Forschung... die Molar\'sche Synthese...\nVexaChem will sie stehlen. Ich WEISS es.\nDie Putzfrau gestern hat VERDAECHTIG geputzt.',
  'Ich habe ein kleines Sicherheitssystem\ninstalliert. Sieben Ebenen.\nChemische Codes. Unknackbar. Theoretisch.',
  'Drei der Ebenen habe ich selbst vergessen.\nAus Sicherheitsgruenden.\nGenie hat seinen Preis.',
  'Ich muss jetzt gehen. Wichtige Angelegenheiten.\nFassen Sie NICHTS an.\nAtmen Sie moeglichst wenig.',
  'Prof. Molar hastet zur Tuer, murmelt\netwas von "Spionen im Lueftungsschacht"\nund verschwindet...',
];
