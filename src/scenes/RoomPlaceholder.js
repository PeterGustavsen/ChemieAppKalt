/*
 * Platzhalter fuer die Raetselkammern (Szene 2-5).
 * Diese werden NACH der Abnahme von Szene 1 voll interaktiv gebaut.
 * Vorab gibt der Raum den Code heraus, damit der Terminal-Loop schon spielbar ist.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function RoomPlaceholder({ room, onBack }) {
  return (
    <View style={[styles.root, { borderColor: room.accent }]}>
      <Text style={[styles.kicker, { color: room.accent }]}>KAMMER {room.id} · SZENE {room.scene}</Text>
      <Text style={styles.title}>{room.title}</Text>
      <Text style={styles.theme}>{room.theme}</Text>

      <Text style={styles.body}>{room.examine}</Text>

      <View style={styles.note}>
        <Text style={styles.noteTxt}>
          Diese Kammer wird als Naechstes voll interaktiv gebaut (Bauphase nach Abnahme von Szene 1).
        </Text>
      </View>

      <View style={[styles.codeBox, { borderColor: room.accent }]}>
        <Text style={styles.codeLabel}>VORAB-CODE (sonst im Raetsel erspielt)</Text>
        <Text style={[styles.code, { color: room.accent }]}>{room.code}</Text>
      </View>

      <Pressable style={({ pressed }) => [styles.back, pressed && styles.backPressed]} onPress={onBack}>
        <Text style={styles.backTxt}>◀ ZURUECK ZUM TERMINAL</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: '#0d0f17', alignItems: 'center', justifyContent: 'center',
    padding: 24, borderWidth: 4,
  },
  kicker: { fontFamily: 'monospace', fontSize: 12, letterSpacing: 2, fontWeight: 'bold' },
  title: { color: '#eafcff', fontFamily: 'monospace', fontSize: 24, fontWeight: 'bold', marginTop: 6 },
  theme: { color: '#6fd3dd', fontFamily: 'monospace', fontSize: 13, marginTop: 2 },
  body: { color: '#aab6c6', fontFamily: 'monospace', fontSize: 13, textAlign: 'center', marginTop: 18, maxWidth: 520, lineHeight: 20 },
  note: { marginTop: 16, maxWidth: 520 },
  noteTxt: { color: '#f0b23a', fontFamily: 'monospace', fontSize: 11, textAlign: 'center', lineHeight: 17 },
  codeBox: { marginTop: 20, borderWidth: 2, paddingHorizontal: 28, paddingVertical: 12, alignItems: 'center' },
  codeLabel: { color: '#718096', fontFamily: 'monospace', fontSize: 9, letterSpacing: 1 },
  code: { fontFamily: 'monospace', fontSize: 36, fontWeight: 'bold', letterSpacing: 6, marginTop: 4 },
  back: { marginTop: 26, borderWidth: 2, borderColor: '#6fd3dd', paddingHorizontal: 20, paddingVertical: 10 },
  backPressed: { backgroundColor: 'rgba(111,211,221,0.15)' },
  backTxt: { color: '#6fd3dd', fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold' },
});
