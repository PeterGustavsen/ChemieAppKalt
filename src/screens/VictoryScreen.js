/*
 * VICTORY SCREEN
 * Wird angezeigt wenn alle 4 Codes eingegeben sind.
 * Zeigt Spielzeit + Nachricht vom Professor.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Professor from '../components/Professor';
import { COLORS } from '../config/theme';

export default function VictoryScreen({ elapsedTime, onRestart }) {
  const min = Math.floor(elapsedTime / 60);
  const sec = elapsedTime % 60;
  const timeStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Professor scale={1} />

      <Text style={styles.title}>ENTKOMMEN!</Text>
      <Text style={styles.time}>
        Benoetigte Zeit: <Text style={styles.timeVal}>{timeStr}</Text>
      </Text>

      {/* Nachricht vom Professor */}
      <View style={styles.msgBox}>
        <Text style={styles.speaker}>Nachricht von Prof. Dr. Molar:</Text>

        <Text style={styles.msg}>
          "Beeindruckend. Du hast mein Sicherheitssystem ueberwunden.
          Vier Codes. In dieser Zeit. Hm."
        </Text>
        <Text style={styles.msg}>
          "Entweder bist du kein Spion... oder ein sehr, sehr guter."
        </Text>
        <Text style={styles.msg}>
          "Ich werde dich im Auge behalten."
        </Text>
        <Text style={styles.ps}>
          P.S.: Die Raetsel waren absichtlich zu leicht. Die echten
          befinden sich auf einem separaten Server. Den Zugangscode
          dafuer... nun ja, den verrate ich vielleicht ein anderes Mal.
          {'\n'}— E.M.
        </Text>
      </View>

      <TouchableOpacity style={styles.restartBtn} onPress={onRestart}>
        <Text style={styles.restartText}>NOCHMAL SPIELEN</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    color: COLORS.green,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginTop: 20,
    marginBottom: 8,
  },
  time: {
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 24,
  },
  timeVal: {
    color: '#60a5fa',
    fontWeight: 'bold',
  },
  msgBox: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 18,
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  speaker: {
    color: COLORS.amber,
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 10,
  },
  msg: {
    color: COLORS.textDim,
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 10,
  },
  ps: {
    color: COLORS.amber,
    fontSize: 11,
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 6,
  },
  restartBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
  },
  restartText: {
    color: COLORS.text,
    fontSize: 12,
    letterSpacing: 1,
  },
});
