/*
 * ClipboardNote — antippbares In-World-Klemmbrett, das den Vollbild-Intro-Dialog
 * ersetzt. Sitzt auf der gemalten Werkbank; tippen öffnet den Notiztext.
 *
 *   <ClipboardNote rect={screenRect} label="LAB-NOTIZ" glow onPress={...} />
 *
 * rect = bereits in Bildschirm-px (L.toScreen(...)). Rein präsentationsneutral,
 * von SceneShell genutzt (alle Szenen erben das In-World-Intro).
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function ClipboardNote({ rect, label = 'LAB-NOTIZ', hint = '▸ tippen', glow, onPress }) {
  return (
    <Pressable style={[styles.note, rect, glow && styles.glow]} onPress={onPress}>
      {/* Klemme oben */}
      <View style={styles.clip} />
      <Text style={styles.hdr} numberOfLines={1}>{label}</Text>
      {/* angedeutete Zeilen */}
      <View style={styles.lines}>
        <View style={styles.line} />
        <View style={[styles.line, { width: '70%' }]} />
      </View>
      <Text style={styles.hint} numberOfLines={1}>{hint}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  note: {
    position: 'absolute', backgroundColor: '#ece3c8',
    borderWidth: 1, borderColor: '#b7ab84',
    alignItems: 'center', justifyContent: 'center', paddingTop: 4,
    transform: [{ rotate: '-3deg' }],
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 3, shadowOffset: { width: 1, height: 2 },
  },
  glow: { borderColor: '#f0b23a', shadowColor: '#f0b23a', shadowOpacity: 0.9, shadowRadius: 6 },
  clip: {
    position: 'absolute', top: -4, alignSelf: 'center',
    width: 18, height: 6, borderRadius: 2, backgroundColor: '#8a8f98', borderWidth: 1, borderColor: '#5a5f68',
  },
  hdr: { color: '#5a4f2a', fontFamily: 'monospace', fontSize: 8, fontWeight: 'bold', letterSpacing: 1 },
  lines: { alignSelf: 'stretch', alignItems: 'center', marginTop: 3, gap: 2 },
  line: { width: '82%', height: 1.5, backgroundColor: '#c2b88f' },
  hint: { color: '#8a7a4a', fontFamily: 'monospace', fontSize: 7, letterSpacing: 1, marginTop: 3 },
});
