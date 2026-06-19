/*
 * SZENE 5 — Veresterung. Interaktion: Carbonsäure und Alkohol so wählen, dass
 * der Ester C₄H₈O₂ entsteht (zusammen 4 C-Atome). Code 482.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import SceneShell from './SceneShell';
import { PUZZLES } from '../config/game';

const P = PUZZLES[5];

const ACIDS = [
  { name: 'Methansäure', c: 1 },
  { name: 'Essigsäure', c: 2 },
  { name: 'Propansäure', c: 3 },
];
const ALCOHOLS = [
  { name: 'Methanol', c: 1 },
  { name: 'Ethanol', c: 2 },
  { name: 'Propanol', c: 3 },
];

export default function Scene5Ester({ room, onBack, onReveal, initiallySolved, emergencyLight, danger }) {
  const [acidIdx, setAcidIdx] = useState(1);
  const [alcoholIdx, setAlcoholIdx] = useState(1);

  const n = ACIDS[acidIdx].c + ALCOHOLS[alcoholIdx].c;
  const solved = (n === 4) || initiallySolved;
  const ester = 'C' + n + 'H' + (2 * n) + 'O₂';

  useEffect(() => { if (solved) onReveal && onReveal(room.id); }, [solved]);

  const renderOverlay = (L, { busy }) => {
    if (busy) return null;
    return (
      <View style={styles.wrap} pointerEvents="box-none">
        <View style={[styles.panel, { borderColor: room.accent }]}>
          <Text style={[styles.head, { color: room.accent }]}>VERESTERUNG</Text>
          <Text style={styles.eq}>Säure + Alkohol → Ester + H₂O</Text>

          <Text style={styles.rowLbl}>SÄURE</Text>
          <View style={styles.row}>
            {ACIDS.map((a, i) => {
              const sel = i === acidIdx;
              return (
                <Pressable
                  key={a.name}
                  onPress={() => setAcidIdx(i)}
                  style={[styles.choice, sel
                    ? { borderColor: room.accent, backgroundColor: 'rgba(111,224,138,0.18)' }
                    : { borderColor: '#33405a' }]}
                >
                  <Text style={styles.choiceTxt}>{a.name}</Text>
                  <Text style={styles.choiceSub}>({a.c} C)</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.rowLbl}>ALKOHOL</Text>
          <View style={styles.row}>
            {ALCOHOLS.map((a, i) => {
              const sel = i === alcoholIdx;
              return (
                <Pressable
                  key={a.name}
                  onPress={() => setAlcoholIdx(i)}
                  style={[styles.choice, sel
                    ? { borderColor: room.accent, backgroundColor: 'rgba(111,224,138,0.18)' }
                    : { borderColor: '#33405a' }]}
                >
                  <Text style={styles.choiceTxt}>{a.name}</Text>
                  <Text style={styles.choiceSub}>({a.c} C)</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.esterLbl}>ESTER:</Text>
          <Text style={styles.esterVal}>{ester}</Text>
          <Text style={styles.goal}>ZIEL: Ester C₄H₈O₂</Text>
        </View>
      </View>
    );
  };

  return (
    <SceneShell
      room={room}
      bgSource={require('../../assets/scenes/scene_05_apparatus.png')}
      introLines={P.intro}
      hintLines={P.hint}
      solved={solved}
      solvedLines={['Säure + Alkohol mit zusammen 4 C-Atomen', 'Ester C₄H₈O₂  →  4·100 + 8·10 + 2 = 482']}
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
    padding: 16, maxWidth: 440, alignItems: 'center',
  },
  head: { fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold', letterSpacing: 2 },
  eq: { color: '#aab6c6', fontFamily: 'monospace', fontSize: 12, marginTop: 6, marginBottom: 10 },
  rowLbl: { color: '#718096', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, marginTop: 8, alignSelf: 'flex-start' },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 },
  choice: { borderWidth: 2, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 6, margin: 3, alignItems: 'center' },
  choiceTxt: { color: '#eafcff', fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold' },
  choiceSub: { color: '#718096', fontFamily: 'monospace', fontSize: 10 },
  esterLbl: { color: '#718096', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, marginTop: 14 },
  esterVal: { color: '#eafcff', fontFamily: 'monospace', fontSize: 26, fontWeight: 'bold', marginTop: 2 },
  goal: { color: '#aab6c6', fontFamily: 'monospace', fontSize: 12, marginTop: 10 },
});
