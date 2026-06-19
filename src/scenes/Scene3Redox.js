/*
 * SZENE 3 — Redox (Reagenzschrank). Zeigt die Permanganat/Eisen-Reaktion im
 * sauren Milieu. Der Spieler stellt die Teilgleichungen SELBST auf und rechnet
 * den Code: n(H+) + n(H2O) + n(e-) = 8 + 4 + 5 = 17. Keine Live-Loesung —
 * der Code wird am Terminal eingegeben (room.code = '17').
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import SceneShell from './SceneShell';
import Chalkboard from '../fx/Chalkboard';
import { PUZZLES } from '../config/game';

const P = PUZZLES[3];

const TASKS = [
  'Oxidationszahlen bestimmen',
  'Oxidation und Reduktion zuordnen',
  'Beide Teilgleichungen aufstellen',
  'Gesamtreaktion ausgleichen',
  'Uebertragene Elektronen zaehlen',
];

export default function Scene3Redox({ room, onBack, emergencyLight, danger }) {
  const renderOverlay = (L, { busy }) => {
    if (busy) return null;
    return (
      <View style={styles.wrap} pointerEvents="none">
        <Chalkboard accent={room.accent}>
          <Text style={[styles.kicker, { color: room.accent }]}>REDOX — SAURE LOESUNG</Text>
          <Text style={styles.eq}>MnO₄⁻ + Fe²⁺  →  Mn²⁺ + Fe³⁺</Text>

          <View style={styles.tasks}>
            {TASKS.map((t, i) => (
              <Text key={i} style={styles.task}>
                <Text style={[styles.num, { color: room.accent }]}>{i + 1}  </Text>{t}
              </Text>
            ))}
          </View>

          <View style={[styles.codeBox, { borderColor: room.accent }]}>
            <Text style={styles.codeLbl}>CODE =</Text>
            <Text style={styles.codeFormula}>n(H⁺) + n(H₂O) + n(e⁻)</Text>
          </View>
        </Chalkboard>
      </View>
    );
  };

  return (
    <SceneShell
      room={room}
      bgSource={require('../../assets/scenes/scene_03_cabinet.png')}
      introLines={P.intro}
      hintLines={P.hint}
      solved={false}
      onBack={onBack}
      emergencyLight={emergencyLight}
      danger={danger}
      renderOverlay={renderOverlay}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  panel: { backgroundColor: 'rgba(10,12,20,0.92)', borderWidth: 2, padding: 18, maxWidth: 440, alignItems: 'center' },
  kicker: { fontFamily: 'monospace', fontSize: 11, letterSpacing: 2, fontWeight: 'bold' },
  eq: { color: '#eafcff', fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 14, textAlign: 'center' },
  tasks: { alignSelf: 'stretch', gap: 4 },
  task: { color: '#aab6c6', fontFamily: 'monospace', fontSize: 13, lineHeight: 19 },
  num: { fontWeight: 'bold' },
  codeBox: { borderWidth: 2, borderStyle: 'dashed', marginTop: 16, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' },
  codeLbl: { color: '#718096', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 },
  codeFormula: { color: '#eafcff', fontFamily: 'monospace', fontSize: 15, fontWeight: 'bold', marginTop: 4 },
});
