import React, { useEffect, useRef, useState } from 'react';
import { Text, Image, Pressable, StyleSheet, Animated } from 'react-native';

const FRAME_W = 72;
const FRAME_H = 112;
const AVATAR = 52;

export default function RadioCall({ lines, onDismiss }) {
  const slide = useRef(new Animated.Value(-160)).current;
  const [lineIdx, setLineIdx] = useState(0);
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  const iRef = useRef(0);
  const timer = useRef(null);

  useEffect(() => {
    Animated.spring(slide, { toValue: 0, useNativeDriver: true, tension: 70, friction: 11 }).start();
  }, []);

  const text = lines[lineIdx] || '';

  useEffect(() => {
    setShown('');
    setDone(false);
    iRef.current = 0;
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      iRef.current += 1;
      if (iRef.current >= text.length) {
        setShown(text);
        setDone(true);
        clearInterval(timer.current);
      } else {
        setShown(text.slice(0, iRef.current));
      }
    }, 28);
    return () => clearInterval(timer.current);
  }, [text]);

  const dismiss = () => {
    Animated.timing(slide, { toValue: -160, duration: 200, useNativeDriver: true }).start(onDismiss);
  };

  const advance = () => {
    if (!done) {
      clearInterval(timer.current);
      setShown(text);
      setDone(true);
      return;
    }
    if (lineIdx < lines.length - 1) setLineIdx((i) => i + 1);
    else dismiss();
  };

  return (
    <Animated.View style={[styles.root, { transform: [{ translateY: slide }] }]}>
      <Pressable style={styles.card} onPress={advance}>
        <Animated.View style={styles.header}>
          <Animated.View style={styles.avatar}>
            <Image
              source={require('../../assets/sprites/molar_idle.png')}
              style={styles.sprite}
              resizeMode="cover"
            />
          </Animated.View>
          <Text style={styles.caller}>{'>> FUNK\nDr. Molar'}</Text>
        </Animated.View>

        <Text style={styles.line}>{shown}</Text>
        {done && (
          <Text style={styles.next}>
            {lineIdx < lines.length - 1 ? '▶ WEITER' : '▶ OK'}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute', top: 0, left: 0, right: 0,
    zIndex: 150,
    alignItems: 'center',
  },
  card: {
    marginTop: 10,
    maxWidth: 280,
    backgroundColor: '#0d0f17',
    borderWidth: 2, borderColor: '#d41808',
    borderRadius: 6,
    padding: 12,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
  },
  avatar: {
    width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2,
    overflow: 'hidden', backgroundColor: '#1a1d2a',
    borderWidth: 2, borderColor: '#d41808',
    marginRight: 10,
  },
  sprite: {
    // Zoom + offset so only frame 0's head fills the round avatar
    position: 'absolute',
    width: FRAME_W * 8 * 1.3, height: FRAME_H * 1.3,
    left: -21, top: -6,
  },
  caller: {
    color: '#d41808', fontFamily: 'monospace',
    fontSize: 11, fontWeight: 'bold', letterSpacing: 1, lineHeight: 16,
  },
  line: {
    color: '#dbe4f0', fontFamily: 'monospace', fontSize: 15, lineHeight: 21,
  },
  next: {
    color: '#d41808', fontFamily: 'monospace',
    fontSize: 11, fontWeight: 'bold', letterSpacing: 1,
    textAlign: 'right', marginTop: 8,
  },
});
