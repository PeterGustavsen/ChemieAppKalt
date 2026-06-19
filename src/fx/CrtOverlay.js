/*
 * CRT OVERLAY
 * Retro scanline + vignette filter, drawn on its own full-screen Skia canvas.
 * Purely cosmetic and pointer-transparent — drop it on top of any scene.
 *
 *   <CrtOverlay />                      // default look
 *   <CrtOverlay scanGap={4} vignette={0.45} />
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Rect, RadialGradient } from '@shopify/react-native-skia';

export default function CrtOverlay({ scanGap = 3, scanOpacity = 0.16, vignette = 0.34 }) {
  const { width, height } = useWindowDimensions();

  const lines = useMemo(() => {
    const ys = [];
    for (let y = 0; y < height; y += scanGap) ys.push(y);
    return ys;
  }, [height, scanGap]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFill}>
        {/* Horizontal scanlines */}
        {lines.map((y) => (
          <Rect key={y} x={0} y={y} width={width} height={1} color={`rgba(0,0,0,${scanOpacity})`} />
        ))}
        {/* Edge vignette — clear centre, darker corners */}
        <Rect x={0} y={0} width={width} height={height}>
          <RadialGradient
            c={{ x: width / 2, y: height / 2 }}
            r={Math.max(width, height) * 0.62}
            colors={['#00000000', '#00000000', `rgba(0,0,0,${vignette})`]}
            positions={[0, 0.6, 1]}
          />
        </Rect>
      </Canvas>
    </View>
  );
}
