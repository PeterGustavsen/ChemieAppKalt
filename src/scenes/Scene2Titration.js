/*
 * SZENE 2 — Titration. Interaktion: Titrant zugeben (Hahn antippen oder Buttons),
 * Kolbenfarbe schlaegt um. Aequivalenzpunkt bei 23,0 mL -> Phenolphthalein bleibt
 * rosa -> Code 23. Ueberschritten -> tiefes Magenta -> zuruecksetzen.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Group, Path, Circle } from '@shopify/react-native-skia';

import SceneShell from './SceneShell';
import PixelButton from '../ui/PixelButton';
import { poly } from '../engine/skiaUtil';
import { PUZZLES } from '../config/game';

const P = PUZZLES[2];
const E = P.equivalence;                 // 23.0
const FLASK = { nl: 197, nr: 213, bl: 177, br: 233, top: 206, bot: 248 };
const DISPLAY = { x: 440, y: 70, w: 160, h: 64 };
const STOPCOCK = { x: 184, y: 168, w: 42, h: 24 };

// Fluessigkeits-Trapez im Kolben (Oberflaeche bei y=224)
const SY = 224;
const lx = (y) => FLASK.nl + (FLASK.bl - FLASK.nl) * (y - FLASK.top) / (FLASK.bot - FLASK.top);
const rx = (y) => FLASK.nr + (FLASK.br - FLASK.nr) * (y - FLASK.top) / (FLASK.bot - FLASK.top);

function colorFor(v) {
  if (v >= E - 0.001 && v <= E + 0.25) return { c: '#e36fb0', o: 1, s: 'equiv' };
  if (v > E + 0.25) return { c: '#a8327f', o: 1, s: 'over' };
  if (v >= E - 1.0) return { c: '#edb9d6', o: 0.85, s: 'near' };
  return { c: '#a9dde4', o: 0.32, s: 'clear' };
}

export default function Scene2Titration({ room, onBack, onReveal, initiallySolved, emergencyLight, danger }) {
  const [v, setV] = useState(initiallySolved ? E : 0);
  const st = colorFor(v);
  const solved = st.s === 'equiv';
  const LIQUID = useMemo(() => poly([[lx(SY), SY], [rx(SY), SY], [FLASK.br, FLASK.bot], [FLASK.bl, FLASK.bot]]), []);

  useEffect(() => { if (solved) onReveal && onReveal(room.id); }, [solved]);

  const add = (amt) => setV((x) => Math.min(40, Math.round((x + amt) * 10) / 10));
  const reset = () => setV(0);

  const renderScene = () => (
    <Group>
      <Path path={LIQUID} color={st.c} opacity={st.o} />
      {/* haengender Tropfen am Hahn-Auslauf */}
      {!solved && <Circle cx={205} cy={200} r={2.4} color="#5b9bf0" />}
    </Group>
  );

  const renderOverlay = (L, { busy }) => {
    const disp = L.toScreen(DISPLAY);
    const sc = L.toScreen(STOPCOCK);
    return (
      <>
        {/* Volumen-Display */}
        <View pointerEvents="none" style={[styles.disp, disp]}>
          <Text style={styles.dispLbl}>ZUGABE NaOH</Text>
          <Text style={styles.dispVal}>{v.toFixed(1)}</Text>
          <Text style={styles.dispUnit}>mL · 0,1 M</Text>
        </View>

        {!busy && (
          <>
            {/* Hahn antippen = 1 Tropfen */}
            <Pressable style={[styles.hotspot, sc]} onPress={() => add(P.fineStep)} />
            {/* Steuerleiste */}
            <View style={styles.controls}>
              <PixelButton label={`TROPFEN +${P.fineStep}`} accent="#5b9bf0" onPress={() => add(P.fineStep)} />
              <PixelButton label={`SCHWALL +${P.coarseStep}`} accent="#5b9bf0" onPress={() => add(P.coarseStep)} />
              <PixelButton label="ZURUECKSETZEN" accent="#f0b23a" onPress={reset} />
            </View>
            {st.s === 'over' && (
              <Text style={styles.warn}>Umschlagpunkt ueberschritten — zuruecksetzen!</Text>
            )}
          </>
        )}
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
      solvedLines={['Aequivalenzpunkt bei 23,0 mL.', 'Phenolphthalein bleibt bestaendig rosa.']}
      onBack={onBack}
      emergencyLight={emergencyLight}
      danger={danger}
      renderScene={renderScene}
      renderOverlay={renderOverlay}
    />
  );
}

const styles = StyleSheet.create({
  disp: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  dispLbl: { color: '#2f8f3a', fontFamily: 'monospace', fontSize: 9, letterSpacing: 1 },
  dispVal: { color: '#6fe87a', fontFamily: 'monospace', fontSize: 30, fontWeight: 'bold' },
  dispUnit: { color: '#2f8f3a', fontFamily: 'monospace', fontSize: 9 },
  hotspot: { position: 'absolute' },
  controls: {
    position: 'absolute', bottom: 18, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 10, flexWrap: 'wrap',
  },
  warn: { position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', color: '#f06b6b', fontFamily: 'monospace', fontSize: 12 },
});
