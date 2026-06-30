/*
 * SZENE 2 — GALVANISCHE ZELLE (in-world).
 * NOTE: Datei heißt aus Legacy-Gründen noch Scene2Buffer.js (App.js-Mapping);
 * Inhalt ist jetzt die galvanische Zelle. Umbenennen, sobald Ruben das
 * ROOM_COMPONENTS-Mapping in App.js anpasst.
 *
 * Mechanik: Metall-Chip (Steuerleiste) anwählen -> in L-Slot (Anode) oder
 * R-Slot (Kathode) setzen. Skia: Voltmeter-Nadel schwingt zur EMK, Elektronen
 * fließen, Blasen steigen, Elektroden färben sich. Ziel: EMK = 1,10 V (1100 mV).
 * Liest PUZZLES[2].metals / .targetMv (Fallback lokal) — siehe PUZZLES_CONTRACT.md.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Group, Path, Circle, Rect } from '@shopify/react-native-skia';

import SceneShell from './SceneShell';
import { useSpriteFrame } from '../engine/useSprite';
import { poly } from '../engine/skiaUtil';
import { PUZZLES } from '../config/game';
import { FX } from '../fx/feedback';
import { useGuessLock } from '../engine/useGuessLock';

const P = PUZZLES[2] || {};
const METALS = P.metals || [
  { sym: 'Zn', e: -0.76, col: '#9aa6b0' },
  { sym: 'Fe', e: -0.44, col: '#7a8088' },
  { sym: 'Cu', e: +0.34, col: '#d08a4a' },
  { sym: 'Ag', e: +0.80, col: '#d8dde2' },
];
const COLS = { Zn: '#9aa6b0', Fe: '#7a8088', Cu: '#d08a4a', Ag: '#d8dde2' };
const TARGET_MV = P.targetMv || 1100;

const VM = { x: 248, y: 56, w: 144, h: 60 };
const LSLOT = { x: 150, y: 150, w: 70, h: 90 };
const RSLOT = { x: 420, y: 150, w: 70, h: 90 };
const PIVOT = { x: VM.x + VM.w / 2, y: VM.y + VM.h - 8 };   // (320,108)
const fmtV = (mv) => `${(mv / 1000).toFixed(2).replace('.', ',')} V`;
const metalOf = (sym) => METALS.find((m) => m.sym === sym);

export default function Scene2Buffer({ room, onBack, onReveal, initiallySolved, emergencyLight, danger }) {
  const [anode, setAnode] = useState(initiallySolved ? 'Zn' : null);
  const [cathode, setCathode] = useState(initiallySolved ? 'Cu' : null);
  const [pick, setPick] = useState(null);
  const lock = useGuessLock();

  const both = anode && cathode;
  const mv = both ? Math.round((metalOf(cathode).e - metalOf(anode).e) * 1000) : 0;
  const solved = both && mv === TARGET_MV;

  const flow = useSpriteFrame(24, 14);
  const flick = useSpriteFrame(4, 8);

  useEffect(() => { if (solved) { FX.success(); lock.reset(); onReveal && onReveal(room.id); } }, [solved]);

  // Anti-Brute-Force: beide Becher besetzt, aber EMK falsch = Fehlversuch → Sperre.
  useEffect(() => {
    if (anode && cathode && !solved) { FX.error(); lock.registerWrong(); }
  }, [anode, cathode]);

  const place = (which) => {
    if (lock.locked) { FX.error(); return; }   // während Sperre keine Eingabe
    const cur = which === 'A' ? anode : cathode;
    const set = which === 'A' ? setAnode : setCathode;
    if (pick) { FX.click(); set(pick); return; }   // Chip gewählt → setzen/ersetzen
    if (cur)  { FX.click(); set(null); return; }    // kein Chip, Becher besetzt → Metall herausnehmen
    FX.error();                                      // nichts gewählt, Becher leer
  };
  const choose = (sym) => { FX.click(); setPick(sym); };

  // Nadelwinkel: EMK 0..2000 mV -> 220°..320°
  const ang = (220 + Math.max(0, Math.min(2000, mv)) / 2000 * 100) * Math.PI / 180;
  const needleLen = 44;
  const nx = PIVOT.x + needleLen * Math.cos(ang);
  const ny = PIVOT.y + needleLen * Math.sin(ang);
  const live = mv > 50;
  const aCol = anode ? COLS[anode] || '#cfe8ff' : null;
  const cCol = cathode ? COLS[cathode] || '#cfe8ff' : null;

  const electrode = (slot, col) => col && (
    <Group>
      <Rect x={slot.x + slot.w / 2 - 5} y={slot.y - 4} width={10} height={slot.h - 18} color={col} />
      <Rect x={slot.x + slot.w / 2 - 5} y={slot.y - 4} width={10} height={3} color="#ffffff" opacity={0.4} />
    </Group>
  );

  // Blasen in den Bechern, wenn Strom fließt
  const bubbles = (slot) => live ? [0, 1, 2].map((k) => {
    const t = ((flow / 24) + k / 3) % 1;
    return <Circle key={k} cx={slot.x + slot.w / 2 + (k - 1) * 6} cy={slot.y + slot.h - 6 - t * (slot.h - 22)} r={1.6} color="#cfeaff" opacity={0.7 * (1 - t)} />;
  }) : null;

  const renderScene = () => {
    // Elektronen entlang der Salzbrücke (Anode -> Kathode, oben)
    const bx0 = LSLOT.x + LSLOT.w / 2, bx1 = RSLOT.x + RSLOT.w / 2, by = 122 + 4;
    const eDots = live ? [0, 1, 2, 3].map((k) => {
      const t = ((flow / 24) + k / 4) % 1;
      return <Circle key={k} cx={bx0 + (bx1 - bx0) * t} cy={by} r={1.8} color="#aef5bd" />;
    }) : null;
    return (
      <Group>
        {electrode(LSLOT, aCol)}
        {electrode(RSLOT, cCol)}
        {bubbles(LSLOT)}{bubbles(RSLOT)}
        {eDots}
        {/* Voltmeter-Nadel */}
        <Path path={poly([[PIVOT.x, PIVOT.y], [nx, ny]])} color={solved ? '#6fe87a' : '#f0b23a'} style="stroke" strokeWidth={2} strokeCap="round" />
        <Circle cx={PIVOT.x} cy={PIVOT.y} r={2.5} color="#e0b44c" />
        {solved && <Rect x={VM.x} y={VM.y} width={VM.w} height={VM.h} color="#6fe87a" opacity={0.08} />}
      </Group>
    );
  };

  const renderOverlay = (L, { busy }) => {
    if (busy) return null;
    const vm = L.toScreen({ x: VM.x + 8, y: VM.y + 4, w: VM.w - 16, h: 16 });
    const u = L.scale;
    return (
      <>
        {/* Digital-Wert auf dem Voltmeter */}
        <View pointerEvents="none" style={[styles.vm, vm]}>
          <Text style={[styles.vmTxt, { fontSize: 11 * u, color: solved ? '#6fe87a' : both ? '#f0b23a' : '#46506a' }]}>
            {both ? fmtV(mv) : '-- V'}
          </Text>
        </View>

        {/* Slot-Taps (Anode / Kathode) */}
        <SlotTap L={L} slot={LSLOT} label="ANODE (−)" sym={anode} accent={room.accent} onPress={() => place('A')} />
        <SlotTap L={L} slot={RSLOT} label="KATHODE (+)" sym={cathode} accent={room.accent} onPress={() => place('C')} />

        {/* Steuerleiste: Metall-Chips */}
        <View style={styles.band}>
          <Text style={[styles.bandHint, { fontSize: 9 * u, color: lock.locked ? '#f0907a' : '#aab6c6' }]}>
            {lock.locked
              ? `GESPERRT — ${lock.remainS}s warten`
              : `${pick ? `„${pick}" → Becher antippen` : 'Metall wählen · besetzten Becher antippen = leeren'} · Ziel ${fmtV(TARGET_MV)}`}
          </Text>
          <View style={styles.chips}>
            {METALS.map((m) => (
              <Pressable key={m.sym} onPress={() => choose(m.sym)}
                style={[styles.chip, { borderColor: pick === m.sym ? room.accent : '#33405a' }, pick === m.sym && styles.chipSel]}>
                <Text style={[styles.chipSym, { color: m.col || '#eafcff' }]}>{m.sym}</Text>
                <Text style={styles.chipE}>{`${m.e < 0 ? '−' : ''}${Math.abs(m.e).toFixed(2).replace('.', ',')} V`}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </>
    );
  };

  return (
    <SceneShell
      room={room}
      bgSource={require('../../assets/scenes/scene_02_galvanic.png')}
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

function SlotTap({ L, slot, label, sym, accent, onPress }) {
  const s = L.toScreen(slot);
  const u = L.scale;
  return (
    <Pressable style={[styles.slot, s]} onPress={onPress}>
      <Text style={[styles.slotLbl, { fontSize: 8 * u, color: accent }]} numberOfLines={1}>{label}</Text>
      {sym
        ? <Text style={[styles.slotSym, { fontSize: 13 * u, color: COLS[sym] || '#eafcff' }]}>{sym}</Text>
        : <Text style={[styles.slotEmpty, { fontSize: 9 * u }]}>leer</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  vm: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  vmTxt: { fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 1 },
  slot: { position: 'absolute', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2 },
  slotLbl: { fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 1 },
  slotSym: { fontFamily: 'monospace', fontWeight: 'bold', marginTop: 2 },
  slotEmpty: { color: '#6a7a8a', fontFamily: 'monospace', marginTop: 2 },
  band: { position: 'absolute', left: 0, right: 0, bottom: 12, alignItems: 'center' },
  bandHint: { color: '#aab6c6', fontFamily: 'monospace', marginBottom: 5 },
  chips: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  chip: {
    borderWidth: 2, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center',
    backgroundColor: 'rgba(13,15,23,0.82)', minWidth: 52,
  },
  chipSel: { backgroundColor: 'rgba(111,211,221,0.18)' },
  chipSym: { fontFamily: 'monospace', fontSize: 15, fontWeight: 'bold' },
  chipE: { color: '#aab6c6', fontFamily: 'monospace', fontSize: 9, marginTop: 1 },
});
