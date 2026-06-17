import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Canvas, Image as SkImage, Group, Rect, RadialGradient, LinearGradient,
  FilterMode, MipmapMode,
} from '@shopify/react-native-skia';

import AnimatedSprite from '../engine/AnimatedSprite';
import { usePixelImage } from '../engine/usePixelImage';
import { useStageLayout } from '../engine/layout';
import PixelDialog from '../ui/PixelDialog';
import { ROOMS, WIN_DIALOG, SCENE_W, SCENE_H } from '../config/game';

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None };
const MOLAR = { x: 60, y: 148, frameW: 72, frameH: 112, scale: 2.0, frames: 8 };

const WIN = { x: 205, y: 14, w: 230, h: 94 };
const SHUTTER_TOP = WIN.y - WIN.h - 8;
const SHUTTER_BOT = WIN.y - 1;

const fmtTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function SceneWin({ elapsed, onRestart }) {
  const L = useStageLayout();
  const bg = usePixelImage(require('../../assets/scenes/scene_01_lab_hub.png'));
  const molar = usePixelImage(require('../../assets/sprites/molar_idle.png'));

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
      <Canvas style={{ flex: 1 }}>
        <Group clip={{ x: L.offsetX, y: L.offsetY, width: L.stageW, height: L.stageH }}
          transform={[{ translateX: L.offsetX }, { translateY: L.offsetY }, { scale: L.scale }]}>
          {bg && <SkImage image={bg} x={0} y={0} width={SCENE_W} height={SCENE_H} fit="fill" sampling={NEAREST} />}

          {/* Window — blue sky revealed as shutter rises */}
          <Group clip={{ x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h }}>
            <Rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h}>
              <LinearGradient start={{ x: WIN.x, y: WIN.y }} end={{ x: WIN.x, y: WIN.y + WIN.h }}
                colors={['#b8e0f7', '#6aaed6']} />
            </Rect>
            <Rect x={WIN.x + 8}   y={WIN.y + 10} width={52} height={14} color="rgba(255,255,255,0.82)" />
            <Rect x={WIN.x + 18}  y={WIN.y + 5}  width={38} height={12} color="rgba(255,255,255,0.65)" />
            <Rect x={WIN.x + 130} y={WIN.y + 14} width={60} height={16} color="rgba(255,255,255,0.78)" />
            <Rect x={WIN.x + 142} y={WIN.y + 8}  width={42} height={12} color="rgba(255,255,255,0.60)" />
            <Rect x={WIN.x + 10}  y={WIN.y + 58} width={28} height={36} color="#3a4d58" />
            <Rect x={WIN.x + 20}  y={WIN.y + 42} width={8}  height={16} color="#3a4d58" />
            <Rect x={WIN.x + 45}  y={WIN.y + 48} width={38} height={46} color="#2d3f4a" />
            <Rect x={WIN.x + 52}  y={WIN.y + 32} width={7}  height={17} color="#2d3f4a" />
            <Rect x={WIN.x + 67}  y={WIN.y + 28} width={7}  height={21} color="#2d3f4a" />
            <Rect x={WIN.x + 92}  y={WIN.y + 52} width={30} height={42} color="#38505c" />
            <Rect x={WIN.x + 132} y={WIN.y + 62} width={60} height={32} color="#324550" />
            <Rect x={WIN.x + 148} y={WIN.y + 46} width={9}  height={17} color="#324550" />
            <Rect x={WIN.x + 170} y={WIN.y + 40} width={9}  height={23} color="#324550" />
            <Rect x={WIN.x} y={WIN.y + 88} width={WIN.w} height={6} color="#26363f" />
          </Group>
          {/* Window frame */}
          <Rect x={WIN.x - 6} y={WIN.y - 6} width={WIN.w + 12} height={WIN.h + 12}
            color="#3e4d58" style="stroke" strokeWidth={12} />
          <Rect x={WIN.x - 1} y={WIN.y - 1} width={WIN.w + 2} height={WIN.h + 2}
            color="#5a6e7c" style="stroke" strokeWidth={2} />
          <Rect x={WIN.x + WIN.w / 3 - 2} y={WIN.y} width={4} height={WIN.h} color="#3e4d58" />
          <Rect x={WIN.x + WIN.w * 2 / 3 - 2} y={WIN.y} width={4} height={WIN.h} color="#3e4d58" />
          <Rect x={WIN.x} y={WIN.y + WIN.h / 2 - 2} width={WIN.w} height={4} color="#3e4d58" />
          {[[-5,-5],[WIN.w-1,-5],[-5,WIN.h-1],[WIN.w-1,WIN.h-1]].map(([dx,dy],i) => (
            <Rect key={i} x={WIN.x+dx} y={WIN.y+dy} width={6} height={6} color="#6a8090" />
          ))}

          {/* Shutter slides back up */}
          <Group clip={{ x: WIN.x - 6, y: WIN.y - 6, width: WIN.w + 12, height: WIN.h + 12 }}>
            <Rect x={WIN.x - 6} y={shutterY} width={WIN.w + 12} height={WIN.h + 14} color="#3e3e3e" />
            {[...Array(10)].map((_, i) => (
              <Rect key={i} x={WIN.x - 6} y={shutterY + i * 11} width={WIN.w + 12} height={2} color="#2e2e2e" />
            ))}
            <Rect x={WIN.x - 6} y={shutterY + WIN.h + 10} width={WIN.w + 12} height={4} color="#606060" />
          </Group>

          {/* Molar walks back in */}
          <AnimatedSprite
            image={molar} frameCount={MOLAR.frames} frameW={MOLAR.frameW} frameH={MOLAR.frameH}
            x={molarX} y={MOLAR.y} scale={MOLAR.scale} fps={7}
          />
        </Group>
      </Canvas>

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
  btn: { borderWidth: 2, borderColor: '#6fe87a', paddingHorizontal: 28, paddingVertical: 12 },
  btnPressed: { backgroundColor: 'rgba(111,232,122,0.1)' },
  btnTxt: { color: '#6fe87a', fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
});
