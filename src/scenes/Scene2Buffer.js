import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import SceneShell from './SceneShell';
import { PUZZLES } from '../config/game';

const P = PUZZLES[2];
const PKS = 4.75;
const CONC = [0.01, 0.1, 1];

const fmt = (n, d) => n.toFixed(d).replace('.', ',');

export default function Scene2Buffer({ room, onBack, onReveal, initiallySolved, emergencyLight, danger }) {
  const [iA, setIA] = useState(1);
  const [iHA, setIHA] = useState(1);

  const cA = CONC[iA];
  const cHA = CONC[iHA];
  const pH = PKS + Math.log10(cA / cHA);
  const solved = Math.abs(pH - 5.75) < 1e-9 || initiallySolved;

  useEffect(() => { if (solved) onReveal && onReveal(room.id); }, [solved]);

  const step = (set, idx, dir) => set(Math.max(0, Math.min(CONC.length - 1, idx + dir)));

  const renderOverlay = (L, { busy }) => {
    if (busy) return null;
    return (
      <View style={styles.wrap}>
        <View style={[styles.panel, { borderColor: room.accent }]}>
          <Text style={[styles.heading, { color: room.accent }]}>ACETAT-PUFFER</Text>
          <Text style={styles.const}>pKs = 4,75</Text>
          <Text style={styles.formula}>pH = pKs + log( c(Ac⁻)/c(HAc) )</Text>

          <View style={styles.row}>
            <View style={styles.stepper}>
              <Text style={styles.label}>c(Ac⁻)</Text>
              <Pressable hitSlop={6} onPress={() => step(setIA, iA, +1)}>
                <Text style={styles.arrow}>▲</Text>
              </Pressable>
              <Text style={styles.value}>{fmt(cA, cA < 1 ? 2 : 0)} mol/L</Text>
              <Pressable hitSlop={6} onPress={() => step(setIA, iA, -1)}>
                <Text style={styles.arrow}>▼</Text>
              </Pressable>
            </View>

            <View style={styles.stepper}>
              <Text style={styles.label}>c(HAc)</Text>
              <Pressable hitSlop={6} onPress={() => step(setIHA, iHA, +1)}>
                <Text style={styles.arrow}>▲</Text>
              </Pressable>
              <Text style={styles.value}>{fmt(cHA, cHA < 1 ? 2 : 0)} mol/L</Text>
              <Pressable hitSlop={6} onPress={() => step(setIHA, iHA, -1)}>
                <Text style={styles.arrow}>▼</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.phWrap} pointerEvents="none">
            <Text style={styles.label}>pH</Text>
            <Text style={styles.ph}>{fmt(pH, 2)}</Text>
            <Text style={styles.goal}>ZIEL: pH = 5,75</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SceneShell
      room={room}
      bgSource={require('../../assets/scenes/scene_02_titration.png')}
      introLines={P.intro}
      hintLines={P.hint}
      solved={solved}
      solvedLines={['Puffer mit c(Ac⁻) : c(HAc) = 10 : 1', 'pH = 4,75 + log 10 = 5,75']}
      onBack={onBack}
      emergencyLight={emergencyLight}
      danger={danger}
      renderOverlay={renderOverlay}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  panel: {
    backgroundColor: 'rgba(10,12,20,0.92)', borderWidth: 2, borderRadius: 6,
    padding: 16, maxWidth: 420, alignItems: 'center',
  },
  heading: { fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold', letterSpacing: 2 },
  const: { fontFamily: 'monospace', fontSize: 12, color: '#aab6c6', marginTop: 8 },
  formula: { fontFamily: 'monospace', fontSize: 11, color: '#aab6c6', marginTop: 4, textAlign: 'center' },
  row: { flexDirection: 'row', marginTop: 16 },
  stepper: { alignItems: 'center', marginHorizontal: 14 },
  label: { fontFamily: 'monospace', fontSize: 10, color: '#718096', letterSpacing: 1 },
  arrow: { fontFamily: 'monospace', fontSize: 14, color: '#e0b44c', marginVertical: 2 },
  value: { fontFamily: 'monospace', fontSize: 12, color: '#aab6c6' },
  phWrap: { alignItems: 'center', marginTop: 18 },
  ph: { fontFamily: 'monospace', fontSize: 32, fontWeight: 'bold', color: '#eafcff' },
  goal: { fontFamily: 'monospace', fontSize: 11, color: '#718096', marginTop: 6, letterSpacing: 1 },
});
