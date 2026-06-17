/*
 * PixelButton — schlichter Steuer-Button im Pixel/Terminal-Stil.
 */
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export default function PixelButton({ label, onPress, accent = '#6fd3dd', disabled, style, big }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn, big && styles.big,
        { borderColor: accent },
        pressed && { backgroundColor: accent + '22' },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.txt, big && styles.txtBig, { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 2, backgroundColor: 'rgba(13,15,23,0.9)',
    paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', justifyContent: 'center',
  },
  big: { paddingHorizontal: 16, paddingVertical: 12 },
  disabled: { opacity: 0.35 },
  txt: { fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  txtBig: { fontSize: 15 },
});
