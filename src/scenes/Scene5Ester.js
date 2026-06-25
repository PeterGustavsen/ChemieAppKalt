/*
 * SZENE 5 — BROMONIUM-MECHANISMUS ordnen (in-world).
 * NOTE: Legacy-Dateiname Scene5Ester.js; Inhalt ist jetzt der Bromonium-Mechanismus.
 *
 * Mechanik: die 3 Mechanismus-Platten in chronologischer Reihenfolge antippen
 * (Alken+Br₂ -> Bromonium-Brücke -> Br⁻-Rückseitenangriff/Dibromid). Falsch ->
 * FX.error + Reset. Jede Platte trägt eine Ziffer; die Reihenfolge baut den Code.
 * Liest PUZZLES[5].plates (Fallback lokal).
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Group, Circle, Path } from '@shopify/react-native-skia';

import SceneShell from './SceneShell';
import { useSpriteFrame } from '../engine/useSprite';
import { useGuessLock } from '../engine/useGuessLock';
import { poly } from '../engine/skiaUtil';
import { PUZZLES } from '../config/game';
import { FX } from '../fx/feedback';

const P = PUZZLES[5] || {};
const PLATE_RECTS = [
  { x: 56, y: 132, w: 120, h: 104 },
  { x: 192, y: 132, w: 120, h: 104 },
  { x: 328, y: 132, w: 120, h: 104 },
];
// Fallback: gemischte Reihenfolge; order = chronologisch (0..2)
const PLATES = P.plates || [
  { order: 2, digit: '2', step: 'dibromide' },
  { order: 0, digit: '9', step: 'alkene' },
  { order: 1, digit: '6', step: 'bromonium' },
];
const READOUT = { x: 470, y: 60, w: 140, h: 56 };
const C_COL = '#cfe8ff', BR_COL = '#e0863a', BOND = '#aeb8c8';

export default function Scene5Ester({ room, onBack, onReveal, initiallySolved, emergencyLight, danger }) {
  const [seq, setSeq] = useState(initiallySolved ? [0, 1, 2] : []);
  const [wrong, setWrong] = useState(false);
  const lock = useGuessLock();
  const solved = seq.length === 3;
  const pulse = useSpriteFrame(40, 16);

  useEffect(() => { if (solved) { FX.success(); onReveal && onReveal(room.id); } }, [solved]);

  const tap = (i) => {
    if (lock.locked) { FX.error(); return; }
    const need = seq.length;
    if (PLATES[i].order === need) { FX.click(); setWrong(false); lock.reset(); setSeq((s) => [...s, PLATES[i].order]); }
    else { FX.error(); setWrong(true); lock.registerWrong(); setSeq([]); setTimeout(() => setWrong(false), 500); }
  };

  // chronologisch sortierte Ziffern in Klick-Reihenfolge
  const byOrder = [...PLATES].sort((a, b) => a.order - b.order);
  const built = seq.map((o) => byOrder[o].digit).join('');

  // Mini-Mechanismus je Platte (Skia)
  const mech = (rect, step) => {
    const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2 - 8;
    const C = (x, y) => <Circle cx={x} cy={y} r={5} color={C_COL} />;
    if (step === 'alkene') {
      return (
        <Group>
          <Path path={poly([[cx - 14, cy - 28], [cx - 4, cy - 28]])} color={BR_COL} style="stroke" strokeWidth={2} />
          <Circle cx={cx - 14} cy={cy - 28} r={5} color={BR_COL} /><Circle cx={cx - 4} cy={cy - 28} r={5} color={BR_COL} />
          <Path path={poly([[cx - 6, cy - 22], [cx - 2, cy - 8]])} color={BR_COL} style="stroke" strokeWidth={1} />
          {C(cx - 14, cy + 4)}{C(cx + 14, cy + 4)}
          <Path path={poly([[cx - 9, cy + 1], [cx + 9, cy + 1]])} color={BOND} style="stroke" strokeWidth={1.5} />
          <Path path={poly([[cx - 9, cy + 7], [cx + 9, cy + 7]])} color={BOND} style="stroke" strokeWidth={1.5} />
        </Group>
      );
    }
    if (step === 'bromonium') {
      return (
        <Group>
          <Circle cx={cx} cy={cy - 18} r={6} color={BR_COL} />
          <Path path={poly([[cx, cy - 12], [cx - 14, cy + 4]])} color={BR_COL} style="stroke" strokeWidth={1.5} />
          <Path path={poly([[cx, cy - 12], [cx + 14, cy + 4]])} color={BR_COL} style="stroke" strokeWidth={1.5} />
          {C(cx - 14, cy + 4)}{C(cx + 14, cy + 4)}
          <Path path={poly([[cx - 9, cy + 4], [cx + 9, cy + 4]])} color={BOND} style="stroke" strokeWidth={1.5} />
          <Circle cx={cx} cy={cy + 28} r={5} color={BR_COL} opacity={0.9} />
          <Path path={poly([[cx - 3, cy + 28], [cx + 3, cy + 28]])} color="#fff" style="stroke" strokeWidth={1} />
        </Group>
      );
    }
    // dibromide (anti)
    return (
      <Group>
        {C(cx - 14, cy + 4)}{C(cx + 14, cy + 4)}
        <Path path={poly([[cx - 9, cy + 4], [cx + 9, cy + 4]])} color={BOND} style="stroke" strokeWidth={1.5} />
        <Path path={poly([[cx - 14, cy - 1], [cx - 22, cy - 16]])} color={BR_COL} style="stroke" strokeWidth={1.5} />
        <Circle cx={cx - 22} cy={cy - 16} r={5} color={BR_COL} />
        <Path path={poly([[cx + 14, cy + 9], [cx + 22, cy + 24]])} color={BR_COL} style="stroke" strokeWidth={1.5} />
        <Circle cx={cx + 22} cy={cy + 24} r={5} color={BR_COL} />
      </Group>
    );
  };

  const renderScene = () => (
    <Group>
      {PLATES.map((p, i) => {
        const picked = seq.includes(p.order);
        return <Group key={i} opacity={picked ? 1 : 0.92}>{mech(PLATE_RECTS[i], p.step)}</Group>;
      })}
    </Group>
  );

  const renderOverlay = (L, { busy }) => {
    if (busy) return null;
    const ro = L.toScreen(READOUT);
    const u = L.scale;
    const nextExpected = seq.length;
    return (
      <>
        {/* Code-Readout */}
        <View pointerEvents="none" style={[styles.ro, ro]}>
          <Text style={[styles.roLbl, { fontSize: 8 * u }]}>CODE</Text>
          <Text style={[styles.roVal, { fontSize: 26 * u, color: solved ? '#6fe87a' : '#9a7ad8' }]}>{built.padEnd(3, '·')}</Text>
          {lock.locked
            ? <Text style={[styles.roWrong, { fontSize: 8 * u }]}>GESPERRT · {lock.remainS}s</Text>
            : wrong && <Text style={[styles.roWrong, { fontSize: 8 * u }]}>falsche Reihenfolge</Text>}
        </View>

        {/* Platten-Inhalte: Ziffer + Reihenfolge-Badge + Tap */}
        {PLATES.map((p, i) => {
          const r = PLATE_RECTS[i];
          const s = L.toScreen(r);
          const dg = L.toScreen({ x: r.x + 6, y: r.y + r.h - 18, w: 22, h: 12 });
          const picked = seq.includes(p.order);
          const pos = seq.indexOf(p.order);
          const isNext = !picked && p.order === nextExpected;
          return (
            <React.Fragment key={i}>
              <View pointerEvents="none" style={[styles.digit, dg]}>
                <Text style={[styles.digitTxt, { fontSize: 10 * u }]}>{p.digit}</Text>
              </View>
              <Pressable style={[styles.plate, s, picked && styles.platePicked, isNext && (pulse % 40 < 20) && styles.plateNext]} onPress={() => tap(i)}>
                {picked && <Text style={[styles.badge, { fontSize: 10 * u }]}>{pos + 1}.</Text>}
              </Pressable>
            </React.Fragment>
          );
        })}

        <View style={styles.band} pointerEvents="none">
          <Text style={[styles.bandTxt, { fontSize: 9 * u }]}>Mechanismus in chronologischer Reihenfolge antippen</Text>
        </View>
      </>
    );
  };

  return (
    <SceneShell
      room={room}
      bgSource={require('../../assets/scenes/scene_05_bromonium.png')}
      introLines={P.intro}
      hintLines={P.hint}
      solved={solved}
      solvedLines={['Alken + Br₂ → Bromonium-Ion → anti-Dibromid.', 'Reihenfolge der Ziffern ergibt den Code.']}
      onBack={onBack}
      emergencyLight={emergencyLight}
      danger={danger}
      renderScene={renderScene}
      renderOverlay={renderOverlay}
    />
  );
}

const styles = StyleSheet.create({
  ro: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  roLbl: { color: '#7a5aa8', fontFamily: 'monospace', letterSpacing: 2 },
  roVal: { fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 4 },
  roWrong: { color: '#f0907a', fontFamily: 'monospace', marginTop: 1 },
  plate: { position: 'absolute', borderWidth: 2, borderColor: 'transparent', alignItems: 'flex-end', justifyContent: 'flex-start' },
  platePicked: { borderColor: '#9660c8' },
  plateNext: { borderColor: '#c8a0ee' },
  badge: { color: '#c8a0ee', fontFamily: 'monospace', fontWeight: 'bold', margin: 3 },
  digit: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  digitTxt: { color: '#e0b44c', fontFamily: 'monospace', fontWeight: 'bold' },
  band: { position: 'absolute', left: 0, right: 0, bottom: 14, alignItems: 'center' },
  bandTxt: { color: '#aab6c6', fontFamily: 'monospace' },
});
