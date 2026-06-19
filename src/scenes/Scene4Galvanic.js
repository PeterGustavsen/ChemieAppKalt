import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import SceneShell from './SceneShell';
import { PUZZLES } from '../config/game';

const P = PUZZLES[4];

const METALS = [
  { sym: 'Zn', e: -0.76 },
  { sym: 'Fe', e: -0.44 },
  { sym: 'Cu', e: +0.34 },
  { sym: 'Ag', e: +0.80 },
];

const fmtV = (v) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(2).replace('.', ',')}V`;
const fmtEMK = (v) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(2).replace('.', ',')} V`;

export default function Scene4Galvanic({ room, onBack, onReveal, initiallySolved, emergencyLight, danger }) {
  const [anodeIdx, setAnodeIdx] = useState(0);
  const [cathodeIdx, setCathodeIdx] = useState(3);

  const emk = METALS[cathodeIdx].e - METALS[anodeIdx].e;
  const solved = Math.round(emk * 100) === 110 || initiallySolved;

  useEffect(() => { if (solved) onReveal && onReveal(room.id); }, [solved]);

  const renderRow = (label, selIdx, setSel) => (
    <View style={styles.rowBlock}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.row}>
        {METALS.map((m, i) => {
          const sel = i === selIdx;
          return (
            <Pressable
              key={m.sym}
              onPress={() => setSel(i)}
              style={[
                styles.metalBtn,
                { borderColor: sel ? room.accent : '#33405a' },
                sel && styles.metalSel,
              ]}
            >
              <Text style={[styles.metalSym, sel && { color: room.accent }]}>{m.sym}</Text>
              <Text style={styles.metalE}>{fmtV(m.e)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderOverlay = (L, { busy }) => {
    if (busy) return null;
    return (
      <View style={styles.wrap} pointerEvents="box-none">
        <View style={[styles.panel, { borderColor: room.accent }]}>
          <Text style={[styles.heading, { color: room.accent }]}>GALVANISCHE ZELLE</Text>
          <Text style={styles.goal}>ZIEL: EMK = 1,10 V</Text>

          {renderRow('ANODE', anodeIdx, setAnodeIdx)}
          {renderRow('KATHODE', cathodeIdx, setCathodeIdx)}

          <Text style={styles.formula}>
            EMK = E°(K) − E°(A) = {fmtV(METALS[cathodeIdx].e)} − {fmtV(METALS[anodeIdx].e)}
          </Text>
          <Text style={styles.emk}>{fmtEMK(emk)}</Text>
          <Text style={styles.emkMv}>{Math.round(emk * 1000)} mV</Text>
        </View>
      </View>
    );
  };

  return (
    <SceneShell
      room={room}
      bgSource={require('../../assets/scenes/scene_04_periodic.png')}
      introLines={P.intro}
      hintLines={P.hint}
      solved={solved}
      solvedLines={['Anode Zn (−0,76 V), Kathode Cu (+0,34 V)', 'EMK = 1,10 V = 1100 mV']}
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
    borderWidth: 2, borderRadius: 6, padding: 16, maxWidth: 440,
    alignItems: 'center',
  },
  heading: {
    fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold',
    letterSpacing: 2, marginBottom: 4,
  },
  goal: {
    fontFamily: 'monospace', fontSize: 12, color: '#aab6c6', marginBottom: 12,
  },
  rowBlock: { alignItems: 'center', marginBottom: 10 },
  rowLabel: {
    fontFamily: 'monospace', fontSize: 10, color: '#718096',
    letterSpacing: 2, marginBottom: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'center' },
  metalBtn: {
    borderWidth: 2, borderRadius: 4, paddingVertical: 6, paddingHorizontal: 10,
    marginHorizontal: 3, alignItems: 'center', minWidth: 52,
    backgroundColor: 'rgba(20,24,36,0.6)',
  },
  metalSel: { backgroundColor: 'rgba(224,180,76,0.18)' },
  metalSym: { fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold', color: '#eafcff' },
  metalE: { fontFamily: 'monospace', fontSize: 10, color: '#aab6c6', marginTop: 2 },
  formula: {
    fontFamily: 'monospace', fontSize: 11, color: '#aab6c6',
    marginTop: 8, textAlign: 'center',
  },
  emk: {
    fontFamily: 'monospace', fontSize: 28, fontWeight: 'bold',
    color: '#eafcff', marginTop: 6,
  },
  emkMv: { fontFamily: 'monospace', fontSize: 12, color: '#718096', marginTop: 2 },
});
