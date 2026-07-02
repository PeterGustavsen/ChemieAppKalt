/*
 * SZENE 3 — OPFERANODE / Ferroxyl-Test (in-world).
 * NOTE: Legacy-Dateiname Scene3Redox.js; Inhalt ist jetzt der Opferanoden-Test.
 *
 * Mechanik: Metall (Cu/Zn/Mg/Al) anwählen -> wickelt den Eisennagel -> „Lösung
 * zugeben". Skia (Ferroxyl): unedles Metall (Mg/Zn/Al) schützt -> Nagel bleibt
 * blank, PINK (Phenolphthalein) am Nagel, BLAU (Berliner Blau) am Opfermetall.
 * Cu (edel) -> BLAU blüht am Nagel (beschleunigte Korrosion). Bestes Metall
 * (Mg) öffnet das Schloss. Liest PUZZLES[3].metals/.best (Fallback lokal).
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Group, Circle, Rect } from '@shopify/react-native-skia';

import SceneShell from './SceneShell';
import { useSpriteFrame } from '../engine/useSprite';
import { PUZZLES } from '../config/game';
import { FX } from '../fx/feedback';
import { useGuessLock } from '../engine/useGuessLock';

const P = PUZZLES[3] || {};
const METALS = P.metals || [
  { sym: 'Cu', e: +0.34, protects: false, col: '#d08a4a' },
  { sym: 'Zn', e: -0.76, protects: true, col: '#9aa6b0' },
  { sym: 'Mg', e: -2.37, protects: true, col: '#cfd6dd' },
  { sym: 'Al', e: -1.66, protects: true, col: '#b8c0c8' },
];
const BEST = P.best || 'Mg';
const DC = { x: 320, y: 195 };               // Schalenmitte (= Nagelmitte)
const NAIL = { x0: 250, x1: 384, y: 199 };

export default function Scene3Redox({ room, onBack, onReveal, initiallySolved, emergencyLight, danger }) {
  const [metal, setMetal] = useState(initiallySolved ? BEST : null);
  const [added, setAdded] = useState(initiallySolved);
  const lock = useGuessLock();
  const m = METALS.find((x) => x.sym === metal) || null;
  const solved = added && metal === BEST;

  const flick = useSpriteFrame(30, 10);
  const [prog, setProg] = useState(initiallySolved ? 1 : 0);
  const progRef = useRef(null);
  useEffect(() => {
    clearInterval(progRef.current);
    if (!added) { setProg(0); return; }
    progRef.current = setInterval(() => {
      setProg((p) => { const np = p + 0.06; if (np >= 1) { clearInterval(progRef.current); return 1; } return np; });
    }, 16);
    return () => clearInterval(progRef.current);
  }, [added, metal]);

  useEffect(() => { if (solved) { FX.success(); onReveal && onReveal(room.id); } }, [solved]);

  const choose = (sym) => { FX.click(); setMetal(sym); setAdded(false); };
  const addSolution = () => {
    if (lock.locked) { FX.error(); return; }   // während Sperre keine Eingabe
    if (!metal) { FX.error(); return; }
    FX.drip();
    setAdded(true);
    if (metal === BEST) { lock.reset(); }
    else { lock.registerWrong(); setTimeout(() => FX.error(), 300); }   // nicht optimal = Fehlversuch → Sperre
  };

  const result = !added ? null
    : (metal === BEST ? { txt: `${metal}: schützt optimal ✓ — Schloss offen`, col: '#6fe87a' }
      : m && m.protects ? { txt: `${metal}: schützt — aber nicht optimal`, col: '#e0b44c' }
        : { txt: `${metal}: beschleunigt Korrosion ✗`, col: '#f0907a' });

  const renderScene = () => {
    const band = m ? <Rect x={DC.x - 9} y={NAIL.y - 6} width={18} height={12} color={m.col} /> : null;
    if (!added || !m) return <Group>{band}</Group>;
    const r = prog * (0.7 + 0.3 * ((flick % 30) / 30));
    const protects = m.protects;
    return (
      <Group>
        {/* PINK Phenolphthalein (Kathode) */}
        {protects
          ? <Circle cx={DC.x} cy={DC.y} r={34 * r} color="#e36fb0" opacity={0.34 * prog} />
          : <>
              <Circle cx={DC.x - 90} cy={DC.y - 24} r={16 * r} color="#e36fb0" opacity={0.3 * prog} />
              <Circle cx={DC.x + 86} cy={DC.y + 22} r={16 * r} color="#e36fb0" opacity={0.3 * prog} />
            </>}
        {/* BLAU Berliner Blau (Anode = Oxidation des Eisens) */}
        {protects
          ? [-1, 0, 1].map((k) => <Circle key={k} cx={DC.x + k * 6} cy={NAIL.y} r={4 * r} color="#2a64c8" opacity={0.85 * prog} />)
          : [0, 1, 2, 3].map((k) => <Circle key={k} cx={NAIL.x0 + 20 + k * 30} cy={NAIL.y} r={6 * r} color="#2050c0" opacity={0.85 * prog} />)}
        {band}
        {solved && <Circle cx={DC.x} cy={DC.y} r={40 * r} color="#6fe87a" style="stroke" strokeWidth={2} opacity={0.4} />}
      </Group>
    );
  };

  const renderOverlay = (L, { busy }) => {
    if (busy) return null;
    const lab = L.toScreen({ x: 46, y: 62, w: 228, h: 44 });
    const u = L.scale;
    return (
      <>
        {/* Ergebnis-Plakette */}
        <View pointerEvents="none" style={[styles.label, lab]}>
          <Text style={[styles.labHdr, { fontSize: 8 * u }]}>FERROXYL-TEST</Text>
          <Text style={[styles.labTxt, { fontSize: 9.5 * u, color: lock.locked ? '#f0907a' : (result ? result.col : '#6fe87a') }]} numberOfLines={2}>
            {lock.locked
              ? `GESPERRT — ${lock.remainS}s warten`
              : (result ? result.txt : (metal ? `${metal} um den Nagel gewickelt — Lösung zugeben` : 'Metall wählen'))}
          </Text>
        </View>

        {/* Steuerleiste: Metalle + Lösung zugeben */}
        <View style={styles.band}>
          <View style={styles.chips}>
            {METALS.map((x) => (
              <Pressable key={x.sym} onPress={() => choose(x.sym)}
                style={[styles.chip, { borderColor: metal === x.sym ? room.accent : '#33405a' }, metal === x.sym && styles.chipSel]}>
                <Text style={[styles.chipSym, { color: '#eafcff' }]}>{x.sym}</Text>
              </Pressable>
            ))}
            <Pressable onPress={addSolution} style={[styles.addBtn, { borderColor: room.accent }]}>
              <Text style={[styles.addTxt, { color: room.accent }]}>LÖSUNG{'\n'}ZUGEBEN</Text>
            </Pressable>
          </View>
        </View>
      </>
    );
  };

  return (
    <SceneShell
      room={room}
      introLines={P.intro}
      hintLines={P.hint}
      solved={solved}
      solvedLines={['Magnesium ist unedler als Eisen — es opfert sich.', 'Der Nagel bleibt blank (Kathode), Mg korrodiert.']}
      onBack={onBack}
      emergencyLight={emergencyLight}
      danger={danger}
      renderScene={renderScene}
      renderOverlay={renderOverlay}
    />
  );
}

const styles = StyleSheet.create({
  label: { position: 'absolute', justifyContent: 'center', paddingHorizontal: 8 },
  labHdr: { color: '#2f8f6a', fontFamily: 'monospace', letterSpacing: 2 },
  labTxt: { fontFamily: 'monospace', fontWeight: 'bold', marginTop: 3, lineHeight: undefined },
  band: { position: 'absolute', left: 0, right: 0, bottom: 12, alignItems: 'center' },
  chips: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  chip: {
    borderWidth: 2, borderRadius: 4, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center',
    backgroundColor: 'rgba(13,15,23,0.82)', minWidth: 44,
  },
  chipSel: { backgroundColor: 'rgba(227,111,176,0.18)' },
  chipSym: { fontFamily: 'monospace', fontSize: 15, fontWeight: 'bold' },
  addBtn: { borderWidth: 2, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 6, backgroundColor: 'rgba(13,15,23,0.82)' },
  addTxt: { fontFamily: 'monospace', fontSize: 9, fontWeight: 'bold', textAlign: 'center', letterSpacing: 1 },
});
