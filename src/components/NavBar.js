/*
 * NAVIGATIONSLEISTE (unten fixiert)
 * 5 Pixel-Buttons: Tisch, Schrank, Destille, Tafel, Terminal
 * Zeigt geloeste Raetsel mit gruenem Punkt.
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../config/theme';

const TABS = [
  { key: 'puzzle1', label: 'Tisch',    icon: '\u2697' }, // Alembic
  { key: 'puzzle2', label: 'Schrank',  icon: '\u2696' }, // Balance
  { key: 'puzzle3', label: 'Destille', icon: '\u2B21' }, // Hexagon
  { key: 'puzzle4', label: 'Tafel',    icon: '\u25A6' }, // Grid
  { key: 'terminal', label: 'PC',      icon: '\u25FB' }, // Square
];

export default function NavBar({ current, solved, onNavigate }) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab, i) => {
        const isActive = current === tab.key;
        const isSolved = i < 4 && solved[i];
        const isLocked = i < 4 && i > 0 && !solved[i - 1] && !solved[i]
          && current !== tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              isActive && styles.tabActive,
              isLocked && styles.tabLocked,
            ]}
            onPress={() => !isLocked && onNavigate(tab.key)}
            disabled={isLocked}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.icon,
              isActive && styles.iconActive,
              isLocked && styles.iconLocked,
            ]}>
              {tab.icon}
            </Text>
            <Text style={[
              styles.label,
              isActive && styles.labelActive,
              isLocked && styles.labelLocked,
            ]}>
              {tab.label}
            </Text>
            {/* Geloest-Indikator */}
            {isSolved && <View style={styles.solvedDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.navBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 4,
    paddingTop: 4,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: COLORS.navActive,
  },
  tabLocked: {
    opacity: 0.3,
  },
  icon: {
    fontSize: 18,
    color: COLORS.textDim,
    marginBottom: 2,
  },
  iconActive: {
    color: COLORS.green,
  },
  iconLocked: {
    color: COLORS.textDark,
  },
  label: {
    fontSize: 9,
    color: COLORS.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: COLORS.green,
  },
  labelLocked: {
    color: COLORS.textDark,
  },
  solvedDot: {
    position: 'absolute',
    top: 4,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
    shadowColor: COLORS.green,
    shadowRadius: 3,
    shadowOpacity: 0.6,
  },
});
