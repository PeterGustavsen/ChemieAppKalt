/*
 * HubBackdrop — verlängert die Laborwand/den Boden der Hub-Szene nahtlos bis an
 * alle Bildschirmränder, damit KEINE schwarzen Letterbox-Balken entstehen.
 *
 * Der Horizont (Bodenkante) wird exakt auf die Bodenkante der 640×360-Szene
 * gelegt (FLOOR_Y = 250). Dadurch gehen Wand (oben) und Boden (unten) in den
 * Rändern bruchlos in die zentrierte Szene über — auf iPad (Rand oben/unten)
 * wie auf iPhone (Rand links/rechts). Farben = Szenen-Palette (palette.py).
 * Rein dekorativ, liegt hinter dem Szenen-Canvas.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Rect, LinearGradient, vec } from '@shopify/react-native-skia';
import { useStageLayout } from '../engine/layout';

const FLOOR_Y = 250;   // Bodenkante der Szene (deckungsgleich mit scene_01-Art)

export default function HubBackdrop() {
  const { width: W, height: H, offsetY, scale } = useStageLayout();
  if (!W || !H) return null;

  const horizon = Math.round(offsetY + FLOOR_Y * scale);
  const tile = Math.max(16, Math.round(32 * scale));
  const base = Math.max(3, Math.round(6 * scale));
  const wallH = Math.max(0, horizon);
  const floorH = Math.max(0, H - horizon);

  const vlines = [];
  for (let x = 0; x <= W; x += tile) vlines.push(x);
  const wallHlines = [];
  for (let y = 0; y < horizon; y += tile) wallHlines.push(y);

  return (
    <Canvas style={styles.fill} pointerEvents="none">
      {/* Wand mit Verlauf */}
      {wallH > 0 && (
        <Rect x={0} y={0} width={W} height={wallH}>
          <LinearGradient start={vec(0, 0)} end={vec(0, wallH)} colors={['#20505a', '#122f36']} />
        </Rect>
      )}
      {/* Fliesenraster Wand */}
      {wallHlines.map((y, i) => (
        <Rect key={`wh${i}`} x={0} y={y} width={W} height={1} color="#122f36" opacity={0.6} />
      ))}
      {vlines.map((x, i) => (
        <Rect key={`wv${i}`} x={x} y={0} width={1} height={wallH} color="#122f36" opacity={0.6} />
      ))}
      {/* Sockelleiste + Lichtkante (wie in der Szene) */}
      <Rect x={0} y={horizon - base} width={W} height={base} color="#36747e" />
      <Rect x={0} y={horizon - base} width={W} height={Math.max(1, Math.round(2 * scale))} color="#f7e08a" opacity={0.45} />

      {/* Boden mit Verlauf */}
      {floorH > 0 && (
        <Rect x={0} y={horizon} width={W} height={floorH}>
          <LinearGradient start={vec(0, horizon)} end={vec(0, H)} colors={['#424c5f', '#1f232e']} />
        </Rect>
      )}
      {/* Fugen Boden */}
      {floorH > 0 && Array.from({ length: Math.ceil(floorH / tile) + 1 }).map((_, i) => (
        <Rect key={`fh${i}`} x={0} y={horizon + i * tile} width={W} height={1} color="#161a23" opacity={0.7} />
      ))}
      {floorH > 0 && vlines.map((x, i) => (
        <Rect key={`fv${i}`} x={x} y={horizon} width={1} height={floorH} color="#161a23" opacity={0.5} />
      ))}
    </Canvas>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
});
