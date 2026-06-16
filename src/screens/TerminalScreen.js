/*
 * PC-TERMINAL SCREEN — SNES pixel-art retro style
 * Code entry happens here. Visual style matches the lab aesthetic.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  ScrollView, StyleSheet, Image,
} from 'react-native';
import { COLORS } from '../config/theme';
import { PUZZLES } from '../config/puzzles';
import { Sound } from '../components/SoundManager';

const SCENE = require('../../assets/scenes/scene_01_lab_hub.png');

export default function TerminalScreen({ currentPuzzle, solved, onCodeCorrect }) {
  const [input, setInput]       = useState('');
  const [feedback, setFeedback] = useState(null); // { ok: bool, text }

  const handleSubmit = () => {
    if (!input.trim() || currentPuzzle >= 4) return;

    if (input.trim() === PUZZLES[currentPuzzle].code) {
      Sound.success();
      setFeedback({ ok: true, text: `CODE ${currentPuzzle + 1} AKZEPTIERT` });
      setInput('');
      onCodeCorrect(currentPuzzle);
    } else {
      Sound.error();
      setFeedback({ ok: false, text: 'ZUGANG VERWEIGERT' });
      setInput('');
    }
  };

  const allDone = currentPuzzle >= 4;

  return (
    <View style={styles.container}>
      {/* ── PIXEL-ART SCENE BANNER ── */}
      <View style={styles.sceneBanner}>
        <Image source={SCENE} style={styles.sceneImg} resizeMode="cover" />
        {/* scanline overlay */}
        <View style={styles.scanlines} pointerEvents="none" />
        {/* title plate */}
        <View style={styles.titlePlate}>
          <Text style={styles.titlePlateText}>SICHERHEITSTERMINAL v7</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* ── CODE STATUS PANEL ── */}
        <View style={styles.statusPanel}>
          <Text style={styles.statusHeader}>// SICHERHEITSCODES //</Text>
          <View style={styles.codeSlots}>
            {PUZZLES.map((p, i) => (
              <View key={i} style={[styles.codeSlot, solved[i] && styles.codeSlotDone]}>
                <Text style={[styles.codeSlotNum, solved[i] && styles.codeSlotNumDone]}>
                  {solved[i] ? p.code : '?'}
                </Text>
                <Text style={[styles.codeSlotLabel, solved[i] && styles.codeSlotLabelDone]}>
                  {p.navLabel.toUpperCase()}
                </Text>
                {solved[i] && <View style={styles.codeLedOn} />}
              </View>
            ))}
          </View>
        </View>

        {/* ── PHOSPHOR DISPLAY ── */}
        <View style={styles.crtDisplay}>
          <View style={styles.crtInner}>
            {allDone ? (
              <>
                <Text style={[styles.crtLine, { color: COLORS.green }]}>
                  {'>>> ALLE CODES VERIFIZIERT <<<'}
                </Text>
                <Text style={[styles.crtLine, { color: COLORS.green }]}>
                  SICHERHEITSSYSTEM DEAKTIVIERT
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.crtLine}>
                  {`[STATUS] ${currentPuzzle}/4 Codes verifiziert`}
                </Text>
                <Text style={styles.crtLine}>
                  {`[WARTE] Code ${currentPuzzle + 1}: ${PUZZLES[currentPuzzle]?.title.toUpperCase()}`}
                </Text>
              </>
            )}

            {feedback && (
              <Text style={[styles.crtLine, feedback.ok ? styles.crtOk : styles.crtErr]}>
                {`>>> ${feedback.text}`}
              </Text>
            )}
          </View>
        </View>

        {/* ── CODE ENTRY ── */}
        {!allDone && (
          <View style={styles.entryPanel}>
            <Text style={styles.entryLabel}>CODE EINGABE</Text>
            <View style={styles.entryRow}>
              <Text style={styles.promptChar}>▶</Text>
              <TextInput
                style={styles.entryInput}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSubmit}
                placeholder="_ _ _"
                placeholderTextColor="rgba(24,216,72,0.25)"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="send"
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitBtnText}>ENTER</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── HINT ── */}
        {!allDone && (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              {'Löse Rätsel im Labor → Code erscheint → hier eingeben'}
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 30 },

  // ── Scene banner ──
  sceneBanner: {
    width: '100%',
    height: 150,
    overflow: 'hidden',
    position: 'relative',
  },
  sceneImg: { width: '100%', height: '100%' },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // subtle dark vignette at bottom to blend into UI
    backgroundImage: 'linear-gradient(transparent 60%, #080810 100%)',
  },
  titlePlate: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  titlePlateText: {
    color: '#18d848',
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 3,
    backgroundColor: 'rgba(8,8,16,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 3,
  },

  // ── Code status panel ──
  statusPanel: {
    marginHorizontal: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#1e3e4e',
    padding: 10,
    backgroundColor: '#0c141e',
  },
  statusHeader: {
    color: '#3c6e7c',
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  codeSlots: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  codeSlot: {
    alignItems: 'center',
    width: 70,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#1e3e4e',
    backgroundColor: '#080810',
    position: 'relative',
  },
  codeSlotDone: {
    borderColor: '#18d848',
    backgroundColor: '#04100a',
  },
  codeSlotNum: {
    fontFamily: 'monospace',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3e4e',
    letterSpacing: 2,
  },
  codeSlotNumDone: {
    color: '#18d848',
  },
  codeSlotLabel: {
    fontFamily: 'monospace',
    fontSize: 7,
    color: '#1e3e4e',
    letterSpacing: 1,
    marginTop: 3,
  },
  codeSlotLabelDone: {
    color: '#50a010',
  },
  codeLedOn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#18d848',
  },

  // ── CRT phosphor display ──
  crtDisplay: {
    marginHorizontal: 12,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#1e3e4e',
    backgroundColor: '#020a04',
    padding: 12,
  },
  crtInner: { gap: 4 },
  crtLine: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#50a010',
    lineHeight: 18,
  },
  crtOk:  { color: '#18d848' },
  crtErr: { color: '#e53e3e' },

  // ── Code entry ──
  entryPanel: {
    marginHorizontal: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#1e3e4e',
    padding: 12,
    backgroundColor: '#020a04',
  },
  entryLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#3c6e7c',
    letterSpacing: 2,
    marginBottom: 8,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promptChar: {
    color: '#18d848',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  entryInput: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: '#18d848',
    color: '#18d848',
    fontFamily: 'monospace',
    fontSize: 20,
    paddingVertical: 6,
    letterSpacing: 6,
    textAlign: 'center',
  },
  submitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#18d848',
    backgroundColor: 'rgba(24,216,72,0.08)',
  },
  submitBtnText: {
    color: '#18d848',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // ── Hint ──
  hintBox: {
    marginHorizontal: 12,
    marginTop: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2c5462',
    backgroundColor: '#080c14',
  },
  hintText: {
    color: '#3c6e7c',
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 16,
  },
});
