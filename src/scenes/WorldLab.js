/*
 * WorldLab — DAS Spiel als eine einzige durchgehende Laborhalle.
 *
 * Eine persistente Canvas für die gesamte Sitzung (Start → Spiel → Win/Fail):
 *  - Der statische Teil der Halle (src/art/world.js) wird EINMAL per
 *    drawAsPicture in ein SkPicture aufgenommen und pro Frame nur abgespielt.
 *  - Stationswechsel = KAMERAFAHRT durch die Halle (~1 s, mit Schritt-Wippen),
 *    kein Szenenwechsel → keine Canvas-Remounts, keine Freeze-Glitches.
 *
 * PERFORMANCE-ARCHITEKTUR: alles, was pro Frame tickt (Ambient-Uhr, Kamera-
 * fahrt, Alarm-Puls), lebt isoliert in <WorldCanvasView> (React.memo). Der
 * äußere WorldLab-Baum — und damit ALLE DOM-Overlays — rendert nur bei echten
 * Ereignissen neu (Dialog, Terminal, Ankunft, Sekundentakt der Uhr), nicht
 * 30–60× pro Sekunde. Das war der Haupt-FPS-Fresser der Vorversion.
 *
 * Die Rätsel-Szenen (Scene2Buffer …) sind unverändert; Navigation läuft
 * ausschließlich über die NavBar (Hub) bzw. „◀ TERMINAL“ (Station).
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Group, Rect, RadialGradient, Picture, drawAsPicture } from '@shopify/react-native-skia';

import LiveCanvas from '../engine/LiveCanvas';
import { useStageLayout } from '../engine/layout';
import { WorldContext } from '../engine/WorldContext';
import {
  WORLD_W, HORIZON, HUB_SEG, HUB_X, SEG_W,
  segCenter, segIndexOfStation, stationX, WorldStatic,
} from '../art/world';
import { AlarmBeacon, DustLayer, WallClock } from '../art/atoms';
import MolarHD from '../art/MolarHD';
import { HubWindowView, HubShutter, WIN } from '../art/HubWindow';
import BackdropHD from '../ui/BackdropHD';
import PixelDialog from '../ui/PixelDialog';
import Terminal from '../ui/Terminal';
import CRTOverlay from '../ui/CRTOverlay';
import NavBar from '../ui/NavBar';
import { FX } from '../fx/feedback';
import {
  ROOMS, TERMINAL, TERMINAL_SCREEN, INTRO_DIALOG, FAREWELL_DIALOG, WIN_DIALOG,
  SCENE_W, SCENE_H,
} from '../config/game';

import Scene2Buffer from './Scene2Buffer';
import Scene3Redox from './Scene3Redox';
import Scene4Galvanic from './Scene4Galvanic';
import Scene5Ester from './Scene5Ester';
import Scene6Electrolysis from './Scene6Electrolysis';
import Scene7Equilibrium from './Scene7Equilibrium';

const ROOM_COMPONENTS = {
  2: Scene2Buffer, 3: Scene3Redox, 4: Scene4Galvanic,
  5: Scene5Ester, 6: Scene6Electrolysis, 7: Scene7Equilibrium,
};

const HUB_CENTER = segCenter(HUB_SEG);
const MOLAR = { x: 60, y: 148, scale: 2.0 };       // im Hub-Segment
const MOLAR_EXIT_X = -220;
const WALK_PX_S = 7 * (1000 / 32);                 // ≈ 219 px/s (wie bisher)
const SHUTTER_PX_S = 5 * (1000 / 32);
const SHUTTER_TOP = WIN.y - WIN.h - 8;
const SHUTTER_BOT = WIN.y - 1;

const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const fmtTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/* ══════════════════════════════════════════════════════════════════════════
 *  Kamera-Controller: eigener rAF-Loop, schreibt NUR in die Canvas-View.
 *  Der äußere Baum erfährt nur Start (traveling=true) und Ankunft (Callback).
 * ══════════════════════════════════════════════════════════════════════════ */
function createCamController(initialX) {
  const ctrl = {
    x: initialX,
    setters: null,
    raf: 0,
    bind(setters) { this.setters = setters; if (setters) setters.setCamX(this.x); },
    travelTo(toX, onArrive) {
      cancelAnimationFrame(this.raf);
      const from = this.x;
      const dist = Math.abs(toX - from);
      if (dist < 1 || !this.setters) { this.x = toX; onArrive && onArrive(); return 0; }
      const ms = Math.min(1800, Math.max(700, 500 + dist * 0.42));
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / ms);
        const e = easeInOut(k);
        this.x = from + (toX - from) * e;
        if (this.setters) {
          this.setters.setCamX(this.x);
          // Schritt-Wippen, klingt zur Ankunft hin aus
          this.setters.setCamBob(Math.sin(k * Math.PI * 2 * (ms / 450)) * 2 * Math.sin(k * Math.PI));
        }
        if (k < 1) this.raf = requestAnimationFrame(step);
        else { if (this.setters) this.setters.setCamBob(0); onArrive && onArrive(); }
      };
      this.raf = requestAnimationFrame(step);
      return ms;
    },
    dispose() { cancelAnimationFrame(this.raf); this.setters = null; },
  };
  return ctrl;
}

/* ══════════════════════════════════════════════════════════════════════════
 *  WorldCanvasView — die EINZIGE Komponente, die pro Frame neu rendert.
 *  Besitzt Kamera (camX/camBob) und Ambient-Uhr (t, ~30 fps) als lokalen
 *  State; alles andere kommt als selten wechselnde Props.
 * ══════════════════════════════════════════════════════════════════════════ */
const WorldCanvasView = React.memo(function WorldCanvasView({
  L, camCtrl, staticPic, sceneLayerRef, activeSegX, hasStation,
  solvedIds, targetId, mode, emergencyLight, danger, taskLamp, atHub,
  molarX, molarGone, molarWalking, molarSpeaking,
  shutterY, pressed, worldL,
}) {
  const [camX, setCamX] = useState(camCtrl.x);
  const [camBob, setCamBob] = useState(0);
  const [t, setT] = useState(0);

  useEffect(() => {
    camCtrl.bind({ setCamX, setCamBob });
    const id = setInterval(() => setT(performance.now() / 1000), 33);
    return () => { camCtrl.dispose(); clearInterval(id); };
  }, [camCtrl]);

  // Alarm-Puls direkt aus der lokalen Uhr (kein äußerer State!)
  const fast = danger || mode === 'fail';
  const period = fast ? 0.7 : 2.0;
  const lo = fast ? 0.40 : 0.28;
  const hi = fast ? 0.75 : 0.55;
  const glow = emergencyLight && mode !== 'win'
    ? lo + (hi - lo) * ((Math.sin((t / period) * Math.PI * 2) + 1) / 2)
    : 0;

  const viewX = camX - SCENE_W / 2;
  const visible = (worldX, m = 760) => Math.abs(worldX - camX) < m;
  const hubVisible = visible(HUB_CENTER);
  const alarmOn = emergencyLight && mode !== 'win';

  return (
    <LiveCanvas style={{ flex: 1 }}>
      <Group clip={{ x: L.offsetX, y: L.offsetY, width: L.stageW, height: L.stageH }}>
        <Group transform={[{ translateX: L.offsetX }, { translateY: L.offsetY }, { scale: L.scale }]}>
          <Group transform={[{ translateX: -viewX }, { translateY: camBob }]}>

            {/* Statische Halle — einmal aufgenommen, pro Frame nur abgespielt */}
            {staticPic ? <Picture picture={staticPic} /> : <WorldStatic />}

            {/* ── Dynamik im Hub-Segment ── */}
            {hubVisible && (
              <Group transform={[{ translateX: HUB_X }]}>
                <HubWindowView t={t} />
                <WallClock cx={166} cy={42} r={13} t={t} />
                {(mode !== 'win' || shutterY > SHUTTER_TOP) && (
                  <HubShutter shutterY={shutterY} redTint={alarmOn} />
                )}
                {!molarGone && (
                  <MolarHD
                    x={molarX}
                    y={MOLAR.y + (molarSpeaking ? Math.sin((t / 2.4) * Math.PI * 2) * 3 : 0)}
                    scale={MOLAR.scale}
                    mode={molarSpeaking ? 'speak' : 'idle'}
                    walking={molarWalking} t={t}
                  />
                )}
                {pressed && (
                  <Rect x={pressed.rect.x - 2} y={pressed.rect.y - 2} width={pressed.rect.w + 4}
                    height={pressed.rect.h + 4} color={pressed.color} style="stroke" strokeWidth={3} opacity={0.5} />
                )}
              </Group>
            )}

            {/* ── Alarm-Beacons (nur sichtbare) ── */}
            {[HUB_X + 368, HUB_X + 498, ...ROOMS.map((r) => stationX(r.id) + SEG_W / 2 + 52)]
              .filter((wx) => visible(wx))
              .map((wx) => (
                <AlarmBeacon key={wx} cx={wx} cy={6} on={alarmOn} t={t}
                  danger={fast} sweepReach={240} />
              ))}

            {/* ── Status-LEDs an den Stations-Schildern ── */}
            {ROOMS.map((r) => {
              const sx = segCenter(segIndexOfStation(r.id));
              if (!visible(sx)) return null;
              const done = solvedIds.includes(r.id);
              const act = targetId === r.id;
              const col = done ? '#6fe87a' : act ? r.accent : '#4a5666';
              const op = done ? 0.9 : act ? 0.45 + 0.45 * (0.5 + 0.5 * Math.sin(t * 3.4)) : 0.18;
              return <Rect key={r.id} x={sx - 38} y={52} width={76} height={4} color={col} opacity={op} />;
            })}

            {/* ── Rätsel-Layer der aktiven Station ── */}
            {hasStation && sceneLayerRef.current && (
              <Group transform={[{ translateX: activeSegX }]}>
                {sceneLayerRef.current(worldL)}
              </Group>
            )}
          </Group>

          {/* ── Bildschirmraum: Alarm-Wash + Staub ── */}
          {alarmOn && (
            <Group>
              <Rect x={0} y={0} width={SCENE_W} height={SCENE_H}
                color={`rgba(0,0,0,${mode === 'fail' ? 0.72 : 0.52})`} />
              <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} opacity={glow}>
                <RadialGradient c={{ x: SCENE_W / 2, y: 8 }} r={280} colors={['#e02010', '#00000000']} />
              </Rect>
              {taskLamp && atHub && (
                <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} opacity={glow}>
                  <RadialGradient c={{ x: 534, y: 8 }} r={230} colors={['#ff2a08', '#d4180840', '#00000000']} />
                </Rect>
              )}
            </Group>
          )}
          <DustLayer t={t} h={HORIZON - 16} seed={9} count={12} />
          {mode === 'start' && (
            <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} color="rgba(2,6,10,0.66)" />
          )}
        </Group>
      </Group>
    </LiveCanvas>
  );
});

/* ══════════════════════════════════════════════════════════════════════════ */

export default function WorldLab({
  mode,                    // 'start' | 'playing' | 'win' | 'fail'
  solvedIds, revealedIds, onSubmitCode, onReveal,
  introDone, alarmPending, onIntroDone,
  timeLeft, danger, emergencyLight,
  onStart, onRestart, elapsed,
}) {
  const L = useStageLayout();

  /* ── Statisches Welt-Picture (einmalige Aufnahme) ─────────────────────── */
  const [staticPic, setStaticPic] = useState(null);
  useEffect(() => {
    let on = true;
    drawAsPicture(<WorldStatic />, { x: 0, y: 0, width: WORLD_W, height: SCENE_H })
      .then((p) => { if (on) setStaticPic(p); })
      .catch(() => {});     // Fallback: Live-Baum bleibt einfach stehen
    return () => { on = false; };
  }, []);

  /* ── Spielzustand (nur ereignisgetrieben — nichts tickt hier!) ─────────── */
  const [activeStation, setActiveStation] = useState(null);
  const [traveling, setTraveling] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [pressed, setPressed] = useState(null);

  const [molarX, setMolarX] = useState(MOLAR.x);
  const [molarLeaving, setMolarLeaving] = useState(false);
  const [molarGone, setMolarGone] = useState(introDone || alarmPending);
  const [molarEntering, setMolarEntering] = useState(false);   // Win: kommt zurück

  const [taskLamp, setTaskLamp] = useState(false);
  const alreadyClosed = introDone || alarmPending;
  const [shutterY, setShutterY] = useState(alreadyClosed ? SHUTTER_BOT : SHUTTER_TOP);
  const [shutterOpening, setShutterOpening] = useState(false); // Win
  const [winDialogDone, setWinDialogDone] = useState(false);

  const onIntroRef = useRef(onIntroDone);
  onIntroRef.current = onIntroDone;

  // Kamera-Controller (eigener rAF, rendert nur die Canvas-View)
  const camCtrl = useRef(null);
  if (!camCtrl.current) camCtrl.current = createCamController(HUB_CENTER);

  // Rätsel-Layer der aktiven Station (von SceneShell publiziert; nur Ref!)
  const sceneLayerRef = useRef(null);
  const setLayer = useCallback((fn) => { sceneLayerRef.current = fn; }, []);

  /* ── Ereignis-Animationen (Molar, Rollladen, Alarmstart) ───────────────── */
  const molarXRef = useRef(MOLAR.x);
  const shutterYRef = useRef(alreadyClosed ? SHUTTER_BOT : SHUTTER_TOP);
  const emergStartRef = useRef(null);
  const flags = useRef({});
  flags.current = {
    mode, molarLeaving, molarGone, molarEntering, dialogOpen: !!dialog,
    emergencyLight, shutterOpening,
    shutterDone: shutterYRef.current >= SHUTTER_BOT, taskLampFired: taskLamp,
  };

  useEffect(() => {
    let raf;
    let last = performance.now();
    const set = (ref, setter, val) => {
      if (Math.abs(ref.current - val) > 0.01) { ref.current = val; setter(val); }
    };
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const f = flags.current;

      if (f.molarLeaving && !f.molarGone) {
        const x = molarXRef.current - WALK_PX_S * dt;
        if (x <= MOLAR_EXIT_X) {
          set(molarXRef, setMolarX, MOLAR_EXIT_X);
          setMolarGone(true); setMolarLeaving(false);
          onIntroRef.current();
        } else set(molarXRef, setMolarX, x);
      }
      if (f.molarEntering) {
        const x = molarXRef.current + (WALK_PX_S * 0.85) * dt;
        if (x >= MOLAR.x) { set(molarXRef, setMolarX, MOLAR.x); setMolarEntering(false); }
        else set(molarXRef, setMolarX, x);
      }

      if (f.shutterOpening) {
        const y = shutterYRef.current - SHUTTER_PX_S * dt;
        if (y <= SHUTTER_TOP) { set(shutterYRef, setShutterY, SHUTTER_TOP); setShutterOpening(false); }
        else set(shutterYRef, setShutterY, y);
      } else if (f.emergencyLight && f.mode === 'playing' && !f.shutterDone) {
        const y = shutterYRef.current + SHUTTER_PX_S * dt;
        if (y >= SHUTTER_BOT) { set(shutterYRef, setShutterY, SHUTTER_BOT); FX.clunk(); }
        else set(shutterYRef, setShutterY, y);
      }

      // Zweite Alarm-Lampe 3 s nach Alarmbeginn
      if (f.emergencyLight && f.mode !== 'win') {
        if (emergStartRef.current == null) emergStartRef.current = now;
        if (!f.taskLampFired && now - emergStartRef.current >= 3000) {
          setTaskLamp(true); FX.clunk();
        }
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── Kamerafahrten ─────────────────────────────────────────────────────── */
  const goToStation = useCallback((room) => {
    FX.click();
    setActiveStation(room);
    setTraveling(true);
    camCtrl.current.travelTo(segCenter(segIndexOfStation(room.id)), () => {
      setTraveling(false); FX.clunk();
    });
  }, []);

  const goHome = useCallback(() => {
    FX.click();
    setTraveling(true);
    camCtrl.current.travelTo(HUB_CENTER, () => {
      setTraveling(false); setActiveStation(null);
    });
  }, []);

  /* ── Hub-Logik ─────────────────────────────────────────────────────────── */
  const introShownRef = useRef(false);
  useEffect(() => {
    if (mode === 'playing' && !introDone && !alarmPending && !introShownRef.current) {
      introShownRef.current = true;
      setDialog({ speaker: 'Prof. Dr. Molar', lines: INTRO_DIALOG });
    }
  }, [mode, introDone, alarmPending]);

  const target = ROOMS.find((r) => !solvedIds.includes(r.id)) || null;
  const atHub = !activeStation;
  const busy = !!dialog || terminalOpen || molarLeaving || traveling;

  const onPick = (room) => {
    if (solvedIds.includes(room.id)) {
      FX.clunk();
      setDialog({ speaker: 'Prof. Dr. Molar', lines: ['Diese Kammer ist bereits gelöst. Gut gemacht!'] });
    } else if (target && room.id === target.id) {
      goToStation(room);
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

  /* ── Win-Sequenz: heimfahren, Rollladen auf, Molar kommt zurück ────────── */
  const winStartedRef = useRef(false);
  useEffect(() => {
    if (mode === 'win' && !winStartedRef.current) {
      winStartedRef.current = true;
      setDialog(null); setTerminalOpen(false);
      const begin = () => {
        setTraveling(false); setActiveStation(null);
        setShutterOpening(true);
        molarXRef.current = MOLAR_EXIT_X;
        setMolarX(MOLAR_EXIT_X);
        setMolarGone(false);
        setMolarEntering(true);
      };
      if (Math.abs(camCtrl.current.x - HUB_CENTER) > 1) {
        setTraveling(true);
        camCtrl.current.travelTo(HUB_CENTER, begin);
      } else begin();
    }
  }, [mode]);
  const winArrived = mode === 'win' && !molarEntering && !molarGone && molarX >= MOLAR.x - 1;

  /* ── Welt→Bildschirm (DOM-Overlays; Kamera steht bei Nutzung still) ────── */
  const activeSegX = activeStation ? stationX(activeStation.id) : HUB_X;
  const restCamX = atHub ? HUB_CENTER : segCenter(segIndexOfStation(activeStation.id));
  const worldToScreen = useCallback((r, segOffsetX = 0) => (
    L.toScreen({ ...r, x: r.x + segOffsetX - (restCamX - SCENE_W / 2) })
  ), [L, restCamX]);

  const worldL = useMemo(() => ({
    ...L,
    toScreen: (r) => worldToScreen(r, activeSegX),
  }), [L, worldToScreen, activeSegX]);

  const worldCtx = useMemo(() => ({
    setLayer, L: worldL, traveling,
  }), [setLayer, worldL, traveling]);

  const ActiveScene = activeStation ? ROOM_COMPONENTS[activeStation.scene] : null;
  const timerColor = danger ? '#f06b6b' : '#6fe87a';
  const screenRect = worldToScreen(TERMINAL_SCREEN, HUB_X);
  const hubUI = atHub && !traveling && mode !== 'start';
  const molarSpeaking = (!!dialog && !introDone && !molarGone) || (winArrived && !winDialogDone);

  return (
    <View style={styles.root}>
      <BackdropHD horizon={HORIZON} accent={activeStation ? activeStation.accent : '#3fb4c4'} />

      <WorldCanvasView
        L={L} camCtrl={camCtrl.current} staticPic={staticPic}
        sceneLayerRef={sceneLayerRef} activeSegX={activeSegX} hasStation={!!activeStation}
        solvedIds={solvedIds} targetId={target ? target.id : null}
        mode={mode} emergencyLight={emergencyLight} danger={danger}
        taskLamp={taskLamp} atHub={atHub}
        molarX={molarX} molarGone={molarGone}
        molarWalking={molarLeaving || molarEntering} molarSpeaking={molarSpeaking}
        shutterY={shutterY} pressed={!busy ? pressed : null} worldL={worldL}
      />

      <CRTOverlay L={L} intensity={emergencyLight && mode !== 'win' ? 1 : 0.85} />

      {/* ── Terminal-Bildschirmtext (DOM) ── */}
      {hubUI && !terminalOpen && (
        <View pointerEvents="none" style={[styles.screen, rectStyle(screenRect)]}>
          {!emergencyLight || mode === 'win' ? (
            <>
              <Text style={styles.screenBig}>CHEM. LABS</Text>
              <Text style={styles.screenSub}>MUENCHEN</Text>
              <Text style={styles.screenSub}>{mode === 'win' ? 'STATUS: FREI' : 'STATUS: OK'}</Text>
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

      {/* ── Hub-Interaktion ── */}
      {hubUI && !busy && mode === 'playing' && (
        <>
          <Pressable
            style={[styles.hotspot, rectStyle(worldToScreen(TERMINAL, HUB_X))]}
            onPressIn={() => setPressed({ rect: TERMINAL, color: '#6fe87a' })}
            onPressOut={() => setPressed(null)}
            onPress={() => { FX.click(); setTerminalOpen(true); }}
          />
          <NavBar rooms={ROOMS} solvedIds={solvedIds} target={target}
            onPick={onPick} onTerminal={() => { FX.click(); setTerminalOpen(true); }} />
        </>
      )}

      {/* ── Aktive Station (DOM via SceneShell-Bridge) ── */}
      <WorldContext.Provider value={worldCtx}>
        {ActiveScene && mode === 'playing' && (
          <ActiveScene
            key={activeStation.id}
            room={activeStation}
            onBack={goHome}
            onReveal={onReveal}
            initiallySolved={revealedIds.includes(activeStation.id)}
            emergencyLight={emergencyLight}
            danger={danger}
          />
        )}
      </WorldContext.Provider>

      {dialog && (
        <PixelDialog speaker={dialog.speaker} lines={dialog.lines} onClose={handleDialogClose} />
      )}
      {terminalOpen && (
        <Terminal rooms={ROOMS} solvedIds={solvedIds} onSubmit={onSubmitCode}
          onClose={() => setTerminalOpen(false)} />
      )}

      {mode === 'start' && <StartOverlay onStart={onStart} />}

      {winArrived && !winDialogDone && (
        <PixelDialog speaker="Prof. Dr. Molar" lines={WIN_DIALOG}
          onClose={() => setWinDialogDone(true)} />
      )}
      {mode === 'win' && winDialogDone && (
        <WinStats elapsed={elapsed} onRestart={onRestart} />
      )}

      {mode === 'fail' && <FailOverlay solvedIds={solvedIds} onRestart={onRestart} />}
    </View>
  );
}

const rectStyle = (r) => ({ left: r.left, top: r.top, width: r.width, height: r.height });

/* ── Overlays: Start / Win / Fail (DOM über der Welt-Canvas) ─────────────── */

function StartOverlay({ onStart }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.overlayFull, { opacity: fade }]}>
      <Text style={styles.title}>CHEMIE</Text>
      <Text style={styles.subtitle}>ESCAPE ROOM</Text>
      <Text style={styles.tagline}>Prof. Dr. Molars Labor — München</Text>
      <Pressable style={({ pressed }) => [styles.startBtn, pressed && styles.btnPressed]} onPress={onStart}>
        <Text style={styles.startTxt}>▶  STARTEN</Text>
      </Pressable>
    </Animated.View>
  );
}

function WinStats({ elapsed, onRestart }) {
  return (
    <View style={styles.bottomOverlay} pointerEvents="box-none">
      <Text style={styles.winHead}>AUSGANG FREI!</Text>
      <Text style={styles.winLabel}>GELÖST IN</Text>
      <Text style={styles.winTime}>{fmtTime(elapsed)}</Text>
      <View style={styles.codeRow}>
        {ROOMS.map((r) => (
          <View key={r.id} style={styles.codeCol}>
            <Text style={[styles.codeVal, { color: r.accent }]}>{r.code}</Text>
            <Text style={styles.codeTheme}>{r.theme}</Text>
          </View>
        ))}
      </View>
      <Pressable style={({ pressed }) => [styles.winBtn, pressed && styles.btnPressed]} onPress={onRestart}>
        <Text style={styles.winBtnTxt}>▶  NOCHMAL SPIELEN</Text>
      </Pressable>
    </View>
  );
}

function FailOverlay({ solvedIds, onRestart }) {
  return (
    <View style={styles.overlayFull} pointerEvents="box-none">
      <View style={styles.failBanner}>
        <Text style={styles.failIcon}>{'[!]'}</Text>
        <View>
          <Text style={styles.failTitle}>SICHERHEITSPROTOKOLL</Text>
          <Text style={styles.failSub}>PERMANENT AKTIVIERT — NOTABSCHALTUNG</Text>
        </View>
      </View>
      <Text style={styles.failHead}>[!]  ZEIT ABGELAUFEN  [!]</Text>
      <Text style={styles.winLabel}>KAMMERSTATUS</Text>
      <View style={styles.codeRow}>
        {ROOMS.map((r) => {
          const ok = solvedIds.includes(r.id);
          return (
            <View key={r.id} style={styles.codeCol}>
              <Text style={[styles.codeVal, { color: ok ? r.accent : '#2a2a3a' }]}>{ok ? r.code : '----'}</Text>
              <Text style={[styles.codeTheme, { color: ok ? '#718096' : '#2a2a3a' }]}>{r.theme}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.failVerdict}>
        {solvedIds.length === 0
          ? 'Kein einziger Code — das Protokoll war gnadenlos.'
          : `${solvedIds.length} von ${ROOMS.length} Kammern geloest. Naechstes Mal schneller!`}
      </Text>
      <Pressable style={({ pressed }) => [styles.failBtn, pressed && styles.btnPressed]} onPress={onRestart}>
        <Text style={styles.failBtnTxt}>▶  NOCHMAL VERSUCHEN</Text>
      </Pressable>
    </View>
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

  overlayFull: {
    position: 'absolute', left: 0, top: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  title: {
    color: '#6fd3dd', fontFamily: 'monospace', fontSize: 52, fontWeight: 'bold',
    letterSpacing: 12, textShadowColor: '#6fd3dd', textShadowRadius: 18,
  },
  subtitle: {
    color: '#6fd3dd', fontFamily: 'monospace', fontSize: 20, fontWeight: 'bold',
    letterSpacing: 8, marginTop: -8, textShadowColor: '#6fd3dd', textShadowRadius: 10,
  },
  tagline: { color: '#8fa6b4', fontFamily: 'monospace', fontSize: 11, letterSpacing: 2, marginTop: 4, marginBottom: 28 },
  startBtn: {
    borderWidth: 2, borderColor: '#6fd3dd', borderRadius: 8, paddingHorizontal: 40, paddingVertical: 14,
    backgroundColor: 'rgba(10,16,24,0.55)', shadowColor: '#6fd3dd', shadowOpacity: 0.35, shadowRadius: 18,
  },
  startTxt: { color: '#6fd3dd', fontFamily: 'monospace', fontSize: 15, fontWeight: 'bold', letterSpacing: 2 },
  btnPressed: { opacity: 0.7 },

  bottomOverlay: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    alignItems: 'center', paddingBottom: 30, paddingHorizontal: 20,
  },
  winHead: {
    color: '#6fe87a', fontFamily: 'monospace', fontSize: 20, fontWeight: 'bold',
    letterSpacing: 3, marginBottom: 8, textShadowColor: '#6fe87a', textShadowRadius: 8,
  },
  winLabel: { color: '#718096', fontFamily: 'monospace', fontSize: 9, letterSpacing: 3 },
  winTime: { color: '#6fe87a', fontFamily: 'monospace', fontSize: 44, fontWeight: 'bold', letterSpacing: 6, marginBottom: 12 },
  codeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  codeCol: { alignItems: 'center' },
  codeVal: { fontFamily: 'monospace', fontSize: 20, fontWeight: 'bold', letterSpacing: 4 },
  codeTheme: { color: '#718096', fontFamily: 'monospace', fontSize: 8, marginTop: 2 },
  winBtn: {
    borderWidth: 2, borderColor: '#6fe87a', borderRadius: 8, paddingHorizontal: 28,
    paddingVertical: 12, backgroundColor: 'rgba(10,16,24,0.55)',
  },
  winBtnTxt: { color: '#6fe87a', fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },

  failBanner: {
    position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(10,0,0,0.85)', borderBottomWidth: 2, borderColor: '#c01008',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  failIcon: { color: '#ff2010', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 13, marginRight: 10 },
  failTitle: { color: '#f06b6b', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold', letterSpacing: 2 },
  failSub: { color: '#804040', fontFamily: 'monospace', fontSize: 9, letterSpacing: 1 },
  failHead: {
    color: '#f06b6b', fontFamily: 'monospace', fontSize: 22, fontWeight: 'bold',
    letterSpacing: 3, textAlign: 'center', marginBottom: 24,
  },
  failVerdict: { color: '#718096', fontFamily: 'monospace', fontSize: 11, textAlign: 'center', marginBottom: 24, lineHeight: 18 },
  failBtn: { borderWidth: 2, borderColor: '#f06b6b', borderRadius: 8, paddingHorizontal: 28, paddingVertical: 12 },
  failBtnTxt: { color: '#f06b6b', fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
});
