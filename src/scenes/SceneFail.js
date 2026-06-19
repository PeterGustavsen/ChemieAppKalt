import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Canvas, Image as SkImage, Group, Rect, RadialGradient,
  FilterMode, MipmapMode,
} from '@shopify/react-native-skia';

import { usePixelImage } from '../engine/usePixelImage';
import { useStageLayout } from '../engine/layout';
import { ROOMS, SCENE_W, SCENE_H } from '../config/game';

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None };
const LAMP = { x: SCENE_W / 2, y: 8 };

export default function SceneFail({ solvedIds, onRestart }) {
  const L = useStageLayout();
  const bg = usePixelImage(require('../../assets/scenes/scene_01_lab_hub.png'));
  const [glow, setGlow] = useState(0.4);

  // Fast danger pulse — system shutdown imminent
  useEffect(() => {
    let t = 0;
    const id = setInterval(() => {
      t += 32;
      const phase = (Math.sin((t / 650) * Math.PI * 2) + 1) / 2;
      setGlow(0.28 + 0.42 * phase);
    }, 32);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.root}>
      <Canvas style={{ flex: 1 }}>
        <Group transform={[{ translateX: L.offsetX }, { translateY: L.offsetY }, { scale: L.scale }]}>
          {bg && <SkImage image={bg} x={0} y={0} width={SCENE_W} height={SCENE_H} fit="fill" sampling={NEAREST} />}
          <Group>
            <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} color="rgba(0,0,0,0.82)" />
            <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} opacity={glow}>
              <RadialGradient c={{ x: LAMP.x, y: LAMP.y }} r={260} colors={['#d41808', '#00000000']} />
            </Rect>
          </Group>
        </Group>
      </Canvas>

      {/* Fail overlay — no card, text directly on scene */}
      <View style={styles.topBanner}>
        <Text style={styles.bannerIcon}>{'[!]'}</Text>
        <View>
          <Text style={styles.bannerTitle}>SICHERHEITSPROTOKOLL</Text>
          <Text style={styles.bannerSub}>PERMANENT AKTIVIERT — NOTABSCHALTUNG</Text>
        </View>
      </View>

      <View style={styles.center}>
        <Text style={styles.headline}>[!]  ZEIT ABGELAUFEN  [!]</Text>

        <Text style={styles.statusLabel}>KAMMERSTATUS</Text>
        <View style={styles.codeRow}>
          {ROOMS.map((r) => {
            const ok = solvedIds.includes(r.id);
            return (
              <View key={r.id} style={styles.codeCol}>
                <Text style={[styles.codeVal, { color: ok ? r.accent : '#2a2a3a' }]}>
                  {ok ? r.code : '----'}
                </Text>
                <Text style={[styles.codeTheme, { color: ok ? '#718096' : '#2a2a3a' }]}>
                  {r.theme}
                </Text>
              </View>
            );
          })}
        </View>

        {solvedIds.length === 0
          ? <Text style={styles.verdict}>Kein einziger Code — das Protokoll war gnadenlos.</Text>
          : <Text style={styles.verdict}>{solvedIds.length} von {ROOMS.length} Kammern geloest. Naechstes Mal schneller!</Text>
        }

        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={onRestart}
        >
          <Text style={styles.btnTxt}>▶  NOCHMAL VERSUCHEN</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070c' },
  topBanner: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(10,0,0,0.85)',
    borderBottomWidth: 2, borderColor: '#c01008',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  bannerIcon: {
    color: '#ff2010', fontFamily: 'monospace', fontWeight: 'bold',
    fontSize: 13, marginRight: 10,
  },
  bannerTitle: {
    color: '#f06b6b', fontFamily: 'monospace', fontSize: 11,
    fontWeight: 'bold', letterSpacing: 2,
  },
  bannerSub: {
    color: '#804040', fontFamily: 'monospace', fontSize: 9, letterSpacing: 1,
  },
  center: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', paddingTop: 60,
  },
  headline: {
    color: '#f06b6b', fontFamily: 'monospace', fontSize: 22,
    fontWeight: 'bold', letterSpacing: 3, textAlign: 'center', marginBottom: 24,
  },
  statusLabel: {
    color: '#718096', fontFamily: 'monospace', fontSize: 9,
    letterSpacing: 3, marginBottom: 10,
  },
  codeRow: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  codeCol: { alignItems: 'center' },
  codeVal: { fontFamily: 'monospace', fontSize: 20, fontWeight: 'bold', letterSpacing: 4 },
  codeTheme: { fontFamily: 'monospace', fontSize: 8, marginTop: 2 },
  verdict: {
    color: '#718096', fontFamily: 'monospace', fontSize: 11,
    textAlign: 'center', marginBottom: 24, lineHeight: 18,
  },
  btn: {
    borderWidth: 2, borderColor: '#f06b6b',
    paddingHorizontal: 28, paddingVertical: 12,
  },
  btnPressed: { backgroundColor: 'rgba(240,107,107,0.1)' },
  btnTxt: {
    color: '#f06b6b', fontFamily: 'monospace',
    fontSize: 13, fontWeight: 'bold', letterSpacing: 1,
  },
});
