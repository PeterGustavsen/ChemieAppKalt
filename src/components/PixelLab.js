/*
 * PIXEL-ART LABOR-HINTERGRUENDE
 * Jeder Bereich hat eine eigene Labor-Szene.
 * Gebaut aus View-Bloecken im Pixel-Stil.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, PX } from '../config/theme';

const P = PX;

/* --- Gemeinsamer Fliesenboden --- */
function Floor() {
  const tiles = [];
  for (let i = 0; i < 20; i++) {
    tiles.push(
      <View
        key={i}
        style={[
          styles.tile,
          i % 2 === 0 ? styles.tileA : styles.tileB,
        ]}
      />
    );
  }
  return <View style={styles.floor}>{tiles}</View>;
}

/* --- Gemeinsame Deckenlampe --- */
function Lamp() {
  return (
    <View style={styles.lamp}>
      <View style={styles.lampRod} />
      <View style={styles.lampHead} />
      <View style={styles.lampGlow} />
    </View>
  );
}

/* === ARBEITSTISCH (Raetsel 1) === */
export function LabBench() {
  return (
    <View style={styles.scene}>
      <Lamp />
      {/* Laborbank */}
      <View style={styles.bench}>
        {/* Bunsenbrenner */}
        <View style={styles.bunsen}>
          <View style={styles.bunsenBase} />
          <View style={styles.bunsenTube} />
          <View style={styles.flame} />
        </View>
        {/* Reagenzglaeser */}
        <View style={styles.tubeRack}>
          <View style={[styles.tube, { backgroundColor: COLORS.green }]} />
          <View style={[styles.tube, { backgroundColor: COLORS.blue }]} />
          <View style={[styles.tube, { backgroundColor: COLORS.amber }]} />
        </View>
        {/* Becherglas */}
        <View style={styles.beaker}>
          <View style={styles.beakerLiquid} />
        </View>
      </View>
      <Floor />
    </View>
  );
}

/* === CHEMIKALIENSCHRANK (Raetsel 2) === */
export function LabCabinet() {
  return (
    <View style={styles.scene}>
      <Lamp />
      {/* Schrank */}
      <View style={styles.cabinet}>
        {/* Oberes Regal */}
        <View style={styles.shelf}>
          <View style={[styles.bottle, { backgroundColor: '#9b59b6' }]} />
          <View style={[styles.bottle, { backgroundColor: COLORS.amber }]} />
          <View style={[styles.bottle, { backgroundColor: COLORS.green }]} />
        </View>
        {/* Unteres Regal */}
        <View style={styles.shelf}>
          <View style={[styles.bottle, { backgroundColor: COLORS.blue }]} />
          <View style={[styles.bottle, { backgroundColor: COLORS.red }]} />
          <View style={[styles.bottle, { backgroundColor: '#48bb78' }]} />
        </View>
      </View>
      {/* Warntafel */}
      <View style={styles.warnSign} />
      <Floor />
    </View>
  );
}

/* === DESTILLATION (Raetsel 3) === */
export function LabDistill() {
  return (
    <View style={styles.scene}>
      <Lamp />
      {/* Rundkolben */}
      <View style={styles.distillSetup}>
        <View style={styles.roundFlask}>
          <View style={styles.roundFlaskLiquid} />
        </View>
        {/* Verbindungsrohr */}
        <View style={styles.condenser} />
        {/* Auffanggefaess */}
        <View style={styles.collector}>
          <View style={styles.collectorLiquid} />
        </View>
      </View>
      {/* Heizplatte */}
      <View style={styles.hotplate}>
        <View style={styles.hotplateGlow} />
      </View>
      <Floor />
    </View>
  );
}

/* === PSE-WAND / TAFEL (Raetsel 4) === */
export function LabBoard() {
  return (
    <View style={styles.scene}>
      <Lamp />
      {/* Tafel */}
      <View style={styles.board}>
        {/* PSE-Grid (vereinfacht) */}
        <View style={styles.pseGrid}>
          {[...Array(18)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.pseCell,
                i % 3 === 0 && { backgroundColor: 'rgba(72,187,120,0.3)' },
                i % 5 === 0 && { backgroundColor: 'rgba(66,153,225,0.3)' },
              ]}
            />
          ))}
        </View>
      </View>
      {/* Kreide */}
      <View style={styles.chalk} />
      <Floor />
    </View>
  );
}

/* === PC TERMINAL === */
export function LabTerminal() {
  return (
    <View style={styles.scene}>
      <Lamp />
      {/* Schreibtisch */}
      <View style={styles.desk}>
        {/* CRT Monitor */}
        <View style={styles.monitor}>
          <View style={styles.monitorScreen} />
          <View style={styles.monitorStand} />
        </View>
        {/* Tastatur */}
        <View style={styles.keyboard}>
          {[...Array(10)].map((_, i) => (
            <View key={i} style={styles.key} />
          ))}
        </View>
      </View>
      <Floor />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.bg,
    overflow: 'hidden',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  // Boden
  floor: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 24,
    flexDirection: 'row',
    backgroundColor: COLORS.floor,
  },
  tile: { width: 24, height: 24, borderWidth: 1 },
  tileA: { backgroundColor: COLORS.floor, borderColor: COLORS.floorLine },
  tileB: { backgroundColor: '#253545', borderColor: COLORS.floorLine },

  // Lampe
  lamp: { position: 'absolute', top: 0, left: '50%', marginLeft: -8, alignItems: 'center' },
  lampRod: { width: 2, height: 12, backgroundColor: COLORS.steelDark },
  lampHead: { width: 20, height: 6, backgroundColor: COLORS.steel, borderRadius: 2 },
  lampGlow: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(250,240,137,0.06)',
    marginTop: -15,
  },

  // --- Arbeitstisch ---
  bench: {
    position: 'absolute', bottom: 24, left: 20, right: 20,
    height: 50, backgroundColor: COLORS.steel,
    borderTopLeftRadius: 2, borderTopRightRadius: 2,
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingBottom: 4, gap: 12,
    borderTopWidth: 2, borderTopColor: COLORS.steelLight,
  },
  bunsen: { alignItems: 'center', width: 20 },
  bunsenBase: { width: 16, height: 6, backgroundColor: COLORS.steelDark, borderRadius: 1 },
  bunsenTube: { width: 4, height: 20, backgroundColor: COLORS.steelDark },
  flame: {
    width: 8, height: 12, backgroundColor: '#4299e1',
    borderRadius: 4, marginTop: -2,
    shadowColor: '#4299e1', shadowRadius: 6, shadowOpacity: 0.5,
  },
  tubeRack: { flexDirection: 'row', gap: 3, alignItems: 'flex-end' },
  tube: { width: 4, height: 22, borderRadius: 2 },
  beaker: {
    width: 20, height: 18,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
    borderTopWidth: 0, borderBottomLeftRadius: 3, borderBottomRightRadius: 3,
  },
  beakerLiquid: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 10, backgroundColor: 'rgba(72,187,120,0.4)',
    borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
  },

  // --- Schrank ---
  cabinet: {
    position: 'absolute', bottom: 24, left: 30, right: 30,
    height: 90, backgroundColor: COLORS.steelDark,
    borderWidth: 2, borderColor: COLORS.steel,
    padding: 6, justifyContent: 'space-around',
  },
  shelf: {
    flexDirection: 'row', gap: 8, justifyContent: 'center',
    borderBottomWidth: 2, borderBottomColor: COLORS.steel,
    paddingBottom: 4, alignItems: 'flex-end',
  },
  bottle: {
    width: 10, height: 22, borderRadius: 2,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  warnSign: {
    position: 'absolute', top: 10, right: 20,
    width: 16, height: 16, backgroundColor: COLORS.amber,
    transform: [{ rotate: '45deg' }],
  },

  // --- Destillation ---
  distillSetup: {
    position: 'absolute', bottom: 54, left: 40,
    flexDirection: 'row', alignItems: 'flex-end', gap: 4,
  },
  roundFlask: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  roundFlaskLiquid: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 14, backgroundColor: 'rgba(66,153,225,0.3)',
  },
  condenser: {
    width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 12,
  },
  collector: {
    width: 18, height: 16,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
    borderTopWidth: 0, overflow: 'hidden',
  },
  collectorLiquid: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 8, backgroundColor: 'rgba(72,187,120,0.3)',
  },
  hotplate: {
    position: 'absolute', bottom: 24, left: 36,
    width: 36, height: 8, backgroundColor: COLORS.steelDark,
    alignItems: 'center',
  },
  hotplateGlow: {
    width: 28, height: 3, backgroundColor: '#e53e3e',
    borderRadius: 1, marginTop: 2,
    shadowColor: '#e53e3e', shadowRadius: 4, shadowOpacity: 0.6,
  },

  // --- Tafel ---
  board: {
    position: 'absolute', top: 20, left: 30, right: 30,
    height: 80, backgroundColor: '#1a3a2a',
    borderWidth: 3, borderColor: '#8B7355',
    padding: 6,
  },
  pseGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 2,
  },
  pseCell: {
    width: 12, height: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  chalk: {
    position: 'absolute', bottom: 30, right: 40,
    width: 20, height: 4, backgroundColor: '#f7fafc',
    borderRadius: 2,
  },

  // --- PC Terminal ---
  desk: {
    position: 'absolute', bottom: 24, left: 30, right: 30,
    height: 40, backgroundColor: COLORS.steelDark,
    alignItems: 'center', justifyContent: 'flex-start',
    paddingTop: -50,
  },
  monitor: {
    alignItems: 'center',
    position: 'absolute', bottom: 40,
  },
  monitorScreen: {
    width: 60, height: 45,
    backgroundColor: '#0a1a0a',
    borderWidth: 3, borderColor: COLORS.steel,
    borderRadius: 3,
  },
  monitorStand: {
    width: 12, height: 8, backgroundColor: COLORS.steel,
  },
  keyboard: {
    position: 'absolute', bottom: 4,
    flexDirection: 'row', gap: 2,
  },
  key: {
    width: 6, height: 5,
    backgroundColor: COLORS.steel,
    borderWidth: 1, borderColor: COLORS.steelLight,
  },
});
