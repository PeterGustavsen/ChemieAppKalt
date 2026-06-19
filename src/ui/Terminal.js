/*
 * Terminal — Fortschritts-Klammer. Hier traegt der Spieler die in den Kammern
 * erspielten Codes ein. Korrekt -> naechste Kammer frei. Das Terminal ist NICHT
 * das Raetsel, nur die Eingabe-/Status-Station (Pixel-CRT-Stil).
 */
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'DEL', '0', 'OK'];

export default function Terminal({ rooms, solvedIds, onSubmit, onClose }) {
  const [input, setInput] = useState('');
  const [fb, setFb] = useState(null); // {ok, msg}

  const press = (k) => {
    setFb(null);
    if (k === 'DEL') return setInput((s) => s.slice(0, -1));
    if (k === 'OK') {
      const res = onSubmit(input);
      setFb({ ok: res.ok, msg: res.message });
      setInput('');
      return;
    }
    if (input.length < 6) setInput((s) => s + k);
  };

  const solvedCount = solvedIds.length;

  return (
    <View style={styles.backdrop}>
      <View style={styles.crt}>
        <View style={styles.header}>
          <Text style={styles.headerTxt}>SICHERHEITSTERMINAL v7</Text>
          <Pressable onPress={onClose} hitSlop={12}><Text style={styles.close}>✕</Text></Pressable>
        </View>

        <Text style={styles.sub}>// CODES {solvedCount}/{rooms.length} //</Text>
        <View style={styles.slots}>
          {rooms.map((r) => {
            const done = solvedIds.includes(r.id);
            return (
              <View key={r.id} style={[styles.slot, done && styles.slotDone]}>
                <Text style={[styles.slotCode, done && styles.slotCodeDone]}>
                  {done ? r.code : '----'}
                </Text>
                <Text style={styles.slotLbl}>{r.theme}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.display}>
          <Text style={styles.displayTxt}>{input.padEnd(6, '·')}</Text>
        </View>
        {fb ? (
          <Text style={[styles.fb, fb.ok ? styles.fbOk : styles.fbErr]}>{fb.msg}</Text>
        ) : (
          <Text style={styles.fbHint}>Code aus der Kammer eintippen</Text>
        )}

        <View style={styles.pad}>
          {KEYS.map((k) => (
            <Pressable
              key={k}
              style={({ pressed }) => [
                styles.key,
                k === 'OK' && styles.keyOk,
                k === 'DEL' && styles.keyDel,
                pressed && styles.keyPressed,
              ]}
              onPress={() => press(k)}
            >
              <Text style={[styles.keyTxt, k === 'OK' && styles.keyTxtOk]}>{k}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const G = '#6fe87a';
const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(5,7,12,0.78)', alignItems: 'center', justifyContent: 'center',
  },
  crt: {
    width: 340, backgroundColor: '#0a140c',
    borderWidth: 3, borderColor: '#2f8f3a', borderRadius: 4, padding: 14,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTxt: { color: G, fontFamily: 'monospace', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
  close: { color: '#f06b6b', fontFamily: 'monospace', fontSize: 16 },
  sub: { color: '#2f8f3a', fontFamily: 'monospace', fontSize: 10, marginTop: 8, letterSpacing: 2 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6, justifyContent: 'center' },
  slot: { width: '31%', borderWidth: 1, borderColor: '#1c4f24', padding: 4, alignItems: 'center' },
  slotDone: { borderColor: G, backgroundColor: 'rgba(111,232,122,0.08)' },
  slotCode: { color: '#1c4f24', fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold' },
  slotCodeDone: { color: G },
  slotLbl: { color: '#2f8f3a', fontFamily: 'monospace', fontSize: 7, marginTop: 2, textAlign: 'center' },
  display: {
    marginTop: 12, borderWidth: 2, borderColor: '#2f8f3a', backgroundColor: '#02160a',
    paddingVertical: 8, alignItems: 'center',
  },
  displayTxt: { color: G, fontFamily: 'monospace', fontSize: 26, letterSpacing: 8 },
  fb: { fontFamily: 'monospace', fontSize: 11, textAlign: 'center', marginTop: 6 },
  fbOk: { color: G }, fbErr: { color: '#f06b6b' },
  fbHint: { color: '#1c5f2a', fontFamily: 'monospace', fontSize: 10, textAlign: 'center', marginTop: 6 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 6, justifyContent: 'center' },
  key: {
    width: 96, height: 40, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#2f8f3a', backgroundColor: '#0d1f12',
  },
  keyOk: { borderColor: G, backgroundColor: '#13351b' },
  keyDel: { borderColor: '#9c7322' },
  keyPressed: { backgroundColor: '#1c4f24' },
  keyTxt: { color: G, fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold' },
  keyTxtOk: { color: '#eafcff' },
});
