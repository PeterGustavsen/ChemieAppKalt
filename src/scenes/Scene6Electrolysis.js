import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import SceneShell from './SceneShell';
import Chalkboard from '../fx/Chalkboard';
import { FX } from '../fx/feedback';
import { PUZZLES } from '../config/game';

const P = PUZZLES[6];

const I = 9.65;     // A
const F = 96500;    // C/mol
const Z = 2;        // Cu²⁺ + 2 e⁻ → Cu
const STEP = 1000;
const T_MIN = 0;
const T_MAX = 15000;

const comma = (n, dec) => n.toFixed(dec).replace('.', ',');

export default function Scene6Electrolysis({ room, onBack, onReveal, initiallySolved, emergencyLight, danger }) {
  const [t, setT] = useState(0);

  const Q = I * t;
  const n = Q / (Z * F);
  const solved = Math.abs(n - 0.5) < 1e-9 || initiallySolved;

  useEffect(() => {
    if (!solved) return;
    onReveal && onReveal(room.id);
    if (!initiallySolved) FX.success();   // chime only on a fresh solve
  }, [solved]);

  const clamp = (v) => Math.max(T_MIN, Math.min(T_MAX, v));
  const step = (delta) => { FX.click(); setT((v) => clamp(v + delta)); };

  const renderOverlay = (L, { busy }) => {
    if (busy) return null;
    return (
      <View style={styles.wrap} pointerEvents="box-none">
        <Chalkboard accent={room.accent}>
          <Text style={[styles.heading, { color: room.accent }]}>ELEKTROLYSE — KUPFER</Text>
          <Text style={styles.consts}>I = 9,65 A   F = 96500 C/mol</Text>
          <Text style={styles.goal}>ZIEL: 0,50 mol Cu abscheiden</Text>

          <View style={styles.stepper}>
            <Pressable hitSlop={8} onPress={() => step(STEP)}>
              <Text style={styles.arrow}>▲</Text>
            </Pressable>
            <Text style={styles.tValue}>{t} s</Text>
            <Pressable hitSlop={8} onPress={() => step(-STEP)}>
              <Text style={styles.arrow}>▼</Text>
            </Pressable>
          </View>

          <View style={styles.readout}>
            <View style={styles.row}>
              <Text style={styles.label}>Q = I · t</Text>
              <Text style={styles.value}>{Math.round(Q)} C</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>n(Cu) = Q / (z · F)</Text>
              <Text style={styles.value}>{comma(n, 3)} mol</Text>
            </View>
          </View>
        </Chalkboard>
      </View>
    );
  };

  return (
    <SceneShell room={room} bgSource={require('../../assets/scenes/scene_06_electrolysis.png')}
      introLines={P.intro} hintLines={P.hint} solved={solved}
      solvedLines={['Q = 9,65 · 10000 = 96500 C', 'n(Cu) = Q/(2·F) = 0,50 mol']}
      onBack={onBack} emergencyLight={emergencyLight} danger={danger}
      renderOverlay={renderOverlay} />
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  panel: {
    backgroundColor: 'rgba(10,12,20,0.92)', borderWidth: 2, borderRadius: 6,
    padding: 16, maxWidth: 420, alignItems: 'center',
  },
  heading: { fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  consts: { fontFamily: 'monospace', fontSize: 12, color: '#aab6c6', marginTop: 8 },
  goal: { fontFamily: 'monospace', fontSize: 11, color: '#718096', marginTop: 4, letterSpacing: 1 },
  stepper: { alignItems: 'center', marginTop: 14 },
  arrow: { fontFamily: 'monospace', fontSize: 18, color: '#e0b44c', paddingHorizontal: 14, paddingVertical: 4 },
  tValue: { fontFamily: 'monospace', fontSize: 30, fontWeight: 'bold', color: '#eafcff', marginVertical: 2 },
  readout: { marginTop: 16, alignSelf: 'stretch' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  label: { fontFamily: 'monospace', fontSize: 11, color: '#718096' },
  value: { fontFamily: 'monospace', fontSize: 14, color: '#eafcff', fontWeight: 'bold' },
});
