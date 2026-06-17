import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Canvas, Image as SkImage, Group, Rect, RadialGradient,
  FilterMode, MipmapMode,
} from '@shopify/react-native-skia';

import AnimatedSprite from '../engine/AnimatedSprite';
import { usePixelImage } from '../engine/usePixelImage';
import { useStageLayout } from '../engine/layout';
import PixelDialog from '../ui/PixelDialog';
import { ROOMS, WIN_DIALOG, SCENE_W, SCENE_H } from '../config/game';

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None };
const MOLAR = { x: 70, y: 188, frameW: 72, frameH: 112, scale: 1.45, frames: 8 };
const LAMP = { x: SCENE_W / 2, y: 8 };

const fmtTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function SceneWin({ elapsed, onRestart }) {
  const L = useStageLayout();
  const bg = usePixelImage(require('../../assets/scenes/scene_01_lab_hub.png'));
  const molar = usePixelImage(require('../../assets/sprites/molar_idle.png'));

  const [dialogDone, setDialogDone] = useState(false);
  const [glow, setGlow] = useState(0.25);

  // Molar walks in from the left on mount, dialog starts after he arrives
  const [molarX, setMolarX] = useState(MOLAR.x - 260); // starts off-screen left
  const [molarArrived, setMolarArrived] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setMolarX((x) => {
        const next = x + 6;
        if (next >= MOLAR.x) {
          clearInterval(id);
          setMolarArrived(true);
          return MOLAR.x;
        }
        return next;
      });
    }, 32);
    return () => clearInterval(id);
  }, []);

  // Gentle red glow — power still on emergency
  useEffect(() => {
    let t = 0;
    const id = setInterval(() => {
      t += 32;
      const phase = (Math.sin((t / 2200) * Math.PI * 2) + 1) / 2;
      setGlow(0.15 + 0.28 * phase);
    }, 32);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.root}>
      <Canvas style={{ flex: 1 }}>
        <Group transform={[{ translateX: L.offsetX }, { translateY: L.offsetY }, { scale: L.scale }]}>
          {bg && <SkImage image={bg} x={0} y={0} width={SCENE_W} height={SCENE_H} fit="fill" sampling={NEAREST} />}

          {/* Emergency light — still on after alarm */}
          <Group>
            <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} color="rgba(0,0,0,0.72)" />
            <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} opacity={glow}>
              <RadialGradient c={{ x: LAMP.x, y: LAMP.y }} r={280} colors={['#d41808', '#00000000']} />
            </Rect>
          </Group>

          {/* Molar walks back in from the left */}
          <AnimatedSprite
            image={molar} frameCount={MOLAR.frames} frameW={MOLAR.frameW} frameH={MOLAR.frameH}
            x={molarX} y={MOLAR.y} scale={MOLAR.scale} fps={7}
          />
        </Group>
      </Canvas>

      {/* Molar's confession dialog — only starts after he walks in */}
      {molarArrived && !dialogDone && (
        <PixelDialog
          speaker="Prof. Dr. Molar"
          lines={WIN_DIALOG}
          onClose={() => setDialogDone(true)}
        />
      )}

      {/* After dialog: win summary — no card, just overlaid text */}
      {dialogDone && (
        <View style={styles.overlay} pointerEvents="box-none">
          <Text style={styles.headline}>★  AUSGANG FREI!  ★</Text>
          <Text style={styles.timeLabel}>GELOEST IN</Text>
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
  root: { flex: 1, backgroundColor: '#05070c' },
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
  codeRow: {
    flexDirection: 'row', gap: 10, marginBottom: 20,
  },
  codeCol: { alignItems: 'center' },
  codeVal: {
    fontFamily: 'monospace', fontSize: 20, fontWeight: 'bold', letterSpacing: 4,
  },
  codeTheme: {
    color: '#718096', fontFamily: 'monospace', fontSize: 8, marginTop: 2,
  },
  btn: {
    borderWidth: 2, borderColor: '#6fe87a',
    paddingHorizontal: 28, paddingVertical: 12,
  },
  btnPressed: { backgroundColor: 'rgba(111,232,122,0.1)' },
  btnTxt: {
    color: '#6fe87a', fontFamily: 'monospace',
    fontSize: 13, fontWeight: 'bold', letterSpacing: 1,
  },
});
