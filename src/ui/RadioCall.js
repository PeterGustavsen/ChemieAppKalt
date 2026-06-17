import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Animated } from 'react-native';

// Molar sprite sheet: 8 frames × 72px wide × 112px tall
const FRAME_W = 72;
const FRAME_H = 112;

export default function RadioCall({ lines, onDismiss }) {
  const slide = useRef(new Animated.Value(-160)).current;
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    Animated.spring(slide, { toValue: 0, useNativeDriver: true, tension: 70, friction: 11 }).start();
  }, []);

  const dismiss = () => {
    Animated.timing(slide, { toValue: -160, duration: 200, useNativeDriver: true }).start(onDismiss);
  };

  const advance = () => {
    if (lineIdx < lines.length - 1) setLineIdx((i) => i + 1);
    else dismiss();
  };

  return (
    <Animated.View style={[styles.root, { transform: [{ translateY: slide }] }]}>
      <View style={styles.inner}>
        {/* Molar portrait — first frame of sprite sheet */}
        <View style={styles.portrait}>
          <View style={styles.spriteClip}>
            <Image
              source={require('../../assets/sprites/molar_idle.png')}
              style={styles.sprite}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.name}>Dr. Molar</Text>
        </View>

        {/* Speech bubble */}
        <Pressable style={styles.bubble} onPress={advance}>
          <View style={styles.bubbleTail} />
          <Text style={styles.caller}>📻  FUNK-EINGANG</Text>
          <Text style={styles.line}>{lines[lineIdx]}</Text>
          <Text style={styles.next}>
            {lineIdx < lines.length - 1 ? '▶ WEITER' : '▶ OK'}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const SCALE = 44 / FRAME_W; // show portrait at 44px wide

const styles = StyleSheet.create({
  root: {
    position: 'absolute', top: 0, left: 0, right: 0,
    zIndex: 150,
  },
  inner: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 10,
  },
  portrait: {
    alignItems: 'center', marginRight: 6,
  },
  spriteClip: {
    width: FRAME_W * SCALE,
    height: FRAME_H * SCALE,
    overflow: 'hidden',
  },
  sprite: {
    // Full sprite sheet width so only frame 0 (leftmost) shows inside clip
    width: FRAME_W * 8 * SCALE,
    height: FRAME_H * SCALE,
    position: 'absolute', left: 0, top: 0,
  },
  name: {
    color: '#d41808', fontFamily: 'monospace', fontSize: 7,
    letterSpacing: 1, marginTop: 2,
  },
  bubble: {
    flex: 1,
    backgroundColor: '#0d0f17',
    borderWidth: 2, borderColor: '#d41808',
    padding: 10,
    position: 'relative',
  },
  bubbleTail: {
    position: 'absolute', left: -8, top: 12,
    width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderRightWidth: 8,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
    borderRightColor: '#d41808',
  },
  caller: {
    color: '#d41808', fontFamily: 'monospace',
    fontSize: 9, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4,
  },
  line: {
    color: '#aab6c6', fontFamily: 'monospace', fontSize: 12, lineHeight: 18,
  },
  next: {
    color: '#d41808', fontFamily: 'monospace',
    fontSize: 9, fontWeight: 'bold', letterSpacing: 1,
    textAlign: 'right', marginTop: 6,
  },
});
