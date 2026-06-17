/*
 * Sprite-Animation: zaehlt Frame-Indizes mit fester FPS (Idle-Loops laufen
 * dauerhaft). Bewusst simpel via setInterval — kein reanimated noetig.
 */
import { useState, useEffect } from 'react';

export function useSpriteFrame(frameCount, fps = 8, playing = true) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!playing || frameCount <= 1) return;
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % frameCount);
    }, Math.round(1000 / fps));
    return () => clearInterval(id);
  }, [frameCount, fps, playing]);
  return frame;
}
