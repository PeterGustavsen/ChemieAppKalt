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
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 8, alignItems: 'center' },
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: 'rgba(8,12,20,0.82)',
    borderWidth: 1, borderColor: '#33414f', borderRadius: 14,
    shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 14, shadowOffset: { width: 0, height: 4 },
  },
  cell: {
    width: 46, height: 46, borderWidth: 1.5, borderRadius: 10,
    backgroundColor: 'rgba(13,15,23,0.75)',
    alignItems: 'center', justifyContent: 'center',
  },
  cellActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#fff', shadowOpacity: 0.25, shadowRadius: 8,
  },
  cellLocked: { opacity: 0.45 },
  term: { borderColor: '#2f8f3a' },
  sep: { width: 1, height: 30, backgroundColor: '#33414f', marginHorizontal: 2 },
  pressed: { opacity: 0.6 },
  icon: { fontSize: 18, lineHeight: 22 },
  badge: { fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold', marginTop: 1 },
});
