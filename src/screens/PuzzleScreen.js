/*
 * PuzzleScreen — interactive chemistry mechanics per puzzle.
 * The code is never typed — it APPEARS on a lab display when the
 * player does the right thing with the scene elements.
 *
 * Flow: interact → code panel lights up → go to terminal → enter code
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image,
} from 'react-native';
import { COLORS } from '../config/theme';

const SCENE_IMAGES = [
  require('../../assets/scenes/scene_02_titration.png'),
  require('../../assets/scenes/scene_03_cabinet.png'),
  require('../../assets/scenes/scene_05_apparatus.png'),
  require('../../assets/scenes/scene_04_periodic.png'),
];

// ─── Shared sub-components ───────────────────────────────────────────────────

function CodePanel({ code, solved }) {
  return (
    <View style={[styles.codePanel, solved && styles.codePanelSolved]}>
      <Text style={styles.codePanelLabel}>CODE-DISPLAY</Text>
      <Text style={[styles.codePanelValue, solved && styles.codePanelValueSolved]}>
        {solved ? code : '- - -'}
      </Text>
      {solved && (
        <Text style={styles.codePanelHint}>
          Gib diesen Code am Terminal (PC) ein!
        </Text>
      )}
    </View>
  );
}

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

// ─── PUZZLE 1 — pH-Wert per Konzentrationsdial ───────────────────────────────
// Player steps through pH values 1–14 to find the correct one for the HCl.
// Correct answer: pH 3  (c = 0.001 mol/L = 10⁻³  →  pH = 3)

function Puzzle1_pH({ onSolve }) {
  const [ph, setPh] = useState(7);
  const [checked, setChecked] = useState(false);

  const correct = ph === 3;

  const step = (dir) => {
    setPh(v => Math.min(14, Math.max(1, v + dir)));
    setChecked(false);
  };

  const check = () => {
    setChecked(true);
    if (correct) onSolve();
  };

  // colour of the indicator liquid changes with pH
  const indicatorColor =
    ph <= 3  ? '#e05050' :   // red: acidic
    ph <= 6  ? '#e8a030' :   // orange
    ph === 7 ? '#50b050' :   // green: neutral
    ph <= 10 ? '#5090e0' :   // blue: basic
               '#9050d0';    // violet: strongly basic

  return (
    <View style={styles.mechanic}>
      <SectionTitle>PROBLEM</SectionTitle>
      <Text style={styles.contextText}>
        Salzsäure (HCl) mit c = 0,001 mol/L.{'\n'}
        Stelle den pH-Wert am Messgerät ein!
      </Text>
      <Text style={styles.formulaSmall}>pH = −log₁₀ [H⁺]</Text>

      {/* Visual indicator flask */}
      <View style={styles.flaskRow}>
        <View style={[styles.flask, { backgroundColor: indicatorColor }]}>
          <Text style={styles.flaskLabel}>Indikator</Text>
        </View>
        <View style={styles.phMeter}>
          <Text style={styles.phMeterLabel}>pH-METER</Text>
          <Text style={[styles.phMeterValue, correct && styles.correct]}>
            {ph}
          </Text>
        </View>
      </View>

      {/* Stepper dial */}
      <View style={styles.dialRow}>
        <TouchableOpacity style={styles.dialBtn} onPress={() => step(-1)}>
          <Text style={styles.dialBtnText}>−</Text>
        </TouchableOpacity>
        <View style={styles.dialDisplay}>
          <Text style={styles.dialLabel}>pH</Text>
          <Text style={styles.dialValue}>{ph}</Text>
        </View>
        <TouchableOpacity style={styles.dialBtn} onPress={() => step(1)}>
          <Text style={styles.dialBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.checkBtn, correct && styles.checkBtnCorrect]}
        onPress={check}
      >
        <Text style={styles.checkBtnText}>BESTÄTIGEN</Text>
      </TouchableOpacity>

      {checked && !correct && (
        <Text style={styles.wrongHint}>
          Nicht korrekt — prüfe die Formel.
        </Text>
      )}
    </View>
  );
}

// ─── PUZZLE 2 — Oxidationszahl Mn per Drehregler ────────────────────────────
// Player spins a wheel to assign the oxidation state to Mn.
// Correct answer: +7  (K=+1, 4×O=−8  →  Mn = +7 for sum = 0)

function Puzzle2_Oxidation({ onSolve }) {
  const STATES = [-3, -1, 0, +1, +2, +3, +4, +5, +6, +7];
  const [idx, setIdx] = useState(2); // starts at 0
  const [checked, setChecked] = useState(false);

  const val = STATES[idx];
  const sum = 1 + val + 4 * (-2);   // K + Mn + 4O
  const correct = val === 7;

  const spin = (dir) => {
    setIdx(i => Math.min(STATES.length - 1, Math.max(0, i + dir)));
    setChecked(false);
  };

  const check = () => {
    setChecked(true);
    if (correct) onSolve();
  };

  return (
    <View style={styles.mechanic}>
      <SectionTitle>KALIUMPERMANGANAT KMnO₄</SectionTitle>
      <Text style={styles.contextText}>
        Das Schloss öffnet sich, wenn die Summe der{'\n'}
        Oxidationszahlen = 0 ist.
      </Text>

      {/* Oxidation number balance */}
      <View style={styles.oxBalance}>
        <View style={styles.oxCell}>
          <Text style={styles.oxElement}>K</Text>
          <Text style={styles.oxFixed}>+1</Text>
        </View>
        <Text style={styles.oxPlus}>+</Text>
        <View style={[styles.oxCell, styles.oxTarget]}>
          <Text style={styles.oxElement}>Mn</Text>
          <Text style={[styles.oxValue, correct && styles.correct]}>
            {val >= 0 ? `+${val}` : val}
          </Text>
        </View>
        <Text style={styles.oxPlus}>+</Text>
        <View style={styles.oxCell}>
          <Text style={styles.oxElement}>4×O</Text>
          <Text style={styles.oxFixed}>−8</Text>
        </View>
        <Text style={styles.oxPlus}>=</Text>
        <View style={[styles.oxCell, sum === 0 && styles.oxSumOk]}>
          <Text style={[styles.oxSum, sum === 0 && styles.correct]}>{sum}</Text>
        </View>
      </View>

      {/* Spin wheel for Mn */}
      <View style={styles.dialRow}>
        <TouchableOpacity style={styles.dialBtn} onPress={() => spin(-1)}>
          <Text style={styles.dialBtnText}>◀</Text>
        </TouchableOpacity>
        <View style={styles.dialDisplay}>
          <Text style={styles.dialLabel}>Mn</Text>
          <Text style={styles.dialValue}>
            {val >= 0 ? `+${val}` : val}
          </Text>
        </View>
        <TouchableOpacity style={styles.dialBtn} onPress={() => spin(1)}>
          <Text style={styles.dialBtnText}>▶</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.checkBtn, correct && styles.checkBtnCorrect]}
        onPress={check}
      >
        <Text style={styles.checkBtnText}>SCHLOSS PRÜFEN</Text>
      </TouchableOpacity>

      {checked && !correct && (
        <Text style={styles.wrongHint}>Summe ≠ 0 — drehe weiter.</Text>
      )}
    </View>
  );
}

// ─── PUZZLE 3 — H-Atome zählen per Antippen ─────────────────────────────────
// Player taps each hydrogen atom token in the structural formula.
// Correct answer: 8  (C₃H₇OH = C₃H₈O)

function Puzzle3_CountAtoms({ onSolve }) {
  const TOTAL = 8;
  // Each H atom as a tappable token with an id
  const [tapped, setTapped] = useState(new Set());

  const toggleH = useCallback((id) => {
    setTapped(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      if (next.size === TOTAL) setTimeout(onSolve, 400);
      return next;
    });
  }, [onSolve]);

  const count = tapped.size;

  // H atoms: positions in the structural formula C₃H₇OH
  // Displayed as a visual grid of formula fragments
  const hAtoms = [
    { id: 0, label: 'H', group: 'C1' },
    { id: 1, label: 'H', group: 'C1' },
    { id: 2, label: 'H', group: 'C1' },
    { id: 3, label: 'H', group: 'C2' },
    { id: 4, label: 'H', group: 'C2' },
    { id: 5, label: 'H', group: 'C3' },
    { id: 6, label: 'H', group: 'C3' },
    { id: 7, label: 'H', group: 'OH' },
  ];

  const groups = ['C1', 'C2', 'C3', 'OH'];
  const groupLabel = { C1: 'CH₃—', C2: '—CH₂—', C3: '—CH₂—', OH: '—OH' };

  return (
    <View style={styles.mechanic}>
      <SectionTitle>PROPAN-1-OL: C₃H₇OH</SectionTitle>
      <Text style={styles.contextText}>
        Tippe jeden Wasserstoff (H) in der Strukturformel an!
      </Text>

      <View style={styles.moleculeGrid}>
        {groups.map(g => (
          <View key={g} style={styles.molGroup}>
            <Text style={styles.molCarbon}>{groupLabel[g]}</Text>
            <View style={styles.molHRow}>
              {hAtoms.filter(h => h.group === g).map(h => (
                <TouchableOpacity
                  key={h.id}
                  style={[styles.hAtom, tapped.has(h.id) && styles.hAtomTapped]}
                  onPress={() => toggleH(h.id)}
                >
                  <Text style={[styles.hAtomText, tapped.has(h.id) && styles.hAtomTextTapped]}>
                    H
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.counterRow}>
        <Text style={styles.counterLabel}>H gezählt:</Text>
        <Text style={[styles.counterValue, count === TOTAL && styles.correct]}>
          {count} / {TOTAL}
        </Text>
      </View>
    </View>
  );
}

// ─── PUZZLE 4 — Stöchiometrie Schritt für Schritt ───────────────────────────
// Player steps through the molar mass calculation.
// Each correct step auto-advances; final answer 36 appears.
// Correct answer: 36

function Puzzle4_Stoich({ onSolve }) {
  const [step, setStep] = useState(0);  // 0,1,2 = the three calc steps
  const [mol, setMol] = useState(1);    // n(H₂) guess
  const [mass, setMass] = useState(18); // m(H₂O) guess

  // Step 0: find n(H₂) = 4/2 = 2
  const nCorrect = mol === 2;
  // Step 1: n(H₂O) = n(H₂) — auto, shown after step 0
  // Step 2: m(H₂O) = n × M = 2 × 18 = 36
  const mCorrect = mass === 36;

  const confirmStep0 = () => { if (nCorrect) setStep(1); };
  const confirmStep2 = () => {
    if (mCorrect) { setStep(3); onSolve(); }
  };

  return (
    <View style={styles.mechanic}>
      <SectionTitle>2 H₂ + O₂ → 2 H₂O</SectionTitle>
      <Text style={styles.contextText}>
        Gegeben: 4 g H₂  |  M(H₂) = 2 g/mol  |  M(H₂O) = 18 g/mol{'\n'}
        Wie viele Gramm Wasser entstehen?
      </Text>

      {/* Step 0: n(H₂) */}
      <View style={[styles.calcStep, step > 0 && styles.calcStepDone]}>
        <Text style={styles.calcStepLabel}>
          Schritt 1 — Stoffmenge H₂
        </Text>
        <Text style={styles.calcFormula}>n = m / M = 4 / 2 = ?</Text>
        {step === 0 ? (
          <View style={styles.dialRow}>
            <TouchableOpacity style={styles.dialBtn} onPress={() => setMol(v => Math.max(1, v-1))}>
              <Text style={styles.dialBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.dialDisplay}>
              <Text style={styles.dialValue}>{mol} mol</Text>
            </View>
            <TouchableOpacity style={styles.dialBtn} onPress={() => setMol(v => Math.min(10, v+1))}>
              <Text style={styles.dialBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[styles.calcAnswer, styles.correct]}>= 2 mol ✓</Text>
        )}
        {step === 0 && (
          <TouchableOpacity
            style={[styles.checkBtn, nCorrect && styles.checkBtnCorrect]}
            onPress={confirmStep0}
          >
            <Text style={styles.checkBtnText}>WEITER</Text>
          </TouchableOpacity>
        )}
        {step === 0 && mol !== 2 && mol !== 1 && (
          <Text style={styles.wrongHint}>Nicht korrekt.</Text>
        )}
      </View>

      {/* Step 1: n(H₂O) = n(H₂) — auto revealed */}
      {step >= 1 && (
        <View style={[styles.calcStep, styles.calcStepDone]}>
          <Text style={styles.calcStepLabel}>
            Schritt 2 — Stoffmenge H₂O (1:1-Verhältnis)
          </Text>
          <Text style={[styles.calcAnswer, styles.correct]}>n(H₂O) = 2 mol ✓</Text>
        </View>
      )}

      {/* Step 2: m(H₂O) = n × M */}
      {step >= 1 && (
        <View style={[styles.calcStep, step >= 3 && styles.calcStepDone]}>
          <Text style={styles.calcStepLabel}>
            Schritt 3 — Masse H₂O
          </Text>
          <Text style={styles.calcFormula}>m = n × M = 2 × 18 = ?</Text>
          {step < 3 ? (
            <>
              <View style={styles.dialRow}>
                <TouchableOpacity style={styles.dialBtn} onPress={() => setMass(v => Math.max(1, v-1))}>
                  <Text style={styles.dialBtnText}>−</Text>
                </TouchableOpacity>
                <View style={styles.dialDisplay}>
                  <Text style={styles.dialValue}>{mass} g</Text>
                </View>
                <TouchableOpacity style={styles.dialBtn} onPress={() => setMass(v => Math.min(72, v+1))}>
                  <Text style={styles.dialBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.checkBtn, mCorrect && styles.checkBtnCorrect]}
                onPress={confirmStep2}
              >
                <Text style={styles.checkBtnText}>BESTÄTIGEN</Text>
              </TouchableOpacity>
              {mass !== 36 && mass !== 18 && (
                <Text style={styles.wrongHint}>Nicht korrekt.</Text>
              )}
            </>
          ) : (
            <Text style={[styles.calcAnswer, styles.correct]}>= 36 g ✓</Text>
          )}
        </View>
      )}
    </View>
  );
}

// ─── MAIN PUZZLE SCREEN ──────────────────────────────────────────────────────

const MECHANICS = [
  Puzzle1_pH,
  Puzzle2_Oxidation,
  Puzzle3_CountAtoms,
  Puzzle4_Stoich,
];

export default function PuzzleScreen({ puzzle, index, isSolved: initialSolved }) {
  const [solved, setSolved] = useState(initialSolved);
  const Mechanic = MECHANICS[index];

  const handleSolve = useCallback(() => setSolved(true), []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Puzzle header */}
      <View style={[styles.header, { borderBottomColor: puzzle.accentDim }]}>
        <Text style={[styles.headerNum, { color: puzzle.accent }]}>
          RÄTSEL {puzzle.id} / 4
        </Text>
        <Text style={[styles.headerTitle, { color: puzzle.accent }]}>
          {puzzle.title.toUpperCase()} — {puzzle.subtitle.toUpperCase()}
        </Text>
      </View>

      {/* Scene banner */}
      <View style={styles.sceneBanner}>
        <Image
          source={SCENE_IMAGES[index]}
          style={styles.sceneImg}
          resizeMode="cover"
        />
      </View>

      {/* Interactive mechanic */}
      {Mechanic && <Mechanic onSolve={handleSolve} />}

      {/* Hint system */}
      <HintSection puzzle={puzzle} solved={solved} />

      {/* Code panel — stays dark until solved */}
      <CodePanel code={puzzle.code} solved={solved} />
    </ScrollView>
  );
}

function HintSection({ puzzle, solved }) {
  const [hintLevel, setHintLevel] = useState(0);
  if (solved) return null;
  return (
    <View style={styles.hintArea}>
      {hintLevel < puzzle.hints.length && (
        <TouchableOpacity
          style={styles.hintBtn}
          onPress={() => setHintLevel(h => h + 1)}
        >
          <Text style={styles.hintBtnText}>
            Hinweis {hintLevel + 1} / {puzzle.hints.length} anzeigen
          </Text>
        </TouchableOpacity>
      )}
      {puzzle.hints.slice(0, hintLevel).map((hint, i) => (
        <View key={i} style={styles.hintBox}>
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content:   { padding: 14, paddingBottom: 40 },

  sceneBanner: {
    width: '100%',
    height: 120,
    marginBottom: 14,
    overflow: 'hidden',
    backgroundColor: '#080810',
    borderRadius: 4,
  },
  sceneImg: {
    width: '100%',
    height: '100%',
  },

  header: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 14,
    alignItems: 'center',
  },
  headerNum: {
    fontSize: 9, letterSpacing: 3, marginBottom: 3,
  },
  headerTitle: {
    fontSize: 12, fontWeight: 'bold', textAlign: 'center',
  },

  sectionTitle: {
    color: COLORS.textDim,
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  mechanic: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },

  contextText: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 10,
  },
  formulaSmall: {
    color: COLORS.textDim,
    fontFamily: 'monospace',
    fontSize: 11,
    marginBottom: 14,
  },

  // Flask / indicator visual
  flaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    gap: 20,
  },
  flask: {
    width: 52, height: 64,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  flaskLabel: { color: '#fff', fontSize: 9, opacity: 0.8 },
  phMeter: {
    backgroundColor: COLORS.bgDark,
    borderWidth: 1,
    borderColor: '#48bb78',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    minWidth: 72,
  },
  phMeterLabel: { color: '#48bb78', fontSize: 8, letterSpacing: 1 },
  phMeterValue: {
    color: '#48bb78',
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: 'bold',
  },

  // Stepper dial
  dialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 10,
  },
  dialBtn: {
    width: 44, height: 44,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialBtnText: { color: COLORS.text, fontSize: 20 },
  dialDisplay: {
    minWidth: 80,
    backgroundColor: COLORS.bgDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  dialLabel: { color: COLORS.textDim, fontSize: 9, letterSpacing: 1 },
  dialValue: { color: COLORS.text, fontFamily: 'monospace', fontSize: 22, fontWeight: 'bold' },

  // Oxidation balance
  oxBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginVertical: 12,
  },
  oxCell: {
    alignItems: 'center',
    backgroundColor: COLORS.bgDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 44,
  },
  oxTarget: { borderColor: '#f6ad55' },
  oxSumOk:  { borderColor: '#48bb78' },
  oxElement: { color: COLORS.textDim, fontSize: 9 },
  oxFixed:   { color: COLORS.text, fontFamily: 'monospace', fontSize: 13 },
  oxValue:   { color: '#f6ad55', fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold' },
  oxSum:     { color: COLORS.text, fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold' },
  oxPlus:    { color: COLORS.textDim, fontSize: 14, paddingTop: 10 },

  // Molecule grid
  moleculeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 14,
  },
  molGroup: { alignItems: 'center' },
  molCarbon: {
    color: COLORS.textDim,
    fontFamily: 'monospace',
    fontSize: 11,
    marginBottom: 4,
  },
  molHRow: { flexDirection: 'row', gap: 4 },
  hAtom: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgDark,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hAtomTapped: {
    backgroundColor: '#276749',
    borderColor: '#48bb78',
  },
  hAtomText:       { color: COLORS.textDim, fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold' },
  hAtomTextTapped: { color: '#48bb78' },

  counterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  counterLabel: { color: COLORS.textDim, fontSize: 12 },
  counterValue: { color: COLORS.text, fontFamily: 'monospace', fontSize: 20, fontWeight: 'bold' },

  // Stoichiometry steps
  calcStep: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  calcStepDone: { borderColor: '#276749', backgroundColor: 'rgba(72,187,120,0.04)' },
  calcStepLabel: { color: COLORS.textDim, fontSize: 9, letterSpacing: 1, marginBottom: 6 },
  calcFormula:   { color: COLORS.text, fontFamily: 'monospace', fontSize: 12, marginBottom: 8 },
  calcAnswer:    { fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold', marginTop: 4 },

  // Check button
  checkBtn: {
    marginTop: 10,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
  },
  checkBtnCorrect: { borderColor: '#48bb78' },
  checkBtnText: { color: COLORS.text, fontSize: 11, letterSpacing: 1 },
  wrongHint: { color: '#e53e3e', fontSize: 11, textAlign: 'center', marginTop: 6 },

  // Code panel
  codePanel: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    backgroundColor: COLORS.bgDark,
    marginBottom: 10,
  },
  codePanelSolved: {
    borderColor: '#48bb78',
    backgroundColor: 'rgba(72,187,120,0.06)',
  },
  codePanelLabel: {
    color: COLORS.textDim,
    fontSize: 9,
    letterSpacing: 3,
    marginBottom: 8,
  },
  codePanelValue: {
    fontFamily: 'monospace',
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.border,
    letterSpacing: 8,
  },
  codePanelValueSolved: {
    color: '#48bb78',
    textShadowColor: '#48bb78',
    textShadowRadius: 8,
  },
  codePanelHint: {
    color: '#48bb78',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },

  // Hints
  hintArea: { marginBottom: 14 },
  hintBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    marginBottom: 8,
  },
  hintBtnText: { color: COLORS.textDim, fontSize: 10 },
  hintBox: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.textDark,
    paddingLeft: 10,
    paddingVertical: 8,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 4,
  },
  hintText: { color: COLORS.textDim, fontSize: 12, lineHeight: 18 },

  correct: { color: '#48bb78' },
});
