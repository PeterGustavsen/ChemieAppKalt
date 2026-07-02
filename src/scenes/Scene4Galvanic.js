/*
 * SZENE 4 — ROSTEN VON EISEN / Wassertropfen-Korrosion (in-world).
 * NOTE: Legacy-Dateiname Scene4Galvanic.js; Inhalt ist jetzt der Rost-Mechanismus.
 *
 * Mechanik: für Anode & Kathode je Spezies + Elektronenzahl per Dial einstellen;
 * stimmt eine Halbreaktion, wird ihr Slot grün. Skia: Wassertropfen-Dom,
 * e⁻-Pfeile Anode→Kathode, Fe²⁺/OH⁻, Rost am Tropfenrand bei Lösung.
 * Anode: Fe→Fe²⁺ (2 e⁻) · Kathode: O₂+2H₂O→4OH⁻ (4 e⁻).
 * Liest PUZZLES[4].anode/.cathode (Fallback lokal).
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Group, Path, Circle } from '@shopify/react-native-skia';

import SceneShell from './SceneShell';
import { useSpriteFrame } from '../engine/useSprite';
import { poly } from '../engine/skiaUtil';
import { PUZZLES } from '../config/game';
import { FX } from '../fx/feedback';

const P = PUZZLES[4] || {};
const A_OPTS = (P.anode && P.anode.options) || ['Fe → Fe²⁺', 'Fe²⁺ → Fe³⁺', '2 H⁺ → H₂'];
const C_OPTS = (P.cathode && P.cathode.options) || ['O₂+2H₂O → 4OH⁻', '2 H⁺ → H₂', 'Fe³⁺ → Fe²⁺'];
const A_E = (P.anode && P.anode.e) || 2;
const C_E = (P.cathode && P.cathode.e) || 4;

const DROP = { cx: 320, base: 250, rx: 150, ry: 120 };
const A_MARK = { x: 216, y: 250 };
const C_MARK = { x: 345, y: 250 };

export default function Scene4Galvanic({ room, onBack, onReveal, initiallySolved, emergencyLight, danger }) {
  const [aSpec, setASpec] = useState(initiallySolved ? 0 : 1);
  const [aE, setAE] = useState(initiallySolved ? A_E : 1);
  const [cSpec, setCSpec] = useState(initiallySolved ? 0 : 1);
  const [cE, setCE] = useState(initiallySolved ? C_E : 1);

  const aOK = aSpec === 0 && aE === A_E;
  const cOK = cSpec === 0 && cE === C_E;
  const solved = aOK && cOK;

  const flow = useSpriteFrame(24, 14);

  useEffect(() => { if (solved) { FX.success(); onReveal && onReveal(room.id); } }, [solved]);

  const cycle = (set, v, len) => { FX.click(); set((v + 1) % len); };
  const bumpE = (set, v) => { FX.click(); set((v % 6) + 1); };

  const dome = () => {
    const pts = [];
    const N = 24;
    for (let i = 0; i <= N; i++) {
      const th = (Math.PI * i) / N;
      pts.push([DROP.cx + DROP.rx * Math.cos(th), DROP.base - DROP.ry * Math.sin(th)]);
    }
    return poly(pts);
  };

  const renderScene = () => {
    const live = aOK || cOK;
    // e⁻ entlang der Oberfläche Anode -> Kathode
    const eDots = live ? [0, 1, 2].map((k) => {
      const t = ((flow / 24) + k / 3) % 1;
      return <Circle key={k} cx={A_MARK.x + (C_MARK.x - A_MARK.x) * t} cy={251} r={1.8} color="#aef5bd" />;
    }) : null;
    return (
      <Group>
        {/* Wassertropfen-Dom */}
        <Path path={dome()} color="#5b9bf0" opacity={0.26} />
        <Path path={dome()} color="#bfe0ff" style="stroke" strokeWidth={1.5} opacity={0.5} />
        {/* Fe²⁺ steigt an der Anode */}
        {aOK && [0, 1].map((k) => {
          const t = ((flow / 24) + k / 2) % 1;
          return <Circle key={'fe' + k} cx={A_MARK.x + (k - 0.5) * 8} cy={248 - t * 70} r={2.4} color="#e0a060" opacity={0.85 * (1 - t)} />;
        })}
        {/* OH⁻ an der Kathode */}
        {cOK && [0, 1].map((k) => (
          <Circle key={'oh' + k} cx={C_MARK.x + (k - 0.5) * 10} cy={236 - k * 8} r={2.2} color="#7fd0ff" opacity={0.8} />
        ))}
        {eDots}
        {/* Rost am Tropfenrand bei Lösung */}
        {solved && [-1, 1].map((s) => (
          <Circle key={s} cx={DROP.cx + s * (DROP.rx - 8)} cy={DROP.base - 6} r={10} color="#9a5a2a" opacity={0.6} />
        ))}
      </Group>
    );
  };

  const renderOverlay = (L, { busy }) => {
    if (busy) return null;
    const ro = L.toScreen({ x: 206, y: 62, w: 228, h: 48 });
    const aS = L.toScreen({ x: 176, y: 200, w: 80, h: 46 });
    const cS = L.toScreen({ x: 300, y: 160, w: 90, h: 46 });
    const u = L.scale;
    return (
      <>
        {/* Gesamtgleichung-Readout */}
        <View pointerEvents="none" style={[styles.ro, ro]}>
          <Text style={[styles.roHdr, { fontSize: 8 * u }]}>GESAMTREAKTION</Text>
          <Text style={[styles.roTxt, { fontSize: 10 * u, color: solved ? '#6fe87a' : '#5a7a6a' }]} numberOfLines={2}>
            {solved ? '2 Fe + O₂ + 2 H₂O → 2 Fe(OH)₂' : `${aOK ? 1 : 0}+${cOK ? 1 : 0}/2 Halbgleichungen`}
          </Text>
        </View>

        {/* Slot-Anzeigen (grün wenn korrekt) */}
        <SlotView rect={aS} u={u} hdr="ANODE (Ox.)" spec={A_OPTS[aSpec]} e={aE} ok={aOK} />
        <SlotView rect={cS} u={u} hdr="KATHODE (Red.)" spec={C_OPTS[cSpec]} e={cE} ok={cOK} />

        {/* Steuerleiste: Dials */}
        <View style={styles.band}>
          <DialGroup u={u} accent={room.accent} title="ANODE"
            onSpec={() => cycle(setASpec, aSpec, A_OPTS.length)} spec={A_OPTS[aSpec]}
            onE={() => bumpE(setAE, aE)} e={aE} />
          <DialGroup u={u} accent={room.accent} title="KATHODE"
            onSpec={() => cycle(setCSpec, cSpec, C_OPTS.length)} spec={C_OPTS[cSpec]}
            onE={() => bumpE(setCE, cE)} e={cE} />
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
      solvedLines={['Anode: Fe → Fe²⁺ + 2 e⁻', 'Kathode: O₂ + 2 H₂O + 4 e⁻ → 4 OH⁻']}
      onBack={onBack}
      emergencyLight={emergencyLight}
      danger={danger}
      renderScene={renderScene}
      renderOverlay={renderOverlay}
    />
  );
}

function SlotView({ rect, u, hdr, spec, e, ok }) {
  return (
    <View pointerEvents="none" style={[styles.slot, rect, ok && styles.slotOk]}>
      <Text style={[styles.slotHdr, { fontSize: 7 * u, color: ok ? '#6fe87a' : '#8a96a6' }]}>{hdr} {ok ? '✓' : ''}</Text>
      <Text style={[styles.slotSpec, { fontSize: 8.5 * u }]} numberOfLines={1}>{spec}</Text>
      <Text style={[styles.slotE, { fontSize: 7.5 * u }]}>{e} e⁻</Text>
    </View>
  );
}

function DialGroup({ u, accent, title, onSpec, spec, onE, e }) {
  return (
    <View style={styles.dg}>
      <Text style={[styles.dgTitle, { fontSize: 8 * u, color: accent }]}>{title}</Text>
      <Pressable onPress={onSpec} style={styles.dgBtn}><Text style={[styles.dgSpec, { fontSize: 9 * u }]} numberOfLines={1}>{spec}</Text></Pressable>
      <Pressable onPress={onE} style={styles.dgBtn}><Text style={[styles.dgE, { fontSize: 9 * u }]}>e⁻: {e} ▸</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  ro: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  roHdr: { color: '#2f8f6a', fontFamily: 'monospace', letterSpacing: 2 },
  roTxt: { fontFamily: 'monospace', fontWeight: 'bold', marginTop: 3, textAlign: 'center' },
  slot: { position: 'absolute', justifyContent: 'center', paddingHorizontal: 5, borderWidth: 1, borderColor: 'transparent' },
  slotOk: { borderColor: '#6fe87a' },
  slotHdr: { fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 1 },
  slotSpec: { color: '#eafcff', fontFamily: 'monospace', fontWeight: 'bold', marginTop: 1 },
  slotE: { color: '#aab6c6', fontFamily: 'monospace', marginTop: 1 },
  band: { position: 'absolute', left: 0, right: 0, bottom: 10, flexDirection: 'row', justifyContent: 'center', gap: 18 },
  dg: { alignItems: 'center' },
  dgTitle: { fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 1, marginBottom: 2 },
  dgBtn: { backgroundColor: 'rgba(13,15,23,0.82)', borderWidth: 1, borderColor: '#33405a', borderRadius: 3, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2, minWidth: 96, alignItems: 'center' },
  dgSpec: { color: '#eafcff', fontFamily: 'monospace', fontWeight: 'bold' },
  dgE: { color: '#e0b44c', fontFamily: 'monospace', fontWeight: 'bold' },
});
