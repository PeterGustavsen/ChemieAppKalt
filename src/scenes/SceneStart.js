import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Group, Rect, Paint, Blur } from '@shopify/react-native-skia';
import LiveCanvas from '../engine/LiveCanvas';

import { useStageLayout } from '../engine/layout';
import { useAmbient } from '../engine/useAmbient';
import HubArtHD, { HORIZON } from '../art/HubArtHD';
import { HubWindowView } from '../art/HubWindow';
import BackdropHD from '../ui/BackdropHD';
import { SCENE_W, SCENE_H } from '../config/game';

export default function SceneStart({ onStart }) {
  const L = useStageLayout();
  const t = useAmbient(24);

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
      <BackdropHD horizon={HORIZON} darken={0.6} />
      {/* Weichgezeichnetes, lebendiges HD-Labor als Titel-Hintergrund */}
      <LiveCanvas style={{ flex: 1 }}>
        <Group transform={[
          { translateX: L.offsetX }, { translateY: L.offsetY }, { scale: L.scale }
        ]}>
          <Group layer={<Paint><Blur blur={3.5} /></Paint>}>
            <HubArtHD t={t} />
            <HubWindowView t={t} />
          </Group>
          {/* Dark vignette overlay */}
          <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} color="rgba(0,0,0,0.55)" />
        </Group>
      </LiveCanvas>

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
    color: '#8fa6b4', fontFamily: 'monospace', fontSize: 11,
    letterSpacing: 2, marginTop: 4, marginBottom: 28,
  },
  btn: {
    borderWidth: 2, borderColor: '#6fd3dd', borderRadius: 8,
    paddingHorizontal: 40, paddingVertical: 14,
    marginTop: 8, backgroundColor: 'rgba(10,16,24,0.55)',
    shadowColor: '#6fd3dd', shadowOpacity: 0.35, shadowRadius: 18,
  },
  btnPressed: { backgroundColor: 'rgba(111,211,221,0.12)' },
  btnTxt: {
    color: '#6fd3dd', fontFamily: 'monospace',
    fontSize: 15, fontWeight: 'bold', letterSpacing: 2,
  },
});
