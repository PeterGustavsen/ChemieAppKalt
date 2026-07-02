/*
 * HubArtHD — prozedurale HD-Version des Labor-Hubs (ersetzt scene_01_lab_hub.png).
 *
 * Navigation zu den Stationen läuft AUSSCHLIESSLICH über die NavBar; im Raum
 * gibt es keine anklickbaren Stations-Objekte. Die Immersion kommt von der
 * Kamera: beim Anwählen einer Station „dreht der Spieler den Kopf“ zur
 * Labortür links (DOOR_RECT — der Durchgang zu den Kammern, durch den auch
 * Molar verschwindet) und die Szene blendet in den Raum über.
 *
 * Story-Objekte bleiben erhalten: Fenster+Rollladen (zeichnet Scene1Hub über
 * dieser Ebene, Koordinaten WIN unverändert), Funkgerät (RadioBox), rote
 * Alarmleuchten (Beacon-Gehäuse an LAMP_MAIN/LAMP_TASKS), Terminal, Tür.
 */
import React from 'react';
import {
  Group, Rect, RoundedRect, Circle, Oval, Path, Line,
  LinearGradient, RadialGradient, BlurMask, vec,
} from '@shopify/react-native-skia';
import {
  TiledWall, Baseboard, LabFloor, LampCone, DustLayer, AlarmBeacon,
  ShelfVials, WallClock, Extinguisher, RadioBox, SlidingDoor, CalendarPoster,
  ContactShadow, WireRun,
} from './atoms';
import { T, alpha, shade, flicker, rnd } from './theme';
import { SCENE_W, SCENE_H } from '../config/game';

export const HORIZON = 250;

// Labortür links — Kamera-Ziel beim „Kopfdrehen“ zu einer Station.
export const DOOR_RECT = { x: -6, y: 92, w: 42, h: HORIZON - 92 };

// Radio-Position (Story-Objekt) — Scene1Hub nutzt sie für den Funk-Puls.
export const RADIO_POS = { x: 148, y: 64, w: 46, h: 30 };

/* Periodensystem-Poster — Deko an der rechten Wand. */
function PeriodicPoster({ x, y, w = 120, h = 84 }) {
  const cols = ['#6fd3dd', '#e36fb0', '#e0b44c', '#6fe87a', '#9660c8', '#f0907a'];
  const cells = [];
  const cw = (w - 12) / 9, ch = (h - 22) / 5;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 9; c++) {
      // grobe PSE-Silhouette: oben nur Ecken, unten voll
      if (r === 0 && c > 0 && c < 8) continue;
      if ((r === 1 || r === 2) && c > 1 && c < 6) continue;
      const v = rnd(r * 17 + c * 3);
      cells.push(
        <Rect key={`${r}-${c}`} x={x + 6 + c * cw} y={y + 16 + r * ch}
          width={cw - 1.2} height={ch - 1.2}
          color={v > 0.72 ? alpha(cols[Math.floor(v * 47) % 6], 0.75) : 'rgba(205,225,235,0.16)'} />
      );
    }
  }
  return (
    <Group>
      <RoundedRect x={x - 3} y={y - 3} width={w + 6} height={h + 6} r={2} color="#39434d" />
      <Rect x={x} y={y} width={w} height={h} color="#141c24" />
      <Rect x={x + 6} y={y + 5} width={w * 0.45} height={5} color="#6fd3dd" opacity={0.75} />
      {cells}
    </Group>
  );
}

/* Terminal-Arbeitsplatz: Monitor (Screen = TERMINAL_SCREEN 258,132,126,106),
   Standfuß, Schreibtisch mit Schubladen, Tastatur, Kabel. */
function TerminalDesk({ t, emergencyLight }) {
  const S = { x: 258, y: 132, w: 126, h: 106 };      // TERMINAL_SCREEN
  const glow = emergencyLight ? 0.05 : 0.10 + 0.02 * Math.sin(t * 1.1);
  return (
    <Group>
      {/* Schreibtisch */}
      <ContactShadow cx={321} y={344} w={230} o={0.5} />
      <RoundedRect x={218} y={262} width={206} height={80} r={3}>
        <LinearGradient start={vec(218, 262)} end={vec(218, 342)}
          colors={[T.woodTop, T.wood, T.woodDark]} positions={[0, 0.2, 1]} />
      </RoundedRect>
      <Rect x={218} y={262} width={206} height={3} color="rgba(255,230,180,0.3)" />
      {/* Schubladen */}
      <RoundedRect x={238} y={286} width={76} height={20} r={2} color={shade(T.wood, -0.25)} />
      <RoundedRect x={328} y={286} width={76} height={20} r={2} color={shade(T.wood, -0.25)} />
      <RoundedRect x={268} y={294} width={16} height={3} r={1.5} color="#c9a86a" />
      <RoundedRect x={358} y={294} width={16} height={3} r={1.5} color="#c9a86a" />
      {/* Monitor-Standfuß */}
      <Rect x={308} y={246} width={26} height={14} color="#38424c" />
      <RoundedRect x={288} y={258} width={66} height={6} r={3} color="#2b333c" />
      {/* Monitor-Gehäuse */}
      <RoundedRect x={S.x - 9} y={S.y - 9} width={S.w + 18} height={S.h + 18} r={7}>
        <LinearGradient start={vec(S.x, S.y - 9)} end={vec(S.x, S.y + S.h + 9)}
          colors={['#6a7a88', '#46535e', '#333d46']} />
      </RoundedRect>
      {/* Bildschirmglas */}
      <RoundedRect x={S.x} y={S.y} width={S.w} height={S.h} r={3} color="#05130a" />
      <RoundedRect x={S.x} y={S.y} width={S.w} height={S.h} r={3}>
        <LinearGradient start={vec(S.x, S.y)} end={vec(S.x, S.y + S.h)}
          colors={[alpha('#6fe87a', glow), 'rgba(0,0,0,0)']} />
      </RoundedRect>
      {/* feine Scanlines im Terminal */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Rect key={i} x={S.x} y={S.y + 8 + i * 15} width={S.w} height={1} color="rgba(111,232,122,0.05)" />
      ))}
      <Group clip={{ x: S.x, y: S.y, width: S.w, height: S.h }}>
        <Path path={`M ${S.x + S.w * 0.68} ${S.y} L ${S.x + S.w * 0.8} ${S.y} L ${S.x + S.w * 0.42} ${S.y + S.h} L ${S.x + S.w * 0.3} ${S.y + S.h} Z`}
          color="rgba(255,255,255,0.045)" />
      </Group>
      {/* Power-LED */}
      <Circle cx={S.x + S.w - 6} cy={S.y + S.h + 4.5} r={1.6}
        color={emergencyLight ? '#ff4020' : '#6fe87a'} />
      {/* Tastatur */}
      <RoundedRect x={276} y={266} width={90} height={12} r={2} color="#2b333c" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Rect key={i} x={280 + i * 10.6} y={268.5} width={7.5} height={3} color="#46535e" />
      ))}
      <Rect x={292} y={273.5} width={58} height={2.5} color="#46535e" />
      {/* Kabel hinter dem Tisch */}
      <WireRun col="#20282f" w={2.5} pts={[[404, 300], [430, 316], [436, 340]]} />
    </Group>
  );
}

export default function HubArtHD({
  t = 0, emergencyLight = false, danger = false, radioActive = false,
}) {
  const lampK = emergencyLight ? 0.35 : flicker(t, 3);
  return (
    <Group>
      {/* Raum-Hülle */}
      <TiledWall h={HORIZON} seed={11} />
      <Rect x={0} y={16} width={SCENE_W} height={5} color={T.steelDark} />
      <Rect x={0} y={16} width={SCENE_W} height={1.4} color="rgba(255,255,255,0.14)" />
      {[60, 320, 600].map((px) => (
        <Rect key={px} x={px} y={13} width={8} height={11} color={T.steel} />
      ))}
      <Baseboard y={HORIZON} accent="#3fb4c4" />
      <LabFloor y={HORIZON} />

      {/* Decke: warme Hauptlampe + zweite Lampe über der Kammern-Wand */}
      <LampCone cx={320} reachY={HORIZON} k={lampK} />
      <LampCone cx={534} reachY={HORIZON} spreadTop={18} spreadBot={90} k={lampK * 0.8} />
      {/* Alarm-Beacons (Gehäuse immer sichtbar — Story-Objekt „rotes Licht“) */}
      <AlarmBeacon cx={368} cy={6} on={emergencyLight} t={t} danger={danger} />
      <AlarmBeacon cx={498} cy={6} on={emergencyLight} t={t} danger={danger} sweepReach={220} />

      {/* Linke Wand: Tür, Kalender, Uhr, Funkgerät, Regal */}
      <SlidingDoor x={-6} y={92} w={42} h={HORIZON - 92} />
      <CalendarPoster x={52} y={32} w={86} h={64} />
      <WallClock cx={166} cy={42} r={13} t={t} />
      <RadioBox x={RADIO_POS.x} y={RADIO_POS.y} w={RADIO_POS.w} h={RADIO_POS.h}
        active={radioActive} t={t} />
      <ShelfVials x={44} y={140} w={148} n={5} seed={4} />

      {/* Rechte Wand: Periodensystem-Poster + Chemikalien-Regale */}
      <PeriodicPoster x={452} y={34} w={124} h={84} />
      <ShelfVials x={450} y={158} w={168} n={6} seed={13} />
      <ShelfVials x={470} y={216} w={130} n={4} seed={21} />
      <Extinguisher x={610} y={252} h={34} />

      {/* Terminal-Arbeitsplatz (Mitte) */}
      <TerminalDesk t={t} emergencyLight={emergencyLight} />

      {/* Staub im Lichtkegel */}
      <DustLayer t={t} h={HORIZON - 16} seed={9} count={16} />
    </Group>
  );
}
