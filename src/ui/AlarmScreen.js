import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { ALARM_LINES } from '../config/game';

export default function AlarmScreen({ onDismiss }) {
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.15, duration: 400, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1,    duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Pressable style={styles.root} onPress={onDismiss}>
      <View style={styles.inner}>
        <Animated.Text style={[styles.header, { opacity: blink }]}>
          {ALARM_LINES[0]}
        </Animated.Text>
        <Text style={styles.sub}>{ALARM_LINES[1]}</Text>
        <View style={styles.divider} />
        {ALARM_LINES.slice(2).map((l, i) => (
          <Text key={i} style={styles.line}>{l}</Text>
        ))}
        <Text style={styles.tap}>[ TIPPEN ZUM FORTFAHREN ]</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: '#0a0000',
    alignItems: 'center', justifyContent: 'center',
  },
  inner: {
    width: '88%', maxWidth: 560,
    borderWidth: 3, borderColor: '#c01008',
    backgroundColor: '#100000',
    padding: 28, alignItems: 'center',
  },
  header: {
    color: '#ff2010', fontFamily: 'monospace', fontWeight: 'bold',
    fontSize: 16, letterSpacing: 2, textAlign: 'center', marginBottom: 10,
  },
  sub: {
    color: '#ff6040', fontFamily: 'monospace', fontSize: 13,
    letterSpacing: 1, textAlign: 'center', marginBottom: 18,
  },
  divider: {
    width: '80%', height: 1, backgroundColor: '#c01008', marginBottom: 18,
  },
  line: {
    color: '#cc9080', fontFamily: 'monospace', fontSize: 12,
    textAlign: 'center', marginBottom: 6, lineHeight: 18,
  },
  tap: {
    marginTop: 24, color: '#804030', fontFamily: 'monospace',
    fontSize: 11, letterSpacing: 2,
  },
});
