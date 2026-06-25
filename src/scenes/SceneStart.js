import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import {
  Canvas, Image as SkImage, Group, Rect, Paint,
  FilterMode, MipmapMode, Blur,
} from '@shopify/react-native-skia';

import { usePixelImage } from '../engine/usePixelImage';
import { useStageLayout } from '../engine/layout';
import SceneBackdrop from '../ui/SceneBackdrop';
import { SCENE_W, SCENE_H } from '../config/game';

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None };
const BG = require('../../assets/scenes/scene_01_lab_hub.png');

export default function SceneStart({ onStart }) {
  const L = useStageLayout();
  const bg = usePixelImage(BG);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.delay(300),
      Animated.timing(btnAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      {/* Füllt die Ränder → keine schwarzen Letterbox-Balken. */}
      <SceneBackdrop source={BG} darken={0.55} />
      {/* Blurred lab background */}
      <Canvas style={{ flex: 1 }}>
        <Group transform={[
          { translateX: L.offsetX }, { translateY: L.offsetY }, { scale: L.scale }
        ]}>
          {bg && (
            <Group layer={<Paint><Blur blur={4} /></Paint>}>
              <SkImage image={bg} x={0} y={0} width={SCENE_W} height={SCENE_H} fit="fill" sampling={NEAREST} />
            </Group>
          )}
          {/* Dark vignette overlay */}
          <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} color="rgba(0,0,0,0.55)" />
        </Group>
      </Canvas>

      {/* Title + button overlay */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Text style={styles.title}>CHEMIE</Text>
        <Text style={styles.subtitle}>ESCAPE ROOM</Text>
        <Text style={styles.tagline}>Prof. Dr. Molars Labor — München</Text>

        <Animated.View style={{ opacity: btnAnim, transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={onStart}
          >
            <Text style={styles.btnTxt}>▶  STARTEN</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070c' },
  overlay: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  title: {
    color: '#6fd3dd', fontFamily: 'monospace', fontSize: 52,
    fontWeight: 'bold', letterSpacing: 12,
    textShadowColor: '#6fd3dd', textShadowRadius: 18,
  },
  subtitle: {
    color: '#6fd3dd', fontFamily: 'monospace', fontSize: 20,
    fontWeight: 'bold', letterSpacing: 8, marginTop: -8,
    textShadowColor: '#6fd3dd', textShadowRadius: 10,
  },
  tagline: {
    color: '#5a7080', fontFamily: 'monospace', fontSize: 11,
    letterSpacing: 2, marginTop: 4, marginBottom: 28,
  },
  btn: {
    borderWidth: 2, borderColor: '#6fd3dd',
    paddingHorizontal: 40, paddingVertical: 14,
    marginTop: 8,
  },
  btnPressed: { backgroundColor: 'rgba(111,211,221,0.12)' },
  btnTxt: {
    color: '#6fd3dd', fontFamily: 'monospace',
    fontSize: 15, fontWeight: 'bold', letterSpacing: 2,
  },
});
