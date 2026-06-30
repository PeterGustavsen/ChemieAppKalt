/*
 * NavBar — minimalistische untere Navigationsleiste des Hubs. Reise zu den 6
 * Stationen + Terminal. Kompakte Icon-Kacheln statt langer Beschriftung.
 *
 * Status je Station:  gelöst → grün ✓ · aktiv → Akzentfarbe · gesperrt → grau.
 * Reine RN-UI, auflösungsunabhängig (iPad/iPhone).
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const ICONS = ['⚡', '🛡', '🧪', '⚗', '💧', '🔗']; // Galvanik·Anode·Rosten·Addition·Bromwasser·Isomerie

export default function NavBar({ rooms, solvedIds, target, onPick, onTerminal }) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.bar}>
        {rooms.map((r, i) => {
          const solved = solvedIds.includes(r.id);
          const active = !!target && r.id === target.id;
          const col = solved ? '#6fe87a' : active ? r.accent : '#56627a';
          return (
            <Pressable
              key={r.key}
              onPress={() => onPick(r)}
              style={({ pressed }) => [
                styles.cell,
                { borderColor: col },
                active && styles.cellActive,
                !solved && !active && styles.cellLocked,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.icon}>{ICONS[i]}</Text>
              <Text style={[styles.badge, { color: col }]}>{solved ? '✓' : i + 1}</Text>
            </Pressable>
          );
        })}

        <View style={styles.sep} />

        <Pressable
          onPress={onTerminal}
          style={({ pressed }) => [styles.cell, styles.term, pressed && styles.pressed]}
        >
          <Text style={styles.icon}>🖥</Text>
          <Text style={[styles.badge, { color: '#6fe87a' }]}>PC</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 7,
    backgroundColor: 'rgba(8,12,20,0.78)',
    borderTopWidth: 1, borderColor: '#2d3748',
  },
  cell: {
    width: 46, height: 46, borderWidth: 1.5, borderRadius: 6,
    backgroundColor: 'rgba(13,15,23,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  cellActive: { backgroundColor: 'rgba(255,255,255,0.07)' },
  cellLocked: { opacity: 0.5 },
  term: { borderColor: '#2f8f3a' },
  sep: { width: 1, height: 30, backgroundColor: '#2d3748', marginHorizontal: 2 },
  pressed: { opacity: 0.6 },
  icon: { fontSize: 18, lineHeight: 22 },
  badge: { fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold', marginTop: 1 },
});
