import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Scene1Hub from './src/scenes/Scene1Hub';
import Scene2Titration from './src/scenes/Scene2Titration';
import Scene3Stoich from './src/scenes/Scene3Stoich';
import Scene4Periodic from './src/scenes/Scene4Periodic';
import Scene5Organik from './src/scenes/Scene5Organik';
import SceneWin from './src/scenes/SceneWin';
import SceneFail from './src/scenes/SceneFail';
import AlarmBubble from './src/ui/AlarmBubble';
import RadioCall from './src/ui/RadioCall';
import { ROOMS, TIMER_SECONDS, RADIO_CALLS } from './src/config/game';

const ROOM_COMPONENTS = { 2: Scene2Titration, 3: Scene3Stoich, 4: Scene4Periodic, 5: Scene5Organik };

export default function App() {
  const [screen, setScreen] = useState('scene1');
  const [activeRoom, setActiveRoom] = useState(null);
  const [solvedIds, setSolvedIds] = useState([]);
  const [revealedIds, setRevealedIds] = useState([]);

  // Intro flow: false → alarmPending → introDone
  const [introDone, setIntroDone] = useState(false);
  const [alarmPending, setAlarmPending] = useState(false);

  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [gameState, setGameState] = useState('playing');
  const startTimeRef = useRef(null);

  const [radioCall, setRadioCall] = useState(null);
  const firedCallsRef = useRef(new Set());
  const [gameKey, setGameKey] = useState(0);

  // One-shot flicker when Molar leaves
  const flickerAnim = useRef(new Animated.Value(0)).current;
  // Screen shake when alarm triggers
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 14, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -14, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  // Countdown — only after alarm is dismissed
  useEffect(() => {
    if (!introDone || gameState !== 'playing') return;
    if (startTimeRef.current === null) startTimeRef.current = Date.now();
    if (timeLeft <= 0) { setGameState('fail'); return; }
    const id = setInterval(() => setTimeLeft((t) => {
      const next = Math.max(0, t - 1);
      const call = RADIO_CALLS.find((c) => next <= c.at && !firedCallsRef.current.has(c.at));
      if (call) {
        firedCallsRef.current.add(call.at);
        setRadioCall(call.lines);
      }
      return next;
    }), 1000);
    return () => clearInterval(id);
  }, [introDone, timeLeft, gameState]);

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

  // Molar leaves → power flicker → screen shakes → alarm bubble
  const onIntroDone = useCallback(() => {
    flickerAnim.setValue(0);
    Animated.sequence([
      Animated.timing(flickerAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(flickerAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      Animated.timing(flickerAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(flickerAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      Animated.timing(flickerAnim, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.timing(flickerAnim, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start(() => {
      triggerShake();
      setAlarmPending(true);
    });
  }, [flickerAnim, triggerShake]);

  // Alarm bubble auto-dismissed → timer starts
  const onAlarmDismissed = useCallback(() => {
    setAlarmPending(false);
    setIntroDone(true);
  }, []);

  const onRestart = useCallback(() => {
    setSolvedIds([]);
    setRevealedIds([]);
    setIntroDone(false);
    setAlarmPending(false);
    setTimeLeft(TIMER_SECONDS);
    setGameState('playing');
    setScreen('scene1');
    setActiveRoom(null);
    setRadioCall(null);
    setGameKey((k) => k + 1);
    flickerAnim.setValue(0);
    shakeAnim.setValue(0);
    startTimeRef.current = null;
    firedCallsRef.current = new Set();
  }, [flickerAnim, shakeAnim]);

  const RoomComp = activeRoom ? ROOM_COMPONENTS[activeRoom.scene] : null;
  const danger = introDone && timeLeft <= 120;
  // Emergency light activates as soon as alarm triggers (not only after dismissal)
  const emergencyLight = alarmPending || introDone;

  if (gameState === 'win') {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <SceneWin elapsed={elapsed} onRestart={onRestart} />
      </View>
    );
  }

  if (gameState === 'fail') {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <SceneFail solvedIds={solvedIds} onRestart={onRestart} />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
      <StatusBar hidden />
      {screen === 'scene1' && (
        <Scene1Hub
          key={gameKey}
          solvedIds={solvedIds}
          onSubmitCode={onSubmitCode}
          onEnterRoom={onEnterRoom}
          introDone={introDone}
          onIntroDone={onIntroDone}
          timeLeft={introDone ? timeLeft : null}
          danger={danger}
          emergencyLight={emergencyLight}
        />
      )}
      {screen === 'room' && RoomComp && (
        <RoomComp
          room={activeRoom}
          onBack={onBack}
          onReveal={onReveal}
          initiallySolved={revealedIds.includes(activeRoom.id)}
          emergencyLight={emergencyLight}
          danger={danger}
        />
      )}

      {/* Alarm intercom bubble — slides in from top after power cut */}
      {alarmPending && <AlarmBubble onDismiss={onAlarmDismissed} />}

      {/* Molar radio calls — top-left speaker widget */}
      {radioCall && <RadioCall lines={radioCall} onDismiss={() => setRadioCall(null)} />}

      {/* One-shot power-cut flicker */}
      <Animated.View pointerEvents="none" style={[styles.flicker, { opacity: flickerAnim }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f17' },
  flicker: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: '#000',
  },
});
