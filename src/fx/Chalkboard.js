/*
 * CHALKBOARD
 * In-world slate board with a wooden frame + chalk tray, used by the
 * board-text puzzle scenes so the task text reads as something hanging on the
 * lab wall rather than a floating UI modal. Purely presentational.
 *
 *   <Chalkboard accent={room.accent}>
 *     <Text>…task text…</Text>
 *   </Chalkboard>
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Chalkboard({ accent = '#6fe87a', children, style }) {
  return (
    <View style={[styles.frame, style]}>
      {/* mount screws */}
      <View style={[styles.screw, styles.screwL]} />
      <View style={[styles.screw, styles.screwR]} />

      <View style={[styles.slate, { borderColor: accent }]}>
        {children}
      </View>

      {/* chalk tray ledge */}
      <View style={styles.tray}>
        <View style={[styles.chalk, { backgroundColor: accent }]} />
        <View style={styles.chalk} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#4a3925',          // wood
    paddingTop: 12, paddingHorizontal: 10, paddingBottom: 4,
    borderRadius: 4,
    borderWidth: 2, borderColor: '#2e2418',
    alignItems: 'center',
    maxWidth: 460,
    // soft drop shadow so it sits "off the wall"
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  slate: {
    backgroundColor: '#15231b',          // dark green slate
    borderWidth: 1,
    paddingVertical: 16, paddingHorizontal: 18,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  tray: {
    flexDirection: 'row', gap: 10,
    alignSelf: 'stretch', justifyContent: 'center',
    backgroundColor: '#6d553b',
    height: 8, marginTop: 4, borderRadius: 2,
    alignItems: 'center',
  },
  chalk: {
    width: 26, height: 3, borderRadius: 2, backgroundColor: '#e6e0d4',
    marginTop: -2,
  },
  screw: {
    position: 'absolute', top: 4, width: 6, height: 6, borderRadius: 3,
    zIndex: 2,
  },
  screwL: { left: 6, backgroundColor: '#8a7a63' },
  screwR: { right: 6, backgroundColor: '#8a7a63' },
});
