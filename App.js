/*
 * ============================================================
 * CHEMISCHER ESCAPE ROOM — Point-and-Click Adventure
 * ============================================================
 * Renderer: react-native-skia (640x360, nearest-neighbor, integer-scaled).
 *
 * State-Machine:
 *   'scene1' (Hub + Terminal)  <->  'room' (Raetselkammer)
 *
 * Fortschritt: in jeder Kammer wird ein Code erspielt -> am Haupt-Terminal in
 * Szene 1 eingetragen -> naechste Kammer entriegelt. Das Terminal ist die
 * Klammer, nicht das Raetsel.
 */
import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Scene1Hub from './src/scenes/Scene1Hub';
import RoomPlaceholder from './src/scenes/RoomPlaceholder';
import { ROOMS } from './src/config/game';

export default function App() {
  const [screen, setScreen] = useState('scene1');   // 'scene1' | 'room'
  const [activeRoom, setActiveRoom] = useState(null);
  const [solvedIds, setSolvedIds] = useState([]);

  // naechste ungeloeste Kammer (Reihenfolge = ROOMS)
  const target = ROOMS.find((r) => !solvedIds.includes(r.id)) || null;

  // Code am Terminal pruefen
  const onSubmitCode = useCallback((code) => {
    if (!target) return { ok: false, message: 'Alle Codes bereits eingegeben.' };
    if (code.trim() === target.code) {
      const next = ROOMS.find((r) => r.id !== target.id && !solvedIds.includes(r.id) && r.id > target.id);
      setSolvedIds((s) => [...s, target.id]);
      return {
        ok: true,
        message: next ? `KORREKT — Kammer ${next.id} entriegelt` : 'ALLE CODES OK — AUSGANG FREI!',
      };
    }
    return { ok: false, message: 'ZUGANG VERWEIGERT' };
  }, [target, solvedIds]);

  const onEnterRoom = useCallback((room) => {
    setActiveRoom(room);
    setScreen('room');
  }, []);

  const onBack = useCallback(() => {
    setScreen('scene1');
    setActiveRoom(null);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {screen === 'scene1' && (
        <Scene1Hub solvedIds={solvedIds} onSubmitCode={onSubmitCode} onEnterRoom={onEnterRoom} />
      )}
      {screen === 'room' && activeRoom && (
        <RoomPlaceholder room={activeRoom} onBack={onBack} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f17' },
});
