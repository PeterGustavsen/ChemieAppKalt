import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Group } from '@shopify/react-native-skia';
import LiveCanvas from '../engine/LiveCanvas';

import { useStageLayout } from '../engine/layout';
import { useAmbient } from '../engine/useAmbient';
import HubArtHD, { HORIZON } from '../art/HubArtHD';
import { HubWindowView, HubShutter, WIN } from '../art/HubWindow';
import MolarHD from '../art/MolarHD';
import BackdropHD from '../ui/BackdropHD';
import PixelDialog from '../ui/PixelDialog';
import { ROOMS, WIN_DIALOG, SCENE_W, SCENE_H } from '../config/game';

const MOLAR = { x: 60, y: 148, scale: 2.0 };
const SHUTTER_TOP = WIN.y - WIN.h - 8;
const SHUTTER_BOT = WIN.y - 1;

const fmtTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function SceneWin({ elapsed, onRestart }) {
  const L = useStageLayout();
  const t = useAmbient(30);

  const [dialogDone, setDialogDone] = useState(false);

  // Shutter slides back up on mount
  const [shutterY, setShutterY] = useState(SHUTTER_BOT);
  useEffect(() => {
    let y = SHUTTER_BOT;
    const id = setInterval(() => {
      y -= 6;
      if (y <= SHUTTER_TOP) { clearInterval(id); setShutterY(SHUTTER_TOP); }
      else setShutterY(y);
    }, 32);
    return () => clearInterval(id);
  }, []);

  // Molar walks in from the left
  const [molarX, setMolarX] = useState(MOLAR.x - 220);
  const [molarArrived, setMolarArrived] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setMolarX((x) => {
        const next = x + 6;
        if (next >= MOLAR.x) { clearInterval(id); setMolarArrived(true); return MOLAR.x; }
        return next;
      });
    }, 32);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.root}>
      {/* Füllt die Ränder → keine schwarzen Letterbox-Balken. */}
      <BackdropHD horizon={HORIZON} darken={0.45} />
      <LiveCanvas style={{ flex: 1 }}>
        <Group clip={{ x: L.offsetX, y: L.offsetY, width: L.stageW, height: L.stageH }}>
          <Group transform={[{ translateX: L.offsetX }, { translateY: L.offsetY }, { scale: L.scale }]}>
            {/* Befreites Labor: kein Alarm */}
            <HubArtHD t={t} />
            {/* Window — blue sky revealed as shutter rises */}
            <HubWindowView t={t} />
            <HubShutter shutterY={shutterY} />

            {/* Molar kommt zurück — läuft herein, spricht dann */}
            <MolarHD
              x={molarX} y={MOLAR.y} scale={MOLAR.scale}
              mode={molarArrived && !dialogDone ? 'speak' : 'idle'}
              walking={!molarArrived} t={t}
            />
          </Group>
        </Group>
      </LiveCanvas>

      {molarArrived && !dialogDone && (
        <PixelDialog
          speaker="Prof. Dr. Molar"
          lines={WIN_DIALOG}
          onClose={() => setDialogDone(true)}
        />
      )}

      {dialogDone && (
        <View style={styles.overlay} pointerEvents="box-none">
          <Text style={styles.headline}>AUSGANG FREI!</Text>
          <Text style={styles.timeLabel}>GELÖST IN</Text>
          <Text style={styles.time}>{fmtTime(elapsed)}</Text>

          <View style={styles.codeRow}>
            {ROOMS.map((r) => (
              <View key={r.id} style={styles.codeCol}>
                <Text style={[styles.codeVal, { color: r.accent }]}>{r.code}</Text>
                <Text style={styles.codeTheme}>{r.theme}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={onRestart}
          >
            <Text style={styles.btnTxt}>▶  NOCHMAL SPIELEN</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d0f17' },
  overlay: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    alignItems: 'center', paddingBottom: 32, paddingHorizontal: 20,
  },
  headline: {
    color: '#6fe87a', fontFamily: 'monospace', fontSize: 20,
    fontWeight: 'bold', letterSpacing: 3, textAlign: 'center', marginBottom: 8,
    textShadowColor: '#6fe87a', textShadowRadius: 8,
  },
  timeLabel: {
    color: '#718096', fontFamily: 'monospace', fontSize: 9, letterSpacing: 3,
  },
  time: {
    color: '#6fe87a', fontFamily: 'monospace', fontSize: 44,
    fontWeight: 'bold', letterSpacing: 6, marginBottom: 12,
  },
  codeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  codeCol: { alignItems: 'center' },
  codeVal: { fontFamily: 'monospace', fontSize: 20, fontWeight: 'bold', letterSpacing: 4 },
  codeTheme: { color: '#718096', fontFamily: 'monospace', fontSize: 8, marginTop: 2 },
  btn: {
    borderWidth: 2, borderColor: '#6fe87a', borderRadius: 8,
    paddingHorizontal: 28, paddingVertical: 12, backgroundColor: 'rgba(10,16,24,0.55)',
  },
  btnPressed: { backgroundColor: 'rgba(111,232,122,0.1)' },
  btnTxt: { color: '#6fe87a', fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
});
