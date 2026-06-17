/*
 * AnimatedSprite — spielt einen Frame eines horizontalen Sprite-Sheets in Skia.
 * Technik: das ganze Sheet wird horizontal verschoben gezeichnet und auf das
 * Frame-Fenster geclippt. Nearest-neighbor fuer scharfe Pixel.
 */
import React from 'react';
import { Group, Image, rect, FilterMode, MipmapMode } from '@shopify/react-native-skia';
import { useSpriteFrame } from './useSprite';

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None };

export default function AnimatedSprite({
  image, frameCount, frameW, frameH, x, y, scale = 1, fps = 8, playing = true, frame,
}) {
  const auto = useSpriteFrame(frameCount, fps, playing && frame == null);
  const f = frame != null ? frame : auto;
  if (!image) return null;

  const w = frameW * scale;
  const h = frameH * scale;
  const sheetW = frameW * frameCount * scale;

  return (
    <Group clip={rect(x, y, w, h)}>
      <Image
        image={image}
        x={x - f * w}
        y={y}
        width={sheetW}
        height={h}
        fit="fill"
        sampling={NEAREST}
      />
    </Group>
  );
}
