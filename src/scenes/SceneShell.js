import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Canvas, Image as SkImage, Group, Rect, RadialGradient,
  FilterMode, MipmapMode,
} from '@shopify/react-native-skia';

import { useStageLayout } from '../engine/layout';
import { usePixelImage } from '../engine/usePixelImage';
import PixelDialog from '../ui/PixelDialog';
import { SCENE_W, SCENE_H } from '../config/game';

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None };
const LAMP = { x: SCENE_W / 2, y: 8 };

export default function SceneShell({
  room, bgSource, introLines, hintLines, solved, solvedLines,
  onBack, renderScene, renderOverlay, emergencyLight, danger,
}) {
  const L = useStageLayout();
  const bg = usePixelImage(bgSource);
  const [dialog, setDialog] = useState(introLines ? { lines: introLines } : null);
  const [hintOpen, setHintOpen] = useState(false);

  const busy = !!dialog || hintOpen || solved;

  const [glow, setGlow] = useState(0.25);
  useEffect(() => {
    if (!emergencyLight) { setGlow(0); return; }
    let t = 0;
    const period = danger ? 700 : 2000;
    const lo = danger ? 0.30 : 0.18;
    const hi = danger ? 0.65 : 0.40;
    const id = setInterval(() => {
      t += 32;
      const phase = (Math.sin((t / period) * Math.PI * 2) + 1) / 2;
      setGlow(lo + (hi - lo) * phase);
    }, 32);
    return () => clearInterval(id);
  }, [emergencyLight, danger]);

  return (
    <View style={styles.root}>
      <Canvas style={{ flex: 1 }}>
        <Group transform={[{ translateX: L.offsetX }, { translateY: L.offsetY }, { scale: L.scale }]}>
          {bg && <SkImage image={bg} x={0} y={0} width={SCENE_W} height={SCENE_H} fit="fill" sampling={NEAREST} />}
          {renderScene && renderScene(L)}

          {emergencyLight && (
            <Group>
              <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} color="rgba(0,0,0,0.78)" />
              <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} opacity={glow}>
                <RadialGradient
                  c={{ x: LAMP.x, y: LAMP.y }}
                  r={260}
                  colors={['#d41808', '#00000000']}
                />
              </Rect>
            </Group>
          )}
        </Group>
      </Canvas>

      {renderOverlay && renderOverlay(L, { busy })}

      <View style={styles.topbar} pointerEvents="box-none">
        <Pressable style={({ pressed }) => [styles.tbBtn, pressed && styles.tbPressed]} onPress={onBack}>
          <Text style={styles.tbTxt}>◀ TERMINAL</Text>
        </Pressable>
        <Text style={[styles.title, { color: room.accent }]}>{room.title.toUpperCase()}</Text>
        <Pressable style={({ pressed }) => [styles.tbBtn, pressed && styles.tbPressed]} onPress={() => setHintOpen(true)}>
          <Text style={styles.tbTxt}>HINWEIS ?</Text>
        </Pressable>
      </View>

      {dialog && (
        <PixelDialog speaker="LAB-NOTIZ" lines={dialog.lines} onClose={() => setDialog(null)} />
      )}
      {hintOpen && (
        <PixelDialog speaker="Hinweis" lines={hintLines} onClose={() => setHintOpen(false)} />
      )}

      {solved && (
        <View style={styles.solvedWrap}>
          <View style={[styles.solvedBox, { borderColor: room.accent }]}>
            <Text style={styles.solvedKick}>RAETSEL GELOEST</Text>
            {(solvedLines || []).map((l, i) => (
              <Text key={i} style={styles.solvedTxt}>{l}</Text>
            ))}
            <Text style={styles.codeLabel}>CODE</Text>
            <Text style={[styles.code, { color: room.accent }]}>{room.code}</Text>
            <Pressable style={({ pressed }) => [styles.goBtn, { borderColor: room.accent }, pressed && styles.tbPressed]} onPress={onBack}>
              <Text style={[styles.goTxt, { color: room.accent }]}>◀ CODE AM TERMINAL EINGEBEN</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d0f17' },
  topbar: {
    position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', padding: 10,
  },
  tbBtn: { borderWidth: 2, borderColor: '#6fd3dd', backgroundColor: 'rgba(13,15,23,0.85)', paddingHorizontal: 10, paddingVertical: 6 },
  tbPressed: { backgroundColor: 'rgba(111,211,221,0.18)' },
  tbTxt: { color: '#6fd3dd', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold' },
  title: { fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, textShadowColor: '#000', textShadowRadius: 4 },
  solvedWrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(5,7,12,0.72)' },
  solvedBox: { backgroundColor: '#0d0f17', borderWidth: 4, padding: 22, alignItems: 'center', maxWidth: 460 },
  solvedKick: { color: '#6fe87a', fontFamily: 'monospace', fontSize: 12, letterSpacing: 3, fontWeight: 'bold' },
  solvedTxt: { color: '#aab6c6', fontFamily: 'monospace', fontSize: 12, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  codeLabel: { color: '#718096', fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, marginTop: 16 },
  code: { fontFamily: 'monospace', fontSize: 44, fontWeight: 'bold', letterSpacing: 8, marginTop: 2 },
  goBtn: { marginTop: 18, borderWidth: 2, paddingHorizontal: 16, paddingVertical: 10 },
  goTxt: { fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold' },
});
