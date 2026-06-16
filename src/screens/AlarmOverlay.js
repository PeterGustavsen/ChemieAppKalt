/*
 * ALARM OVERLAY
 * Roter Blink-Effekt + Shake wenn Alarm ausloest.
 * Wird ueber dem Intro eingeblendet.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../config/theme';
import { Sound } from '../components/SoundManager';

export default function AlarmOverlay({ onDismiss }) {
  const flashAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Sound.alarm();

    // Blink-Loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 400, useNativeDriver: false }),
        Animated.timing(flashAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
      ])
    ).start();

    // Shake-Loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 3, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -3, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const bgColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(180,0,0,0.06)', 'rgba(200,0,0,0.22)'],
  });

  return (
    <Animated.View style={[styles.overlay, { backgroundColor: bgColor }]}>
      <Animated.View
        style={[styles.box, { transform: [{ translateX: shakeAnim }] }]}
      >
        <Text style={styles.title}>ALARM</Text>
        <Text style={styles.sub}>
          SICHERHEITSPROTOKOLL AKTIVIERT{'\n'}
          LABOR VERRIEGELT{'\n'}
          4 CODES ERFORDERLICH
        </Text>
        <TouchableOpacity style={styles.btn} onPress={onDismiss}>
          <Text style={styles.btnText}>ZUM TERMINAL</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  box: {
    backgroundColor: 'rgba(10,10,15,0.95)',
    borderWidth: 2,
    borderColor: COLORS.red,
    borderRadius: 8,
    padding: 30,
    alignItems: 'center',
    maxWidth: 320,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.red,
    letterSpacing: 6,
    marginBottom: 14,
  },
  sub: {
    color: '#f87171',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
  },
  btnText: {
    color: COLORS.text,
    fontSize: 11,
    letterSpacing: 1,
  },
});
