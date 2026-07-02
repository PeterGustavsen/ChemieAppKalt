/*
 * world — Layout der EINEN durchgehenden Laborhalle.
 *
 * Das ganze Spiel ist ein einziger, 7 Segmente breiter Raum:
 *
 *   [St.1][St.2][St.3][ TERMINAL-HUB ][St.4][St.5][St.6]
 *
 * Die Kamera (ein 640×360-Fenster) FÄHRT beim Stationswechsel durch die Halle
 * — kein Szenenwechsel mehr. Jedes Segment ist 640 Szenen-px breit; die
 * Rätsel-Layer der Szenen zeichnen unverändert in ihren 0..640-Koordinaten
 * und werden nur um den Segment-Offset verschoben.
 *
 * WorldStatic ist der komplette UNBEWEGTE Teil der Halle und wird einmalig
 * per drawAsPicture in ein SkPicture aufgenommen → pro Frame bleibt nur eine
 * Handvoll dynamischer Elemente (Kamera, Molar, LEDs, Alarm, Staub).
 */
import React from 'react';
import {
  Group, Rect, RoundedRect, Circle, Oval, Path, Line,
  LinearGradient, RadialGradient, BlurMask, vec,
} from '@shopify/react-native-skia';
import {
  Baseboard, LampCone, Panel, GlassVessel, Bottle, PetriDish, Nail,
  WireRun, SteelStrip, WoodBench, ShelfVials, WallClock, Extinguisher,
  RadioBox, SlidingDoor, CalendarPoster, ContactShadow, SevenSeg,
} from './atoms';
import { T, alpha, shade, rnd } from './theme';
import { SCENE_W, SCENE_H, ROOMS } from '../config/game';

export const SEG_W = SCENE_W;                 // 640
export const WORLD_W = SEG_W * 7;             // 4480
export const HORIZON = 266;                   // eine Bodenkante für die ganze Halle

// Segment-Reihenfolge: Stationen 1-3 links, Hub in der Mitte, 4-6 rechts.
export const HUB_SEG = 3;
export const segIndexOfStation = (roomId) => (roomId <= 3 ? roomId - 1 : roomId);
export const segX = (segIdx) => segIdx * SEG_W;
export const stationX = (roomId) => segX(segIndexOfStation(roomId));
export const HUB_X = segX(HUB_SEG);
// Kamera-Zentrum eines Segments
export const segCenter = (segIdx) => segX(segIdx) + SEG_W / 2;

/* ── Zusätzliche Atome für die Halle ────────────────────────────────────── */

// Unterbau-Schrank: Werkbank-Platte + Front mit Türen bis zur Bodenkante.
export function CabinetBench({ x, y, w }) {
  const h = HORIZON - y;
  const doors = Math.max(2, Math.round(w / 110));
  const dw = (w - 16) / doors;
  return (
    <Group>
      <ContactShadow cx={x + w / 2} y={HORIZON + 3} w={w} o={0.35} />
      {/* Korpus */}
      <Rect x={x + 4} y={y + 10} width={w - 8} height={h - 10}>
        <LinearGradient start={vec(x, y)} end={vec(x, y + h)}
          colors={[shade(T.wood, -0.1), T.woodDark]} />
      </Rect>
      {/* Türen */}
      {Array.from({ length: doors }).map((_, i) => (
        <Group key={i}>
          <RoundedRect x={x + 10 + i * dw} y={y + 16} width={dw - 6} height={h - 24} r={2}
            color={shade(T.wood, -0.22)} />
          <RoundedRect x={x + 10 + i * dw + dw - 16} y={y + (h - 24) / 2 + 8} width={3} height={12} r={1.5}
            color="#c9a86a" />
        </Group>
      ))}
      {/* Platte */}
      <RoundedRect x={x} y={y} width={w} height={12} r={2}>
        <LinearGradient start={vec(x, y)} end={vec(x, y + 12)}
          colors={[T.woodTop, T.wood]} />
      </RoundedRect>
      <Rect x={x} y={y} width={w} height={1.4} color="rgba(255,230,180,0.28)" />
    </Group>
  );
}

// Hängendes Stations-Schild (statisch: Rahmen + Ziffer; LED-Leiste ist dynamisch).
export function StationSign({ segIdx, num, accent }) {
  const cx = segCenter(segIdx);
  const w = 92, h = 34, y = 26;
  const x = cx - w / 2;
  return (
    <Group>
      {/* Aufhängung */}
      <Line p1={vec(cx - 26, 18)} p2={vec(cx - 22, y)} color={T.steelDark} strokeWidth={2} />
      <Line p1={vec(cx + 26, 18)} p2={vec(cx + 22, y)} color={T.steelDark} strokeWidth={2} />
      <RoundedRect x={x - 3} y={y - 3} width={w + 6} height={h + 6} r={5}>
        <LinearGradient start={vec(x, y - 3)} end={vec(x, y + h + 3)}
          colors={[shade(T.steel, 0.12), T.steelDark]} />
      </RoundedRect>
      <RoundedRect x={x} y={y} width={w} height={h} r={3} color="#0b1218" />
      <SevenSeg digit={num} x={cx - 7} y={y + 6} w={14} h={22} color={accent} />
      {/* seitliche Zierstreifen */}
      <Rect x={x + 8} y={y + 8} width={16} height={2.4} color={alpha(accent, 0.5)} />
      <Rect x={x + 8} y={y + 14} width={10} height={2.4} color={alpha(accent, 0.3)} />
      <Rect x={x + w - 24} y={y + 8} width={16} height={2.4} color={alpha(accent, 0.5)} />
      <Rect x={x + w - 18} y={y + 14} width={10} height={2.4} color={alpha(accent, 0.3)} />
    </Group>
  );
}

// Trennsäule zwischen zwei Segmenten (Stahlpfeiler + Kabelkanal).
function DividerPillar({ x }) {
  return (
    <Group>
      <Rect x={x - 7} y={0} width={14} height={HORIZON}>
        <LinearGradient start={vec(x - 7, 0)} end={vec(x + 7, 0)}
          colors={[T.steelDark, T.steelLight, T.steelDark]} />
      </Rect>
      {[40, 120, 200].map((y) => (
        <Rect key={y} x={x - 7} y={y} width={14} height={4} color="rgba(0,0,0,0.3)" />
      ))}
      <Rect x={x - 2} y={0} width={4} height={HORIZON} color="rgba(0,0,0,0.25)" />
    </Group>
  );
}

/* ── Stations-Requisiten (nur Props, Wand/Boden liefert die Halle) ──────── */
/* Alle Koordinaten identisch zu den Rätsel-Layern der Szenen! */

function Station2Props({ accent }) {   // Galvanische Zelle
  const VM = { x: 248, y: 56, w: 144, h: 60 };
  const LS = { x: 150, y: 150, w: 70, h: 90 };
  const RS = { x: 420, y: 150, w: 70, h: 90 };
  return (
    <Group>
      <WireRun col="#c9a227" w={4} pts={[[LS.x + 35, LS.y + 6], [LS.x + 35, 128], [VM.x - 12, 128], [VM.x - 12, VM.y + 30]]} />
      <WireRun col="#c9a227" w={4} pts={[[RS.x + 35, RS.y + 6], [RS.x + 35, 128], [VM.x + VM.w + 12, 128], [VM.x + VM.w + 12, VM.y + 30]]} />
      <WireRun col="#9dd7e0" w={7} pts={[[LS.x + 56, LS.y + 26], [LS.x + 56, 136], [RS.x + 14, 136], [RS.x + 14, RS.y + 26]]} />
      <Panel x={VM.x} y={VM.y} w={VM.w} h={VM.h} accent={accent} />
      <Circle cx={VM.x + VM.w / 2} cy={VM.y + VM.h - 8} r={3} color="#7c8ea0" />
      <CabinetBench x={64} y={240} w={512} />
      <GlassVessel x={LS.x} y={LS.y} w={LS.w} h={LS.h} liquid="#3fb4c4" level={0.62} />
      <GlassVessel x={RS.x} y={RS.y} w={RS.w} h={RS.h} liquid="#3fb4c4" level={0.62} />
    </Group>
  );
}

function Station3Props({ accent }) {   // Opferanode
  return (
    <Group>
      <Panel x={38} y={52} w={244} h={60} accent={accent} />
      <CabinetBench x={92} y={246} w={456} />
      <PetriDish cx={320} cy={195} rx={106} ry={72} />
      <Nail x0={250} x1={384} y={199} />
    </Group>
  );
}

function Station4Props({ accent }) {   // Rosten von Eisen
  return (
    <Group>
      <Panel x={198} y={48} w={244} h={66} accent={accent} />
      <Panel x={172} y={196} w={88} h={54} accent={accent} screen={false} screws={false} />
      <Panel x={296} y={156} w={98} h={54} accent={accent} screen={false} screws={false} />
      {/* Stahltisch — Tropfen-Basis y=250, bis zur Bodenkante */}
      <SteelStrip x={70} y={250} w={500} h={HORIZON - 250} hazard />
    </Group>
  );
}

function Station5Props({ accent }) {   // Bromonium-Mechanismus
  const plates = [{ x: 56 }, { x: 192 }, { x: 328 }];
  return (
    <Group>
      <Panel x={470} y={60} w={140} h={56} accent={accent} />
      <CabinetBench x={40} y={240} w={560} />
      {plates.map((p, i) => (
        <Group key={i}>
          <RoundedRect x={p.x - 6} y={126} width={132} height={116} r={3} color="#4a3b28" />
          <Panel x={p.x} y={132} w={120} h={104} accent={accent} screws={false} />
          <Rect x={p.x + 8} y={232} width={104} height={3} color="rgba(230,230,220,0.12)" />
        </Group>
      ))}
      <Bottle x={496} y={152} w={42} h={88} col="#e0863a" />
    </Group>
  );
}

function Station6Props({ accent }) {   // Bromwasser-Test
  const tubes = [{ x: 120 }, { x: 290 }, { x: 460 }];
  return (
    <Group>
      <Panel x={40} y={56} w={200} h={56} accent={accent} />
      <WoodBench x={96} y={128} w={448} h={11} legs={false} />
      <SteelStrip x={72} y={252} w={496} h={HORIZON - 252} />
      {tubes.map((tb, i) => (
        <Group key={i}>
          <RoundedRect x={tb.x - 8} y={256} width={76} height={8} r={2} color={T.steelDark} />
          <GlassVessel x={tb.x} y={120} w={60} h={140} liquid={null} tint="rgba(150,215,235,0.10)" />
        </Group>
      ))}
      <Bottle x={560} y={176} w={26} h={62} col="#e0863a" label={false} />
      <Path path="M 573 176 L 573 162 L 578 156 L 581 162 L 581 176 Z" color="#38434c" />
    </Group>
  );
}

function Station7Props({ accent }) {   // Isomerie
  const V = { x: 160, y: 120, w: 320, h: 140 };
  const grid = [];
  for (let i = 1; i < 8; i++) {
    grid.push(<Line key={`v${i}`} p1={vec(V.x + (V.w / 8) * i, V.y + 4)} p2={vec(V.x + (V.w / 8) * i, V.y + V.h - 4)} color="rgba(111,232,122,0.06)" strokeWidth={1} />);
  }
  for (let i = 1; i < 4; i++) {
    grid.push(<Line key={`h${i}`} p1={vec(V.x + 4, V.y + (V.h / 4) * i)} p2={vec(V.x + V.w - 4, V.y + (V.h / 4) * i)} color="rgba(111,232,122,0.06)" strokeWidth={1} />);
  }
  return (
    <Group>
      <Panel x={38} y={50} w={220} h={60} accent={accent} />
      <Panel x={470} y={56} w={140} h={56} accent={accent} />
      <Rect x={V.x + V.w / 2 - 24} y={V.y + V.h + 4} width={48} height={HORIZON - V.y - V.h - 8} color={T.steelDark} />
      <Rect x={V.x + V.w / 2 - 44} y={HORIZON - 5} width={88} height={5} color="#2a343c" />
      <Panel x={V.x} y={V.y} w={V.w} h={V.h} accent={accent} r={6} />
      {grid}
    </Group>
  );
}

// Szenen-Id (2..7) → Props-Layer
const STATION_PROPS = {
  2: Station2Props, 3: Station3Props, 4: Station4Props,
  5: Station5Props, 6: Station6Props, 7: Station7Props,
};

/* ── Hub-Requisiten (statisch; Fenster/Rollladen/Molar/Uhr sind dynamisch) ── */

function HubProps() {
  return (
    <Group>
      {/* Linke Wand: Tür (Story: verriegelter Ausgang), Kalender, Funkgerät */}
      <SlidingDoor x={-6} y={92} w={42} h={HORIZON - 92} />
      <CalendarPoster x={52} y={32} w={86} h={64} />
      <RadioBox x={148} y={64} w={46} h={30} active={false} t={0} />
      <ShelfVials x={44} y={140} w={148} n={5} seed={4} />

      {/* Rechte Wand: Poster + Regale */}
      <PeriodicPosterStatic x={452} y={34} w={124} h={84} />
      <ShelfVials x={450} y={158} w={168} n={6} seed={13} />
      <ShelfVials x={470} y={216} w={130} n={4} seed={21} />
      <Extinguisher x={606} y={HORIZON + 4} h={34} />

      {/* Terminal-Schreibtisch */}
      <TerminalDeskStatic />
    </Group>
  );
}

// Periodensystem-Poster (aus HubArtHD übernommen, statisch)
function PeriodicPosterStatic({ x, y, w = 120, h = 84 }) {
  const cols = ['#6fd3dd', '#e36fb0', '#e0b44c', '#6fe87a', '#9660c8', '#f0907a'];
  const cells = [];
  const cw = (w - 12) / 9, ch = (h - 22) / 5;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 9; c++) {
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

// Schreibtisch + Monitor-Gehäuse (statisch; Screen-Text ist DOM, Glow statisch)
function TerminalDeskStatic() {
  const S = { x: 258, y: 132, w: 126, h: 106 };      // TERMINAL_SCREEN
  return (
    <Group>
      <ContactShadow cx={321} y={344} w={230} o={0.5} />
      <RoundedRect x={218} y={262} width={206} height={80} r={3}>
        <LinearGradient start={vec(218, 262)} end={vec(218, 342)}
          colors={[T.woodTop, T.wood, T.woodDark]} positions={[0, 0.2, 1]} />
      </RoundedRect>
      <Rect x={218} y={262} width={206} height={3} color="rgba(255,230,180,0.3)" />
      <RoundedRect x={238} y={286} width={76} height={20} r={2} color={shade(T.wood, -0.25)} />
      <RoundedRect x={328} y={286} width={76} height={20} r={2} color={shade(T.wood, -0.25)} />
      <RoundedRect x={268} y={294} width={16} height={3} r={1.5} color="#c9a86a" />
      <RoundedRect x={358} y={294} width={16} height={3} r={1.5} color="#c9a86a" />
      <Rect x={308} y={246} width={26} height={14} color="#38424c" />
      <RoundedRect x={288} y={258} width={66} height={6} r={3} color="#2b333c" />
      <RoundedRect x={S.x - 9} y={S.y - 9} width={S.w + 18} height={S.h + 18} r={7}>
        <LinearGradient start={vec(S.x, S.y - 9)} end={vec(S.x, S.y + S.h + 9)}
          colors={['#6a7a88', '#46535e', '#333d46']} />
      </RoundedRect>
      <RoundedRect x={S.x} y={S.y} width={S.w} height={S.h} r={3} color="#05130a" />
      <RoundedRect x={S.x} y={S.y} width={S.w} height={S.h} r={3}>
        <LinearGradient start={vec(S.x, S.y)} end={vec(S.x, S.y + S.h)}
          colors={[alpha('#6fe87a', 0.08), 'rgba(0,0,0,0)']} />
      </RoundedRect>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Rect key={i} x={S.x} y={S.y + 8 + i * 15} width={S.w} height={1} color="rgba(111,232,122,0.05)" />
      ))}
      <Group clip={{ x: S.x, y: S.y, width: S.w, height: S.h }}>
        <Path path={`M ${S.x + S.w * 0.68} ${S.y} L ${S.x + S.w * 0.8} ${S.y} L ${S.x + S.w * 0.42} ${S.y + S.h} L ${S.x + S.w * 0.3} ${S.y + S.h} Z`}
          color="rgba(255,255,255,0.045)" />
      </Group>
      <RoundedRect x={276} y={266} width={90} height={12} r={2} color="#2b333c" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Rect key={i} x={280 + i * 10.6} y={268.5} width={7.5} height={3} color="#46535e" />
      ))}
      <Rect x={292} y={273.5} width={58} height={2.5} color="#46535e" />
      <WireRun col="#20282f" w={2.5} pts={[[404, 300], [430, 316], [436, 340]]} />
    </Group>
  );
}

/* ── Halle: Wand, Boden, Sockel über die volle Weltbreite ──────────────── */

function WorldWall() {
  const tile = 40;
  const cols = Math.ceil(WORLD_W / tile);
  const rows = Math.ceil(HORIZON / tile);
  const tiles = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = rnd(3 + r * 31 + c * 7);
      if (v > 0.85) {
        tiles.push(
          <Rect key={`t${r}-${c}`} x={c * tile} y={r * tile} width={tile} height={tile}
            color={v > 0.94 ? T.wallSheen : 'rgba(0,10,14,0.10)'} />
        );
      }
    }
  }
  return (
    <Group>
      <Rect x={0} y={0} width={WORLD_W} height={HORIZON}>
        <LinearGradient start={vec(0, 0)} end={vec(0, HORIZON)}
          colors={[T.wallTop, T.wallBot]} />
      </Rect>
      {tiles}
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <Rect key={`h${i}`} x={0} y={i * tile} width={WORLD_W} height={1.2} color={T.wallGrout} />
      ))}
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <Rect key={`v${i}`} x={i * tile} y={0} width={1.2} height={HORIZON} color={T.wallGrout} />
      ))}
      <Rect x={0} y={0} width={WORLD_W} height={26}>
        <LinearGradient start={vec(0, 0)} end={vec(0, 26)}
          colors={['rgba(0,0,0,0.42)', 'rgba(0,0,0,0)']} />
      </Rect>
    </Group>
  );
}

function WorldFloor() {
  const H = SCENE_H - HORIZON;
  const joints = [];
  for (let k = 0, jy = HORIZON + 8; jy < SCENE_H; k++, jy += 14 + k * 7) {
    joints.push(<Rect key={`j${k}`} x={0} y={jy} width={WORLD_W} height={1.4} color={T.floorJoint} />);
  }
  const verts = [];
  for (let x = 0; x <= WORLD_W; x += 80) {
    verts.push(<Rect key={`v${x}`} x={x} y={HORIZON} width={1.2} height={H} color={T.floorJoint} />);
  }
  return (
    <Group>
      <Rect x={0} y={HORIZON} width={WORLD_W} height={H}>
        <LinearGradient start={vec(0, HORIZON)} end={vec(0, SCENE_H)}
          colors={[T.floorTop, T.floorBot]} />
      </Rect>
      {joints}
      {verts}
    </Group>
  );
}

/*
 * Der komplette statische Teil der Halle — wird einmalig per drawAsPicture
 * aufgenommen. KEINE zeitabhängigen Elemente hier!
 */
export function WorldStatic() {
  return (
    <Group>
      <WorldWall />
      {/* Rohrleitung über die ganze Halle */}
      <Rect x={0} y={16} width={WORLD_W} height={5} color={T.steelDark} />
      <Rect x={0} y={16} width={WORLD_W} height={1.4} color="rgba(255,255,255,0.14)" />
      {Array.from({ length: 14 }).map((_, i) => (
        <Rect key={i} x={90 + i * 320} y={13} width={8} height={11} color={T.steel} />
      ))}
      <Baseboard y={HORIZON} w={WORLD_W} />
      {/* Akzentstreifen der Sockelleiste je Segment (Wegweiser beim Fahren) */}
      {ROOMS.map((r) => (
        <Rect key={r.id} x={stationX(r.id) + 12} y={HORIZON - 3.5} width={SEG_W - 24}
          height={2.4} color={r.accent} opacity={0.8} />
      ))}
      <Rect x={HUB_X + 12} y={HORIZON - 3.5} width={SEG_W - 24} height={2.4} color="#3fb4c4" opacity={0.8} />
      <WorldFloor />

      {/* Deckenlampen: eine pro Segment (statischer Kegel) */}
      {Array.from({ length: 7 }).map((_, i) => (
        <LampCone key={i} cx={segCenter(i)} reachY={HORIZON} k={0.9} />
      ))}

      {/* Segment-Trenner */}
      {[1, 2, 3, 4, 5, 6].map((i) => <DividerPillar key={i} x={segX(i)} />)}

      {/* Stations-Segmente: Schild + Requisiten */}
      {ROOMS.map((r, i) => {
        const Props = STATION_PROPS[r.scene];
        const sIdx = segIndexOfStation(r.id);
        return (
          <Group key={r.id}>
            <StationSign segIdx={sIdx} num={i + 1} accent={r.accent} />
            <Group transform={[{ translateX: segX(sIdx) }]}>
              {Props && <Props accent={r.accent} />}
            </Group>
          </Group>
        );
      })}

      {/* Hub-Segment */}
      <Group transform={[{ translateX: HUB_X }]}>
        <HubProps />
      </Group>
    </Group>
  );
}
