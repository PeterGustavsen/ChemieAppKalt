/*
 * SZENE 4 — Galvanische Zelle, IN-WORLD. Auf der Tafel ist eine echte Zelle
 * gezeichnet: zwei Halbzellen (Becher + Elektrode), Salzbrücke und Voltmeter.
 * Pro Elektrode wird das Metall mit ◀ ▶ gewählt; die aktive Elektrode glüht
 * pulsierend. Voltmeter zeigt die EMK; bei 1,10 V fließt Strom (Elektronen
 * wandern, alles leuchtet grün).  Zn-Anode / Cu-Kathode -> 1,10 V.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Group, Path, Rect, Circle } from '@shopify/react-native-skia';

import SceneShell from './SceneShell';
import { useSpriteFrame } from '../engine/useSprite';
import { poly } from '../engine/skiaUtil';
import { PUZZLES } from '../config/game';
import { FX } from '../fx/feedback';

const P = PUZZLES[4];
const METALS = [
  { sym: 'Zn', e: -0.76, col: '#9aa6b0' },
  { sym: 'Fe', e: -0.44, col: '#7a8088' },
  { sym: 'Cu', e: +0.34, col: '#d08a4a' },
  { sym: 'Ag', e: +0.80, col: '#d8dde2' },
];
const fmtV = (v) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(2).replace('.', ',')} V`;

// Zell-Geometrie (Szenen-Koordinaten) auf der Tafel
const VM = { x: 284, y: 58, w: 72, h: 32 };
const A = { cx: 196, top: 122, bot: 184, ht: 30, hb: 24 };   // Anode (links)
const C = { cx: 444, top: 122, bot: 184, ht: 30, hb: 24 };   // Kathode (rechts)
const EL_TOP = 104;                                          // Elektroden-Oberkante
const NOTE = { x: 150, y: 150, w: 150, h: 40 };

const beakerGlass = (b) => poly([[b.cx - b.ht, b.top], [b.cx + b.ht, b.top], [b.cx + b.hb, b.bot], [b.cx - b.hb, b.bot]]);
const beakerLiquid = (b) => {
  const sy = b.top + 14;
  const lx = b.cx - (b.ht - (b.ht - b.hb) * (sy - b.top) / (b.bot - b.top));
  return poly([[lx, sy], [2 * b.cx - lx, sy], [b.cx + b.hb, b.bot], [b.cx - b.hb, b.bot]]);
};

export default function Scene4Galvanic({ room, onBack, onReveal, initiallySolved, emergencyLight, danger }) {
  const [anodeIdx, setAnodeIdx] = useState(0);
  const [cathodeIdx, setCathodeIdx] = useState(3);
  const emk = METALS[cathodeIdx].e - METALS[anodeIdx].e;
  const solved = Math.round(emk * 100) === 110 || initiallySolved;

  const ph = useSpriteFrame(40, 20);
  const pulse = (Math.sin((ph / 40) * Math.PI * 2) + 1) / 2;     // 0..1
  const flow = useSpriteFrame(24, 16);                            // Elektronen-Phase

  useEffect(() => { if (solved) { FX.success(); onReveal && onReveal(room.id); } }, [solved]);

  const cycle = (idx, set, dir) => { FX.click(); set((idx + dir + METALS.length) % METALS.length); };

  const aM = METALS[anodeIdx], cM = METALS[cathodeIdx];
  const live = solved ? '#6fe87a' : '#cfe8ff';

  // Drahtweg Voltmeter -> Anode -> (Salzbrücke) -> Kathode -> Voltmeter
  const wireL = poly([[VM.x + 8, VM.y + VM.h], [VM.x + 8, EL_TOP - 6], [A.cx, EL_TOP - 6], [A.cx, EL_TOP]]);
  const wireR = poly([[VM.x + VM.w - 8, VM.y + VM.h], [VM.x + VM.w - 8, EL_TOP - 6], [C.cx, EL_TOP - 6], [C.cx, EL_TOP]]);
  const bridge = poly([[A.cx + 30, A.top + 4], [A.cx + 30, A.top - 8], [C.cx - 30, A.top - 8], [C.cx - 30, C.top + 4]]);

  // Elektronen entlang des linken Drahts (nur wenn gelöst)
  const eDots = solved ? [0, 1, 2, 3].map((k) => {
    const t = ((flow / 24) + k / 4) % 1;
    return { x: A.cx + (VM.x + 8 - A.cx) * 0, y: EL_TOP - 6, px: A.cx + (VM.x + 8 - A.cx) * t };
  }) : [];

  const renderScene = () => (
    <Group>
      {/* Drähte + Salzbrücke */}
      <Path path={wireL} color={live} style="stroke" strokeWidth={2} />
      <Path path={wireR} color={live} style="stroke" strokeWidth={2} />
      <Path path={bridge} color="#b9a25a" style="stroke" strokeWidth={5} opacity={0.85} />
      <Path path={bridge} color="#e7d79a" style="stroke" strokeWidth={2} />

      {/* Elektronenfluss auf der Oberleitung */}
      {eDots.map((d, i) => <Circle key={i} cx={d.px} cy={d.y} r={1.8} color="#aef5bd" />)}

      {/* Voltmeter-Ring */}
      <Rect x={VM.x} y={VM.y} width={VM.w} height={VM.h} color="#10141d" />
      <Rect x={VM.x} y={VM.y} width={VM.w} height={VM.h} color={solved ? '#6fe87a' : '#46506a'} style="stroke" strokeWidth={2} />

      {[A, C].map((b, i) => {
        const m = i === 0 ? aM : cM;
        return (
          <Group key={i}>
            {/* Glas + Flüssigkeit */}
            <Path path={beakerLiquid(b)} color={i === 0 ? '#6c84a8' : '#6ca8a0'} opacity={0.6} />
            <Path path={beakerGlass(b)} color="#cfe8ff" style="stroke" strokeWidth={2} opacity={0.6} />
            {/* pulsierender Schein der aktiven Elektrode */}
            <Rect x={b.cx - 6} y={EL_TOP} width={12} height={b.bot - EL_TOP - 4}
              color={solved ? '#6fe87a' : m.col} opacity={0.12 + 0.4 * pulse} />
            {/* Elektrode */}
            <Rect x={b.cx - 3} y={EL_TOP} width={6} height={b.bot - EL_TOP - 6} color={m.col} />
          </Group>
        );
      })}
    </Group>
  );

  const renderOverlay = (L, { busy }) => {
    if (busy) return null;
    const vm = L.toScreen(VM);
    const note = L.toScreen(NOTE);
    const u = L.scale;
    const near = Math.abs(emk - 1.10) < 0.25;
    return (
      <>
        {/* Voltmeter-Anzeige */}
        <View pointerEvents="none" style={[styles.vm, vm]}>
          <Text style={[styles.vmVal, { fontSize: 17 * u, color: solved ? '#6fe87a' : near ? '#e0e87a' : '#cfe8ff' }]}>{fmtV(emk)}</Text>
          <Text style={[styles.vmLbl, { fontSize: 6.5 * u }]}>EMK</Text>
        </View>

        {/* Elektroden-Wähler */}
        <Selector L={L} cx={A.cx} label="ANODE (−)" metal={aM} accent={room.accent}
          onPrev={() => cycle(anodeIdx, setAnodeIdx, -1)} onNext={() => cycle(anodeIdx, setAnodeIdx, +1)} />
        <Selector L={L} cx={C.cx} label="KATHODE (+)" metal={cM} accent={room.accent}
          onPrev={() => cycle(cathodeIdx, setCathodeIdx, -1)} onNext={() => cycle(cathodeIdx, setCathodeIdx, +1)} />

        {/* Angepinnte Ziel-Notiz */}
        <View pointerEvents="none" style={[styles.note, note]}>
          <View style={styles.notePin} />
          <Text style={[styles.noteTxt, { fontSize: 11 * u }]}>ZIEL: EMK = 1,10 V</Text>
          <Text style={[styles.noteSub, { fontSize: 8 * u }]}>EMK = E°(K) − E°(A)</Text>
        </View>
      </>
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
      renderScene={renderScene}
      renderOverlay={renderOverlay}
    />
  );
}

function Selector({ L, cx, label, metal, accent, onPrev, onNext }) {
  const u = L.scale;
  const rect = L.toScreen({ x: cx - 40, y: 188, w: 80, h: 30 });
  return (
    <View style={[styles.sel, rect]}>
      <Text style={[styles.selLbl, { fontSize: 7 * u, color: accent }]} numberOfLines={1}>{label}</Text>
      <View style={styles.selRow}>
        <Pressable hitSlop={8} onPress={onPrev}><Text style={[styles.selArrow, { fontSize: 13 * u }]}>◀</Text></Pressable>
        <View style={styles.selMid}>
          <Text style={[styles.selSym, { fontSize: 13 * u, color: metal.col }]}>{metal.sym}</Text>
          <Text style={[styles.selE, { fontSize: 7.5 * u }]}>{fmtV(metal.e)}</Text>
        </View>
        <Pressable hitSlop={8} onPress={onNext}><Text style={[styles.selArrow, { fontSize: 13 * u }]}>▶</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vm: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  vmVal: { fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 1 },
  vmLbl: { color: '#5a7a9a', fontFamily: 'monospace', letterSpacing: 2 },
  sel: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  selLbl: { fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 1 },
  selRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  selArrow: { color: '#cfe8ff', fontFamily: 'monospace', marginHorizontal: 4 },
  selMid: { alignItems: 'center', minWidth: 36 },
  selSym: { fontFamily: 'monospace', fontWeight: 'bold' },
  selE: { color: '#aab6c6', fontFamily: 'monospace' },
  note: {
    position: 'absolute', backgroundColor: '#ece3c8', borderWidth: 1, borderColor: '#c8bd9a',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
    transform: [{ rotate: '-2deg' }],
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 3, shadowOffset: { width: 1, height: 2 },
  },
  notePin: { position: 'absolute', top: -4, alignSelf: 'center', width: 7, height: 7, borderRadius: 4, backgroundColor: '#d4302a' },
  noteTxt: { color: '#2a2410', fontFamily: 'monospace', fontWeight: 'bold' },
  noteSub: { color: '#6a5e34', fontFamily: 'monospace', marginTop: 1 },
});
