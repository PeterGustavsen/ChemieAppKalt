/*
 * RPG-STIL DIALOGBOX
 * Text laeuft Buchstabe fuer Buchstabe ein.
 * "Weiter"-Indikator unten rechts.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../config/theme';

export default function DialogBox({ text, speaker, onNext, isLast }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  // Typewriter-Effekt
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    timerRef.current = setInterval(() => {
      indexRef.current++;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(timerRef.current);
      } else {
        setDisplayed(text.substring(0, indexRef.current));
      }
    }, 30);

    return () => clearInterval(timerRef.current);
  }, [text]);

  const handlePress = () => {
    if (!done) {
      // Skip: zeige sofort alles
      clearInterval(timerRef.current);
      setDisplayed(text);
      setDone(true);
    } else {
      onNext();
    }
  };

  return (
    <TouchableOpacity
      style={styles.box}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {speaker ? (
        <Text style={styles.speaker}>{speaker}</Text>
      ) : null}
      <Text style={styles.text}>
        {displayed}
        {!done && <Text style={styles.cursor}>|</Text>}
      </Text>
      {done && (
        <Text style={styles.next}>
          {isLast ? '\u25BC Weiter' : '\u25BC'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: 'rgba(10,15,25,0.92)',
    borderWidth: 2,
    borderColor: COLORS.textDim,
    borderRadius: 4,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    minHeight: 90,
  },
  speaker: {
    color: COLORS.amber,
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 6,
    letterSpacing: 1,
  },
  text: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
  },
  cursor: {
    color: COLORS.amber,
  },
  next: {
    color: COLORS.textDim,
    fontSize: 10,
    textAlign: 'right',
    marginTop: 8,
  },
});
