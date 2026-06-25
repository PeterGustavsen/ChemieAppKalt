/*
 * SZENE 7 — ISOMERIE E/Z (in-world, NEU).
 * Mechanik: für jedes der 3 Moleküle im Viewer E oder Z wählen. Richtig ->
 * nächstes Molekül + Ziffer. Skia zeichnet das Molekül; Prioritätspfeile zeigen
 * die höher-priorisierten (CIP) Substituenten. Ziffern ergeben den Code.
 * HANDOFF #2: Geometrie muss zu Rubens answer (E/Z) passen — gemeinsam abstimmen.
 * Liest PUZZLES[7].molecules (Fallback lokal).
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Group, Circle, Path } from '@shopify/react-native-skia';

import SceneShell from './SceneShell';
import { poly } from '../engine/skiaUtil';
import { useGuessLock } from '../engine/useGuessLock';
import { PUZZLES } from '../config/game';
import { FX } from '../fx/feedback';

const P = PUZZLES[7] || {};
// hi = höhere CIP-Priorität. answer aus der Geometrie (beide hi gleiche Seite=Z).
const MOLS = P.molecules || [
  { answer: 'Z', digit: '2', c1Top: { l: 'CH₃', hi: true }, c1Bot: { l: 'H' }, c2Top: { l: 'CH₃', hi: true }, c2Bot: { l: 'H' } },
  { answer: 'E', digit: '8', c1Top: { l: 'CH₃', hi: true }, c1Bot: { l: 'H' }, c2Top: { l: 'H' }, c2Bot: { l: 'CH₃', hi: true } },
  { answer: 'Z', digit: '4', c1Top: { l: 'Cl', hi: true }, c1Bot: { l: 'H' }, c2Top: { l: 'Br', hi: true }, c2Bot: { l: 'CH₃' } },
];
const V = { x: 160, y: 120, w: 320, h: 140 };
const PROG = { x: 470, y: 56, w: 140, h: 56 };
// Atompositionen (Szenen-Koordinaten)
const C1 = { x: 300, y: 192 }, C2 = { x: 344, y: 192 };
const ENDS = {
  c1Top: { x: 266, y: 158 }, c1Bot: { x: 266, y: 226 },
  c2Top: { x: 378, y: 158 }, c2Bot: { x: 378, y: 226 },
};

export default function Scene7Isomerie({ room, onBack, onReveal, initiallySolved, emergencyLight, danger }) {
  const [idx, setIdx] = useState(initiallySolved ? 3 : 0);
  const [digits, setDigits] = useState(initiallySolved ? MOLS.map((m) => m.digit) : []);
  const [wrong, setWrong] = useState(false);
  const lock = useGuessLock();
  const solved = idx >= MOLS.length;
  const mol = MOLS[Math.min(idx, MOLS.length - 1)];

  useEffect(() => { if (solved) { FX.success(); onReveal && onReveal(room.id); } }, [solved]);

  const pick = (ans) => {
    if (solved) return;
    if (lock.locked) { FX.error(); return; }
    if (ans === mol.answer) {
      FX.click();
      lock.reset();
      setDigits((d) => [...d, mol.digit]);
      setIdx((i) => i + 1);
    } else { FX.error(); setWrong(true); lock.registerWrong(); setTimeout(() => setWrong(false), 500); }
  };

  const bond = (a, b, col, sw = 2) => <Path path={poly([[a.x, a.y], [b.x, b.y]])} color={col} style="stroke" strokeWidth={sw} />;
  const prioArrow = (from, to) => {
    const dx = to.x - from.x, dy = to.y - from.y, len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const tip = { x: from.x + ux * (len - 14), y: from.y + uy * (len - 14) };
    return <Circle cx={tip.x} cy={tip.y} r={3} color={room.accent} />;
  };

  const renderScene = () => {
    if (solved) {
      return <Group><Circle cx={V.x + V.w / 2} cy={V.y + V.h / 2} r={30} color="#6fe87a" opacity={0.15} /></Group>;
    }
    const C = '#cfe8ff';
    return (
      <Group>
        {/* Doppelbindung */}
        {bond({ x: C1.x, y: C1.y - 3 }, { x: C2.x, y: C2.y - 3 }, C, 2)}
        {bond({ x: C1.x, y: C1.y + 3 }, { x: C2.x, y: C2.y + 3 }, C, 2)}
        {/* Substituenten-Bindungen */}
        {bond(C1, ENDS.c1Top, C)}{bond(C1, ENDS.c1Bot, C)}
        {bond(C2, ENDS.c2Top, C)}{bond(C2, ENDS.c2Bot, C)}
        {/* Atome */}
        <Circle cx={C1.x} cy={C1.y} r={5} color={C} /><Circle cx={C2.x} cy={C2.y} r={5} color={C} />
        {[['c1Top', ENDS.c1Top], ['c1Bot', ENDS.c1Bot], ['c2Top', ENDS.c2Top], ['c2Bot', ENDS.c2Bot]].map(([k, e]) => {
          const sub = mol[k];
          return <Circle key={k} cx={e.x} cy={e.y} r={sub.hi ? 6 : 4} color={sub.hi ? room.accent : '#8fa0b0'} />;
        })}
        {/* Prioritätspfeile auf die hi-Substituenten je C */}
        {mol.c1Top.hi ? prioArrow(C1, ENDS.c1Top) : prioArrow(C1, ENDS.c1Bot)}
        {mol.c2Top.hi ? prioArrow(C2, ENDS.c2Top) : prioArrow(C2, ENDS.c2Bot)}
      </Group>
    );
  };

  const renderOverlay = (L, { busy }) => {
    if (busy) return null;
    const u = L.scale;
    const prog = L.toScreen(PROG);
    return (
      <>
        {/* Fortschritt / Code */}
        <View pointerEvents="none" style={[styles.prog, prog]}>
          <Text style={[styles.progLbl, { fontSize: 8 * u }]}>MOLEKÜL {Math.min(idx + 1, 3)}/3</Text>
          <Text style={[styles.progCode, { fontSize: 22 * u, color: solved ? '#6fe87a' : '#e0b44c' }]}>{digits.join('').padEnd(3, '·')}</Text>
        </View>

        {/* Substituenten-Beschriftung */}
        {!solved && [['c1Top', ENDS.c1Top], ['c1Bot', ENDS.c1Bot], ['c2Top', ENDS.c2Top], ['c2Bot', ENDS.c2Bot]].map(([k, e]) => {
          const s = L.toScreen({ x: e.x - 18, y: e.y - 18, w: 36, h: 14 });
          const sub = mol[k];
          return (
            <View key={k} pointerEvents="none" style={[styles.sub, s]}>
              <Text style={[styles.subTxt, { fontSize: 9 * u, color: sub.hi ? room.accent : '#aab6c6' }]}>{sub.l}</Text>
            </View>
          );
        })}

        {/* Steuerleiste: E / Z */}
        <View style={styles.band}>
          {!solved && <Text style={[styles.bandHint, { fontSize: 9 * u }]}>{lock.locked ? `GESPERRT · ${lock.remainS}s` : wrong ? 'falsch — CIP-Prioritäten prüfen' : 'Konfiguration bestimmen'}</Text>}
          <View style={styles.btns}>
            {['E', 'Z'].map((a) => (
              <Pressable key={a} onPress={() => pick(a)} style={[styles.btn, { borderColor: room.accent }]}>
                <Text style={[styles.btnTxt, { color: room.accent }]}>{a}</Text>
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
      bgSource={require('../../assets/scenes/scene_07_isomerie.png')}
      introLines={P.intro}
      hintLines={P.hint}
      solved={solved}
      solvedLines={['Höhere CIP-Priorität gleiche Seite = Z, gegenüber = E.', 'Die Ziffern in Reihenfolge ergeben den Code.']}
      onBack={onBack}
      emergencyLight={emergencyLight}
      danger={danger}
      renderScene={renderScene}
      renderOverlay={renderOverlay}
    />
  );
}

const styles = StyleSheet.create({
  prog: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  progLbl: { color: '#8a7a3a', fontFamily: 'monospace', letterSpacing: 1 },
  progCode: { fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 4 },
  sub: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  subTxt: { fontFamily: 'monospace', fontWeight: 'bold' },
  band: { position: 'absolute', left: 0, right: 0, bottom: 12, alignItems: 'center' },
  bandHint: { color: '#aab6c6', fontFamily: 'monospace', marginBottom: 5 },
  btns: { flexDirection: 'row', gap: 16 },
  btn: { borderWidth: 2, borderRadius: 4, paddingHorizontal: 22, paddingVertical: 6, backgroundColor: 'rgba(13,15,23,0.82)' },
  btnTxt: { fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
});
