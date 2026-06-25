import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Canvas, Image as SkImage, Group, Rect, RadialGradient, LinearGradient,
  FilterMode, MipmapMode,
} from '@shopify/react-native-skia';

import AnimatedSprite from '../engine/AnimatedSprite';
import { usePixelImage } from '../engine/usePixelImage';
import { useStageLayout } from '../engine/layout';
import PixelDialog from '../ui/PixelDialog';
import Terminal from '../ui/Terminal';
import CRTOverlay from '../ui/CRTOverlay';
import HubBackdrop from '../ui/HubBackdrop';
import NavBar from '../ui/NavBar';
import { FX } from '../fx/feedback';
import {
  ROOMS, TERMINAL, TERMINAL_SCREEN,
  INTRO_DIALOG, FAREWELL_DIALOG,
  SCENE_W, SCENE_H,
} from '../config/game';

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None };
const MOLAR = { x: 60, y: 148, frameW: 72, frameH: 112, scale: 2.0, frames: 15 };
const LAMP_MAIN = { x: SCENE_W / 2, y: 8 };       // ceiling centre lamp
const LAMP_TASKS = { x: 534, y: 8 };               // second lamp centred above task boxes
const MOLAR_EXIT_X = -200;
const WALK_SPEED = 7;                          // legacy px per ~32ms frame
const WALK_PX_S = WALK_SPEED * (1000 / 32);    // ≈ 219 px/s (frame-rate independent)
const SHUTTER_PX_S = 5 * (1000 / 32);          // ≈ 156 px/s

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
  const molarSpeak = usePixelImage(require('../../assets/sprites/molar_speak.png'));

  const [dialog, setDialog] = useState(
    (introDone || alarmPending) ? null : { speaker: 'Prof. Dr. Molar', lines: INTRO_DIALOG }
  );
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [pressed, setPressed] = useState(null);

  // ── Animated scene state ────────────────────────────────────────────────────
  const [molarX, setMolarX] = useState(MOLAR.x);
  const [molarLeaving, setMolarLeaving] = useState(false);
  const [molarGone, setMolarGone] = useState(introDone || alarmPending);
  const onIntroRef = useRef(onIntroDone);
  onIntroRef.current = onIntroDone;

  const [molarBobY, setMolarBobY] = useState(0);
  const dialogOpen = !!dialog;

  const [glow, setGlow] = useState(0);
  const [taskLamp, setTaskLamp] = useState(false);

  const alreadyClosed = introDone || alarmPending;
  const [shutterY, setShutterY] = useState(alreadyClosed ? SHUTTER_BOT : SHUTTER_TOP);
  const [shutterDone, setShutterDone] = useState(alreadyClosed);

  // ── Single animation loop ───────────────────────────────────────────────────
  // Replaces five separate setIntervals (walk, bob, glow, shutter, task-lamp
  // delay). One requestAnimationFrame loop reads the latest flags via a ref and
  // is frame-rate independent (dt-based), so timing matches on any device.
  const molarXRef = useRef(MOLAR.x);
  const bobRef = useRef(0);
  const glowRef = useRef(0);
  const shutterYRef = useRef(alreadyClosed ? SHUTTER_BOT : SHUTTER_TOP);
  const emergStartRef = useRef(null);

  const flags = useRef({});
  flags.current = {
    molarLeaving, molarGone, dialogOpen, emergencyLight, danger, shutterDone, taskLamp,
  };

  useEffect(() => {
    let raf;
    let last = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    // Push a value to state only when it actually changed → no idle re-renders.
    const set = (ref, setter, val) => {
      if (Math.abs(ref.current - val) > 0.01) { ref.current = val; setter(val); }
    };
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const f = flags.current;

      // Molar walks out, then hands control back to App.
      if (f.molarLeaving && !f.molarGone) {
        const x = molarXRef.current - WALK_PX_S * dt;
        if (x <= MOLAR_EXIT_X) {
          set(molarXRef, setMolarX, MOLAR_EXIT_X);
          setMolarGone(true);
          setMolarLeaving(false);
          onIntroRef.current();
        } else {
          set(molarXRef, setMolarX, x);
        }
      }

      // Gentle bob while talking.
      set(bobRef, setMolarBobY, f.dialogOpen ? Math.sin((now / 2400) * Math.PI * 2) * 3 : 0);

      // Emergency lamp pulse + the second lamp that joins 3 s later.
      if (f.emergencyLight) {
        if (emergStartRef.current == null) emergStartRef.current = now;
        const period = f.danger ? 700 : 2000;
        const lo = f.danger ? 0.40 : 0.28;
        const hi = f.danger ? 0.75 : 0.55;
        const phase = (Math.sin((now / period) * Math.PI * 2) + 1) / 2;
        set(glowRef, setGlow, lo + (hi - lo) * phase);
        if (!f.taskLamp && now - emergStartRef.current >= 3000) {
          setTaskLamp(true);
          FX.clunk();
        }
      } else {
        set(glowRef, setGlow, 0);
      }

      // Steel shutter grinds down over the window, then slams shut.
      if (f.emergencyLight && !f.shutterDone) {
        const y = shutterYRef.current + SHUTTER_PX_S * dt;
        if (y >= SHUTTER_BOT) {
          set(shutterYRef, setShutterY, SHUTTER_BOT);
          setShutterDone(true);
          FX.clunk();
        } else {
          set(shutterYRef, setShutterY, y);
        }
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const target = ROOMS.find((r) => !solvedIds.includes(r.id)) || null;
  const busy = !!dialog || terminalOpen || molarLeaving;

  const onDoor = (room) => {
    if (solvedIds.includes(room.id)) {
      FX.clunk();   // opening an already-solved chamber
      setDialog({ speaker: 'Prof. Dr. Molar', lines: ['Diese Kammer ist bereits gelöst. Gut gemacht!'] });
    } else if (target && room.id === target.id) {
      FX.click();
      onEnterRoom(room);
    } else {
      FX.click();
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
      <HubBackdrop />
      <Canvas style={{ flex: 1 }}>
        <Group clip={{ x: 0, y: 0, width: SCENE_W, height: SCENE_H }}
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
              <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} color="rgba(0,0,0,0.52)" />
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

          {/* Molar — Sprech-Sheet (Mund auf/zu) waehrend Dialog, sonst Idle */}
          {!molarGone && (
            <AnimatedSprite
              image={dialogOpen ? molarSpeak : molar}
              frameCount={dialogOpen ? 8 : MOLAR.frames}
              frameW={MOLAR.frameW} frameH={MOLAR.frameH}
              x={molarX} y={MOLAR.y + molarBobY} scale={MOLAR.scale}
              fps={dialogOpen ? 4 : 3}
            />
          )}

          {/* Konsole-Hover-Glow (Navigation/Status liegen in der NavBar) */}
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
              <Text style={styles.screenCodes}>CODES {solvedIds.length}/{ROOMS.length}</Text>
              {timeLeft !== null ? (
                <Text style={[styles.screenTimer, { color: timerColor }]}>{fmtTime(timeLeft)}</Text>
              ) : (
                <Text style={styles.screenHint}>{'>'} TIPPEN</Text>
              )}
            </>
          )}
        </View>
      )}

      {/* CRT scanline + vignette filter over the scene (shared with SceneShell) */}
      <CRTOverlay L={L} intensity={emergencyLight ? 1 : 0.85} />

      {!busy && (
        <>
          {/* Konsole bleibt anklickbar; Navigation läuft über die untere Leiste */}
          <Hotspot layout={L} rectObj={TERMINAL} color="#6fe87a"
            onIn={() => setPressed({ rect: TERMINAL, color: '#6fe87a' })}
            onOut={() => setPressed(null)}
            onPress={() => { FX.click(); setTerminalOpen(true); }} />
          <NavBar
            rooms={ROOMS} solvedIds={solvedIds} target={target}
            onPick={onDoor}
            onTerminal={() => { FX.click(); setTerminalOpen(true); }}
          />
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
