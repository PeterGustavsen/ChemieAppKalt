import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { ROOMS } from '../config/game';

const fmtTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function SceneEnd({ type, solvedIds, timeLeft, elapsed, onRestart }) {
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  const win = type === 'win';

  return (
    <View style={styles.root}>
      <View style={[styles.box, { borderColor: win ? '#6fe87a' : '#f06b6b' }]}>

        <Animated.Text style={[styles.headline, { color: win ? '#6fe87a' : '#f06b6b', opacity: glowOpacity }]}>
          {win ? '★  AUSGANG FREI!  ★' : '⚠  ZEIT ABGELAUFEN  ⚠'}
        </Animated.Text>

        {win ? (
          <>
            <Text style={styles.sub}>Prof. Dr. Molar meldet sich per Funk:</Text>
            <Text style={styles.quote}>
              "Ausgezeichnet! Ich wusste, du schaffst das.{'\n'}
              Das Labor ist entsperrt. Du bist frei!"
            </Text>
            <Text style={styles.label}>GELÖST IN</Text>
            <Text style={[styles.bigTime, { color: '#6fe87a' }]}>{fmtTime(elapsed)}</Text>

            <View style={styles.codeRow}>
              {ROOMS.map((r) => (
                <View key={r.id} style={[styles.codeBox, { borderColor: r.accent }]}>
                  <Text style={[styles.codeVal, { color: r.accent }]}>{r.code}</Text>
                  <Text style={styles.codeTheme}>{r.theme}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sub}>SICHERHEITSPROTOKOLL</Text>
            <Text style={[styles.sub, { color: '#f06b6b', marginTop: 4 }]}>PERMANENT GESPERRT</Text>
            <Text style={styles.quote}>
              {solvedIds.length === 0
                ? 'Kein einziger Code — das Protokoll war gnadenlos.'
                : `${solvedIds.length} von 4 Kammern geloest.\nNaechstes Mal ein bisschen schneller!`}
            </Text>
            <View style={styles.codeRow}>
              {ROOMS.map((r) => (
                <View key={r.id} style={[
                  styles.codeBox,
                  { borderColor: solvedIds.includes(r.id) ? r.accent : '#2a2a3a' },
                ]}>
                  <Text style={[
                    styles.codeVal,
                    { color: solvedIds.includes(r.id) ? r.accent : '#2a2a3a' },
                  ]}>
                    {solvedIds.includes(r.id) ? r.code : '----'}
                  </Text>
                  <Text style={[
                    styles.codeTheme,
                    { color: solvedIds.includes(r.id) ? '#718096' : '#2a2a3a' },
                  ]}>
                    {r.theme}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.btn,
            { borderColor: win ? '#6fe87a' : '#f06b6b' },
            pressed && styles.btnPressed,
          ]}
          onPress={onRestart}
        >
          <Text style={[styles.btnTxt, { color: win ? '#6fe87a' : '#f06b6b' }]}>
            {win ? '▶  NOCHMAL SPIELEN' : '▶  NOCHMAL VERSUCHEN'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: '#05070c',
    alignItems: 'center', justifyContent: 'center',
  },
  box: {
    width: '90%', maxWidth: 520,
    backgroundColor: '#0d0f17',
    borderWidth: 4, padding: 28,
    alignItems: 'center',
  },
  headline: {
    fontFamily: 'monospace', fontSize: 22, fontWeight: 'bold',
    letterSpacing: 3, textAlign: 'center', marginBottom: 20,
  },
  sub: {
    color: '#718096', fontFamily: 'monospace', fontSize: 11,
    letterSpacing: 1, textAlign: 'center',
  },
  quote: {
    color: '#aab6c6', fontFamily: 'monospace', fontSize: 13,
    textAlign: 'center', marginTop: 10, lineHeight: 20,
  },
  label: {
    color: '#718096', fontFamily: 'monospace', fontSize: 9,
    letterSpacing: 3, marginTop: 20,
  },
  bigTime: {
    fontFamily: 'monospace', fontSize: 48, fontWeight: 'bold',
    letterSpacing: 6, marginTop: 4, marginBottom: 4,
  },
  codeRow: {
    flexDirection: 'row', gap: 8, marginTop: 18, marginBottom: 22,
  },
  codeBox: {
    flex: 1, borderWidth: 2, padding: 8, alignItems: 'center',
  },
  codeVal: {
    fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold',
  },
  codeTheme: {
    color: '#718096', fontFamily: 'monospace', fontSize: 8,
    marginTop: 3, textAlign: 'center',
  },
  btn: {
    borderWidth: 2, paddingHorizontal: 24, paddingVertical: 12,
  },
  btnPressed: { backgroundColor: 'rgba(255,255,255,0.06)' },
  btnTxt: { fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
});
