/*
 * useAmbient — gemeinsame Ambient-Uhr für Licht-Flackern, Staub, Beacons,
 * Idle-Animationen. Liefert Sekunden seit Mount, aktualisiert mit ~fps
 * (Standard 30). Ein setInterval wie useSpriteFrame — bewusst simpel.
 */
import { useState, useEffect, useRef } from 'react';

export function useAmbient(fps = 30, running = true) {
  const [t, setT] = useState(0);
  const startRef = useRef(null);
  useEffect(() => {
    if (!running) return;
    if (startRef.current == null) startRef.current = Date.now();
    const id = setInterval(() => {
      setT((Date.now() - startRef.current) / 1000);
    }, Math.round(1000 / fps));
    return () => clearInterval(id);
  }, [fps, running]);
  return t;
}
