/*
 * NavBar — untere Navigationsleiste des Hubs. Ersetzt das Anklicken der
 * Schrank-Boxen: man reist über diese Leiste zu den 6 Stationen und zum
 * Terminal. Reine RN-UI (auflösungsunabhängig, volle Breite), passt sich an
 * jede iPad-/iPhone-Größe an.
 *
 * Status je Station:
 *   gelöst  → grün, Häkchen
 *   aktiv   → Akzentfarbe der Station (nächste zu lösende)
 *   gesperrt→ gedämpft grau (Antippen zeigt Molars Hinweis via onPick)
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

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
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.cellTop}>
                <Text style={[styles.num, { color: col }]}>{solved ? '✓' : i + 1}</Text>
                <View style={[styles.led, { backgroundColor: col }]} />
              </View>
              <Text style={[styles.lbl, !solved && !active && styles.lblLocked]} numberOfLines={1}>
                {r.title}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={onTerminal}
          style={({ pressed }) => [styles.cell, styles.term, pressed && styles.pressed]}
        >
          <View style={styles.cellTop}>
            <Text style={[styles.num, { color: '#6fe87a' }]}>⌨</Text>
            <View style={[styles.led, { backgroundColor: '#6fe87a' }]} />
          </View>
          <Text style={[styles.lbl, { color: '#6fe87a' }]} numberOfLines={1}>TERMINAL</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row', alignItems: 'stretch', gap: 6,
    paddingHorizontal: 10, paddingVertical: 8,
    backgroundColor: 'rgba(8,12,20,0.86)',
    borderTopWidth: 2, borderColor: '#2d3748',
    width: '100%', justifyContent: 'center',
  },
  cell: {
    flex: 1, maxWidth: 150, minWidth: 64,
    borderWidth: 2, borderRadius: 3,
    backgroundColor: 'rgba(13,15,23,0.9)',
    paddingHorizontal: 8, paddingVertical: 6,
    justifyContent: 'center',
  },
  cellActive: { backgroundColor: 'rgba(40,30,8,0.92)' },
  term: { borderColor: '#2f8f3a', maxWidth: 120 },
  pressed: { opacity: 0.65 },
  cellTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  num: { fontFamily: 'monospace', fontSize: 15, fontWeight: 'bold' },
  led: { width: 7, height: 7, borderRadius: 1 },
  lbl: { color: '#aeb9c9', fontFamily: 'monospace', fontSize: 9, marginTop: 3, letterSpacing: 0.5 },
  lblLocked: { color: '#56627a' },
});
