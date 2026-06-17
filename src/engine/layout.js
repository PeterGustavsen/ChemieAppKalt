/*
 * Stage-Layout: rechnet das 640x360 Render-Feld per Integer-Scaling
 * (nearest-neighbor, scharfe Pixel) mittig auf den Bildschirm, Letterbox bei Bedarf.
 */
import { useWindowDimensions } from 'react-native';
import { SCENE_W, SCENE_H } from '../config/game';

export function useStageLayout() {
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / SCENE_W, height / SCENE_H);
  const stageW = SCENE_W * scale;
  const stageH = SCENE_H * scale;
  const offsetX = Math.round((width - stageW) / 2);
  const offsetY = Math.round((height - stageH) / 2);

  // Render-Koordinate (640x360) -> Bildschirm-Pixel
  const toScreen = (r) => ({
    left: offsetX + r.x * scale,
    top: offsetY + r.y * scale,
    width: r.w * scale,
    height: r.h * scale,
  });

  return { width, height, scale, offsetX, offsetY, stageW, stageH, toScreen };
}
