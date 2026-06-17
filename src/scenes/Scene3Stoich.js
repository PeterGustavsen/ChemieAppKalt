/*
 * SZENE 3 — Stoechiometrie. Interaktion: vier Koeffizienten per ▲/▼ einstellen.
 * Live-Atombilanz; bei ausgeglichener Gleichung in kleinster Ganzzahl -> Code 2121.
 *   a AgNO3 + b CaCl2 -> c AgCl + d Ca(NO3)2
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import SceneShell from './SceneShell';
import { PUZZLES } from '../config/game';

const P = PUZZLES[3];
const BOARD = { x: 176, y: 60, w: 288, h: 134 };
const ELEMENTS = ['Ag', 'N', 'O', 'Ca', 'Cl'];

function counts([a, b, c, d]) {
  return {
    left: { Ag: a, N: a, O: 3 * a, Ca: b, Cl: 2 * b },
    right: { Ag: c, N: 2 * d, O: 6 * d, Ca: d, Cl: c },
  };
}
const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));

export default function Scene3Stoich({ room, onBack, onReveal, initiallySolved }) {
  const [co, setCo] = useState(initiallySolved ? [2, 1, 2, 1] : [1, 1, 1, 1]);
  const { left, right } = counts(co);
  const balanced = ELEMENTS.every((e) => left[e] === right[e]);
  const g = co.reduce((a, b) => gcd(a, b));
  const solved = balanced && g === 1;

  useEffect(() => { if (solved) onReveal && onReveal(room.id); }, [solved]);

  const bump = (i, dv) => setCo((c) => c.map((x, j) => (j === i ? Math.max(1, Math.min(9, x + dv)) : x)));

  const renderOverlay = (L, { busy }) => {
    const b = L.toScreen(BOARD);
    if (busy) return (
      <View pointerEvents="none" style={[styles.board, b]} />
    );
    return (
      <View style={[styles.board, b]}>
        <View style={styles.eqRow}>
          <Stepper v={co[0]} i={0} bump={bump} /><Text style={styles.term}>{P.terms[0]}</Text>
          <Text style={styles.op}>+</Text>
          <Stepper v={co[1]} i={1} bump={bump} /><Text style={styles.term}>{P.terms[1]}</Text>
          <Text style={styles.op}>→</Text>
          <Stepper v={co[2]} i={2} bump={bump} /><Text style={styles.term}>{P.terms[2]}</Text>
          <Text style={styles.op}>+</Text>
          <Stepper v={co[3]} i={3} bump={bump} /><Text style={styles.term}>{P.terms[3]}</Text>
        </View>

        <View style={styles.balRow}>
          {ELEMENTS.map((e) => {
            const ok = left[e] === right[e];
            return (
              <Text key={e} style={[styles.bal, { color: ok ? '#6fe87a' : '#f06b6b' }]}>
                {e}:{left[e]}/{right[e]}
              </Text>
            );
          })}
        </View>
        <Text style={[styles.status, { color: balanced ? '#6fe87a' : '#718096' }]}>
          {balanced ? (g === 1 ? 'AUSGEGLICHEN ✓' : 'ausgeglichen — aber kuerze die Koeffizienten') : 'noch nicht ausgeglichen'}
        </Text>
      </View>
    );
  };

  return (
    <SceneShell
      room={room}
      bgSource={require('../../assets/scenes/scene_03_cabinet.png')}
      introLines={P.intro}
      hintLines={P.hint}
      solved={solved}
      solvedLines={['2 AgNO₃ + CaCl₂ → 2 AgCl + Ca(NO₃)₂', 'Koeffizienten: 2 – 1 – 2 – 1.']}
      onBack={onBack}
      renderOverlay={renderOverlay}
    />
  );
}

function Stepper({ v, i, bump }) {
  return (
    <View style={styles.stepper}>
      <Pressable hitSlop={6} onPress={() => bump(i, +1)}><Text style={styles.arrow}>▲</Text></Pressable>
      <Text style={styles.coeff}>{v}</Text>
      <Pressable hitSlop={6} onPress={() => bump(i, -1)}><Text style={styles.arrow}>▼</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  board: { position: 'absolute', alignItems: 'center', justifyContent: 'center', padding: 8 },
  eqRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  stepper: { alignItems: 'center', marginHorizontal: 2 },
  arrow: { color: '#e0b44c', fontFamily: 'monospace', fontSize: 13 },
  coeff: { color: '#eafcff', fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold' },
  term: { color: '#eafcff', fontFamily: 'monospace', fontSize: 15, marginRight: 4 },
  op: { color: '#6fd3dd', fontFamily: 'monospace', fontSize: 16, marginHorizontal: 4 },
  balRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  bal: { fontFamily: 'monospace', fontSize: 12 },
  status: { fontFamily: 'monospace', fontSize: 12, marginTop: 8, fontWeight: 'bold' },
});
