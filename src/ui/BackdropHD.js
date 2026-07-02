/*
 * BackdropHD — füllt die Letterbox-Ränder ALLER Szenen prozedural (Wand oben,
 * Boden unten), sodass keine schwarzen Balken entstehen. Ersetzt HubBackdrop
 * und SceneBackdrop (die das PNG spiegelten). Der Horizont wird auf die
 * Bodenkante der jeweiligen Szene gelegt. Rein dekorativ, pointerEvents=none.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Rect, LinearGradient, vec } from '@shopify/react-native-skia';
import { useStageLayout } from '../engine/layout';
import { T, alpha } from '../art/theme';

export default function BackdropHD({ horizon = 250, accent = '#3fb4c4', darken = 0.35 }) {
  const { width: W, height: H, offsetY, scale } = useStageLayout();
  if (!W || !H) return null;

  const hz = Math.round(offsetY + horizon * scale);
  const wallH = Math.max(0, hz);
  const floorH = Math.max(0, H - hz);
  const base = Math.max(3, Math.round(8 * scale));

  return (
    <Canvas style={styles.fill} pointerEvents="none">
      {wallH > 0 && (
        <Rect x={0} y={0} width={W} height={wallH}>
          <LinearGradient start={vec(0, 0)} end={vec(0, wallH)}
            colors={[T.wallTop, T.wallBot]} />
        </Rect>
      )}
      {/* Sockelleiste + Akzent, bündig zur Szene */}
      <Rect x={0} y={hz - base} width={W} height={base} color={T.baseDark} />
      <Rect x={0} y={hz - base} width={W} height={Math.max(1, Math.round(2 * scale))}
        color={alpha(T.glowWarm, 0.4)} />
      <Rect x={0} y={hz - Math.round(3.5 * scale)} width={W}
        height={Math.max(1, Math.round(2.4 * scale))} color={accent} opacity={0.7} />
      {floorH > 0 && (
        <Rect x={0} y={hz} width={W} height={floorH}>
          <LinearGradient start={vec(0, hz)} end={vec(0, H)}
            colors={[T.floorTop, T.floorBot]} />
        </Rect>
      )}
      {/* Ränder zurücknehmen, damit die Bühne im Fokus bleibt */}
      <Rect x={0} y={0} width={W} height={H} color={`rgba(0,0,0,${darken})`} />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
});
