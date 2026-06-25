/*
 * SZENE 6 — BROMWASSER-TEST (in-world, NEU).
 * Mechanik: in jedes Glas Bromwasser geben (orange Schicht) -> „Schütteln".
 * Ungesättigte Öle (Sonnenblumen, Oliven) entfärben das Brom, gesättigtes
 * Kokosöl bleibt orange. Danach die Gläser nach STEIGENDER Sättigung ordnen;
 * die Ziffern ergeben den Code. Liest PUZZLES[6].tubes (Fallback lokal).
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Group, Rect, Circle } from '@shopify/react-native-skia';

import SceneShell from './SceneShell';
import { useSpriteFrame } from '../engine/useSprite';
import { useGuessLock } from '../engine/useGuessLock';
import { PUZZLES } from '../config/game';
import { FX } from '../fx/feedback';

const P = PUZZLES[6] || {};
const RECTS = [
  { x: 120, y: 120, w: 60, h: 140 },
  { x: 290, y: 120, w: 60, h: 140 },
  { x: 460, y: 120, w: 60, h: 140 },
];
// sat = Sättigungsgrad (0 = am wenigsten gesättigt). decolor = entfärbt Brom.
const TUBES = P.tubes || [
  { name: 'Sonnenblumenöl', sat: 0, decolor: true, digit: '3', oil: '#e8dc8c' },
  { name: 'Kokosöl', sat: 2, decolor: false, digit: '9', oil: '#ededed' },
  { name: 'Olivenöl', sat: 1, decolor: true, digit: '5', oil: '#b8c86e' },
];
const READOUT = { x: 40, y: 56, w: 200, h: 56 };
const BROM = '#e0863a';

export default function Scene6Bromwasser({ room, onBack, onReveal, initiallySolved, emergencyLight, danger }) {
  const [added, setAdded] = useState(initiallySolved ? TUBES.map(() => true) : TUBES.map(() => false));
  const [shaken, setShaken] = useState(initiallySolved);
  const [seq, setSeq] = useState(initiallySolved ? [0, 1, 2] : []);
  const [wrong, setWrong] = useState(false);
  const lock = useGuessLock();
  const [shake, setShake] = useState(0);
  const shakeRef = useRef(null);
  const shimmer = useSpriteFrame(20, 10);

  const allAdded = added.every(Boolean);
  const solved = seq.length === 3;

  useEffect(() => { if (solved) { FX.success(); onReveal && onReveal(room.id); } }, [solved]);
  useEffect(() => () => clearInterval(shakeRef.current), []);

  const tapTube = (i) => {
    if (!shaken) {
      if (added[i]) { FX.error(); return; }
      FX.drip();
      setAdded((a) => a.map((v, j) => (j === i ? true : v)));
      return;
    }
    // Phase 2: nach steigender Sättigung ordnen
    if (lock.locked) { FX.error(); return; }
    if (TUBES[i].sat === seq.length) { FX.click(); setWrong(false); lock.reset(); setSeq((s) => [...s, TUBES[i].sat]); }
    else { FX.error(); setWrong(true); lock.registerWrong(); setSeq([]); setTimeout(() => setWrong(false), 500); }
  };

  const doShake = () => {
    if (!allAdded) { FX.error(); return; }
    if (shaken) return;
    FX.click();
    let t = 0;
    clearInterval(shakeRef.current);
    shakeRef.current = setInterval(() => {
      t += 1; setShake(Math.sin(t * 0.9) * 4 * Math.max(0, 1 - t / 26));
      if (t >= 26) { clearInterval(shakeRef.current); setShake(0); setShaken(true); }
    }, 16);
  };

  // digits in Sättigungs-Reihenfolge
  const byShake = [...TUBES].sort((a, b) => a.sat - b.sat);
  const built = seq.map((s) => byShake[s].digit).join('');

  const renderScene = () => (
    <Group>
      {TUBES.map((t, i) => {
        const r = RECTS[i];
        const ix = r.x + 4, iw = r.w - 8;
        const dx = shake;                       // Schüttel-Versatz
        const oilTop = r.y + 70, oilH = 56;
        const bromBleached = shaken && t.decolor;
        const bromCol = bromBleached ? t.oil : BROM;
        return (
          <Group key={i}>
            {/* Öl unten */}
            <Rect x={ix + dx} y={oilTop} width={iw} height={oilH} color={t.oil} opacity={0.9} />
            {/* Brom-Schicht oben (orange / entfärbt) */}
            {added[i] && <Rect x={ix + dx} y={oilTop - 26} width={iw} height={26} color={bromCol} opacity={bromBleached ? 0.5 : 0.92} />}
            {/* Schaum/Schimmer beim Schütteln */}
            {shake !== 0 && [0, 1].map((k) => (
              <Circle key={k} cx={ix + iw / 2 + dx + (k - 0.5) * 12} cy={oilTop - 18 + ((shimmer + k * 5) % 10)} r={2} color="#ffffff" opacity={0.4} />
            ))}
            {solved && seq.includes(t.sat) && <Rect x={r.x} y={r.y} width={r.w} height={r.h} color="#6fe87a" opacity={0.06} />}
          </Group>
        );
      })}
    </Group>
  );

  const renderOverlay = (L, { busy }) => {
    if (busy) return null;
    const ro = L.toScreen(READOUT);
    const u = L.scale;
    const phase = !shaken ? (allAdded ? 'schütteln' : 'bromwasser') : 'ordnen';
    return (
      <>
        <View pointerEvents="none" style={[styles.ro, ro]}>
          <Text style={[styles.roHdr, { fontSize: 8 * u }]}>BROMWASSER-TEST</Text>
          <Text style={[styles.roCode, { fontSize: 20 * u, color: solved ? '#6fe87a' : '#7fd89a' }]}>{built.padEnd(3, '·')}</Text>
          {lock.locked
            ? <Text style={[styles.roWrong, { fontSize: 8 * u }]}>GESPERRT · {lock.remainS}s</Text>
            : wrong && <Text style={[styles.roWrong, { fontSize: 8 * u }]}>falsche Reihenfolge</Text>}
        </View>

        {/* Glas-Labels + Taps */}
        {TUBES.map((t, i) => {
          const r = RECTS[i];
          const lab = L.toScreen({ x: r.x - 4, y: r.y + r.h + 2, w: r.w + 8, h: 14 });
          const s = L.toScreen(r);
          const picked = shaken && seq.includes(t.sat);
          const pos = seq.indexOf(t.sat);
          return (
            <React.Fragment key={i}>
              <View pointerEvents="none" style={[styles.lab, lab]}>
                <Text style={[styles.labTxt, { fontSize: 7 * u }]} numberOfLines={1}>{t.name}</Text>
              </View>
              <Pressable style={[styles.tube, s, picked && styles.tubePicked]} onPress={() => tapTube(i)}>
                {!shaken && !added[i] && <Text style={[styles.plus, { fontSize: 14 * u }]}>＋</Text>}
                {picked && <Text style={[styles.badge, { fontSize: 11 * u }]}>{pos + 1}.</Text>}
              </Pressable>
            </React.Fragment>
          );
        })}

        {/* Steuerleiste */}
        <View style={styles.band}>
          <Text style={[styles.bandHint, { fontSize: 9 * u }]}>
            {phase === 'bromwasser' ? 'Bromwasser in jedes Glas geben (+)' :
              phase === 'schütteln' ? 'Schütteln, dann beobachten' :
                'nach STEIGENDER Sättigung ordnen'}
          </Text>
          {!shaken && (
            <Pressable onPress={doShake} style={[styles.shakeBtn, { borderColor: room.accent, opacity: allAdded ? 1 : 0.5 }]}>
              <Text style={[styles.shakeTxt, { color: room.accent }]}>SCHÜTTELN</Text>
            </Pressable>
          )}
        </View>
      </>
    );
  };

  return (
    <SceneShell
      room={room}
      bgSource={require('../../assets/scenes/scene_06_bromwasser.png')}
      introLines={P.intro}
      hintLines={P.hint}
      solved={solved}
      solvedLines={['Ungesättigte Öle entfärben Bromwasser, gesättigtes nicht.', 'Sonnenblumen < Oliven < Kokos (steigende Sättigung).']}
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
  roHdr: { color: '#2f8f6a', fontFamily: 'monospace', letterSpacing: 1 },
  roCode: { fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 4 },
  roWrong: { color: '#f0907a', fontFamily: 'monospace' },
  lab: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  labTxt: { color: '#cfe0d6', fontFamily: 'monospace', fontWeight: 'bold' },
  tube: { position: 'absolute', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  tubePicked: { borderColor: '#6fe08a' },
  plus: { color: '#e0863a', fontFamily: 'monospace', fontWeight: 'bold' },
  badge: { color: '#6fe08a', fontFamily: 'monospace', fontWeight: 'bold' },
  band: { position: 'absolute', left: 0, right: 0, bottom: 10, alignItems: 'center' },
  bandHint: { color: '#aab6c6', fontFamily: 'monospace', marginBottom: 5 },
  shakeBtn: { borderWidth: 2, borderRadius: 4, paddingHorizontal: 16, paddingVertical: 5, backgroundColor: 'rgba(13,15,23,0.82)' },
  shakeTxt: { fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
});
