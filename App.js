import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated,
  AppState, useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import SceneStart from './src/scenes/SceneStart';
import Scene1Hub from './src/scenes/Scene1Hub';
import Scene2Buffer from './src/scenes/Scene2Buffer';
import Scene3Redox from './src/scenes/Scene3Redox';
import Scene4Galvanic from './src/scenes/Scene4Galvanic';
import Scene5Ester from './src/scenes/Scene5Ester';
import Scene6Electrolysis from './src/scenes/Scene6Electrolysis';
import Scene7Equilibrium from './src/scenes/Scene7Equilibrium';
import SceneWin from './src/scenes/SceneWin';
import SceneFail from './src/scenes/SceneFail';
import RadioCall from './src/ui/RadioCall';
import ErrorBoundary from './src/fx/ErrorBoundary';
import { FX } from './src/fx/feedback';
import { ROOMS, TIMER_SECONDS, RADIO_CALLS } from './src/config/game';

const ROOM_COMPONENTS = {
  2: Scene2Buffer, 3: Scene3Redox, 4: Scene4Galvanic,
  5: Scene5Ester, 6: Scene6Electrolysis, 7: Scene7Equilibrium,
};

const SAVE_KEY = '@chemie/save';

// Optional persistence — degrades to in-memory if the dep isn't installed.
let AsyncStorage = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (_) { /* not installed yet */ }

export default function App() {
  const [screen, setScreen] = useState('start');
  const [activeRoom, setActiveRoom] = useState(null);
  const [solvedIds, setSolvedIds] = useState([]);
  const [revealedIds, setRevealedIds] = useState([]);

  // Intro flow: false → alarmPending → introDone
  const [introDone, setIntroDone] = useState(false);
  const [alarmPending, setAlarmPending] = useState(false);

  const [durationSec, setDurationSec] = useState(TIMER_SECONDS);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [gameState, setGameState] = useState('playing');

  // Wall-clock timing. startRef is the (mutable) reference timestamp; it is
  // shifted forward whenever the app returns from background so time spent
  // backgrounded is not counted against the player.
  const startRef = useRef(null);
  const bgAtRef = useRef(null);

  // FIFO radio queue — two producers (progress + time) can both enqueue
  // without one overwriting the other.
  const [radioQueue, setRadioQueue] = useState([]);
  const firedCallsRef = useRef(new Set());
  const [gameKey, setGameKey] = useState(0);

  // Refs mirroring state for use inside intervals / AppState callbacks.
  const solvedIdsRef = useRef(solvedIds);
  const revealedIdsRef = useRef(revealedIds);
  const introDoneRef = useRef(introDone);
  const gameStateRef = useRef(gameState);
  const durationRef = useRef(durationSec);
  const hydratedRef = useRef(false);
  useEffect(() => { solvedIdsRef.current = solvedIds; }, [solvedIds]);
  useEffect(() => { revealedIdsRef.current = revealedIds; }, [revealedIds]);
  useEffect(() => { introDoneRef.current = introDone; }, [introDone]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { durationRef.current = durationSec; }, [durationSec]);

  // One-shot flicker when Molar leaves
  const flickerAnim = useRef(new Animated.Value(0)).current;
  // Screen shake when alarm triggers
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const enqueueCall = useCallback((lines) => {
    setRadioQueue((q) => [...q, lines]);
  }, []);
  const dismissCall = useCallback(() => {
    setRadioQueue((q) => q.slice(1));
  }, []);

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

  // ── Persistence ────────────────────────────────────────────────────────────
  const elapsedSec = useCallback(() => (
    startRef.current ? Math.floor((Date.now() - startRef.current) / 1000) : 0
  ), []);

  const persist = useCallback(() => {
    if (!AsyncStorage || !hydratedRef.current) return;
    const snap = {
      solvedIds: solvedIdsRef.current,
      revealedIds: revealedIdsRef.current,
      introDone: introDoneRef.current,
      gameState: gameStateRef.current,
      durationSec: durationRef.current,
      elapsedSec: elapsedSec(),
    };
    AsyncStorage.setItem(SAVE_KEY, JSON.stringify(snap)).catch(() => {});
  }, [elapsedSec]);

  // Restore on launch (so a lock-screen / app-kill mid-game keeps progress).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!AsyncStorage) { hydratedRef.current = true; return; }
      try {
        const raw = await AsyncStorage.getItem(SAVE_KEY);
        if (raw && !cancelled) {
          const s = JSON.parse(raw);
          if (s && s.gameState === 'playing' && Array.isArray(s.solvedIds)
              && s.solvedIds.length < ROOMS.length) {
            setSolvedIds(s.solvedIds);
            setRevealedIds(Array.isArray(s.revealedIds) ? s.revealedIds : []);
            if (typeof s.durationSec === 'number') setDurationSec(s.durationSec);
            if (s.introDone) {
              setIntroDone(true);
              startRef.current = Date.now() - (s.elapsedSec || 0) * 1000;
              setScreen('scene1');
              // Don't replay progress radio calls the player already passed.
              RADIO_CALLS.forEach((c) => {
                if (c.after !== null && c.after <= s.solvedIds.length) {
                  firedCallsRef.current.add(`progress-${c.after}`);
                }
              });
            }
          }
        }
      } catch (_) { /* corrupt save → start fresh */ }
      hydratedRef.current = true;
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist on meaningful state changes.
  useEffect(() => {
    persist();
  }, [solvedIds, revealedIds, introDone, gameState, durationSec, persist]);

  // ── Background pause ─────────────────────────────────────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        if (bgAtRef.current && startRef.current) {
          startRef.current += Date.now() - bgAtRef.current;
        }
        bgAtRef.current = null;
      } else {
        if (bgAtRef.current === null) bgAtRef.current = Date.now();
        persist();
      }
    });
    return () => sub.remove();
  }, [persist]);

  // ── Countdown (single wall-clock interval) ──────────────────────────────────
  useEffect(() => {
    if (!introDone || gameState !== 'playing') return;
    if (startRef.current === null) startRef.current = Date.now();
    let ticks = 0;
    const id = setInterval(() => {
      const left = Math.max(0, durationSec - Math.floor((Date.now() - startRef.current) / 1000));
      setTimeLeft(left);

      // Time-based panic call (after: null).
      const call = RADIO_CALLS.find(
        (c) => c.after === null && left <= c.at && !firedCallsRef.current.has('time')
      );
      if (call) {
        firedCallsRef.current.add('time');
        enqueueCall(call.lines);
      }

      if (left <= 0) {
        // Win/Fail race guard: never fail if every room is already solved.
        // setTimeout wie beim Win-Übergang: der Fail-Screen-Mount direkt aus
        // dem Interval-Tick friert die Skia-Canvas auf Web ein.
        if (solvedIdsRef.current.length < ROOMS.length) {
          setTimeout(() => setGameState('fail'), 0);
        }
        return;
      }

      ticks += 1;
      if (ticks % 20 === 0) persist();   // ~every 5s at 250ms
    }, 250);
    return () => clearInterval(id);
  }, [introDone, gameState, durationSec, enqueueCall, persist]);

  // Progress-based radio calls
  useEffect(() => {
    if (!introDone || gameState !== 'playing') return;
    const call = RADIO_CALLS.find(
      (c) => c.after === solvedIds.length && !firedCallsRef.current.has(`progress-${c.after}`)
    );
    if (call) {
      firedCallsRef.current.add(`progress-${call.after}`);
      enqueueCall(call.lines);
    }
  }, [introDone, solvedIds, gameState, enqueueCall]);

  // Win when all rooms solved.
  // setTimeout: nicht direkt aus dem Passiv-Effekt committen — die Canvas des
  // Win-Screens friert auf Web sonst ein (Skia-Reconciler übernimmt keine
  // Updates mehr, wenn der Mount aus diesem Kontext kommt).
  useEffect(() => {
    if (gameState === 'playing' && solvedIds.length === ROOMS.length) {
      const id = setTimeout(() => setGameState('win'), 0);
      return () => clearTimeout(id);
    }
  }, [solvedIds, gameState]);

  // Radio chirp whenever a new call surfaces.
  useEffect(() => {
    if (radioQueue.length > 0) FX.radio();
  }, [radioQueue[0]]);

  const elapsed = startRef.current
    ? Math.min(durationSec, Math.floor((Date.now() - startRef.current) / 1000))
    : 0;

  const target = ROOMS.find((r) => !solvedIds.includes(r.id)) || null;

  const onSubmitCode = useCallback((code) => {
    if (!target) return { ok: false, message: 'Alle Codes bereits eingegeben.' };
    if (code.trim() === target.code) {
      const next = ROOMS.find((r) => r.id > target.id);
      setSolvedIds((s) => [...s, target.id]);
      FX.success();
      return {
        ok: true,
        message: next ? `KORREKT — Kammer ${next.id} entriegelt` : 'ALLE CODES OK — AUSGANG FREI!',
      };
    }
    FX.error();
    return { ok: false, message: 'ZUGANG VERWEIGERT' };
  }, [target]);

  const onEnterRoom = useCallback((room) => { setActiveRoom(room); setScreen('room'); }, []);
  const onBack = useCallback(() => { setScreen('scene1'); setActiveRoom(null); }, []);
  const onStart = useCallback(() => setScreen('scene1'), []);
  const onReveal = useCallback((id) => setRevealedIds((r) => (r.includes(id) ? r : [...r, id])), []);

  // Molar leaves → power flicker → screen shakes → alarm on terminal → timer starts
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
      FX.alarm();
      setAlarmPending(true);
      // Terminal shows [!] ALARM for 5 s, then timer starts automatically
      setTimeout(() => {
        setAlarmPending(false);
        setIntroDone(true);
      }, 5000);
    });
  }, [flickerAnim, triggerShake]);

  const onRestart = useCallback(() => {
    setSolvedIds([]);
    setRevealedIds([]);
    setIntroDone(false);
    setAlarmPending(false);
    setTimeLeft(durationRef.current);
    setGameState('playing');
    setScreen('start');
    setActiveRoom(null);
    setRadioQueue([]);
    setGameKey((k) => k + 1);
    flickerAnim.setValue(0);
    shakeAnim.setValue(0);
    startRef.current = null;
    bgAtRef.current = null;
    firedCallsRef.current = new Set();
    if (AsyncStorage) AsyncStorage.removeItem(SAVE_KEY).catch(() => {});
  }, [flickerAnim, shakeAnim]);

  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;

  const RoomComp = activeRoom ? ROOM_COMPONENTS[activeRoom.scene] : null;
  const danger = introDone && timeLeft <= 120;
  // Emergency light activates as soon as alarm triggers (not only after dismissal)
  const emergencyLight = alarmPending || introDone;

  // ── Render ──────────────────────────────────────────────────────────────────
  let content;

  if (isPortrait) {
    content = (
      <View style={styles.rotate}>
        <StatusBar hidden />
        <Text style={styles.rotateIcon}>⟳</Text>
        <Text style={styles.rotateTxt}>Gerät drehen</Text>
        <Text style={styles.rotateSub}>Das Spiel läuft nur im Querformat</Text>
      </View>
    );
  } else if (gameState === 'win') {
    content = (
      <View style={styles.container}>
        <StatusBar hidden />
        <SceneWin elapsed={elapsed} onRestart={onRestart} />
      </View>
    );
  } else if (gameState === 'fail') {
    content = (
      <View style={styles.container}>
        <StatusBar hidden />
        <SceneFail solvedIds={solvedIds} onRestart={onRestart} />
      </View>
    );
  } else if (screen === 'start') {
    content = (
      <View style={styles.container}>
        <StatusBar hidden />
        <SceneStart onStart={onStart} />
      </View>
    );
  } else {
    content = (
      <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
        <StatusBar hidden />
        {screen === 'scene1' && (
          <Scene1Hub
            key={gameKey}
            solvedIds={solvedIds}
            onSubmitCode={onSubmitCode}
            onEnterRoom={onEnterRoom}
            introDone={introDone}
            alarmPending={alarmPending}
            onIntroDone={onIntroDone}
            timeLeft={introDone ? timeLeft : null}
            danger={danger}
            emergencyLight={emergencyLight}
          />
        )}
        {screen === 'room' && (
          RoomComp ? (
            <RoomComp
              room={activeRoom}
              onBack={onBack}
              onReveal={onReveal}
              initiallySolved={revealedIds.includes(activeRoom.id)}
              emergencyLight={emergencyLight}
              danger={danger}
            />
          ) : (
            // Dead-end guard: unknown scene id → don't render a blank screen.
            <View style={styles.deadEnd}>
              <Text style={styles.deadEndTitle}>Kammer nicht verfügbar</Text>
              <Text style={styles.deadEndSub}>
                Diese Station ist noch nicht eingebaut.
              </Text>
              <Pressable style={styles.deadEndBtn} onPress={onBack}>
                <Text style={styles.deadEndBtnTxt}>◀ ZURÜCK</Text>
              </Pressable>
            </View>
          )
        )}

        {/* Molar radio calls — FIFO queue, top-left speaker widget */}
        {radioQueue.length > 0 && (
          <RadioCall key={radioQueue.length} lines={radioQueue[0]} onDismiss={dismissCall} />
        )}

        {/* One-shot power-cut flicker */}
        <Animated.View pointerEvents="none" style={[styles.flicker, { opacity: flickerAnim }]} />
      </Animated.View>
    );
  }

  return <ErrorBoundary onReset={onRestart}>{content}</ErrorBoundary>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f17' },
  rotate: {
    flex: 1, backgroundColor: '#0d0f17',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  rotateIcon: { color: '#6fd3dd', fontSize: 48 },
  rotateTxt: {
    color: '#6fd3dd', fontFamily: 'monospace', fontSize: 18,
    fontWeight: 'bold', letterSpacing: 2,
  },
  rotateSub: {
    color: '#4a6070', fontFamily: 'monospace', fontSize: 11, letterSpacing: 1,
  },
  flicker: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: '#000',
  },
  deadEnd: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24,
  },
  deadEndTitle: {
    color: '#e0b44c', fontFamily: 'monospace', fontSize: 18,
    fontWeight: '900', letterSpacing: 1,
  },
  deadEndSub: {
    color: '#dbe4f0', fontFamily: 'monospace', fontSize: 13, textAlign: 'center',
  },
  deadEndBtn: {
    marginTop: 12, borderWidth: 2, borderColor: '#6fd3dd',
    borderRadius: 6, paddingVertical: 10, paddingHorizontal: 20,
  },
  deadEndBtnTxt: {
    color: '#6fd3dd', fontFamily: 'monospace', fontSize: 14,
    fontWeight: 'bold', letterSpacing: 1,
  },
});
