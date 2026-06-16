/*
 * PC-TERMINAL SCREEN (Zentrale)
 * Hier werden die Codes eingegeben.
 * Retro-CRT-Look mit gruenem Phosphor-Text.
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet,
} from 'react-native';
import { LabTerminal } from '../components/PixelLab';
import { COLORS } from '../config/theme';
import { PUZZLES } from '../config/puzzles';
import { Sound } from '../components/SoundManager';

export default function TerminalScreen({ currentPuzzle, solved, onCodeCorrect }) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'ok'|'err', text }

  const handleSubmit = () => {
    if (!input.trim() || currentPuzzle >= 4) return;

    if (input.trim() === PUZZLES[currentPuzzle].code) {
      // Richtig!
      Sound.success();
      setFeedback({
        type: 'ok',
        text: `[OK] Code ${currentPuzzle + 1} akzeptiert! "${PUZZLES[currentPuzzle].title}" entsperrt.`,
      });
      setInput('');
      onCodeCorrect(currentPuzzle);
    } else {
      // Falsch
      Sound.error();
      setFeedback({
        type: 'err',
        text: '[FEHLER] Falscher Code. Zugang verweigert.',
      });
      setInput('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Labor-Szene: PC */}
      <LabTerminal />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* CRT Terminal Window */}
        <View style={styles.crt}>
          {/* Titlebar */}
          <View style={styles.titlebar}>
            <View style={[styles.dot, { backgroundColor: '#f87171' }]} />
            <View style={[styles.dot, { backgroundColor: '#fbbf24' }]} />
            <View style={[styles.dot, { backgroundColor: '#4ade80' }]} />
            <Text style={styles.titleText}>molar_security_v7.exe</Text>
          </View>

          {/* Terminal Body */}
          <View style={styles.body}>
            <Text style={styles.line}>
              <Text style={styles.prompt}>[SYSTEM]</Text> Sicherheitssystem aktiv.
            </Text>
            <Text style={styles.line}>
              <Text style={styles.err}>[ALARM]</Text> Alle Ausgaenge verriegelt.
            </Text>
            <Text style={styles.line}>
              <Text style={styles.info}>[INFO]</Text> 4 Sicherheitscodes erforderlich.
            </Text>
            <Text style={styles.line}>
              <Text style={styles.prompt}>[STATUS]</Text> Codes: {currentPuzzle}/4
            </Text>

            {/* Fortschritt */}
            <View style={styles.progressWrap}>
              {PUZZLES.map((p, i) => (
                <View key={i} style={styles.progressItem}>
                  <View style={[
                    styles.progressDot,
                    solved[i] && styles.progressDotSolved,
                  ]} />
                  <Text style={[
                    styles.progressLabel,
                    solved[i] && styles.progressLabelSolved,
                  ]}>
                    {p.navLabel}
                  </Text>
                </View>
              ))}
            </View>

            {/* Aktuelles Raetsel */}
            {currentPuzzle < 4 ? (
              <View style={styles.currentBox}>
                <Text style={styles.currentText}>
                  Aktuell: {PUZZLES[currentPuzzle].title} — {PUZZLES[currentPuzzle].subtitle}
                </Text>
              </View>
            ) : (
              <View style={[styles.currentBox, { borderLeftColor: COLORS.green }]}>
                <Text style={[styles.currentText, { color: COLORS.green }]}>
                  Alle Codes eingegeben. System deaktiviert...
                </Text>
              </View>
            )}

            {/* Eingabe */}
            {currentPuzzle < 4 && (
              <View style={styles.inputArea}>
                <Text style={styles.line}>
                  <Text style={styles.prompt}>[EINGABE]</Text> Code:
                </Text>
                <View style={styles.inputRow}>
                  <Text style={styles.promptSign}>&gt;</Text>
                  <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={handleSubmit}
                    placeholder="Code eingeben..."
                    placeholderTextColor="rgba(255,255,255,0.15)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="send"
                  />
                  <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                    <Text style={styles.submitText}>SENDEN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Feedback */}
            {feedback && (
              <View style={[
                styles.feedback,
                feedback.type === 'ok' ? styles.feedbackOk : styles.feedbackErr,
              ]}>
                <Text style={[
                  styles.feedbackText,
                  { color: feedback.type === 'ok' ? COLORS.green : '#f87171' },
                ]}>
                  {feedback.text}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 30 },

  crt: {
    backgroundColor: '#0c0f1a',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  titlebar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  titleText: {
    color: COLORS.textDark,
    fontSize: 9,
    fontFamily: 'monospace',
    marginLeft: 6,
  },
  body: {
    padding: 14,
  },
  line: {
    color: COLORS.textDim,
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 18,
    marginBottom: 4,
  },
  prompt: { color: COLORS.amber },
  err: { color: '#f87171' },
  info: { color: '#60a5fa' },

  progressWrap: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressDot: {
    width: 8, height: 8, borderRadius: 4,
    borderWidth: 1, borderColor: COLORS.textDark,
  },
  progressDotSolved: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  progressLabel: {
    color: COLORS.textDark,
    fontSize: 9,
    fontFamily: 'monospace',
  },
  progressLabelSolved: {
    color: COLORS.green,
  },

  currentBox: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.amber,
    paddingLeft: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 4,
    marginBottom: 12,
  },
  currentText: {
    color: COLORS.textDim,
    fontSize: 11,
    fontFamily: 'monospace',
  },

  inputArea: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  promptSign: {
    color: COLORS.amber,
    fontFamily: 'monospace',
    fontSize: 16,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    color: COLORS.text,
    fontFamily: 'monospace',
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  submitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  submitText: {
    color: COLORS.text,
    fontFamily: 'monospace',
    fontSize: 11,
  },

  feedback: {
    marginTop: 10,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
  },
  feedbackOk: {
    backgroundColor: 'rgba(74,222,128,0.06)',
    borderColor: 'rgba(74,222,128,0.2)',
  },
  feedbackErr: {
    backgroundColor: 'rgba(248,113,113,0.06)',
    borderColor: 'rgba(248,113,113,0.2)',
  },
  feedbackText: {
    fontFamily: 'monospace',
    fontSize: 11,
  },
});
