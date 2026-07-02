/*
 * atoms — wiederverwendbare prozedurale HD-Requisiten (reines Skia, kein PNG).
 * Alles zeichnet in Szenen-Koordinaten (640×360) und ist dadurch auf jedem
 * Display gestochen scharf. Kein Text (Skia-Fonts vermeiden) — Beschriftungen
 * bleiben RN-Overlays; Ziffern gibt es als Sieben-Segment-Painter.
 */
import React from 'react';
import {
  Group, Rect, RoundedRect, Circle, Oval, Path, Line,
  LinearGradient, RadialGradient, BlurMask, vec,
} from '@shopify/react-native-skia';
import { T, alpha, shade, rnd } from './theme';
import { SCENE_W, SCENE_H } from '../config/game';

/* ── Raum-Hülle ─────────────────────────────────────────────────────────── */

// Fliesenwand mit Verlauf, Fugen und dezent variierten Kacheln.
export function TiledWall({ x = 0, y = 0, w = SCENE_W, h = 250, tile = 40, seed = 1 }) {
  const cols = Math.ceil(w / tile);
  const rows = Math.ceil(h / tile);
  const tiles = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = rnd(seed + r * 31 + c * 7);
      if (v > 0.82) {
        tiles.push(
          <Rect key={`t${r}-${c}`} x={x + c * tile} y={y + r * tile}
            width={tile} height={tile}
            color={v > 0.93 ? T.wallSheen : 'rgba(0,10,14,0.10)'} />
        );
      }
    }
  }
  return (
    <Group>
      <Rect x={x} y={y} width={w} height={h}>
        <LinearGradient start={vec(x, y)} end={vec(x, y + h)}
          colors={[T.wallTop, T.wallBot]} />
      </Rect>
      {tiles}
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <Rect key={`h${i}`} x={x} y={y + i * tile} width={w} height={1.2} color={T.wallGrout} />
      ))}
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <Rect key={`v${i}`} x={x + i * tile} y={y} width={1.2} height={h} color={T.wallGrout} />
      ))}
      {/* Deckenschatten */}
      <Rect x={x} y={y} width={w} height={26}>
        <LinearGradient start={vec(x, y)} end={vec(x, y + 26)}
          colors={['rgba(0,0,0,0.42)', 'rgba(0,0,0,0)']} />
      </Rect>
    </Group>
  );
}

// Sockelleiste mit warmer Lichtkante + Raum-Akzentstreifen.
export function Baseboard({ y, x = 0, w = SCENE_W, accent }) {
  return (
    <Group>
      <Rect x={x} y={y - 10} width={w} height={10}>
        <LinearGradient start={vec(x, y - 10)} end={vec(x, y)}
          colors={[T.base, T.baseDark]} />
      </Rect>
      <Rect x={x} y={y - 10} width={w} height={2} color={alpha(T.glowWarm, 0.5)} />
      {accent && (
        <Rect x={x} y={y - 3.5} width={w} height={2.4} color={accent} opacity={0.85}>
          <BlurMask blur={3} style="solid" />
        </Rect>
      )}
    </Group>
  );
}

// Boden mit Verlauf, perspektivischen Fugen und Lichtspiegelung unter der Lampe.
export function LabFloor({ y, h = SCENE_H, w = SCENE_W, lampX = SCENE_W / 2 }) {
  const H = Math.max(0, Math.min(h, SCENE_H) - y);
  const joints = [];
  // Horizontale Fugen: nach vorn hin weiter auseinander (Perspektive).
  for (let k = 0, jy = y + 8; jy < y + H; k++, jy += 14 + k * 7) {
    joints.push(<Rect key={`j${k}`} x={0} y={jy} width={w} height={1.4} color={T.floorJoint} />);
  }
  // Vertikale Fugen: leicht auf einen Fluchtpunkt zulaufend.
  const verts = [];
  for (let i = 0; i <= 8; i++) {
    const xTop = (i / 8) * w;
    const xBot = lampX + (xTop - lampX) * 1.35;
    verts.push(
      <Line key={`v${i}`} p1={vec(xTop, y)} p2={vec(xBot, y + H)}
        color={T.floorJoint} strokeWidth={1.2} />
    );
  }
  return (
    <Group>
      <Rect x={0} y={y} width={w} height={H}>
        <LinearGradient start={vec(0, y)} end={vec(0, y + H)}
          colors={[T.floorTop, T.floorBot]} />
      </Rect>
      {joints}
      {verts}
      {/* weiche Lichtspiegelung der Deckenlampe */}
      <Oval x={lampX - 130} y={y + 6} width={260} height={46} color="rgba(255,240,200,0.05)">
        <BlurMask blur={16} style="normal" />
      </Oval>
    </Group>
  );
}

// Weicher Kontaktschatten unter Objekten.
export function ContactShadow({ cx, y, w, h = 10, o = 0.45 }) {
  return (
    <Oval x={cx - w / 2} y={y - h / 2} width={w} height={h} color={`rgba(0,0,0,${o})`}>
      <BlurMask blur={6} style="normal" />
    </Oval>
  );
}

/* ── Licht ──────────────────────────────────────────────────────────────── */

// Deckenleuchte (Gehäuse) + warmer Lichtkegel mit Flackern.
export function LampCone({ cx, topY = 0, reachY = 250, spreadTop = 26, spreadBot = 120, k = 1 }) {
  const p = `M ${cx - spreadTop} ${topY + 10} L ${cx + spreadTop} ${topY + 10} L ${cx + spreadBot} ${reachY} L ${cx - spreadBot} ${reachY} Z`;
  return (
    <Group>
      {/* Gehäuse */}
      <RoundedRect x={cx - 34} y={topY} width={68} height={10} r={3} color="#2b333c" />
      <Rect x={cx - 28} y={topY + 8} width={56} height={3} color={alpha(T.glowWarm, 0.9 * k)} />
      {/* Kegel */}
      <Path path={p} opacity={0.16 * k}>
        <LinearGradient start={vec(cx, topY)} end={vec(cx, reachY)}
          colors={['rgba(255,236,180,0.95)', 'rgba(255,236,180,0)']} />
      </Path>
      {/* Kern */}
      <Path path={`M ${cx - spreadTop * 0.6} ${topY + 10} L ${cx + spreadTop * 0.6} ${topY + 10} L ${cx + spreadBot * 0.5} ${reachY} L ${cx - spreadBot * 0.5} ${reachY} Z`}
        opacity={0.10 * k}>
        <LinearGradient start={vec(cx, topY)} end={vec(cx, reachY)}
          colors={['rgba(255,246,214,1)', 'rgba(255,246,214,0)']} />
      </Path>
    </Group>
  );
}

// Rote Alarm-Rundumleuchte: Gehäuse + rotierender Lichtstrahl + Puls.
// on=false zeigt nur das dunkle Gehäuse (die Lampe existiert im Raum!).
export function AlarmBeacon({ cx, cy = 10, on, t = 0, danger = false, sweepReach = 300 }) {
  const speed = danger ? 4.2 : 2.0;                    // rad/s
  const a = t * speed;
  const wob = 0.5 + 0.5 * Math.sin(t * (danger ? 9 : 5));
  return (
    <Group>
      {/* Halterung + rote Kuppel */}
      <Rect x={cx - 12} y={cy - 4} width={24} height={5} color="#2b333c" />
      <RoundedRect x={cx - 9} y={cy} width={18} height={13} r={6}
        color={on ? shade(T.red, 0.1) : '#5a1410'} />
      <RoundedRect x={cx - 9} y={cy} width={18} height={13} r={6}
        color="rgba(255,255,255,0.18)" style="stroke" strokeWidth={1} />
      <Oval x={cx - 6} y={cy + 1.5} width={5} height={4} color="rgba(255,255,255,0.4)" />
      {on && (
        <Group>
          {/* Glutpuls um die Kuppel */}
          <Circle cx={cx} cy={cy + 7} r={16 + wob * 6} color={alpha('#ff2a08', 0.22 + wob * 0.2)}>
            <BlurMask blur={12} style="normal" />
          </Circle>
          {/* zwei gegenläufige Sweep-Keulen */}
          {[0, Math.PI].map((off, i) => {
            const ang = a + off;
            const x2 = cx + Math.cos(ang) * sweepReach;
            const y2 = cy + 7 + Math.sin(ang) * sweepReach * 0.62;
            const px = -Math.sin(ang) * 46;
            const py = Math.cos(ang) * 30;
            return (
              <Path key={i}
                path={`M ${cx} ${cy + 7} L ${x2 + px} ${y2 + py} L ${x2 - px} ${y2 - py} Z`}
                opacity={0.10 + wob * 0.08}>
                <RadialGradient c={vec(cx, cy + 7)} r={sweepReach}
                  colors={['rgba(255,60,20,0.9)', 'rgba(255,60,20,0)']} />
              </Path>
            );
          })}
        </Group>
      )}
    </Group>
  );
}

// Schwebende Staubpartikel im Licht — driftet langsam, funkelt.
export function DustLayer({ t = 0, count = 14, x = 0, y = 0, w = SCENE_W, h = 250, seed = 5 }) {
  const dots = [];
  for (let i = 0; i < count; i++) {
    const r1 = rnd(seed + i * 3), r2 = rnd(seed + i * 3 + 1), r3 = rnd(seed + i * 3 + 2);
    const px = x + ((r1 * w + t * (4 + r2 * 7)) % w);
    const py = y + ((r2 * h + t * (2 + r3 * 4) + Math.sin(t * 0.8 + i) * 6) % h);
    const tw = 0.5 + 0.5 * Math.sin(t * (1 + r3) + i * 2.4);
    dots.push(
      <Circle key={i} cx={px} cy={py} r={0.6 + r3 * 1.1}
        color={`rgba(230,240,255,${0.05 + tw * 0.13})`} />
    );
  }
  return <Group>{dots}</Group>;
}

/* ── Möbel & Geräte ─────────────────────────────────────────────────────── */

// Holz-Werkbank: Platte mit Maserung, dunkle Front, Beine, Kontaktschatten.
export function WoodBench({ x, y, w, h = 13, legs = true, legH = 0 }) {
  const grain = [];
  for (let i = 0; i < Math.floor(w / 46); i++) {
    const gx = x + 10 + i * 46 + rnd(i) * 18;
    grain.push(<Rect key={i} x={gx} y={y + 2} width={16 + rnd(i + 9) * 14} height={1} color={T.woodGrain} />);
  }
  return (
    <Group>
      <ContactShadow cx={x + w / 2} y={y + h + (legs ? legH : 2)} w={w * 0.96} o={0.35} />
      <RoundedRect x={x} y={y} width={w} height={h} r={2}>
        <LinearGradient start={vec(x, y)} end={vec(x, y + h)}
          colors={[T.woodTop, T.wood]} />
      </RoundedRect>
      {grain}
      <Rect x={x} y={y + h} width={w} height={3} color={T.woodDark} />
      <Rect x={x} y={y} width={w} height={1.4} color="rgba(255,230,180,0.28)" />
      {legs && legH > 0 && (
        <Group>
          <Rect x={x + 8} y={y + h} width={9} height={legH} color={T.woodDark} />
          <Rect x={x + w - 17} y={y + h} width={9} height={legH} color={T.woodDark} />
        </Group>
      )}
    </Group>
  );
}

// Gebürsteter Stahltisch/-streifen, optional mit Warnschraffur.
export function SteelStrip({ x, y, w, h, hazard = false }) {
  const stripes = [];
  if (hazard) {
    for (let sx = x - h; sx < x + w; sx += 26) {
      stripes.push(
        <Path key={sx} path={`M ${sx} ${y + h} L ${sx + 13} ${y} L ${sx + 20} ${y} L ${sx + 7} ${y + h} Z`}
          color="rgba(255,200,40,0.10)" />
      );
    }
  }
  return (
    <Group>
      <Rect x={x} y={y} width={w} height={h}>
        <LinearGradient start={vec(x, y)} end={vec(x, y + h)}
          colors={[T.steelLight, T.steel, T.steelDark]} positions={[0, 0.25, 1]} />
      </Rect>
      <Group clip={{ x, y, width: w, height: h }}>{stripes}</Group>
      <Rect x={x} y={y} width={w} height={1.6} color="rgba(255,255,255,0.35)" />
      <Rect x={x} y={y + h - 2} width={w} height={2} color="rgba(0,0,0,0.4)" />
    </Group>
  );
}

// Dunkles Geräte-Panel mit Metallrahmen, Eckschrauben und Innen-Glow.
export function Panel({ x, y, w, h, accent, r = 4, screen = true, screws = true }) {
  return (
    <Group>
      <RoundedRect x={x - 4} y={y - 4} width={w + 8} height={h + 8} r={r + 2}>
        <LinearGradient start={vec(x, y - 4)} end={vec(x, y + h + 4)}
          colors={[shade(T.panelEdge, 0.25), T.panelEdge, shade(T.panelEdge, -0.35)]} />
      </RoundedRect>
      <RoundedRect x={x} y={y} width={w} height={h} r={r} color={T.panel} />
      {screen && (
        <Group>
          <RoundedRect x={x} y={y} width={w} height={h} r={r}>
            <LinearGradient start={vec(x, y)} end={vec(x + w, y + h)}
              colors={[accent ? alpha(accent, 0.10) : T.panelGlow, 'rgba(0,0,0,0)']} />
          </RoundedRect>
          {/* diagonale Glas-Reflexion */}
          <Group clip={{ x, y, width: w, height: h }}>
            <Path path={`M ${x + w * 0.55} ${y} L ${x + w * 0.75} ${y} L ${x + w * 0.35} ${y + h} L ${x + w * 0.15} ${y + h} Z`}
              color="rgba(255,255,255,0.04)" />
          </Group>
        </Group>
      )}
      {accent && (
        <RoundedRect x={x} y={y} width={w} height={h} r={r}
          color={alpha(accent, 0.5)} style="stroke" strokeWidth={1.2} />
      )}
      {screws && [[x - 1, y - 1], [x + w + 1, y - 1], [x - 1, y + h + 1], [x + w + 1, y + h + 1]].map(([sx, sy], i) => (
        <Circle key={i} cx={sx} cy={sy} r={1.8} color="#7c8ea0" />
      ))}
    </Group>
  );
}

// Glasgefäß (Becher/Standzylinder): Wand, Lichtkante, Mündung, Flüssigkeit.
export function GlassVessel({ x, y, w, h, liquid, level = 0.55, tint = T.glassFill }) {
  const lh = h * level;
  const ly = y + h - lh;
  return (
    <Group>
      <ContactShadow cx={x + w / 2} y={y + h + 3} w={w * 1.15} o={0.4} />
      {/* Flüssigkeit */}
      {liquid && (
        <Group clip={{ x: x + 2, y: ly, width: w - 4, height: lh - 2 }}>
          <Rect x={x + 2} y={ly} width={w - 4} height={lh}>
            <LinearGradient start={vec(x, ly)} end={vec(x, ly + lh)}
              colors={[alpha(liquid, 0.78), alpha(shade(liquid, -0.4), 0.9)]} />
          </Rect>
          <Oval x={x + 2} y={ly - 3} width={w - 4} height={6} color={alpha(shade(liquid, 0.35), 0.9)} />
        </Group>
      )}
      {/* Glaskörper */}
      <RoundedRect x={x} y={y} width={w} height={h} r={4} color={tint} />
      <RoundedRect x={x} y={y} width={w} height={h} r={4}
        color={T.glassEdge} style="stroke" strokeWidth={1.5} />
      {/* Lichtkanten */}
      <RoundedRect x={x + 3} y={y + 4} width={3} height={h - 10} r={2} color={T.glassShine} opacity={0.5} />
      <RoundedRect x={x + w - 7} y={y + 6} width={2} height={h - 14} r={1} color={T.glassShine} opacity={0.25} />
      {/* Mündung */}
      <Oval x={x - 1} y={y - 3} width={w + 2} height={7}
        color={T.glassEdge} style="stroke" strokeWidth={1.4} />
    </Group>
  );
}

// Laborflasche mit Etikett + Gefahren-Diamant.
export function Bottle({ x, y, w = 40, h = 86, col = '#e0863a', label = true }) {
  const neckW = w * 0.42;
  return (
    <Group>
      <ContactShadow cx={x + w / 2} y={y + h + 2} w={w * 1.2} o={0.4} />
      {/* Körper */}
      <RoundedRect x={x} y={y + h * 0.28} width={w} height={h * 0.72} r={5}>
        <LinearGradient start={vec(x, y)} end={vec(x + w, y)}
          colors={[shade(col, 0.25), col, shade(col, -0.35)]} />
      </RoundedRect>
      {/* Hals + Kappe */}
      <Rect x={x + (w - neckW) / 2} y={y + h * 0.10} width={neckW} height={h * 0.2} color={shade(col, -0.15)} />
      <RoundedRect x={x + (w - neckW) / 2 - 2} y={y} width={neckW + 4} height={h * 0.12} r={2} color="#22292f" />
      {/* Etikett */}
      {label && (
        <Group>
          <RoundedRect x={x + 5} y={y + h * 0.44} width={w - 10} height={h * 0.3} r={2} color={T.paper} />
          <Rect x={x + 9} y={y + h * 0.5} width={w - 18} height={2} color="#6b6046" />
          <Rect x={x + 9} y={y + h * 0.56} width={w - 22} height={2} color="#8a7d5c" />
          {/* Gefahren-Diamant */}
          <Group transform={[{ translateX: x + w / 2 }, { translateY: y + h * 0.66 }, { rotate: Math.PI / 4 }]}>
            <Rect x={-4} y={-4} width={8} height={8} color="#d43a2a" />
          </Group>
        </Group>
      )}
      <RoundedRect x={x + 3} y={y + h * 0.32} width={3} height={h * 0.6} r={2} color="rgba(255,255,255,0.3)" />
    </Group>
  );
}

// Petrischale mit Gel (Ferroxyl) — elliptisch, Glasrand, Gel-Verlauf.
export function PetriDish({ cx, cy, rx, ry }) {
  return (
    <Group>
      <ContactShadow cx={cx} y={cy + ry + 4} w={rx * 2.1} h={14} o={0.5} />
      <Oval x={cx - rx} y={cy - ry} width={rx * 2} height={ry * 2}>
        <RadialGradient c={vec(cx - rx * 0.25, cy - ry * 0.3)} r={rx * 1.3}
          colors={['#cdd98e', '#a8ba6a', '#8ba050']} />
      </Oval>
      {/* Gel-Glanz */}
      <Oval x={cx - rx * 0.55} y={cy - ry * 0.62} width={rx * 0.8} height={ry * 0.42}
        color="rgba(255,255,255,0.14)">
        <BlurMask blur={6} style="normal" />
      </Oval>
      {/* Glasrand doppelt */}
      <Oval x={cx - rx} y={cy - ry} width={rx * 2} height={ry * 2}
        color="#3f9aa8" style="stroke" strokeWidth={3} />
      <Oval x={cx - rx + 4} y={cy - ry + 4} width={rx * 2 - 8} height={ry * 2 - 8}
        color="rgba(220,245,250,0.35)" style="stroke" strokeWidth={1.2} />
    </Group>
  );
}

// Eisennagel (liegend, Spitze links) — Metallverlauf + Kopf.
export function Nail({ x0, x1, y, th = 5 }) {
  const head = 8;
  return (
    <Group>
      <Path path={`M ${x0} ${y} L ${x0 + 14} ${y - th / 2} L ${x1 - head} ${y - th / 2} L ${x1 - head} ${y + th / 2} L ${x0 + 14} ${y + th / 2} Z`}>
        <LinearGradient start={vec(x0, y - th)} end={vec(x0, y + th)}
          colors={['#dfe6ec', '#9aa6b0', '#5c666e']} />
      </Path>
      <Rect x={x1 - head} y={y - th - 1} width={4} height={th * 2 + 2} color="#8a949c" />
      <Rect x={x0 + 12} y={y - th / 2} width={x1 - x0 - head - 12} height={1.2} color="rgba(255,255,255,0.5)" />
    </Group>
  );
}

// Kabel/Leitungszug als abgerundete Polylinie.
export function WireRun({ pts, col = '#c9a227', w = 3 }) {
  const d = pts.map(([px, py], i) => `${i === 0 ? 'M' : 'L'} ${px} ${py}`).join(' ');
  return (
    <Group>
      <Path path={d} color="rgba(0,0,0,0.35)" style="stroke" strokeWidth={w + 2}
        strokeJoin="round" strokeCap="round" />
      <Path path={d} color={col} style="stroke" strokeWidth={w}
        strokeJoin="round" strokeCap="round" />
    </Group>
  );
}

// Wandregal (Metallschiene) mit bunten Chemikalien-Fläschchen.
export function ShelfVials({ x, y, w, n = 5, seed = 2 }) {
  const cols = ['#e36fb0', '#6fd3dd', '#e0b44c', '#6fe87a', '#9660c8', '#f0907a', '#5b9bf0'];
  const vials = [];
  const gap = w / n;
  for (let i = 0; i < n; i++) {
    const col = cols[Math.floor(rnd(seed + i) * cols.length)];
    const vw = 11 + rnd(seed + i * 2) * 5;
    const vh = 20 + rnd(seed + i * 3) * 9;
    const vx = x + 8 + i * gap;
    const vy = y - vh;
    vials.push(
      <Group key={i}>
        <Rect x={vx} y={vy + vh * 0.35} width={vw} height={vh * 0.65} color={alpha(col, 0.85)} />
        <Rect x={vx} y={vy} width={vw} height={vh} color={T.glassFill} />
        <Rect x={vx} y={vy} width={vw} height={vh}
          color={T.glassEdge} style="stroke" strokeWidth={1} />
        <Rect x={vx + vw * 0.25} y={vy - 3.5} width={vw * 0.5} height={4} color="#22292f" />
        <Rect x={vx + 1.5} y={vy + 2} width={1.6} height={vh - 5} color="rgba(255,255,255,0.4)" />
        {/* schwaches Leuchten */}
        <Rect x={vx - 2} y={vy + vh * 0.3} width={vw + 4} height={vh * 0.7} color={alpha(col, 0.16)}>
          <BlurMask blur={5} style="normal" />
        </Rect>
      </Group>
    );
  }
  return (
    <Group>
      {vials}
      {/* Brett + Konsolen */}
      <RoundedRect x={x} y={y} width={w} height={6} r={2}>
        <LinearGradient start={vec(x, y)} end={vec(x, y + 6)} colors={[T.steelLight, T.steelDark]} />
      </RoundedRect>
      <Path path={`M ${x + 10} ${y + 6} L ${x + 10} ${y + 16} L ${x + 20} ${y + 6} Z`} color={T.steelDark} />
      <Path path={`M ${x + w - 20} ${y + 6} L ${x + w - 10} ${y + 16} L ${x + w - 10} ${y + 6} Z`} color={T.steelDark} />
    </Group>
  );
}

// Wanduhr mit laufendem Sekundenzeiger.
export function WallClock({ cx, cy, r = 13, t = 0 }) {
  const sec = (t % 60) / 60 * Math.PI * 2 - Math.PI / 2;
  const min = ((t / 60) % 60) / 60 * Math.PI * 2 - Math.PI / 2;
  const hr = ((t / 3600) % 12) / 12 * Math.PI * 2 - Math.PI / 2 + 1.1;
  return (
    <Group>
      <Circle cx={cx} cy={cy} r={r + 2.5} color="#39434d" />
      <Circle cx={cx} cy={cy} r={r} color="#dde4ea" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <Circle key={i} cx={cx + Math.cos(a) * (r - 2.5)} cy={cy + Math.sin(a) * (r - 2.5)} r={0.8} color="#5a6570" />;
      })}
      <Line p1={vec(cx, cy)} p2={vec(cx + Math.cos(hr) * r * 0.45, cy + Math.sin(hr) * r * 0.45)} color="#2b333c" strokeWidth={2} />
      <Line p1={vec(cx, cy)} p2={vec(cx + Math.cos(min) * r * 0.68, cy + Math.sin(min) * r * 0.68)} color="#2b333c" strokeWidth={1.4} />
      <Line p1={vec(cx, cy)} p2={vec(cx + Math.cos(sec) * r * 0.78, cy + Math.sin(sec) * r * 0.78)} color="#d43a2a" strokeWidth={0.9} />
      <Circle cx={cx} cy={cy} r={1.4} color="#2b333c" />
    </Group>
  );
}

// Feuerlöscher an Wandhalterung.
export function Extinguisher({ x, y, h = 34 }) {
  const w = h * 0.38;
  return (
    <Group>
      <Rect x={x - 2} y={y + 4} width={w + 4} height={3} color="#39434d" />
      <RoundedRect x={x} y={y} width={w} height={h} r={4}>
        <LinearGradient start={vec(x, y)} end={vec(x + w, y)}
          colors={['#f06a5a', '#c22818', '#7e1408']} />
      </RoundedRect>
      <Rect x={x + w * 0.3} y={y - 5} width={w * 0.4} height={6} color="#39434d" />
      <Path path={`M ${x + w * 0.5} ${y - 4} L ${x + w * 1.1} ${y + 3} L ${x + w * 1.05} ${y + 6} L ${x + w * 0.5} ${y - 1} Z`} color="#22292f" />
      <RoundedRect x={x + 3} y={y + h * 0.3} width={w - 6} height={h * 0.34} r={2} color={T.paper} />
      <Rect x={x + 2} y={y + 2} width={2} height={h - 6} color="rgba(255,255,255,0.35)" />
    </Group>
  );
}

// Wand-Funkgerät (Intercom) — Story-Objekt „Radio“.
export function RadioBox({ x, y, w = 52, h = 34, active = false, t = 0 }) {
  const led = active ? (Math.sin(t * 6) > 0 ? '#7dff8a' : '#1e5a26') : '#265c2e';
  const grille = [];
  for (let i = 0; i < 5; i++) {
    grille.push(<Rect key={i} x={x + 6} y={y + 7 + i * 4.4} width={w * 0.52} height={2} color="#141a20" />);
  }
  return (
    <Group>
      <RoundedRect x={x - 2} y={y - 2} width={w + 4} height={h + 4} r={4}>
        <LinearGradient start={vec(x, y - 2)} end={vec(x, y + h + 2)}
          colors={['#57646e', '#333e47']} />
      </RoundedRect>
      <RoundedRect x={x} y={y} width={w} height={h} r={3} color="#232b32" />
      {grille}
      {/* LED + Regler */}
      <Circle cx={x + w - 11} cy={y + 9} r={2.6} color={led} />
      {active && (
        <Circle cx={x + w - 11} cy={y + 9} r={6} color={alpha('#7dff8a', 0.4)}>
          <BlurMask blur={4} style="normal" />
        </Circle>
      )}
      <Circle cx={x + w - 11} cy={y + 21} r={4} color="#4a565f" />
      <Line p1={vec(x + w - 11, y + 21)} p2={vec(x + w - 8.5, y + 18.5)} color="#cfd8de" strokeWidth={1.2} />
      {/* Antenne */}
      <Line p1={vec(x + w - 4, y)} p2={vec(x + w + 6, y - 14)} color="#7c8ea0" strokeWidth={1.6} />
      <Circle cx={x + w + 6} cy={y - 14} r={1.6} color="#7c8ea0" />
    </Group>
  );
}

// Schiebetür (links, durch die Molar verschwindet) mit Warnstreifen.
export function SlidingDoor({ x = -6, y = 92, w = 42, h = 158 }) {
  return (
    <Group>
      <RoundedRect x={x} y={y} width={w} height={h} r={3}>
        <LinearGradient start={vec(x, y)} end={vec(x + w, y)}
          colors={['#4b5a66', '#37444e', '#2a343c']} />
      </RoundedRect>
      <Rect x={x + 4} y={y + 6} width={w - 8} height={4} color="rgba(255,200,40,0.5)" />
      <Rect x={x + 4} y={y + h - 12} width={w - 8} height={4} color="rgba(255,200,40,0.5)" />
      <RoundedRect x={x + w - 8} y={y + h * 0.42} width={3} height={26} r={2} color="#8fa6b4" />
      {[0.25, 0.5, 0.75].map((f, i) => (
        <Rect key={i} x={x + 3} y={y + h * f} width={w - 6} height={1.4} color="rgba(0,0,0,0.35)" />
      ))}
      {/* Türrahmen-Lichtkante */}
      <Rect x={x + w} y={y - 4} width={3} height={h + 8} color="#20282f" />
    </Group>
  );
}

// Wandkalender mit Chemie-Poster-Look.
export function CalendarPoster({ x, y, w = 84, h = 64 }) {
  const cells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 7; c++) {
      const hot = rnd(r * 9 + c) > 0.78;
      cells.push(
        <Rect key={`${r}${c}`} x={x + 5 + c * ((w - 10) / 7)} y={y + 16 + r * ((h - 22) / 4)}
          width={(w - 10) / 7 - 1.5} height={(h - 22) / 4 - 1.5}
          color={hot ? alpha('#b06fe3', 0.55) : 'rgba(210,225,235,0.14)'} />
      );
    }
  }
  return (
    <Group>
      <RoundedRect x={x - 3} y={y - 3} width={w + 6} height={h + 6} r={2} color="#4a3b28" />
      <Rect x={x} y={y} width={w} height={h} color="#1b232b" />
      <Rect x={x + 5} y={y + 5} width={w * 0.4} height={5} color="#6fe87a" opacity={0.7} />
      {cells}
    </Group>
  );
}

/* ── Sieben-Segment-Ziffern (kein Font nötig) ───────────────────────────── */

const SEG = { // a,b,c,d,e,f,g
  0: [1, 1, 1, 1, 1, 1, 0], 1: [0, 1, 1, 0, 0, 0, 0], 2: [1, 1, 0, 1, 1, 0, 1],
  3: [1, 1, 1, 1, 0, 0, 1], 4: [0, 1, 1, 0, 0, 1, 1], 5: [1, 0, 1, 1, 0, 1, 1],
  6: [1, 0, 1, 1, 1, 1, 1], 7: [1, 1, 1, 0, 0, 0, 0], 8: [1, 1, 1, 1, 1, 1, 1],
  9: [1, 1, 1, 1, 0, 1, 1],
};

export function SevenSeg({ digit, x, y, w = 10, h = 16, color = T.green, off = 0.07 }) {
  const s = SEG[digit] || SEG[8];
  const th = Math.max(1.6, w * 0.18);
  const segs = [
    { x: x + th, y: y, w: w - 2 * th, h: th },                       // a
    { x: x + w - th, y: y + th, w: th, h: h / 2 - th * 1.5 },        // b
    { x: x + w - th, y: y + h / 2 + th / 2, w: th, h: h / 2 - th * 1.5 }, // c
    { x: x + th, y: y + h - th, w: w - 2 * th, h: th },              // d
    { x: x, y: y + h / 2 + th / 2, w: th, h: h / 2 - th * 1.5 },     // e
    { x: x, y: y + th, w: th, h: h / 2 - th * 1.5 },                 // f
    { x: x + th, y: y + h / 2 - th / 2, w: w - 2 * th, h: th },      // g
  ];
  return (
    <Group>
      {segs.map((r, i) => (
        <Rect key={i} x={r.x} y={r.y} width={r.w} height={r.h}
          color={color} opacity={s[i] ? 0.95 : off} />
      ))}
    </Group>
  );
}
