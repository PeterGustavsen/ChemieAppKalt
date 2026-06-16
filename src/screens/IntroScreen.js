/*
 * INTRO SCREEN
 * Professor erscheint und spricht den Spieler an.
 * Nach dem letzten Dialog: Alarm ausloesen.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Professor from '../components/Professor';
import DialogBox from '../components/DialogBox';
import { COLORS } from '../config/theme';
import { DIALOG_LINES } from '../config/puzzles';

export default function IntroScreen({ onAlarm }) {
  const [lineIdx, setLineIdx] = useState(0);

  const handleNext = () => {
    if (lineIdx < DIALOG_LINES.length - 1) {
      setLineIdx(lineIdx + 1);
    } else {
      // Letzter Dialog fertig -> Alarm
      onAlarm();
    }
  };

  const isNarration = lineIdx === DIALOG_LINES.length - 1;

  return (
    <View style={styles.container}>
      {/* Labor-Hintergrund (vereinfacht) */}
      <View style={styles.labBg}>
        <View style={styles.wall} />
        <View style={styles.floorStrip} />
      </View>

      {/* Professor Sprite */}
      <View style={styles.profWrap}>
        <Professor scale={1.2} />
      </View>

      {/* Titel */}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>CHEMISCHER ESCAPE ROOM</Text>
        <Text style={styles.subtitle}>Prof. Dr. Molars Labor</Text>
      </View>

      {/* Dialogbox */}
      <View style={styles.dialogWrap}>
        <DialogBox
          text={DIALOG_LINES[lineIdx]}
          speaker={isNarration ? null : 'Prof. Dr. Molar'}
          onNext={handleNext}
          isLast={lineIdx === DIALOG_LINES.length - 1}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'flex-end',
  },
  labBg: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  wall: {
    flex: 3,
    backgroundColor: COLORS.bg,
  },
  floorStrip: {
    flex: 1,
    backgroundColor: COLORS.floor,
    borderTopWidth: 2,
    borderTopColor: COLORS.steelDark,
  },
  profWrap: {
    position: 'absolute',
    bottom: '35%',
    alignSelf: 'center',
  },
  titleWrap: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.textDim,
    fontSize: 14,
    letterSpacing: 3,
    fontWeight: 'bold',
  },
  subtitle: {
    color: COLORS.textDark,
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 1,
  },
  dialogWrap: {
    marginBottom: 40,
  },
});
