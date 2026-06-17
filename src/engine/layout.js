import { useWindowDimensions, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { SCENE_W, SCENE_H } from '../config/game';

export function useStageLayout() {
  const dims = useWindowDimensions();
  const [vpHeight, setVpHeight] = useState(dims.height);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setVpHeight(vv.height);
    vv.addEventListener('resize', update);
    update();
    return () => vv.removeEventListener('resize', update);
  }, []);

  const width = dims.width;
  const height = Platform.OS === 'web' ? vpHeight : dims.height;
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
