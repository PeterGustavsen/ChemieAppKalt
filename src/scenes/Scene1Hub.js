import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Group, Rect, RadialGradient, LinearGradient,
} from '@shopify/react-native-skia';
import LiveCanvas from '../engine/LiveCanvas';

import { useStageLayout } from '../engine/layout';
import { useAmbient } from '../engine/useAmbient';
import { useCamera, camTransform, toScreenCam } from '../engine/useCamera';
import HubArtHD, { DOOR_RECT, HORIZON } from '../art/HubArtHD';
import MolarHD from '../art/MolarHD';
import { HubWindowView, HubShutter, WIN } from '../art/HubWindow';
import BackdropHD from '../ui/BackdropHD';
import PixelDialog from '../ui/PixelDialog';
import Terminal from '../ui/Terminal';
import CRTOverlay from '../ui/CRTOverlay';
import NavBar from '../ui/NavBar';
import { FX } from '../fx/feedback';
import {
  ROOMS, TERMINAL, TERMINAL_SCREEN,
  INTRO_DIALOG, FAREWELL_DIALOG,
  SCENE_W, SCENE_H,
} from '../config/game';

const MOLAR = { x: 60, y: 148, frameW: 72, frameH: 112, scale: 2.0 };
const LAMP_MAIN = { x: SCENE_W / 2, y: 8 };       // ceiling centre lamp
const LAMP_TASKS = { x: 534, y: 8 };               // second lamp centred above task boxes
const MOLAR_EXIT_X = -200;
const WALK_SPEED = 7;                          // legacy px per ~32ms frame
const WALK_PX_S = WALK_SPEED * (1000 / 32);    // ≈ 219 px/s (frame-rate independent)
const SHUTTER_PX_S = 5 * (1000 / 32);          // ≈ 156 px/s

// Window behind the PC: WIN kommt aus art/HubWindow (geteilt mit SceneWin)
const SHUTTER_TOP = WIN.y - WIN.h - 8;
const SHUTTER_BOT = WIN.y - 1;

const fmtTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// Merkt sich über den Raumwechsel hinweg, dass wir aus einer Kammer zurückkommen
// (Modul-Singleton — Scene1Hub wird beim Betreten eines Raums unmounted).
let returnFromRoom = false;

export default function Scene1Hub({
  solvedIds, onSubmitCode, onEnterRoom,
  introDone, alarmPending, onIntroDone, timeLeft, danger, emergencyLight,
}) {
  const L = useStageLayout();
  const t = useAmbient(30);

  const [dialog, setDialog] = useState(
    (introDone || alarmPending) ? null : { speaker: 'Prof. Dr. Molar', lines: INTRO_DIALOG }
  );
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [pressed, setPressed] = useState(null);

  // ── Kamera: „Kopfdrehen" zu Stationen, Idle-Drift, Rückkehr-Kontinuität ────
  // Rückkehr aus einer Kammer: Blick startet an der Tür und schwenkt zurück.
  const startCam = useRef(
    returnFromRoom
      ? { cx: DOOR_RECT.x + DOOR_RECT.w / 2, cy: DOOR_RECT.y + DOOR_RECT.h / 2, z: 1.6 }
      : null
  ).current;
  const { cam, flying, flyTo, reset } = useCamera({ drift: true, baseZoom: 1.045, start: startCam });
  useEffect(() => {
    // Vom Raum zurück: von der Tür zur Übersicht zurückschwenken.
    if (returnFromRoom) {
      returnFromRoom = false;
      const id = setTimeout(() => reset(700), 140);
      return () => clearTimeout(id);
    }
  }, [reset]);

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
  // One requestAnimationFrame loop reads the latest flags via a ref and
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
  const busy = !!dialog || terminalOpen || molarLeaving || flying;

  const onDoor = (room) => {
    if (solvedIds.includes(room.id)) {
      FX.clunk();   // opening an already-solved chamber
      setDialog({ speaker: 'Prof. Dr. Molar', lines: ['Diese Kammer ist bereits gelöst. Gut gemacht!'] });
    } else if (target && room.id === target.id) {
      FX.click();
      // „Kopf drehen": Blick schwenkt zur Labortür, dann betreten wir die Kammer.
      // setTimeout: der Szenenwechsel darf NICHT aus dem rAF-Promise heraus
      // committen — Canvases, die aus einem rAF-Kontext mounten, frieren auf
      // Web ein (RNSkia-Reconciler verarbeitet dann keine Updates mehr).
      returnFromRoom = true;
      flyTo(DOOR_RECT, { zoom: 1.6, ms: 620 }).then(() => setTimeout(() => onEnterRoom(room), 0));
    } else {
      FX.click();
      const need = target ? target.id : '?';
      setDialog({
        speaker: 'Prof. Dr. Molar',
        lines: [room.examine, `Noch verriegelt — löse zuerst Kammer ${need}.`],
      });
    }
  };

  const openTerminal = () => {
    FX.click();
    flyTo(TERMINAL, { zoom: 1.5, ms: 340 }).then(() => setTerminalOpen(true));
  };
  const closeTerminal = () => {
    setTerminalOpen(false);
    reset(430);
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
  const screenRect = toScreenCam(L, cam, TERMINAL_SCREEN);
  const fz = cam.z;   // Schriftgröße folgt dem Kamera-Zoom

  return (
    <View style={styles.root}>
      <BackdropHD horizon={HORIZON} />
      <LiveCanvas style={{ flex: 1 }}>
        <Group clip={{ x: L.offsetX, y: L.offsetY, width: L.stageW, height: L.stageH }}>
          <Group transform={[{ translateX: L.offsetX }, { translateY: L.offsetY }, { scale: L.scale }]}>
            <Group transform={camTransform(cam)}>
              {/* Prozeduraler HD-Hub: Raum, Kammern-Wand, Terminal, Deko */}
              <HubArtHD t={t} emergencyLight={emergencyLight} danger={danger} />

              <HubWindowView t={t} />

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
              <HubShutter shutterY={shutterY} redTint />

              {/* Molar — Vektor-Figur; spricht/blinzelt/geht (ersetzt Pixel-Sprites) */}
              {!molarGone && (
                <MolarHD
                  x={molarX} y={MOLAR.y + molarBobY} scale={MOLAR.scale}
                  mode={dialogOpen ? 'speak' : 'idle'}
                  walking={molarLeaving} t={t}
                />
              )}

              {/* Konsole-Hover-Glow (Navigation/Status liegen in der NavBar) */}
              {!busy && pressed && (
                <PressGlow rectObj={pressed.rect} color={pressed.color} />
              )}
            </Group>
          </Group>
        </Group>
      </LiveCanvas>

      {!terminalOpen && (
        <View pointerEvents="none" style={[styles.screen, screenRect]}>
          {!emergencyLight ? (
            <>
              <Text style={[styles.screenBig, { fontSize: 16 * fz }]}>CHEM. LABS</Text>
              <Text style={[styles.screenSub, { fontSize: 11 * fz }]}>MUENCHEN</Text>
              <Text style={[styles.screenSub, { fontSize: 11 * fz }]}>STATUS: OK</Text>
            </>
          ) : alarmPending ? (
            <>
              <Text style={[styles.screenAlarm, { fontSize: 17 * fz }]}>[!]</Text>
              <Text style={[styles.screenAlarm, { fontSize: 17 * fz }]}>ALARM</Text>
              <Text style={[styles.screenAlarmSub, { fontSize: 13 * fz }]}>GESPERRT</Text>
              <Text style={[styles.screenSub, { fontSize: 11 * fz }]}>CODES EINGEBEN</Text>
            </>
          ) : (
            <>
              <Text style={[styles.screenTitle, { fontSize: 11 * fz }]}>SICHERHEITS-</Text>
              <Text style={[styles.screenTitle, { fontSize: 11 * fz }]}>TERMINAL v7</Text>
              <Text style={[styles.screenCodes, { fontSize: 13 * fz }]}>CODES {solvedIds.length}/{ROOMS.length}</Text>
              {timeLeft !== null ? (
                <Text style={[styles.screenTimer, { color: timerColor, fontSize: 18 * fz }]}>{fmtTime(timeLeft)}</Text>
              ) : (
                <Text style={[styles.screenHint, { fontSize: 11 * fz }]}>{'>'} TIPPEN</Text>
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
          <Hotspot rect={toScreenCam(L, cam, TERMINAL)}
            onIn={() => setPressed({ rect: TERMINAL, color: '#6fe87a' })}
            onOut={() => setPressed(null)}
            onPress={openTerminal} />
          <NavBar
            rooms={ROOMS} solvedIds={solvedIds} target={target}
            onPick={onDoor}
            onTerminal={openTerminal}
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
          onClose={closeTerminal}
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

function Hotspot({ rect, onIn, onOut, onPress }) {
  return (
    <Pressable
      style={[styles.hotspot, { left: rect.left, top: rect.top, width: rect.width, height: rect.height }]}
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
  screenBig: { color: '#6fe87a', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 2 },
  screenTitle: { color: '#6fe87a', fontFamily: 'monospace', letterSpacing: 1 },
  screenCodes: { color: '#6fe87a', fontFamily: 'monospace', marginTop: 4, fontWeight: 'bold' },
  screenHint: { color: '#2f8f3a', fontFamily: 'monospace', marginTop: 6 },
  screenTimer: { fontFamily: 'monospace', marginTop: 4, fontWeight: 'bold', letterSpacing: 2 },
  screenSub: { color: '#5abf68', fontFamily: 'monospace', letterSpacing: 1 },
  screenAlarm: { color: '#ff3010', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 2 },
  screenAlarmSub: { color: '#cc2010', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 2 },
});
