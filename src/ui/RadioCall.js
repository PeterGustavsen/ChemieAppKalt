import React, { useEffect, useRef, useState } from 'react';
import { Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Canvas, Group } from '@shopify/react-native-skia';
import MolarHD from '../art/MolarHD';
import { useAmbient } from '../engine/useAmbient';

const AVATAR = 64;
const AUTO_MS = 3000;          // Verweildauer pro Zeile, nachdem sie fertig getippt ist

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

  // Mund bewegt sich, solange noch getippt wird (= er "spricht")
  const speaking = !done;
  const t = useAmbient(20);

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

  // Auto-Funk: sobald eine Zeile fertig getippt ist, kurz stehen lassen und
  // dann selbststaendig weiterschalten — auf der letzten Zeile schliesst es sich.
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(advance, AUTO_MS);
    return () => clearTimeout(id);
  }, [done, lineIdx]);

  return (
    // box-none: nur die Karte fängt Taps — der volle Breitstreifen darunter
    // darf Klicks auf Topbar/Terminal-✕ nicht blockieren.
    <Animated.View pointerEvents="box-none" style={[styles.root, { transform: [{ translateY: slide }] }]}>
      <Pressable style={styles.card} onPress={advance}>
        <Animated.View style={styles.header}>
          <Animated.View style={styles.avatar}>
            {/* Vektor-Molar-Kopf (Ausschnitt) statt Sprite-Sheet */}
            <Canvas style={{ width: AVATAR, height: AVATAR }}>
              <Group transform={[{ translateX: -18 }, { translateY: 7 }, { scale: 1.4 }]}>
                <MolarHD x={0} y={0} scale={1} mode={speaking ? 'speak' : 'idle'} t={t} />
              </Group>
            </Canvas>
          </Animated.View>
          <Animated.View>
            <Text style={styles.caller}>{'>> FUNK-EMPFANG'}</Text>
            <Text style={styles.name}>DR. MOLAR</Text>
          </Animated.View>
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
    alignItems: 'flex-start',
  },
  card: {
    marginTop: 8, marginLeft: 8,
    maxWidth: 330,
    backgroundColor: '#0d0f17',
    borderWidth: 2, borderColor: '#d41808',
    borderRadius: 6,
    padding: 14,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
  },
  avatar: {
    width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2,
    overflow: 'hidden', backgroundColor: '#1a1d2a',
    borderWidth: 2, borderColor: '#d41808',
    marginRight: 12,
  },
  caller: {
    color: '#d41808', fontFamily: 'monospace',
    fontSize: 15, fontWeight: '900', letterSpacing: 1, lineHeight: 19,
  },
  name: {
    color: '#f0f4fa', fontFamily: 'monospace',
    fontSize: 17, fontWeight: '900', letterSpacing: 1, lineHeight: 21,
  },
  line: {
    color: '#dbe4f0', fontFamily: 'monospace', fontSize: 16, lineHeight: 23,
  },
  next: {
    color: '#d41808', fontFamily: 'monospace',
    fontSize: 11, fontWeight: 'bold', letterSpacing: 1,
    textAlign: 'right', marginTop: 8,
  },
});
