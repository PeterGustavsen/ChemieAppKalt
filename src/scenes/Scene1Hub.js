import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Canvas, Image as SkImage, Group, Rect, RadialGradient,
  FilterMode, MipmapMode,
} from '@shopify/react-native-skia';

import AnimatedSprite from '../engine/AnimatedSprite';
import { usePixelImage } from '../engine/usePixelImage';
import { useStageLayout } from '../engine/layout';
import { useSpriteFrame } from '../engine/useSprite';
import PixelDialog from '../ui/PixelDialog';
import Terminal from '../ui/Terminal';
import {
  ROOMS, TERMINAL, TERMINAL_SCREEN,
  INTRO_DIALOG, FAREWELL_DIALOG,
  SCENE_W, SCENE_H,
} from '../config/game';

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None };
const MOLAR = { x: 60, y: 148, frameW: 72, frameH: 112, scale: 2.0, frames: 8 };
const LAMP_MAIN = { x: SCENE_W / 2, y: 8 };       // ceiling centre lamp
const LAMP_TASKS = { x: 490, y: 10 };              // second lamp above task boxes
const MOLAR_EXIT_X = -200;
const WALK_SPEED = 7;

const fmtTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function Scene1Hub({
  solvedIds, onSubmitCode, onEnterRoom,
  introDone, alarmPending, onIntroDone, timeLeft, danger, emergencyLight,
}) {
  const L = useStageLayout();
  const bg = usePixelImage(require('../../assets/scenes/scene_01_lab_hub.png'));
  const molar = usePixelImage(require('../../assets/sprites/molar_idle.png'));

  const [dialog, setDialog] = useState(
    (introDone || alarmPending) ? null : { speaker: 'Prof. Dr. Molar', lines: INTRO_DIALOG }
  );
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [pressed, setPressed] = useState(null);
  const blink = useSpriteFrame(2, 1.6);

  // ── Molar walk-out ──────────────────────────────────────────────────────────
  const [molarX, setMolarX] = useState(MOLAR.x);
  const [molarLeaving, setMolarLeaving] = useState(false);
  const [molarGone, setMolarGone] = useState(introDone || alarmPending);
  const onIntroRef = useRef(onIntroDone);
  onIntroRef.current = onIntroDone;

  useEffect(() => {
    if (!molarLeaving) return;
    const id = setInterval(() => {
      setMolarX((x) => {
        const next = x - WALK_SPEED;
        if (next <= MOLAR_EXIT_X) {
          clearInterval(id);
          setMolarGone(true);
          onIntroRef.current();
          return MOLAR_EXIT_X;
        }
        return next;
      });
    }, 32);
    return () => clearInterval(id);
  }, [molarLeaving]);

  // ── Molar bob while talking ─────────────────────────────────────────────────
  const [molarBobY, setMolarBobY] = useState(0);
  const dialogOpen = !!dialog;
  useEffect(() => {
    if (!dialogOpen) { setMolarBobY(0); return; }
    let t = 0;
    const id = setInterval(() => {
      t += 32;
      setMolarBobY(Math.sin((t / 900) * Math.PI * 2) * 4);
    }, 32);
    return () => clearInterval(id);
  }, [dialogOpen]);

  // ── Emergency main lamp glow ────────────────────────────────────────────────
  const [glow, setGlow] = useState(0);
  useEffect(() => {
    if (!emergencyLight) { setGlow(0); return; }
    let t = 0;
    const period = danger ? 700 : 2000;
    const lo = danger ? 0.30 : 0.18;
    const hi = danger ? 0.65 : 0.40;
    const id = setInterval(() => {
      t += 32;
      const phase = (Math.sin((t / period) * Math.PI * 2) + 1) / 2;
      setGlow(lo + (hi - lo) * phase);
    }, 32);
    return () => clearInterval(id);
  }, [emergencyLight, danger]);

  // ── Second red lamp above task boxes (3 s delay after emergency) ────────────
  const [taskLamp, setTaskLamp] = useState(false);
  const taskTimerRef = useRef(null);
  useEffect(() => {
    if (emergencyLight && !taskLamp) {
      taskTimerRef.current = setTimeout(() => setTaskLamp(true), 3000);
    }
    return () => clearTimeout(taskTimerRef.current);
  }, [emergencyLight]);

  const target = ROOMS.find((r) => !solvedIds.includes(r.id)) || null;
  const busy = !!dialog || terminalOpen || molarLeaving;

  const ledColor = (room) => {
    if (solvedIds.includes(room.id)) return '#6fe87a';
    if (target && room.id === target.id) return '#f0b23a';
    return '#ad3535';
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

  const handleDialogClose = () => {
    if (!introDone && dialog && dialog.lines === INTRO_DIALOG) {
      setDialog({ speaker: 'Prof. Dr. Molar', lines: FAREWELL_DIALOG });
    } else if (!introDone && dialog && dialog.lines === FAREWELL_DIALOG) {
      setDialog(null);
      setMolarLeaving(true);
    } else {
      setDialog(null);
    }
  };

  const timerColor = danger ? '#f06b6b' : '#6fe87a';

  return (
    <View style={styles.root}>
      <Canvas style={{ flex: 1 }}>
        <Group transform={[{ translateX: L.offsetX }, { translateY: L.offsetY }, { scale: L.scale }]}>
          {bg && (
            <SkImage image={bg} x={0} y={0} width={SCENE_W} height={SCENE_H} fit="fill" sampling={NEAREST} />
          )}

          {/* Emergency lighting */}
          {emergencyLight && (
            <Group>
              <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} color="rgba(0,0,0,0.78)" />
              {/* Main ceiling lamp */}
              <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} opacity={glow}>
                <RadialGradient c={LAMP_MAIN} r={260} colors={['#d41808', '#00000000']} />
              </Rect>
              {/* Second lamp above task boxes — activates 3 s later */}
              {taskLamp && (
                <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} opacity={glow * 0.8}>
                  <RadialGradient c={LAMP_TASKS} r={200} colors={['#d41808', '#00000000']} />
                </Rect>
              )}
            </Group>
          )}

          {/* Molar — with bob animation while talking */}
          {!molarGone && (
            <AnimatedSprite
              image={molar} frameCount={MOLAR.frames} frameW={MOLAR.frameW} frameH={MOLAR.frameH}
              x={molarX} y={MOLAR.y + molarBobY} scale={MOLAR.scale} fps={7}
            />
          )}

          {ROOMS.map((r) => (
            <Group key={`led-${r.id}`}>
              <Rect x={r.rect.x + 10} y={r.rect.y + r.rect.h - 14} width={8} height={8} color={ledColor(r)} />
              <Rect x={r.rect.x + 10} y={r.rect.y + r.rect.h - 14} width={3} height={3} color="#ffffff" />
            </Group>
          ))}

          {!busy && target && blink === 0 && (
            <Rect x={target.rect.x - 1} y={target.rect.y - 1} width={target.rect.w + 2} height={target.rect.h + 2}
              color="#f0b23a" style="stroke" strokeWidth={2} />
          )}
          {!busy && pressed && (
            <PressGlow rectObj={pressed.rect} color={pressed.color} />
          )}
        </Group>
      </Canvas>

      {!terminalOpen && (
        <View pointerEvents="none" style={[styles.screen, L.toScreen(TERMINAL_SCREEN)]}>
          {!emergencyLight ? (
            <>
              <Text style={styles.screenTitle}>CHEM. LABS</Text>
              <Text style={styles.screenTitle}>MUENCHEN</Text>
              <Text style={styles.screenSub}>SICHERHEITSSYSTEM</Text>
              <Text style={styles.screenSub}>STATUS: OK</Text>
            </>
          ) : alarmPending ? (
            <>
              <Text style={styles.screenAlarm}>[!] ALARM</Text>
              <Text style={styles.screenAlarmSub}>GESPERRT</Text>
              <Text style={styles.screenSub}>4 CODES</Text>
              <Text style={styles.screenSub}>ERFORDERLICH</Text>
            </>
          ) : (
            <>
              <Text style={styles.screenTitle}>SICHERHEITS-</Text>
              <Text style={styles.screenTitle}>TERMINAL v7</Text>
              <Text style={styles.screenCodes}>CODES {solvedIds.length}/4</Text>
              {timeLeft !== null ? (
                <Text style={[styles.screenTimer, { color: timerColor }]}>{fmtTime(timeLeft)}</Text>
              ) : (
                <Text style={styles.screenHint}>{'>'} TIPPEN</Text>
              )}
            </>
          )}
        </View>
      )}

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

      {dialog && (
        <PixelDialog speaker={dialog.speaker} lines={dialog.lines} onClose={handleDialogClose} />
      )}

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
  screenTimer: { fontFamily: 'monospace', fontSize: 15, marginTop: 6, fontWeight: 'bold', letterSpacing: 2 },
  screenSub: { color: '#3a6e3f', fontFamily: 'monospace', fontSize: 8, letterSpacing: 1 },
  screenAlarm: { color: '#ff3010', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  screenAlarmSub: { color: '#cc2010', fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
});
