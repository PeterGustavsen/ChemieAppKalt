/*
 * SZENE 5 — Veresterung, IN-WORLD. Auf dem Apparate-Tisch stehen zwei Pixel-
 * Bechergläser (Säure + Alkohol), die per ◀ ▶ gewählt werden. Das Gemisch
 * "reagiert" im gemalten Rundkolben über dem Brenner; die Flamme wird heller,
 * je näher man am Ziel ist. Die Ester-Formel steht im Wand-Monitor.
 *   Säure + Alkohol mit zusammen 4 C -> Ester C₄H₈O₂ -> Code 482.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Group, Path, Circle, Rect } from '@shopify/react-native-skia';

import SceneShell from './SceneShell';
import { useSpriteFrame } from '../engine/useSprite';
import { poly } from '../engine/skiaUtil';
import { PUZZLES } from '../config/game';
import { FX } from '../fx/feedback';

const P = PUZZLES[5];
const ACIDS = [
  { name: 'Methansäure', c: 1, col: '#cfe0e8' },
  { name: 'Essigsäure', c: 2, col: '#e0d29a' },
  { name: 'Propansäure', c: 3, col: '#e0b48a' },
];
const ALCOHOLS = [
  { name: 'Methanol', c: 1, col: '#bcd8e8' },
  { name: 'Ethanol', c: 2, col: '#a8d8c0' },
  { name: 'Propanol', c: 3, col: '#c0c0e8' },
];

const ACID_B = { cx: 150, top: 150, bot: 214, ht: 26, hb: 20 };
const ALC_B = { cx: 300, top: 150, bot: 214, ht: 26, hb: 20 };
const FLASK = { x: 516, y: 142, r: 17 };     // gemalter Rundkolben
const BX = 516, BY = 196;                     // Brenner
const MON = { x: 470, y: 60, w: 140, h: 54 }; // Wand-Monitor

const glass = (b) => poly([[b.cx - b.ht, b.top], [b.cx + b.ht, b.top], [b.cx + b.hb, b.bot], [b.cx - b.hb, b.bot]]);
const liquid = (b) => {
  const sy = b.top + 16;
  const w = b.ht - (b.ht - b.hb) * (sy - b.top) / (b.bot - b.top);
  return poly([[b.cx - w, sy], [b.cx + w, sy], [b.cx + b.hb, b.bot], [b.cx - b.hb, b.bot]]);
};

export default function Scene5Ester({ room, onBack, onReveal, initiallySolved, emergencyLight, danger }) {
  const [acidIdx, setAcidIdx] = useState(1);
  const [alcoholIdx, setAlcoholIdx] = useState(1);
  const acid = ACIDS[acidIdx], alc = ALCOHOLS[alcoholIdx];
  const n = acid.c + alc.c;
  const solved = (n === 4) || initiallySolved;
  const ester = `C${n}H${2 * n}O₂`;

  const flick = useSpriteFrame(4, 9);
  const closeness = 1 - Math.abs(n - 4) / 3;     // 0..1, 1 am Ziel

  useEffect(() => { if (solved) { FX.success(); onReveal && onReveal(room.id); } }, [solved]);

  const cycle = (idx, set, len, dir) => { FX.click(); set((idx + dir + len) % len); };

  // Brennerflamme: höher/heller je näher am Ziel, grünlich wenn gelöst
  const fh = (14 + flick * 3) * (0.55 + 0.6 * closeness);
  const flameOuter = poly([[BX - 7, BY], [BX + 7, BY], [BX, BY - fh]]);
  const flameInner = poly([[BX - 3, BY], [BX + 3, BY], [BX, BY - fh * 0.55]]);
  const prodCol = solved ? '#8fe0a0' : closeness > 0.6 ? '#d8c87a' : '#9bb0c0';

  const renderScene = () => (
    <Group>
      {/* Reagenz-Bechergläser */}
      {[[ACID_B, acid], [ALC_B, alc]].map(([b, r], i) => (
        <Group key={i}>
          <Path path={liquid(b)} color={r.col} opacity={0.85} />
          <Path path={glass(b)} color="#cfe8ff" style="stroke" strokeWidth={2} opacity={0.55} />
        </Group>
      ))}

      {/* Produkt im Rundkolben + Glühen */}
      <Circle cx={FLASK.x} cy={FLASK.y} r={FLASK.r - 3} color={prodCol} opacity={0.5 + 0.4 * closeness} />
      {(solved || closeness > 0.5) && (
        <Circle cx={FLASK.x} cy={FLASK.y} r={FLASK.r + 4} color={solved ? '#6fe87a' : '#e0c060'}
          style="stroke" strokeWidth={2} opacity={0.25 + 0.4 * closeness} />
      )}

      {/* Bunsenflamme */}
      <Path path={flameOuter} color={solved ? '#7fe89a' : '#f0913a'} opacity={0.95} />
      <Path path={flameInner} color={solved ? '#d8ffe0' : '#5b9bf0'} opacity={0.9} />
    </Group>
  );

  const renderOverlay = (L, { busy }) => {
    if (busy) return null;
    const mon = L.toScreen(MON);
    const u = L.scale;
    return (
      <>
        {/* Wand-Monitor: Ester-Formel */}
        <View pointerEvents="none" style={[styles.mon, mon]}>
          <Text style={[styles.monLbl, { fontSize: 8 * u }]}>REAKTOR · PRODUKT</Text>
          <Text style={[styles.monVal, { fontSize: 24 * u, color: solved ? '#6fe87a' : '#8fd8b0' }]}>{ester}</Text>
          <Text style={[styles.monGoal, { fontSize: 8 * u }]}>ZIEL C₄H₈O₂</Text>
        </View>

        {/* Reagenz-Wähler unter den Bechergläsern */}
        <Selector L={L} cx={ACID_B.cx} label="SÄURE" name={acid.name} sub={`${acid.c} C`} accent={room.accent}
          onPrev={() => cycle(acidIdx, setAcidIdx, ACIDS.length, -1)} onNext={() => cycle(acidIdx, setAcidIdx, ACIDS.length, +1)} />
        <Selector L={L} cx={ALC_B.cx} label="ALKOHOL" name={alc.name} sub={`${alc.c} C`} accent={room.accent}
          onPrev={() => cycle(alcoholIdx, setAlcoholIdx, ALCOHOLS.length, -1)} onNext={() => cycle(alcoholIdx, setAlcoholIdx, ALCOHOLS.length, +1)} />
      </>
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
      renderScene={renderScene}
      renderOverlay={renderOverlay}
    />
  );
}

function Selector({ L, cx, label, name, sub, accent, onPrev, onNext }) {
  const u = L.scale;
  const rect = L.toScreen({ x: cx - 56, y: 220, w: 112, h: 32 });
  return (
    <View style={[styles.sel, rect]}>
      <Text style={[styles.selLbl, { fontSize: 7 * u, color: accent }]}>{label}</Text>
      <View style={styles.selRow}>
        <Pressable hitSlop={8} onPress={onPrev}><Text style={[styles.selArrow, { fontSize: 13 * u }]}>◀</Text></Pressable>
        <View style={styles.selMid}>
          <Text style={[styles.selName, { fontSize: 9.5 * u }]} numberOfLines={1}>{name}</Text>
          <Text style={[styles.selSub, { fontSize: 7.5 * u }]}>({sub})</Text>
        </View>
        <Pressable hitSlop={8} onPress={onNext}><Text style={[styles.selArrow, { fontSize: 13 * u }]}>▶</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mon: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  monLbl: { color: '#2f8f6a', fontFamily: 'monospace', letterSpacing: 1 },
  monVal: { fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 1 },
  monGoal: { color: '#2f8f6a', fontFamily: 'monospace', letterSpacing: 1 },
  sel: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  selLbl: { fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 2 },
  selRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  selArrow: { color: '#cfe8ff', fontFamily: 'monospace', marginHorizontal: 4 },
  selMid: { alignItems: 'center', minWidth: 70 },
  selName: { color: '#eafcff', fontFamily: 'monospace', fontWeight: 'bold' },
  selSub: { color: '#aab6c6', fontFamily: 'monospace' },
});
