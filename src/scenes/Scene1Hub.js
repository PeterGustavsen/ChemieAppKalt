import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Canvas, Image as SkImage, Group, Rect, RadialGradient, LinearGradient,
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
const LAMP_TASKS = { x: 534, y: 8 };               // second lamp centred above task boxes
const MOLAR_EXIT_X = -200;
const WALK_SPEED = 7;

// Window behind the PC
const WIN = { x: 205, y: 14, w: 230, h: 94 };
const SHUTTER_TOP = WIN.y - WIN.h - 8;
const SHUTTER_BOT = WIN.y - 1;

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
          setMolarLeaving(false);
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
      setMolarBobY(Math.sin((t / 2400) * Math.PI * 2) * 3);
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

  // ── Metal shutter over window ────────────────────────────────────────────────
  const alreadyClosed = introDone || alarmPending;
  const [shutterY, setShutterY] = useState(alreadyClosed ? SHUTTER_BOT : SHUTTER_TOP);
  const [shutterDone, setShutterDone] = useState(alreadyClosed);
  useEffect(() => {
    if (!emergencyLight || shutterDone) return;
    let y = SHUTTER_TOP;
    const id = setInterval(() => {
      y += 5;
      if (y >= SHUTTER_BOT) { clearInterval(id); setShutterY(SHUTTER_BOT); setShutterDone(true); }
      else setShutterY(y);
    }, 32);
    return () => clearInterval(id);
  }, [emergencyLight, shutterDone]);

  const target = ROOMS.find((r) => !solvedIds.includes(r.id)) || null;
  const busy = !!dialog || terminalOpen || molarLeaving;

  const ledColor = (room) => {
    if (solvedIds.includes(room.id)) return '#6fe87a';
    if (target && room.id === target.id) return '#f0b23a';
    return '#ad3535';
  };

  const onDoor = (room) => {
    if (solvedIds.includes(room.id)) {
      setDialog({ speaker: 'Prof. Dr. Molar', lines: ['Diese Kammer ist bereits gelöst. Gut gemacht!'] });
    } else if (target && room.id === target.id) {
      onEnterRoom(room);
    } else {
      const need = target ? target.id : '?';
      setDialog({
        speaker: 'Prof. Dr. Molar',
        lines: [room.examine, `Noch verriegelt — löse zuerst Kammer ${need}.`],
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
        <Group clip={{ x: L.offsetX, y: L.offsetY, width: L.stageW, height: L.stageH }}
          transform={[{ translateX: L.offsetX }, { translateY: L.offsetY }, { scale: L.scale }]}>
          {bg && (
            <SkImage image={bg} x={0} y={0} width={SCENE_W} height={SCENE_H} fit="fill" sampling={NEAREST} />
          )}

          {/* ── Window behind PC ── */}
          <Group clip={{ x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h }}>
            {/* Sky */}
            <Rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h}>
              <LinearGradient
                start={{ x: WIN.x, y: WIN.y }} end={{ x: WIN.x, y: WIN.y + WIN.h }}
                colors={['#b8e0f7', '#6aaed6']}
              />
            </Rect>
            {/* Clouds */}
            <Rect x={WIN.x + 8}   y={WIN.y + 10} width={52} height={14} color="rgba(255,255,255,0.82)" />
            <Rect x={WIN.x + 18}  y={WIN.y + 5}  width={38} height={12} color="rgba(255,255,255,0.65)" />
            <Rect x={WIN.x + 130} y={WIN.y + 14} width={60} height={16} color="rgba(255,255,255,0.78)" />
            <Rect x={WIN.x + 142} y={WIN.y + 8}  width={42} height={12} color="rgba(255,255,255,0.60)" />
            {/* Industrial silhouettes */}
            <Rect x={WIN.x + 10}  y={WIN.y + 58} width={28} height={36} color="#3a4d58" />
            <Rect x={WIN.x + 20}  y={WIN.y + 42} width={8}  height={16} color="#3a4d58" />
            <Rect x={WIN.x + 45}  y={WIN.y + 48} width={38} height={46} color="#2d3f4a" />
            <Rect x={WIN.x + 52}  y={WIN.y + 32} width={7}  height={17} color="#2d3f4a" />
            <Rect x={WIN.x + 67}  y={WIN.y + 28} width={7}  height={21} color="#2d3f4a" />
            <Rect x={WIN.x + 92}  y={WIN.y + 52} width={30} height={42} color="#38505c" />
            <Rect x={WIN.x + 88}  y={WIN.y + 48} width={38} height={8}  color="#38505c" />
            <Rect x={WIN.x + 132} y={WIN.y + 62} width={60} height={32} color="#324550" />
            <Rect x={WIN.x + 148} y={WIN.y + 46} width={9}  height={17} color="#324550" />
            <Rect x={WIN.x + 170} y={WIN.y + 40} width={9}  height={23} color="#324550" />
            {/* Ground strip */}
            <Rect x={WIN.x} y={WIN.y + 88} width={WIN.w} height={6} color="#26363f" />
          </Group>
          {/* Industrial lab window frame — steel grey with bolts */}
          <Rect x={WIN.x - 6} y={WIN.y - 6} width={WIN.w + 12} height={WIN.h + 12}
            color="#3e4d58" style="stroke" strokeWidth={12} />
          {/* Inner bezel line */}
          <Rect x={WIN.x - 1} y={WIN.y - 1} width={WIN.w + 2} height={WIN.h + 2}
            color="#5a6e7c" style="stroke" strokeWidth={2} />
          {/* Dividers */}
          <Rect x={WIN.x + WIN.w / 3 - 2} y={WIN.y} width={4} height={WIN.h} color="#3e4d58" />
          <Rect x={WIN.x + WIN.w * 2 / 3 - 2} y={WIN.y} width={4} height={WIN.h} color="#3e4d58" />
          <Rect x={WIN.x} y={WIN.y + WIN.h / 2 - 2} width={WIN.w} height={4} color="#3e4d58" />
          {/* Corner bolts */}
          {[[-5,-5],[WIN.w-1,-5],[-5,WIN.h-1],[WIN.w-1,WIN.h-1]].map(([dx,dy],i) => (
            <Rect key={i} x={WIN.x+dx} y={WIN.y+dy} width={6} height={6} color="#6a8090" />
          ))}
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
                <Group>
                  {/* Wide red wash */}
                  <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} opacity={glow}>
                    <RadialGradient c={LAMP_TASKS} r={230} colors={['#ff2a08', '#d4180840', '#00000000']} />
                  </Rect>
                  {/* Bright lamp-core hot-spot */}
                  <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} opacity={Math.min(1, glow * 1.8)}>
                    <RadialGradient c={LAMP_TASKS} r={50} colors={['#ff7040', '#ff200800']} />
                  </Rect>
                </Group>
              )}
            </Group>
          )}

          {/* Metal shutter — above emergency overlay so it stays visible in red light */}
          <Group clip={{ x: WIN.x - 6, y: WIN.y - 6, width: WIN.w + 12, height: WIN.h + 12 }}>
            <Rect x={WIN.x - 6} y={shutterY} width={WIN.w + 12} height={WIN.h + 14} color="#3e3e3e" />
            {[...Array(10)].map((_, i) => (
              <Rect key={i} x={WIN.x - 6} y={shutterY + i * 11} width={WIN.w + 12} height={2} color="#2e2e2e" />
            ))}
            {/* Leading edge highlight */}
            <Rect x={WIN.x - 6} y={shutterY + WIN.h + 10} width={WIN.w + 12} height={4} color="#606060" />
            {/* Red emergency tint — makes shutter look lit by alarm lamp */}
            <Rect x={WIN.x - 6} y={shutterY} width={WIN.w + 12} height={WIN.h + 14}
              color="rgba(180,30,0,0.18)" />
          </Group>

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
              <Text style={styles.screenBig}>CHEM. LABS</Text>
              <Text style={styles.screenSub}>MUENCHEN</Text>
              <Text style={styles.screenSub}>STATUS: OK</Text>
            </>
          ) : alarmPending ? (
            <>
              <Text style={styles.screenAlarm}>[!]</Text>
              <Text style={styles.screenAlarm}>ALARM</Text>
              <Text style={styles.screenAlarmSub}>GESPERRT</Text>
              <Text style={styles.screenSub}>CODES EINGEBEN</Text>
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
  screenBig: { color: '#6fe87a', fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 },
  screenTitle: { color: '#6fe87a', fontFamily: 'monospace', fontSize: 11, letterSpacing: 1 },
  screenCodes: { color: '#6fe87a', fontFamily: 'monospace', fontSize: 13, marginTop: 4, fontWeight: 'bold' },
  screenHint: { color: '#2f8f3a', fontFamily: 'monospace', fontSize: 11, marginTop: 6 },
  screenTimer: { fontFamily: 'monospace', fontSize: 18, marginTop: 4, fontWeight: 'bold', letterSpacing: 2 },
  screenSub: { color: '#5abf68', fontFamily: 'monospace', fontSize: 11, letterSpacing: 1 },
  screenAlarm: { color: '#ff3010', fontFamily: 'monospace', fontSize: 17, fontWeight: 'bold', letterSpacing: 2 },
  screenAlarmSub: { color: '#cc2010', fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold', letterSpacing: 2 },
});
