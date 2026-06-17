/*
 * SZENE 1 — Molars Labor (interaktiver Hub).
 * Skia-Canvas (Hintergrund, animierter Molar, Tuer-LEDs, Hover/Klick-Glow)
 * + RN-Pressable-Hotspots + Dialog + Terminal.
 *
 * Interaktion:
 *   - Molar (Idle-Loop) begruesst per Dialog.
 *   - Tuer antippen: offene/aktuelle Kammer -> betreten; verriegelte -> Hinweis.
 *   - Terminal antippen: Code-Eingabe (Fortschritts-Mechanik).
 *   - Hotspots zeigen Press-Glow + "untersuchen"-Text.
 */
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Canvas, Image as SkImage, useImage, Group, rect, Rect,
  FilterMode, MipmapMode,
} from '@shopify/react-native-skia';

import AnimatedSprite from '../engine/AnimatedSprite';
import { useStageLayout } from '../engine/layout';
import { useSpriteFrame } from '../engine/useSprite';
import PixelDialog from '../ui/PixelDialog';
import Terminal from '../ui/Terminal';
import { ROOMS, TERMINAL, TERMINAL_SCREEN, INTRO_DIALOG, SCENE_W, SCENE_H } from '../config/game';

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None };
const MOLAR = { x: 70, y: 188, frameW: 72, frameH: 112, scale: 1.45, frames: 8 };

export default function Scene1Hub({ solvedIds, onSubmitCode, onEnterRoom }) {
  const L = useStageLayout();
  const bg = useImage(require('../../assets/scenes/scene_01_lab_hub.png'));
  const molar = useImage(require('../../assets/sprites/molar_idle.png'));

  const [dialog, setDialog] = useState({ speaker: 'Prof. Dr. Molar', lines: INTRO_DIALOG });
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [pressed, setPressed] = useState(null);
  const blink = useSpriteFrame(2, 1.6); // Attract-Blink fuer die aktuelle Kammer

  const target = ROOMS.find((r) => !solvedIds.includes(r.id)) || null;
  const busy = !!dialog || terminalOpen;

  const ledColor = (room) => {
    if (solvedIds.includes(room.id)) return '#6fe87a';      // geloest
    if (target && room.id === target.id) return '#f0b23a';  // offen / aktuell
    return '#ad3535';                                       // verriegelt
  };

  const onDoor = (room) => {
    if (solvedIds.includes(room.id)) {
      setDialog({ speaker: 'Prof. Dr. Molar', lines: ['Diese Kammer ist bereits geloest. Gut gemacht!'] });
    } else if (target && room.id === target.id) {
      onEnterRoom(room);
    } else {
      const need = target ? target.id : '?';
      setDialog({
        speaker: 'Prof. Dr. Molar',
        lines: [room.examine, `Noch verriegelt — loese zuerst Kammer ${need}.`],
      });
    }
  };

  return (
    <View style={styles.root}>
      <Canvas style={{ flex: 1 }}>
        <Group transform={[{ translateX: L.offsetX }, { translateY: L.offsetY }, { scale: L.scale }]}>
          {bg && (
            <SkImage image={bg} x={0} y={0} width={SCENE_W} height={SCENE_H} fit="fill" sampling={NEAREST} />
          )}

          {/* animierter Professor */}
          <AnimatedSprite
            image={molar} frameCount={MOLAR.frames} frameW={MOLAR.frameW} frameH={MOLAR.frameH}
            x={MOLAR.x} y={MOLAR.y} scale={MOLAR.scale} fps={7}
          />

          {/* Tuer-Status-LEDs (ueber dem gemalten Sockel) */}
          {ROOMS.map((r) => (
            <Group key={`led-${r.id}`}>
              <Rect x={r.rect.x + 10} y={r.rect.y + r.rect.h - 14} width={8} height={8} color={ledColor(r)} />
              <Rect x={r.rect.x + 10} y={r.rect.y + r.rect.h - 14} width={3} height={3} color="#ffffff" />
            </Group>
          ))}

          {/* Glow: aktuelle Kammer blinkt dezent; gedrueckter Hotspot leuchtet */}
          {!busy && target && blink === 0 && (
            <Rect x={target.rect.x - 1} y={target.rect.y - 1} width={target.rect.w + 2} height={target.rect.h + 2}
              color="#f0b23a" style="stroke" strokeWidth={2} />
          )}
          {!busy && pressed && (
            <PressGlow rectObj={pressed.rect} color={pressed.color} />
          )}
        </Group>
      </Canvas>

      {/* CRT-Screen-Text (idle) */}
      {!terminalOpen && (
        <View pointerEvents="none" style={[styles.screen, L.toScreen(TERMINAL_SCREEN)]}>
          <Text style={styles.screenTitle}>SICHERHEITS-</Text>
          <Text style={styles.screenTitle}>TERMINAL v7</Text>
          <Text style={styles.screenCodes}>CODES {solvedIds.length}/4</Text>
          <Text style={styles.screenHint}>{'>'} TIPPEN</Text>
        </View>
      )}

      {/* Hotspots (nur wenn nichts offen) */}
      {!busy && (
        <>
          <Hotspot layout={L} rectObj={TERMINAL} color="#6fe87a"
            onIn={() => setPressed({ rect: TERMINAL, color: '#6fe87a' })}
            onOut={() => setPressed(null)}
            onPress={() => setTerminalOpen(true)} />
          {ROOMS.map((r) => (
            <Hotspot key={r.key} layout={L} rectObj={r.rect} color={r.accent}
              onIn={() => setPressed({ rect: r.rect, color: r.accent })}
              onOut={() => setPressed(null)}
              onPress={() => onDoor(r)} />
          ))}
        </>
      )}

      {/* Dialog */}
      {dialog && (
        <PixelDialog speaker={dialog.speaker} lines={dialog.lines} onClose={() => setDialog(null)} />
      )}

      {/* Terminal */}
      {terminalOpen && (
        <Terminal
          rooms={ROOMS}
          solvedIds={solvedIds}
          onSubmit={onSubmitCode}
          onClose={() => setTerminalOpen(false)}
        />
      )}
    </View>
  );
}

function PressGlow({ rectObj, color }) {
  return (
    <Group>
      <Rect x={rectObj.x - 2} y={rectObj.y - 2} width={rectObj.w + 4} height={rectObj.h + 4}
        color={color} style="stroke" strokeWidth={3} opacity={0.5} />
      <Rect x={rectObj.x} y={rectObj.y} width={rectObj.w} height={rectObj.h}
        color={color} style="stroke" strokeWidth={1.5} />
    </Group>
  );
}

function Hotspot({ layout, rectObj, color, onIn, onOut, onPress }) {
  const s = layout.toScreen(rectObj);
  return (
    <Pressable
      style={[styles.hotspot, { left: s.left, top: s.top, width: s.width, height: s.height }]}
      onPressIn={onIn}
      onPressOut={onOut}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d0f17' },
  hotspot: { position: 'absolute' },
  screen: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { color: '#6fe87a', fontFamily: 'monospace', fontSize: 9, letterSpacing: 1 },
  screenCodes: { color: '#6fe87a', fontFamily: 'monospace', fontSize: 11, marginTop: 6, fontWeight: 'bold' },
  screenHint: { color: '#2f8f3a', fontFamily: 'monospace', fontSize: 9, marginTop: 8 },
});
