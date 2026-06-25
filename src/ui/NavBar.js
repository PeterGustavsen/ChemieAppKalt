/*
 * NavBar — untere Navigationsleiste des Hubs im Stil einer minimalistischen
 * Handy-App-Tableiste: NUR Icons, keine Labels. Reise über diese Leiste zu den
 * 6 Stationen und zum Terminal. Reine RN-UI (auflösungsunabhängig, volle Breite).
 *
 * Status je Station (nur über Farbe/Animation, keine Beschriftung):
 *   gelöst   → grün
 *   aktiv    → Akzentfarbe der Station + BLINKEN (die Station, die man jetzt lösen muss)
 *   gesperrt → grau (noch nicht dran; Antippen zeigt Molars Hinweis via onPick)
 */
import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, Pressable, StyleSheet } from 'react-native';
import { Canvas, Group, Path, Skia } from '@shopify/react-native-skia';

const SOLVED = '#6fe87a';
const LOCKED = '#4a5568';

// Minimalistische Linien-Icons, gezeichnet in einem 24×24-Raster (SVG-Pfade).
// Reihenfolge = ROOMS (Stationen 1–6). Letztes Icon = Terminal.
const STATION_ICONS = [
  'M14 2 L6 13 H11 L10 22 L18 10 H13 Z',                                          // 1 Galvanische Zelle — Blitz/Spannung
  'M12 2 L20 5 V11 C20 16 16 20 12 22 C8 20 4 16 4 11 V5 Z',                       // 2 Opferanode — Schutzschild
  'M12 2 C12 2 5 11 5 15 C5 19 8 22 12 22 C16 22 19 19 19 15 C19 11 12 2 12 2 Z', // 3 Rosten — Feuchtigkeitstropfen
  'M12 2 L21 7 V17 L12 22 L3 17 V7 Z M8 9 V15',                                    // 4 Elektrophile Addition — Ringmolekül
  'M9 2 H15 M10 2 V16 C10 19 14 19 14 16 V2 M10 11 H14',                          // 5 Bromwasser-Test — Reagenzglas
  'M5 10 H19 M5 14 H19 M5 10 L2 6 M19 14 L22 18',                                  // 6 Isomerie — C=C-Doppelbindung
];
const TERMINAL_ICON = 'M3 5 H21 V16 H3 Z M9 20 H15 M12 16 V20';                    // Monitor/Konsole

const FILLED = { 0: true };   // der Blitz wirkt gefüllt am besten

const ICON_BOX = 26;
const S = ICON_BOX / 24;

function Glyph({ d, color, fill }) {
  const path = useMemo(() => Skia.Path.MakeFromSVGString(d), [d]);
  if (!path) return null;
  return (
    <Canvas style={{ width: ICON_BOX, height: ICON_BOX }}>
      <Group transform={[{ scale: S }]}>
        <Path
          path={path}
          color={color}
          style={fill ? 'fill' : 'stroke'}
          strokeWidth={2}
          strokeCap="round"
          strokeJoin="round"
        />
      </Group>
    </Canvas>
  );
}

function NavCell({ d, color, fill, blink, onPress }) {
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!blink) { op.setValue(1); return; }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(op, { toValue: 0.2, duration: 520, useNativeDriver: true }),
        Animated.timing(op, { toValue: 1, duration: 520, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [blink, op]);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.cell, pressed && styles.pressed]}>
      <Animated.View style={{ opacity: op }}>
        <Glyph d={d} color={color} fill={fill} />
      </Animated.View>
    </Pressable>
  );
}

export default function NavBar({ rooms, solvedIds, target, onPick, onTerminal }) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.bar}>
        {rooms.map((r, i) => {
          const solved = solvedIds.includes(r.id);
          const active = !!target && r.id === target.id;
          const color = solved ? SOLVED : active ? r.accent : LOCKED;
          return (
            <NavCell
              key={r.key}
              d={STATION_ICONS[i]}
              color={color}
              fill={!!FILLED[i]}
              blink={active}
              onPress={() => onPick(r)}
            />
          );
        })}

        <View style={styles.sep} />

        <NavCell d={TERMINAL_ICON} color={SOLVED} onPress={onTerminal} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingHorizontal: 14, paddingTop: 6, paddingBottom: 8,
    backgroundColor: 'rgba(8,12,20,0.82)',
    borderTopWidth: 1, borderColor: '#2d3748',
    width: '100%',
  },
  cell: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6, paddingVertical: 2,
  },
  pressed: { opacity: 0.55 },
  sep: { width: 1, height: 22, backgroundColor: '#2d3748', marginHorizontal: 2 },
});
