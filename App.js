/*
 * ============================================================
 * CHEMISCHER ESCAPE ROOM — Point-and-Click Adventure
 * ============================================================
 * Renderer: react-native-skia (640x360, nearest-neighbor, integer-scaled).
 *
 * State-Machine:  'scene1' (Hub + Terminal)  <->  'room' (Raetselkammer 2-5)
 *
 * Loop: in jeder Kammer wird ein Code per Interaktion erspielt -> am Haupt-
 * Terminal in Szene 1 eingetragen -> naechste Kammer entriegelt. Das Terminal
 * ist nur die Fortschritts-Klammer, nicht das Raetsel.
 */
import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Scene1Hub from './src/scenes/Scene1Hub';
import Scene2Titration from './src/scenes/Scene2Titration';
import Scene3Stoich from './src/scenes/Scene3Stoich';
import Scene4Periodic from './src/scenes/Scene4Periodic';
import Scene5Organik from './src/scenes/Scene5Organik';
import { ROOMS } from './src/config/game';

const ROOM_COMPONENTS = { 2: Scene2Titration, 3: Scene3Stoich, 4: Scene4Periodic, 5: Scene5Organik };

export default function App() {
  const [screen, setScreen] = useState('scene1');   // 'scene1' | 'room'
  const [activeRoom, setActiveRoom] = useState(null);
  const [solvedIds, setSolvedIds] = useState([]);    // am Terminal bestaetigt
  const [revealedIds, setRevealedIds] = useState([]); // Raetsel im Raum geloest

  const target = ROOMS.find((r) => !solvedIds.includes(r.id)) || null;

  const onSubmitCode = useCallback((code) => {
    if (!target) return { ok: false, message: 'Alle Codes bereits eingegeben.' };
    if (code.trim() === target.code) {
      const next = ROOMS.find((r) => r.id > target.id);
      setSolvedIds((s) => [...s, target.id]);
      return {
        ok: true,
        message: next ? `KORREKT — Kammer ${next.id} entriegelt` : 'ALLE CODES OK — AUSGANG FREI!',
      };
    }
    return { ok: false, message: 'ZUGANG VERWEIGERT' };
  }, [target]);

  const onEnterRoom = useCallback((room) => { setActiveRoom(room); setScreen('room'); }, []);
  const onBack = useCallback(() => { setScreen('scene1'); setActiveRoom(null); }, []);
  const onReveal = useCallback((id) => setRevealedIds((r) => (r.includes(id) ? r : [...r, id])), []);

  const RoomComp = activeRoom ? ROOM_COMPONENTS[activeRoom.scene] : null;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {screen === 'scene1' && (
        <Scene1Hub solvedIds={solvedIds} onSubmitCode={onSubmitCode} onEnterRoom={onEnterRoom} />
      )}
      {screen === 'room' && RoomComp && (
        <RoomComp
          room={activeRoom}
          onBack={onBack}
          onReveal={onReveal}
          initiallySolved={revealedIds.includes(activeRoom.id)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f17' },
});
