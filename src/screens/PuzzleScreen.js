/*
 * WIEDERVERWENDBARER RAETSEL-SCREEN
 * Wird fuer alle 4 Raetsel verwendet.
 * Erhaelt Puzzle-Config als Props.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { LabBench, LabCabinet, LabDistill, LabBoard } from '../components/PixelLab';
import { COLORS } from '../config/theme';

// Welche Labor-Szene fuer welches Raetsel
const LAB_SCENES = [LabBench, LabCabinet, LabDistill, LabBoard];

export default function PuzzleScreen({ puzzle, index, isSolved }) {
  const [hintLevel, setHintLevel] = useState(0);
  const LabScene = LAB_SCENES[index] || LabBench;

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bgDark }]}>
      {/* Pixel-Art Labor-Szene oben */}
      <LabScene />

      {/* Raetsel-Inhalt */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.num, { color: puzzle.accent }]}>
            RAETSEL {puzzle.id} VON 4
          </Text>
          <Text style={[styles.title, { color: puzzle.accent }]}>
            {puzzle.title.toUpperCase()} — {puzzle.subtitle.toUpperCase()}
          </Text>
        </View>

        {/* Karte */}
        <View style={[styles.card, { borderColor: puzzle.accentDim }]}>
          {/* Story */}
          <Text style={styles.story}>{puzzle.story}</Text>

          {/* Aufgabe */}
          <Text style={styles.task}>{puzzle.task}</Text>

          {/* Formel */}
          <View style={[styles.formulaBox, { borderColor: puzzle.accentDim }]}>
            <Text style={[styles.formula, { color: puzzle.accent }]}>
              {puzzle.formula}
            </Text>
          </View>

          {/* Geloest? */}
          {isSolved && (
            <View style={[styles.solvedBanner, { borderColor: puzzle.accent }]}>
              <Text style={[styles.solvedText, { color: puzzle.accent }]}>
                CODE GEFUNDEN — gib ihn am PC-Terminal ein!
              </Text>
            </View>
          )}
        </View>

        {/* Hinweise */}
        {!isSolved && (
          <View style={styles.hintArea}>
            {hintLevel < puzzle.hints.length && (
              <TouchableOpacity
                style={[styles.hintBtn, { borderColor: puzzle.accentDim }]}
                onPress={() => setHintLevel(hintLevel + 1)}
              >
                <Text style={[styles.hintBtnText, { color: puzzle.accent }]}>
                  Hinweis {hintLevel + 1}/{puzzle.hints.length}
                </Text>
              </TouchableOpacity>
            )}
            {puzzle.hints.slice(0, hintLevel).map((hint, i) => (
              <View
                key={i}
                style={[styles.hintBox, { borderLeftColor: puzzle.accent }]}
              >
                <Text style={styles.hintText}>{hint}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  num: {
    fontSize: 9,
    letterSpacing: 3,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  story: {
    color: COLORS.textDim,
    fontSize: 12,
    lineHeight: 19,
    fontStyle: 'italic',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  task: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 14,
  },
  formulaBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  formula: {
    fontFamily: 'monospace',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  solvedBanner: {
    marginTop: 14,
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(72,187,120,0.08)',
    alignItems: 'center',
  },
  solvedText: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hintArea: {
    marginTop: 16,
  },
  hintBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 10,
  },
  hintBtnText: {
    fontSize: 10,
  },
  hintBox: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 4,
  },
  hintText: {
    color: COLORS.textDim,
    fontSize: 12,
    lineHeight: 18,
  },
});
