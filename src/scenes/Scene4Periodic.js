/*
 * SZENE 4 — Periodensystem. Interaktion: zu jedem Hinweis das passende Element
 * antippen. Ordnungszahlen der Treffer ergeben den Code (Neon 10, Fluor 9 -> 109).
 * Layout deckungsgleich mit tools/pixelart/scene_04_periodic.py.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Group, Rect } from '@shopify/react-native-skia';

import SceneShell from './SceneShell';
import { PUZZLES } from '../config/game';

const P = PUZZLES[4];
const CW = 28, CH = 30, GAP = 2, GX = 52, GY = 84;
const cell = (col, row) => ({ x: GX + col * (CW + GAP), y: GY + row * (CH + GAP), w: CW, h: CH });

// (Symbol, Z, col, row) — exakt wie im Generator
const ELS = [
  ['H', 1, 0, 0], ['He', 2, 17, 0],
  ['Li', 3, 0, 1], ['Be', 4, 1, 1], ['B', 5, 12, 1], ['C', 6, 13, 1], ['N', 7, 14, 1], ['O', 8, 15, 1], ['F', 9, 16, 1], ['Ne', 10, 17, 1],
  ['Na', 11, 0, 2], ['Mg', 12, 1, 2], ['Al', 13, 12, 2], ['Si', 14, 13, 2], ['P', 15, 14, 2], ['S', 16, 15, 2], ['Cl', 17, 16, 2], ['Ar', 18, 17, 2],
].map(([sym, z, col, row]) => ({ sym, z, ...cell(col, row) }));

export default function Scene4Periodic({ room, onBack, onReveal, initiallySolved }) {
  const [found, setFound] = useState(initiallySolved ? P.clues.map((c) => c.z) : []);
  const [wrong, setWrong] = useState(null);
  const idx = found.length;
  const clue = P.clues[idx] || null;
  const solved = idx >= P.clues.length;

  useEffect(() => { if (solved) onReveal && onReveal(room.id); }, [solved]);

  const tap = (el) => {
    if (!clue) return;
    if (el.z === clue.z) { setWrong(null); setFound((f) => [...f, el.z]); }
    else { setWrong(el.z); setTimeout(() => setWrong((w) => (w === el.z ? null : w)), 500); }
  };

  const renderScene = () => (
    <Group>
      {ELS.filter((e) => found.includes(e.z)).map((e) => (
        <Rect key={e.z} x={e.x - 1} y={e.y - 1} width={e.w + 2} height={e.h + 2}
          color="#6fe87a" style="stroke" strokeWidth={2} />
      ))}
      {wrong != null && (() => {
        const e = ELS.find((x) => x.z === wrong);
        return <Rect x={e.x - 1} y={e.y - 1} width={e.w + 2} height={e.h + 2} color="#f06b6b" style="stroke" strokeWidth={2} />;
      })()}
    </Group>
  );

  const renderOverlay = (L, { busy }) => (
    <>
      {/* Element-Beschriftung */}
      {ELS.map((e) => {
        const s = L.toScreen(e);
        return (
          <View key={e.z} pointerEvents="none" style={[styles.cell, s]}>
            <Text style={styles.z}>{e.z}</Text>
            <Text style={styles.sym}>{e.sym}</Text>
          </View>
        );
      })}
      {/* Hinweis-Banner */}
      {!busy && clue && (
        <View style={styles.clueBar}>
          <Text style={styles.clueLbl}>GESUCHT ({idx}/{P.clues.length})</Text>
          <Text style={styles.clueTxt}>{clue.text}</Text>
        </View>
      )}
      {/* Tap-Flaechen */}
      {!busy && ELS.map((e) => {
        const s = L.toScreen(e);
        return <Pressable key={'p' + e.z} style={[styles.hit, s]} onPress={() => tap(e)} />;
      })}
    </>
  );

  return (
    <SceneShell
      room={room}
      bgSource={require('../../assets/scenes/scene_04_periodic.png')}
      introLines={P.intro}
      hintLines={P.hint}
      solved={solved}
      solvedLines={['Neon (Ordnungszahl 10), Fluor (Ordnungszahl 9).', 'Ordnungszahlen ergeben: 109.']}
      onBack={onBack}
      renderScene={renderScene}
      renderOverlay={renderOverlay}
    />
  );
}

const styles = StyleSheet.create({
  cell: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  z: { color: '#0d0f17', fontFamily: 'monospace', fontSize: 7, position: 'absolute', top: 1, left: 2 },
  sym: { color: '#0d0f17', fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold' },
  hit: { position: 'absolute' },
  clueBar: { position: 'absolute', bottom: 18, left: 0, right: 0, alignItems: 'center' },
  clueLbl: { color: '#9660c8', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 },
  clueTxt: { color: '#eafcff', fontFamily: 'monospace', fontSize: 15, fontWeight: 'bold', marginTop: 2 },
});
