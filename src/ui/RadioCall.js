import React, { useEffect, useRef, useState } from 'react';
import { Text, Image, Pressable, StyleSheet, Animated } from 'react-native';

const FRAME_W = 72;
const FRAME_H = 112;
const SPEAK_FRAMES = 2;        // molar_speak.png: Mund zu / auf
const AVATAR = 52;
const ZOOM = 1.3;
const FW_Z = FRAME_W * ZOOM;   // ein Frame, gezoomt

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
  const [mouth, setMouth] = useState(0);
  useEffect(() => {
    if (!speaking) { setMouth(0); return; }
    const id = setInterval(() => setMouth((m) => (m ? 0 : 1)), 130);
    return () => clearInterval(id);
  }, [speaking]);

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
              source={require('../../assets/sprites/molar_speak.png')}
              style={[styles.sprite, { left: -21 - mouth * FW_Z }]}
              resizeMode="stretch"
            />
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
    // Kopf gezoomt ins runde Avatar. Breite = ganzes Sheet, damit ein Frame
    // korrekt skaliert; horizontaler Offset (inline) waehlt zu/auf-Mund.
    position: 'absolute',
    width: FRAME_W * SPEAK_FRAMES * ZOOM, height: FRAME_H * ZOOM,
    top: -6,
  },
  caller: {
    color: '#d41808', fontFamily: 'monospace',
    fontSize: 14, fontWeight: '900', letterSpacing: 1, lineHeight: 18,
  },
  name: {
    color: '#f0f4fa', fontFamily: 'monospace',
    fontSize: 16, fontWeight: '900', letterSpacing: 1, lineHeight: 20,
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
