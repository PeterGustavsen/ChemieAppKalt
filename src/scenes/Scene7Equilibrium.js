import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import SceneShell from './SceneShell';
import Chalkboard from '../fx/Chalkboard';
import { FX } from '../fx/feedback';
import { PUZZLES } from '../config/game';

const P = PUZZLES[7];

const OPTIONS = [8, 16, 64, 640];
const CONCS = [
  { label: 'c(HI)', value: '0,8' },
  { label: 'c(H₂)', value: '0,1' },
  { label: 'c(I₂)', value: '0,1' },
];

export default function Scene7Equilibrium({ room, onBack, onReveal, initiallySolved, emergencyLight, danger }) {
  const [pick, setPick] = useState(null);

  const solved = pick === 64 || initiallySolved;

  useEffect(() => {
    if (!solved) return;
    onReveal && onReveal(room.id);
    if (!initiallySolved) FX.success();   // chime only on a fresh solve
  }, [solved]);

  const choose = (opt) => {
    if (opt === 64) { setPick(opt); return; }  // success chime fires via effect
    FX.error();
    setPick(opt);
  };

  const renderOverlay = (L, { busy }) => {
    if (busy) return null;
    return (
      <View style={styles.wrap} pointerEvents="box-none">
        <Chalkboard accent={room.accent}>
          <Text style={[styles.heading, { color: room.accent }]}>H₂ + I₂ ⇌ 2 HI</Text>

          <View style={styles.concBlock}>
            {CONCS.map((c) => (
              <View key={c.label} style={styles.concRow}>
                <Text style={styles.concLabel}>{c.label}</Text>
                <Text style={styles.concValue}>{c.value} mol/L</Text>
              </View>
            ))}
          </View>

          <Text style={styles.formula}>Kc = c(HI)² / ( c(H₂) · c(I₂) )</Text>
          <Text style={styles.prompt}>WÄHLE Kc:</Text>

          <View style={styles.optRow}>
            {OPTIONS.map((opt) => {
              const sel = pick === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => choose(opt)}
                  style={[
                    styles.optBtn,
                    { borderColor: sel ? room.accent : '#33405a' },
                    sel && styles.optSel,
                  ]}
                >
                  <Text style={[styles.optTxt, sel && { color: room.accent }]}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        </Chalkboard>
      </View>
    );
  };

  return (
    <SceneShell
      room={room}
      bgSource={require('../../assets/scenes/scene_07_equilibrium.png')}
      introLines={P.intro}
      hintLines={P.hint}
      solved={solved}
      solvedLines={['Kc = c(HI)² / ( c(H₂) · c(I₂) )', '0,8² / (0,1 · 0,1) = 64']}
      onBack={onBack}
      emergencyLight={emergencyLight}
      danger={danger}
      renderOverlay={renderOverlay}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  panel: {
    backgroundColor: 'rgba(10,12,20,0.92)',
    borderWidth: 2, borderRadius: 6, padding: 16, maxWidth: 420,
    alignItems: 'center',
  },
  heading: {
    fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold',
    letterSpacing: 1, marginBottom: 10,
  },
  concBlock: { alignItems: 'center', marginBottom: 10 },
  concRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 1 },
  concLabel: {
    fontFamily: 'monospace', fontSize: 12, color: '#718096',
    minWidth: 64, textAlign: 'right', marginRight: 8,
  },
  concValue: {
    fontFamily: 'monospace', fontSize: 12, color: '#eafcff',
    minWidth: 80, textAlign: 'left',
  },
  formula: {
    fontFamily: 'monospace', fontSize: 12, color: '#aab6c6',
    marginBottom: 12, textAlign: 'center',
  },
  prompt: {
    fontFamily: 'monospace', fontSize: 11, color: '#718096',
    letterSpacing: 2, marginBottom: 8,
  },
  optRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  optBtn: {
    borderWidth: 2, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 14,
    margin: 4, alignItems: 'center', minWidth: 56,
    backgroundColor: 'rgba(20,24,36,0.6)',
  },
  optSel: { backgroundColor: 'rgba(150,96,200,0.18)' },
  optTxt: { fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold', color: '#eafcff' },
});
