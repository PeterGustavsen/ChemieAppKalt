/*
 * SZENE 2 — Acetat-Puffer, IN-WORLD. Die Säure-Base-Mischung steht im gemalten
 * Erlenmeyerkolben: die Flüssigkeitsfarbe spiegelt den pH (Crossfade), ein
 * fallender Tropfen + FX.drip() bei jeder Zugabe. Der pH-Wert sitzt im gemalten
 * Wand-Monitor; darunter zwei kompakte Reagenz-Regler.
 *   pH = pKs + log( c(Ac⁻)/c(HAc) ),  Ziel pH = 5,75  ->  Verhältnis 10:1
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Group, Path, Circle, Rect } from '@shopify/react-native-skia';

import SceneShell from './SceneShell';
import { poly } from '../engine/skiaUtil';
import { PUZZLES } from '../config/game';
import { FX } from '../fx/feedback';

const P = PUZZLES[2];
const PKS = 4.75;
const CONC = [0.01, 0.1, 1];
const TARGET = 5.75;

const fmt = (n, d) => n.toFixed(d).replace('.', ',');

// Kolben-Geometrie (Szenen-Koordinaten), Oberfläche bei SY.
const FLASK = { nl: 197, nr: 213, bl: 177, br: 233, top: 206, bot: 248 };
const SY = 224;
const lx = (y) => FLASK.nl + (FLASK.bl - FLASK.nl) * (y - FLASK.top) / (FLASK.bot - FLASK.top);
const rx = (y) => FLASK.nr + (FLASK.br - FLASK.nr) * (y - FLASK.top) / (FLASK.bot - FLASK.top);
const TIP = { x: 205, y0: 166, y1: SY - 2 };   // Bürettenauslauf -> Kolben

const MONITOR = { x: 444, y: 66, w: 156, h: 62 };   // gemalter Wand-Monitor rechts

// pH -> Indikatorfarbe (universalindikator-artig), Stützstellen
const STOPS = [
  [2.75, [210, 59, 59]],   // stark sauer – rot
  [4.75, [224, 123, 47]],  // orange
  [5.25, [224, 179, 65]],  // amber
  [5.75, [155, 216, 74]],  // Ziel – gelbgrün
  [6.75, [78, 201, 138]],  // grün
];
function colorFor(ph) {
  const p = Math.max(STOPS[0][0], Math.min(STOPS[STOPS.length - 1][0], ph));
  let a = STOPS[0], b = STOPS[STOPS.length - 1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (p >= STOPS[i][0] && p <= STOPS[i + 1][0]) { a = STOPS[i]; b = STOPS[i + 1]; break; }
  }
  const t = (p - a[0]) / (b[0] - a[0] || 1);
  const c = a[1].map((v, i) => Math.round(v + (b[1][i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export default function Scene2Buffer({ room, onBack, onReveal, initiallySolved, emergencyLight, danger }) {
  const [iA, setIA] = useState(1);
  const [iHA, setIHA] = useState(1);
  const cA = CONC[iA], cHA = CONC[iHA];
  const pH = PKS + Math.log10(cA / cHA);
  const solved = Math.abs(pH - TARGET) < 1e-9 || initiallySolved;

  // pH-Crossfade
  const [dispPH, setDispPH] = useState(pH);
  const easeRef = useRef(null);
  useEffect(() => {
    clearInterval(easeRef.current);
    easeRef.current = setInterval(() => {
      setDispPH((d) => {
        const nd = d + (pH - d) * 0.2;
        if (Math.abs(nd - pH) < 0.004) { clearInterval(easeRef.current); return pH; }
        return nd;
      });
    }, 16);
    return () => clearInterval(easeRef.current);
  }, [pH]);

  // Fallender Tropfen
  const [dropY, setDropY] = useState(null);
  const dripRef = useRef(null);
  const drip = () => {
    FX.drip();
    clearInterval(dripRef.current);
    let y = TIP.y0;
    setDropY(y);
    dripRef.current = setInterval(() => {
      y += 6;
      if (y >= TIP.y1) { clearInterval(dripRef.current); setDropY(null); }
      else setDropY(y);
    }, 16);
  };
  useEffect(() => () => clearInterval(dripRef.current), []);

  useEffect(() => { if (solved) { FX.success(); onReveal && onReveal(room.id); } }, [solved]);

  const onStep = (set, idx, dir) => {
    const ni = Math.max(0, Math.min(CONC.length - 1, idx + dir));
    if (ni === idx) { FX.error(); return; }
    set(ni); drip();
  };

  const LIQUID = useMemo(() => poly([[lx(SY), SY], [rx(SY), SY], [FLASK.br, FLASK.bot], [FLASK.bl, FLASK.bot]]), []);
  const liqColor = colorFor(dispPH);

  const renderScene = () => (
    <Group>
      <Path path={LIQUID} color={liqColor} opacity={0.92} />
      {solved && (
        <Path path={LIQUID} color="#ffffff" opacity={0.12} />
      )}
      {dropY != null && <Circle cx={TIP.x} cy={dropY} r={2.4} color={liqColor} />}
      {/* haengender Tropfen am Auslauf, solange nicht gelöst */}
      {!solved && dropY == null && <Circle cx={TIP.x} cy={TIP.y0} r={2} color="#5b9bf0" opacity={0.8} />}
    </Group>
  );

  const renderOverlay = (L, { busy }) => {
    const mon = L.toScreen(MONITOR);
    const u = L.scale;
    if (busy) return null;
    const near = Math.abs(pH - TARGET) < 0.3;
    return (
      <>
        {/* pH-Readout im gemalten Wand-Monitor */}
        <View pointerEvents="none" style={[styles.monitor, mon]}>
          <Text style={[styles.monLbl, { fontSize: 9 * u }]}>pH-METER</Text>
          <Text style={[styles.monVal, { fontSize: 30 * u, color: near ? '#9bd84a' : '#6fe87a' }]}>{fmt(pH, 2)}</Text>
          <Text style={[styles.monGoal, { fontSize: 9 * u }]}>ZIEL {fmt(TARGET, 2)} · pKs {fmt(PKS, 2)}</Text>
        </View>

        {/* Zwei Reagenz-Regler unter dem Monitor */}
        <Dial L={L} rect={{ x: 452, y: 140, w: 64, h: 70 }} label="c(Ac⁻)"
          value={`${fmt(cA, cA < 1 ? 2 : 0)}`} accent={room.accent}
          onUp={() => onStep(setIA, iA, +1)} onDown={() => onStep(setIA, iA, -1)} />
        <Dial L={L} rect={{ x: 528, y: 140, w: 64, h: 70 }} label="c(HAc)"
          value={`${fmt(cHA, cHA < 1 ? 2 : 0)}`} accent={room.accent}
          onUp={() => onStep(setIHA, iHA, +1)} onDown={() => onStep(setIHA, iHA, -1)} />
      </>
    );
  };

  return (
    <SceneShell
      room={room}
      bgSource={require('../../assets/scenes/scene_02_titration.png')}
      introLines={P.intro}
      hintLines={P.hint}
      solved={solved}
      solvedLines={['Puffer mit c(Ac⁻) : c(HAc) = 10 : 1', 'pH = 4,75 + log 10 = 5,75']}
      onBack={onBack}
      emergencyLight={emergencyLight}
      danger={danger}
      renderScene={renderScene}
      renderOverlay={renderOverlay}
    />
  );
}

// Reagenz-Regler: kleine Flasche mit ▲/▼ (in-world)
function Dial({ L, rect, label, value, accent, onUp, onDown }) {
  const s = L.toScreen(rect);
  const u = L.scale;
  return (
    <View style={[styles.dial, s, { borderColor: accent }]}>
      <Text style={[styles.dialLbl, { fontSize: 9 * u, color: accent }]}>{label}</Text>
      <Pressable hitSlop={6} onPress={onUp}><Text style={[styles.dialArrow, { fontSize: 12 * u }]}>▲</Text></Pressable>
      <Text style={[styles.dialVal, { fontSize: 11 * u }]}>{value}</Text>
      <Pressable hitSlop={6} onPress={onDown}><Text style={[styles.dialArrow, { fontSize: 12 * u }]}>▼</Text></Pressable>
      <Text style={[styles.dialUnit, { fontSize: 7 * u }]}>mol/L</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  monitor: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  monLbl: { color: '#2f8f3a', fontFamily: 'monospace', letterSpacing: 2 },
  monVal: { fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 1 },
  monGoal: { color: '#2f8f3a', fontFamily: 'monospace', letterSpacing: 1 },
  dial: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(13,15,23,0.78)', borderWidth: 2, borderRadius: 4,
  },
  dialLbl: { fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 1 },
  dialArrow: { color: '#e0b44c', fontFamily: 'monospace' },
  dialVal: { color: '#eafcff', fontFamily: 'monospace', fontWeight: 'bold' },
  dialUnit: { color: '#718096', fontFamily: 'monospace' },
});
