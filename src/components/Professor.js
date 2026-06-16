/*
 * PROFESSOR PIXEL-ART SPRITE
 * Gebaut aus React Native Views (Pixel-Bloecke).
 * Weisser Kittel, Schutzbrille, wirres graues Haar.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, PX } from '../config/theme';

const P = PX; // Pixel-Einheit

export default function Professor({ scale = 1 }) {
  const s = scale;
  return (
    <View style={[styles.wrap, { transform: [{ scale: s }] }]}>
      {/* Haare (wild, ueber dem Kopf) */}
      <View style={styles.hair}>
        <View style={[styles.hairTuft, { left: -2*P, top: -3*P, transform: [{ rotate: '-20deg' }] }]} />
        <View style={[styles.hairTuft, { right: -2*P, top: -3*P, transform: [{ rotate: '20deg' }] }]} />
        <View style={[styles.hairTuft, { left: 3*P, top: -4*P, transform: [{ rotate: '-5deg' }] }]} />
      </View>

      {/* Kopf */}
      <View style={styles.head}>
        {/* Brille */}
        <View style={styles.glasses}>
          <View style={styles.lens} />
          <View style={styles.bridge} />
          <View style={styles.lens} />
        </View>
        {/* Augen (hinter Brille) */}
        <View style={styles.eyes}>
          <View style={styles.eye} />
          <View style={styles.eye} />
        </View>
        {/* Mund */}
        <View style={styles.mouth} />
      </View>

      {/* Koerper / Laborkittel */}
      <View style={styles.coat}>
        <View style={styles.coatLine} />
        {/* Brusttasche */}
        <View style={styles.pocket} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 28*PX,
    height: 48*PX,
    alignItems: 'center',
  },

  // --- Haare ---
  hair: {
    width: 16*P,
    height: 7*P,
    backgroundColor: COLORS.hair,
    borderTopLeftRadius: 6*P,
    borderTopRightRadius: 6*P,
    position: 'relative',
  },
  hairTuft: {
    position: 'absolute',
    width: 5*P,
    height: 6*P,
    backgroundColor: COLORS.hair,
    borderRadius: 2*P,
  },

  // --- Kopf ---
  head: {
    width: 14*P,
    height: 14*P,
    backgroundColor: COLORS.skin,
    borderRadius: 3*P,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -1*P,
  },
  glasses: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1*P,
  },
  lens: {
    width: 5*P,
    height: 4*P,
    borderWidth: 1*P,
    borderColor: COLORS.glasses,
    borderRadius: 2*P,
    backgroundColor: 'rgba(66,153,225,0.15)',
  },
  bridge: {
    width: 2*P,
    height: 1*P,
    backgroundColor: COLORS.glasses,
  },
  eyes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 10*P,
    marginTop: -3*P,
  },
  eye: {
    width: 2*P,
    height: 2*P,
    backgroundColor: '#1a202c',
    borderRadius: 1*P,
  },
  mouth: {
    width: 4*P,
    height: 1*P,
    backgroundColor: '#a06040',
    borderRadius: 1*P,
    marginTop: 2*P,
  },

  // --- Laborkittel ---
  coat: {
    width: 18*P,
    height: 22*P,
    backgroundColor: COLORS.coat,
    borderRadius: 2*P,
    marginTop: 1*P,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e0',
  },
  coatLine: {
    width: 1,
    height: 16*P,
    backgroundColor: '#cbd5e0',
    marginTop: 2*P,
  },
  pocket: {
    position: 'absolute',
    top: 3*P,
    right: 2*P,
    width: 4*P,
    height: 3*P,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 1,
  },
});
