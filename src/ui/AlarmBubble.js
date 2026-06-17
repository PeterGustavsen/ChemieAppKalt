import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { ALARM_LINES } from '../config/game';

export default function AlarmBubble({ onDismiss }) {
  const slide = useRef(new Animated.Value(200)).current; // slides UP from bottom
  const blink = useRef(new Animated.Value(1)).current;
  const [lineIdx, setLineIdx] = useState(0);
  const dismissed = useRef(false);

  useEffect(() => {
    Animated.spring(slide, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.2, duration: 350, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1,   duration: 350, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setLineIdx((i) => {
        if (i >= ALARM_LINES.length - 1) {
          clearInterval(id);
          if (!dismissed.current) {
            dismissed.current = true;
            setTimeout(() => {
              Animated.timing(slide, { toValue: 200, duration: 220, useNativeDriver: true })
                .start(onDismiss);
            }, 1800);
          }
          return i;
        }
        return i + 1;
      });
    }, 1600);
    return () => clearInterval(id);
  }, []);

  const dismiss = () => {
    if (dismissed.current) return;
    dismissed.current = true;
    Animated.timing(slide, { toValue: 200, duration: 200, useNativeDriver: true }).start(onDismiss);
  };

  return (
    <Animated.View style={[styles.root, { transform: [{ translateY: slide }] }]}>
      <Pressable style={styles.inner} onPress={dismiss}>
        <View style={styles.iconCol}>
          <Animated.Text style={[styles.icon, { opacity: blink }]}>{'[!]'}</Animated.Text>
          <Text style={styles.src}>SYSTEM</Text>
        </View>
        <View style={styles.textCol}>
          <Animated.Text style={[styles.header, { opacity: lineIdx === 0 ? blink : 1 }]}>
            {ALARM_LINES[0]}
          </Animated.Text>
          {lineIdx >= 1 && <Text style={styles.sub}>{ALARM_LINES[1]}</Text>}
          {lineIdx >= 2 && <Text style={styles.line}>{ALARM_LINES[2]}</Text>}
          {lineIdx >= 3 && <Text style={styles.line}>{ALARM_LINES[3]}</Text>}
          {lineIdx >= 4 && <Text style={styles.line}>{ALARM_LINES[4]}</Text>}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0a0000',
    borderTopWidth: 3, borderColor: '#c01008',
    zIndex: 200,
  },
  inner: {
    flexDirection: 'row', padding: 12, alignItems: 'flex-start',
  },
  iconCol: {
    alignItems: 'center', marginRight: 12, paddingTop: 2,
  },
  icon: {
    color: '#ff2010', fontFamily: 'monospace', fontWeight: 'bold',
    fontSize: 18, letterSpacing: 0,
  },
  src: {
    color: '#c01008', fontFamily: 'monospace', fontSize: 7,
    letterSpacing: 1, marginTop: 3,
  },
  textCol: { flex: 1 },
  header: {
    color: '#ff2010', fontFamily: 'monospace', fontWeight: 'bold',
    fontSize: 13, letterSpacing: 2, marginBottom: 4,
  },
  sub: {
    color: '#ff6040', fontFamily: 'monospace', fontSize: 11,
    letterSpacing: 1, marginBottom: 3,
  },
  line: {
    color: '#cc9080', fontFamily: 'monospace', fontSize: 10,
    lineHeight: 16, marginTop: 1,
  },
});
