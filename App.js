import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Scene1Hub from './src/scenes/Scene1Hub';
import Scene2Titration from './src/scenes/Scene2Titration';
import Scene3Stoich from './src/scenes/Scene3Stoich';
import Scene4Periodic from './src/scenes/Scene4Periodic';
import Scene5Organik from './src/scenes/Scene5Organik';
import SceneEnd from './src/scenes/SceneEnd';
import { ROOMS, TIMER_SECONDS } from './src/config/game';

const ROOM_COMPONENTS = { 2: Scene2Titration, 3: Scene3Stoich, 4: Scene4Periodic, 5: Scene5Organik };

export default function App() {
  const [screen, setScreen] = useState('scene1');
  const [activeRoom, setActiveRoom] = useState(null);
  const [solvedIds, setSolvedIds] = useState([]);
  const [revealedIds, setRevealedIds] = useState([]);
  const [introDone, setIntroDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [gameState, setGameState] = useState('playing');
  const startTimeRef = useRef(null);

  // Flicker overlay: fires once when Molar leaves, then fades to dim red
  const flickerAnim = useRef(new Animated.Value(0)).current;
  const [flickerDone, setFlickerDone] = useState(false);

  // Countdown — starts after intro
  useEffect(() => {
    if (!introDone || gameState !== 'playing') return;
    if (startTimeRef.current === null) startTimeRef.current = Date.now();
    if (timeLeft <= 0) { setGameState('fail'); return; }
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [introDone, timeLeft, gameState]);

  // Win detection
  useEffect(() => {
    if (gameState === 'playing' && solvedIds.length === ROOMS.length) {
      setGameState('win');
    }
  }, [solvedIds, gameState]);

  const elapsed = startTimeRef.current
    ? Math.round((Date.now() - startTimeRef.current) / 1000)
    : 0;

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

  const onIntroDone = useCallback(() => {
    setIntroDone(true);
    // Power cut flicker → emergency red
    flickerAnim.setValue(0);
    Animated.sequence([
      Animated.timing(flickerAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(flickerAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      Animated.timing(flickerAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(flickerAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      Animated.timing(flickerAnim, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.timing(flickerAnim, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start(() => setFlickerDone(true));
  }, [flickerAnim]);

  const onRestart = useCallback(() => {
    setSolvedIds([]);
    setRevealedIds([]);
    setIntroDone(false);
    setTimeLeft(TIMER_SECONDS);
    setGameState('playing');
    setScreen('scene1');
    setActiveRoom(null);
    setFlickerDone(false);
    flickerAnim.setValue(0);
    startTimeRef.current = null;
  }, [flickerAnim]);

  const RoomComp = activeRoom ? ROOM_COMPONENTS[activeRoom.scene] : null;
  const danger = introDone && timeLeft <= 120;

  if (gameState !== 'playing') {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <SceneEnd
          type={gameState}
          solvedIds={solvedIds}
          timeLeft={timeLeft}
          elapsed={elapsed}
          onRestart={onRestart}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {screen === 'scene1' && (
        <Scene1Hub
          solvedIds={solvedIds}
          onSubmitCode={onSubmitCode}
          onEnterRoom={onEnterRoom}
          introDone={introDone}
          onIntroDone={onIntroDone}
          timeLeft={introDone ? timeLeft : null}
          danger={danger}
          emergencyLight={flickerDone}
        />
      )}
      {screen === 'room' && RoomComp && (
        <RoomComp
          room={activeRoom}
          onBack={onBack}
          onReveal={onReveal}
          initiallySolved={revealedIds.includes(activeRoom.id)}
          emergencyLight={introDone}
          danger={danger}
        />
      )}

      {/* One-shot power-cut flicker — black screen flash */}
      {!introDone || !flickerDone ? (
        <Animated.View pointerEvents="none" style={[styles.flicker, { opacity: flickerAnim }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f17' },
  flicker: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: '#000',
  },
});
