import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';

export default function RadioCall({ lines, onDismiss }) {
  const slide = useRef(new Animated.Value(-180)).current;
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    Animated.spring(slide, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }).start();
  }, []);

  const dismiss = () => {
    Animated.timing(slide, { toValue: -180, duration: 200, useNativeDriver: true }).start(onDismiss);
  };

  const advance = () => {
    if (lineIdx < lines.length - 1) {
      setLineIdx((i) => i + 1);
    } else {
      dismiss();
    }
  };

  return (
    <Animated.View style={[styles.root, { transform: [{ translateY: slide }] }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>📻</Text>
        <Text style={styles.caller}>FUNK — PROF. DR. MOLAR</Text>
        <Pressable onPress={dismiss} style={styles.closeBtn}>
          <Text style={styles.closeTxt}>✕</Text>
        </Pressable>
      </View>
      <Text style={styles.line}>{lines[lineIdx]}</Text>
      <Pressable onPress={advance} style={styles.nextBtn}>
        <Text style={styles.nextTxt}>
          {lineIdx < lines.length - 1 ? '▶ WEITER' : '▶ OK'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: '#0d0f17',
    borderBottomWidth: 3, borderColor: '#d41808',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 6,
  },
  icon: { fontSize: 14, marginRight: 6 },
  caller: {
    flex: 1, color: '#d41808', fontFamily: 'monospace',
    fontSize: 10, fontWeight: 'bold', letterSpacing: 2,
  },
  closeBtn: { padding: 4 },
  closeTxt: { color: '#718096', fontFamily: 'monospace', fontSize: 12 },
  line: {
    color: '#aab6c6', fontFamily: 'monospace', fontSize: 12,
    lineHeight: 18, marginBottom: 8,
  },
  nextBtn: { alignSelf: 'flex-end' },
  nextTxt: {
    color: '#d41808', fontFamily: 'monospace', fontSize: 10,
    fontWeight: 'bold', letterSpacing: 1,
  },
});
