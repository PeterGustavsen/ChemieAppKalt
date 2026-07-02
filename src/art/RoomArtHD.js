/*
 * RoomArtHD — prozeduraler HD-Hintergrund je Rätselraum (Szenen-Id 2–7).
 * Ersetzt die Pixel-PNGs. WICHTIG: Die Requisiten sitzen exakt auf den
 * Koordinaten, auf die die Rätsel-Layer der Szenen zeichnen (Becher-Slots,
 * Voltmeter, Nagel, Platten, Zylinder, Viewer …) — diese Rects stammen aus
 * den Szenen-Dateien und dürfen nur zusammen mit ihnen geändert werden.
 */
import React from 'react';
import {
  Group, Rect, RoundedRect, Circle, Oval, Path, Line,
  LinearGradient, RadialGradient, BlurMask, vec,
} from '@shopify/react-native-skia';
import {
  TiledWall, Baseboard, LabFloor, LampCone, DustLayer, AlarmBeacon,
  WoodBench, SteelStrip, Panel, GlassVessel, Bottle, PetriDish, Nail,
  WireRun, ContactShadow,
} from './atoms';
import { T, alpha, shade } from './theme';
import { SCENE_W, SCENE_H } from '../config/game';

// Bodenkante (Horizont) je Szene — Requisiten stehen auf dieser Linie.
export const ROOM_HORIZON = { 2: 258, 3: 262, 4: 286, 5: 256, 6: 272, 7: 284 };

/* Szene 2 — Galvanische Zelle: Voltmeter (248,56,144,60), Becher-Slots
   (150,150,70,90) & (420,150,70,90), Salzbrücke/Leitungen dazwischen. */
function Room2({ accent }) {
  const VM = { x: 248, y: 56, w: 144, h: 60 };
  const LS = { x: 150, y: 150, w: 70, h: 90 };
  const RS = { x: 420, y: 150, w: 70, h: 90 };
  return (
    <Group>
      {/* Leitungszug: Voltmeter → beide Becher (Kupferschiene) */}
      <WireRun col="#c9a227" w={4} pts={[
        [LS.x + LS.w / 2, LS.y + 6], [LS.x + LS.w / 2, 128], [VM.x - 12, 128],
        [VM.x - 12, VM.y + VM.h / 2],
      ]} />
      <WireRun col="#c9a227" w={4} pts={[
        [RS.x + RS.w / 2, RS.y + 6], [RS.x + RS.w / 2, 128], [VM.x + VM.w + 12, 128],
        [VM.x + VM.w + 12, VM.y + VM.h / 2],
      ]} />
      {/* Salzbrücke zwischen den Bechern */}
      <WireRun col="#9dd7e0" w={7} pts={[
        [LS.x + LS.w - 14, LS.y + 26], [LS.x + LS.w - 14, 136],
        [RS.x + 14, 136], [RS.x + 14, RS.y + 26],
      ]} />
      {/* Voltmeter-Gehäuse (Nadel zeichnet die Szene selbst) */}
      <Panel x={VM.x} y={VM.y} w={VM.w} h={VM.h} accent={accent} />
      <Circle cx={VM.x + VM.w / 2} cy={VM.y + VM.h - 8} r={3} color="#7c8ea0" />
      {/* Werkbank, auf der die Becher stehen (Becherboden = 240) */}
      <WoodBench x={64} y={240} w={512} h={15} legs={false} />
      {/* Becher mit Elektrolyt */}
      <GlassVessel x={LS.x} y={LS.y} w={LS.w} h={LS.h} liquid="#3fb4c4" level={0.62} />
      <GlassVessel x={RS.x} y={RS.y} w={RS.w} h={RS.h} liquid="#3fb4c4" level={0.62} />
    </Group>
  );
}

/* Szene 3 — Opferanode: Petrischale (Mitte 320,195), Nagel 250→384 auf y=199,
   Readout-Panel hinter dem RN-Label (46,62,228,44). */
function Room3({ accent }) {
  return (
    <Group>
      <Panel x={38} y={52} w={244} h={60} accent={accent} />
      {/* Labortisch — die Schale steht vorn über der Tischkante */}
      <WoodBench x={92} y={246} w={456} h={14} legs={false} />
      <PetriDish cx={320} cy={195} rx={106} ry={72} />
      <Nail x0={250} x1={384} y={199} />
    </Group>
  );
}

/* Szene 4 — Rosten: großes Readout-Panel oben, Stahlplatte (Tropfen-Basis
   y=250), Montage-Platten hinter den Slot-Anzeigen (176,200,80,46)/(300,160,90,46). */
function Room4({ accent }) {
  return (
    <Group>
      <Panel x={198} y={48} w={244} h={66} accent={accent} />
      <Panel x={172} y={196} w={88} h={54} accent={accent} screen={false} screws={false} />
      <Panel x={296} y={156} w={98} h={54} accent={accent} screen={false} screws={false} />
      {/* Stahlplatte, auf der der Wassertropfen sitzt */}
      <SteelStrip x={0} y={250} w={SCENE_W} h={30} hazard />
    </Group>
  );
}

/* Szene 5 — Bromonium: 3 Mechanismus-Tafeln (56/192/328,132,120,104),
   Readout (470,60,140,56), Br₂-Flasche rechts. */
function Room5({ accent }) {
  const plates = [{ x: 56 }, { x: 192 }, { x: 328 }];
  return (
    <Group>
      <Panel x={470} y={60} w={140} h={56} accent={accent} />
      {plates.map((p, i) => (
        <Group key={i}>
          {/* Holzrahmen-Tafel („Kreidetafel“) */}
          <RoundedRect x={p.x - 6} y={126} width={132} height={116} r={3} color="#4a3b28" />
          <Panel x={p.x} y={132} w={120} h={104} accent={accent} screws={false} />
          {/* Kreidestaub-Ablage */}
          <Rect x={p.x + 8} y={232} width={104} height={3} color="rgba(230,230,220,0.12)" />
        </Group>
      ))}
      {/* Werkbank unter Tafeln + Flasche (Unterkante 240) */}
      <WoodBench x={40} y={240} w={560} h={14} legs={false} />
      <Bottle x={496} y={152} w={42} h={88} col="#e0863a" />
    </Group>
  );
}

/* Szene 6 — Bromwasser: 3 Standzylinder (120/290/460,120,60,140) vor einer
   Holztraverse, Readout (40,56,200,56), Tropfflasche rechts. */
function Room6({ accent }) {
  const tubes = [{ x: 120 }, { x: 290 }, { x: 460 }];
  return (
    <Group>
      <Panel x={40} y={56} w={200} h={56} accent={accent} />
      {/* Holztraverse hinter den Zylindern */}
      <WoodBench x={96} y={128} w={448} h={11} legs={false} />
      {/* Labortresen, auf dem die Zylinder stehen */}
      <SteelStrip x={72} y={264} w={496} h={12} />
      {tubes.map((tb, i) => (
        <Group key={i}>
          {/* Sockel */}
          <RoundedRect x={tb.x - 8} y={258} width={76} height={8} r={2} color={T.steelDark} />
          <GlassVessel x={tb.x} y={120} w={60} h={140} liquid={null} tint="rgba(150,215,235,0.10)" />
        </Group>
      ))}
      {/* Tropfflasche */}
      <Bottle x={560} y={176} w={26} h={62} col="#e0863a" label={false} />
      <Path path="M 573 176 L 573 162 L 578 156 L 581 162 L 581 176 Z" color="#38434c" />
    </Group>
  );
}

/* Szene 7 — Isomerie: Molekül-Viewer (160,120,320,140) mit Gitter,
   Chip-Panel (38,50,220,60), Fortschritt (470,56,140,56). */
function Room7({ accent }) {
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
      {/* Viewer mit Standfuß */}
      <Rect x={V.x + V.w / 2 - 24} y={V.y + V.h + 4} width={48} height={16} color={T.steelDark} />
      <Rect x={V.x + V.w / 2 - 44} y={V.y + V.h + 18} width={88} height={5} color="#2a343c" />
      <Panel x={V.x} y={V.y} w={V.w} h={V.h} accent={accent} r={6} />
      {grid}
    </Group>
  );
}

const ROOM_PROPS = { 2: Room2, 3: Room3, 4: Room4, 5: Room5, 6: Room6, 7: Room7 };

/*
 * Kompletter Raum-Hintergrund. t = Ambient-Uhr (Sekunden) für Staub/Beacon;
 * emergencyLight/danger steuern die Alarm-Rundumleuchte an der Decke.
 */
export default function RoomArtHD({ sceneId, accent, t = 0, emergencyLight = false, danger = false }) {
  const horizon = ROOM_HORIZON[sceneId] || 258;
  const Props = ROOM_PROPS[sceneId];
  return (
    <Group>
      <TiledWall h={horizon} seed={sceneId * 17} />
      {/* Wand-Rohrleitung oben */}
      <Rect x={0} y={16} width={SCENE_W} height={5} color={T.steelDark} />
      <Rect x={0} y={16} width={SCENE_W} height={1.4} color="rgba(255,255,255,0.14)" />
      {[90, 300, 540].map((px) => (
        <Rect key={px} x={px} y={13} width={8} height={11} color={T.steel} />
      ))}
      <Baseboard y={horizon} accent={accent} />
      <LabFloor y={horizon} />
      {/* vordere Arbeitsplatte am unteren Bildrand */}
      <WoodBench x={-8} y={horizon + 44} w={SCENE_W + 16} h={16} legs={false} />
      <LampCone cx={SCENE_W / 2} reachY={horizon} />
      <AlarmBeacon cx={SCENE_W / 2 + 52} cy={8} on={emergencyLight} t={t} danger={danger} />
      {Props && <Props accent={accent} />}
      <DustLayer t={t} h={horizon - 20} seed={sceneId * 7} />
    </Group>
  );
}
