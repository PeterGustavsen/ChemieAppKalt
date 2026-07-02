/*
 * MolarHD — Prof. Dr. Molar als Vektor-Figur (ersetzt die Pixel-Sprites).
 * Zeichnet in eine lokale 72×112-Box (dasselbe Frame-Maß wie die alten
 * Sprite-Sheets), positioniert über x/y/scale — die Laufmechanik in
 * Scene1Hub/SceneWin bleibt unverändert.
 *
 *   mode: 'idle' | 'speak'   t: Ambient-Uhr (Sekunden)
 *   walking: true → Beine schwingen, Mantel weht leicht
 */
import React from 'react';
import {
  Group, Rect, RoundedRect, Circle, Oval, Path, Line,
  LinearGradient, BlurMask, vec,
} from '@shopify/react-native-skia';

const SKIN = '#e8c49a';
const SKIN_SHADE = '#caa27a';
const COAT = '#e9edf1';
const COAT_SHADE = '#c3ccd4';
const HAIR = '#cfd6db';
const TROUSER = '#3c4653';

export default function MolarHD({ x, y, scale = 1, mode = 'idle', walking = false, t = 0 }) {
  // Gang- und Lebendigkeits-Phasen
  const walk = walking ? Math.sin(t * 9) : 0;          // Beinschwung
  const bob = walking ? Math.abs(Math.cos(t * 9)) * 2 : Math.sin(t * 1.4) * 1.2;
  const breathe = walking ? 0 : Math.sin(t * 1.4) * 0.6;
  const blink = !walking && (t % 3.9) > 3.72;          // kurzer Lidschlag
  const mouthOpen = mode === 'speak' ? (Math.sin(t * 11) > -0.2 ? 3.4 : 1.0) : 0;

  const legL = walk * 7;
  const legR = -walk * 7;

  return (
    <Group transform={[{ translateX: x }, { translateY: y - bob }, { scale }]}>
      {/* Schatten */}
      <Oval x={10} y={106} width={52} height={8} color="rgba(0,0,0,0.4)">
        <BlurMask blur={4} style="normal" />
      </Oval>

      {/* Beine */}
      <Group>
        <RoundedRect x={24 + legL * 0.4} y={82} width={10} height={26} r={3} color={TROUSER} />
        <RoundedRect x={38 + legR * 0.4} y={82} width={10} height={26} r={3} color={TROUSER} />
        {/* Schuhe */}
        <RoundedRect x={21 + legL * 0.5} y={104} width={15} height={6} r={3} color="#23282e" />
        <RoundedRect x={36 + legR * 0.5} y={104} width={15} height={6} r={3} color="#23282e" />
      </Group>

      {/* Laborkittel */}
      <Group>
        <Path path={`M 18 44 Q 16 ${86 + walk * 1.5} 19 88 L 53 88 Q 56 ${86 - walk * 1.5} 54 44 Q 46 36 36 36 Q 26 36 18 44 Z`}>
          <LinearGradient start={vec(18, 36)} end={vec(56, 88)} colors={[COAT, COAT_SHADE]} />
        </Path>
        {/* Mittelschlitz + Knöpfe */}
        <Line p1={vec(36, 46)} p2={vec(36, 86)} color="#aab4bc" strokeWidth={1.2} />
        <Circle cx={36} cy={54} r={1.3} color="#88949c" />
        <Circle cx={36} cy={64} r={1.3} color="#88949c" />
        <Circle cx={36} cy={74} r={1.3} color="#88949c" />
        {/* Kragen */}
        <Path path="M 28 40 L 36 48 L 44 40 L 40 37 L 32 37 Z" color="#f6f8fa" />
        {/* Brusttasche mit Stiften */}
        <RoundedRect x={42} y={52} width={9} height={11} r={1} color="#dde3e8" />
        <Rect x={44} y={49} width={2} height={5} color="#3b6fd4" />
        <Rect x={47} y={49} width={2} height={5} color="#d43a2a" />
        {/* Arme */}
        <Group transform={[{ translateX: 0 }, { translateY: breathe * 0.4 }]}>
          <RoundedRect x={13 - walk * 1.4} y={46} width={9} height={32} r={4} color={COAT_SHADE} />
          <RoundedRect x={50 + walk * 1.4} y={46} width={9} height={32} r={4} color={COAT} />
          {/* Hände */}
          <Circle cx={17.5 - walk * 1.4} cy={80} r={3.4} color={SKIN} />
          <Circle cx={54.5 + walk * 1.4} cy={80} r={3.4} color={SKIN} />
        </Group>
        {/* Klemmbrett in der rechten Hand (nur im Stand) */}
        {!walking && (
          <Group transform={[{ rotate: -0.12 }]} origin={vec(54, 80)}>
            <RoundedRect x={48} y={70} width={14} height={19} r={1.5} color="#8a6a3c" />
            <Rect x={50} y={72} width={10} height={15} color="#efe8d2" />
            <Rect x={51.5} y={75} width={7} height={1} color="#9a917c" />
            <Rect x={51.5} y={78} width={7} height={1} color="#9a917c" />
            <Rect x={51.5} y={81} width={5} height={1} color="#9a917c" />
          </Group>
        )}
      </Group>

      {/* Kopf */}
      <Group transform={[{ translateY: breathe }]}>
        {/* Hals */}
        <Rect x={31} y={30} width={10} height={8} color={SKIN_SHADE} />
        {/* Gesicht */}
        <RoundedRect x={22} y={6} width={28} height={27} r={9}>
          <LinearGradient start={vec(22, 6)} end={vec(50, 33)} colors={[SKIN, SKIN_SHADE]} />
        </RoundedRect>
        {/* Ohren */}
        <Circle cx={21} cy={20} r={3.2} color={SKIN_SHADE} />
        <Circle cx={51} cy={20} r={3.2} color={SKIN_SHADE} />
        {/* wilde graue Haare */}
        <Path path="M 20 12 Q 18 2 26 4 Q 28 -2 36 1 Q 44 -2 46 4 Q 54 2 52 12 Q 55 10 54 16 L 50 14 Q 51 8 46 8 Q 44 4 36 5 Q 28 4 26 8 Q 21 8 22 14 L 18 16 Q 17 10 20 12 Z" color={HAIR} />
        <Path path="M 17 14 Q 13 16 15 22 Q 17 26 20 24 Q 18 19 19 15 Z" color={HAIR} />
        <Path path="M 55 14 Q 59 16 57 22 Q 55 26 52 24 Q 54 19 53 15 Z" color={HAIR} />
        {/* Brille */}
        <Circle cx={29.5} cy={19} r={5.2} color="#20262c" style="stroke" strokeWidth={1.6} />
        <Circle cx={42.5} cy={19} r={5.2} color="#20262c" style="stroke" strokeWidth={1.6} />
        <Line p1={vec(34.6, 19)} p2={vec(37.4, 19)} color="#20262c" strokeWidth={1.4} />
        <Circle cx={29.5} cy={19} r={4.4} color="rgba(180,220,235,0.20)" />
        <Circle cx={42.5} cy={19} r={4.4} color="rgba(180,220,235,0.20)" />
        {/* Brillen-Glint */}
        <Line p1={vec(27, 17)} p2={vec(30, 15.5)} color="rgba(255,255,255,0.6)" strokeWidth={1} />
        {/* Augen (blinzeln) */}
        {blink ? (
          <Group>
            <Line p1={vec(27.5, 19)} p2={vec(31.5, 19)} color="#3a2d20" strokeWidth={1.2} />
            <Line p1={vec(40.5, 19)} p2={vec(44.5, 19)} color="#3a2d20" strokeWidth={1.2} />
          </Group>
        ) : (
          <Group>
            <Circle cx={29.5} cy={19} r={1.5} color="#2d251c" />
            <Circle cx={42.5} cy={19} r={1.5} color="#2d251c" />
          </Group>
        )}
        {/* buschige Augenbrauen */}
        <RoundedRect x={25.5} y={12.5} width={8} height={2.4} r={1.2} color={HAIR} />
        <RoundedRect x={38.5} y={12.5} width={8} height={2.4} r={1.2} color={HAIR} />
        {/* Nase */}
        <Path path="M 36 20 Q 38.5 24 36 26 Q 34.5 25 35 22 Z" color={SKIN_SHADE} />
        {/* Schnurrbart */}
        <Path path="M 29 27.5 Q 36 24.5 43 27.5 Q 36 30.5 29 27.5 Z" color={HAIR} />
        {/* Mund */}
        {mouthOpen > 0 ? (
          <Oval x={33} y={29} width={6} height={mouthOpen} color="#5a2d24" />
        ) : (
          <Line p1={vec(33, 30)} p2={vec(39, 30)} color="#8a6a52" strokeWidth={1.2} />
        )}
      </Group>
    </Group>
  );
}
