/*
 * PixelDialog — JRPG-Dialogbox mit Typewriter-Effekt. NUR fuer Dialog/Untersuchen,
 * keine Eingabe. Tippen: erst Text sofort fertig, dann naechste Zeile / schliessen.
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function PixelDialog({ speaker, lines, onClose }) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  const iRef = useRef(0);
  const timer = useRef(null);

  // Reset to first line whenever the line set changes
  useEffect(() => { setIdx(0); }, [lines]);

  const text = lines[idx] || '';

  useEffect(() => {
    setShown('');
    setDone(false);
    iRef.current = 0;
    timer.current = setInterval(() => {
      iRef.current += 1;
      if (iRef.current >= text.length) {
        setShown(text);
        setDone(true);
        clearInterval(timer.current);
      } else {
        setShown(text.slice(0, iRef.current));
      }
    }, 24);
    return () => clearInterval(timer.current);
  }, [text]);

  const advance = () => {
    if (!done) {
      clearInterval(timer.current);
      setShown(text);
      setDone(true);
      return;
    }
    if (idx < lines.length - 1) setIdx(idx + 1);
    else onClose && onClose();
  };

  return (
    <Pressable style={styles.wrap} onPress={advance}>
      <View style={styles.box}>
        {speaker ? <Text style={styles.speaker}>{speaker}</Text> : null}
        <Text style={styles.text}>{shown}</Text>
        {done ? (
          <Text style={styles.next}>
            {idx < lines.length - 1 ? '▼' : '▼ schliessen'}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16,
  },
  box: {
    width: '100%', maxWidth: 680,
    backgroundColor: 'rgba(13,15,23,0.96)',
    borderWidth: 3, borderColor: '#6fd3dd',
    borderRadius: 2, padding: 10,
    shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 0,
    shadowOffset: { width: 0, height: 4 },
  },
  speaker: {
    color: '#f0b23a', fontFamily: 'monospace', fontWeight: 'bold',
    fontSize: 16, marginBottom: 5, letterSpacing: 1,
  },
  text: { color: '#eafcff', fontFamily: 'monospace', fontSize: 17, lineHeight: 24 },
  next: { color: '#6fd3dd', fontFamily: 'monospace', fontSize: 13, textAlign: 'right', marginTop: 5 },
});
