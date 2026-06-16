/*
 * ============================================================
 * CHEMISCHER ESCAPE ROOM — Hauptdatei
 * ============================================================
 *
 * State-Machine fuer Screen-Wechsel:
 *   'intro' -> 'alarm' -> 'terminal' / 'puzzle1-4' -> 'victory'
 *
 * Struktur:
 *   App.js          — State-Machine, Timer, HUD, Navigation
 *   src/screens/    — Einzelne Screens (Intro, Raetsel, Terminal, Victory)
 *   src/components/ — Wiederverwendbare Teile (Professor, PixelLab, NavBar, Dialog)
 *   src/config/     — Raetsel-Daten, Farben (hier anpassen!)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { COLORS } from './src/config/theme';
import { PUZZLES, TOTAL_TIME } from './src/config/puzzles';
import { Sound } from './src/components/SoundManager';

// Screens
import IntroScreen from './src/screens/IntroScreen';
import AlarmOverlay from './src/screens/AlarmOverlay';
import TerminalScreen from './src/screens/TerminalScreen';
import PuzzleScreen from './src/screens/PuzzleScreen';
import VictoryScreen from './src/screens/VictoryScreen';
import NavBar from './src/components/NavBar';

export default function App() {
  /* ===========================================
     GAME STATE
     =========================================== */
  const [screen, setScreen] = useState('intro');
  // intro | alarm | terminal | puzzle1 | puzzle2 | puzzle3 | puzzle4 | victory

  const [solved, setSolved] = useState([false, false, false, false]);
  const [currentPuzzle, setCurrentPuzzle] = useState(0); // naechster ungeloester Index
  const [timerSec, setTimerSec] = useState(TOTAL_TIME);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const timerRef = useRef(null);

  /* ===========================================
     TIMER
     =========================================== */
  useEffect(() => {
    if (gameStartTime && screen !== 'victory') {
      timerRef.current = setInterval(() => {
        setTimerSec(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Zeit abgelaufen
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [gameStartTime, screen]);

  // Timer-Formatierung
  const timerMin = Math.floor(timerSec / 60);
  const timerSecDisplay = timerSec % 60;
  const timerStr = `${String(timerMin).padStart(2, '0')}:${String(timerSecDisplay).padStart(2, '0')}`;
  const timerWarning = timerSec < 300;

  /* ===========================================
     EVENT HANDLERS
     =========================================== */

  // Alarm ausloesen (nach Intro)
  const handleAlarm = useCallback(() => {
    setScreen('alarm');
  }, []);

  // Alarm bestaetigen -> Spiel startet
  const handleDismissAlarm = useCallback(() => {
    setScreen('terminal');
    setGameStartTime(Date.now());
  }, []);

  // Navigation zwischen Screens
  const handleNavigate = useCallback((target) => {
    Sound.click();
    setScreen(target);
  }, []);

  // Code korrekt eingegeben
  const handleCodeCorrect = useCallback((index) => {
    const newSolved = [...solved];
    newSolved[index] = true;
    setSolved(newSolved);

    const nextPuzzle = index + 1;
    setCurrentPuzzle(nextPuzzle);

    // Alle geloest?
    if (nextPuzzle >= 4) {
      const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
      setElapsedTime(elapsed);
      clearInterval(timerRef.current);
      setTimeout(() => setScreen('victory'), 1200);
    }
  }, [solved, gameStartTime]);

  // Neustart
  const handleRestart = useCallback(() => {
    setScreen('intro');
    setSolved([false, false, false, false]);
    setCurrentPuzzle(0);
    setTimerSec(TOTAL_TIME);
    setGameStartTime(null);
    setElapsedTime(0);
    clearInterval(timerRef.current);
  }, []);

  // Mute toggle
  const handleToggleMute = useCallback(() => {
    const nowMuted = Sound.toggle();
    setMuted(nowMuted);
  }, []);

  /* ===========================================
     Welcher Puzzle-Index fuer puzzle1-4 Screens
     =========================================== */
  const getPuzzleIndex = () => {
    if (screen.startsWith('puzzle')) {
      return parseInt(screen.replace('puzzle', ''), 10) - 1;
    }
    return -1;
  };

  /* ===========================================
     RENDER
     =========================================== */
  const showHUD = screen !== 'intro' && screen !== 'alarm' && screen !== 'victory';
  const showNav = showHUD;
  const puzzleIdx = getPuzzleIndex();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />

      {/* === HUD (Timer + Fortschritt) === */}
      {showHUD && (
        <View style={styles.hud}>
          <Text style={[styles.timer, timerWarning && styles.timerWarn]}>
            {timerStr}
          </Text>
          <View style={styles.hudCenter}>
            <Text style={styles.hudTitle}>CODES: {currentPuzzle}/4</Text>
            <View style={styles.dots}>
              {solved.map((s, i) => (
                <View key={i} style={[styles.dot, s && styles.dotSolved]} />
              ))}
            </View>
          </View>
          <TouchableOpacity onPress={handleToggleMute} style={styles.muteBtn}>
            <Text style={styles.muteText}>{muted ? '\u2716' : '\u266B'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* === MAIN CONTENT === */}
      <View style={styles.content}>
        {screen === 'intro' && (
          <IntroScreen onAlarm={handleAlarm} />
        )}

        {screen === 'alarm' && (
          <>
            <IntroScreen onAlarm={() => {}} />
            <AlarmOverlay onDismiss={handleDismissAlarm} />
          </>
        )}

        {screen === 'terminal' && (
          <TerminalScreen
            currentPuzzle={currentPuzzle}
            solved={solved}
            onCodeCorrect={handleCodeCorrect}
          />
        )}

        {puzzleIdx >= 0 && (
          <PuzzleScreen
            puzzle={PUZZLES[puzzleIdx]}
            index={puzzleIdx}
            isSolved={solved[puzzleIdx]}
          />
        )}

        {screen === 'victory' && (
          <VictoryScreen
            elapsedTime={elapsedTime}
            onRestart={handleRestart}
          />
        )}
      </View>

      {/* === ALARM-RAHMEN (pulsierend, solange nicht alle Codes da) === */}
      {showHUD && currentPuzzle < 4 && (
        <View style={styles.alarmBorder} pointerEvents="none" />
      )}

      {/* === BOTTOM NAV === */}
      {showNav && (
        <NavBar
          current={screen}
          solved={solved}
          onNavigate={handleNavigate}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },

  // --- HUD ---
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(8,10,20,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  timer: {
    fontFamily: 'monospace',
    fontSize: 18,
    color: '#f87171',
    letterSpacing: 2,
    minWidth: 60,
  },
  timerWarn: {
    color: '#ef4444',
  },
  hudCenter: {
    alignItems: 'center',
  },
  hudTitle: {
    color: COLORS.textDim,
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    borderWidth: 1, borderColor: COLORS.textDark,
  },
  dotSolved: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  muteBtn: {
    width: 32, height: 32,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  muteText: {
    color: COLORS.textDim,
    fontSize: 14,
  },

  // --- Content ---
  content: {
    flex: 1,
  },

  // --- Alarm-Rahmen (pulsierend) ---
  alarmBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderWidth: 2,
    borderColor: 'rgba(229,62,62,0.25)',
    zIndex: 50,
  },
});
