/*
 * CRTOverlay — wiederverwendbares Skia-Overlay: Scanlines + Vignette über die
 * ganze Bühne. Rein visuell (pointerEvents="none"), eigene Canvas, einfach
 * irgendwo in den View-Baum legen.
 *
 *   <CRTOverlay L={L} />                       // L = useStageLayout()
 *   <CRTOverlay L={L} intensity={0.6} />       // schwächer
 *
 * Genutzt von SceneShell (Konstantin) und Scene1Hub (Ruben).
 */
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Group, Rect, RadialGradient } from '@shopify/react-native-skia';
import { SCENE_W, SCENE_H } from '../config/game';

const STEP = 3;     // Szenen-px zwischen den Scanlines
const LINE = 1;     // Linienhöhe in Szenen-px

export default function CRTOverlay({ L, intensity = 1 }) {
  if (!L) return null;
  const { offsetX, offsetY, scale } = L;

  // Scanlines einmalig aufbauen (statisch -> useMemo)
  const lines = useMemo(() => {
    const ys = [];
    for (let y = 0; y < SCENE_H; y += STEP) ys.push(y);
    return ys;
  }, []);

  const lineColor = `rgba(0,0,0,${0.16 * intensity})`;
  const edgeColor = `rgba(0,0,0,${0.55 * intensity})`;

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Group transform={[{ translateX: offsetX }, { translateY: offsetY }, { scale }]}>
        {/* Scanlines */}
        {lines.map((y) => (
          <Rect key={y} x={0} y={y} width={SCENE_W} height={LINE} color={lineColor} />
        ))}
        {/* Vignette — dunkle Ecken */}
        <Rect x={0} y={0} width={SCENE_W} height={SCENE_H}>
          <RadialGradient
            c={{ x: SCENE_W / 2, y: SCENE_H / 2 }}
            r={SCENE_W * 0.62}
            colors={['#00000000', '#00000000', edgeColor]}
            positions={[0, 0.6, 1]}
          />
        </Rect>
      </Group>
    </Canvas>
  );
}
