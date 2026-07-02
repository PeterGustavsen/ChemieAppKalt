/*
 * LiveCanvas — Canvas mit Watchdog für einen Web-Renderer-Bug in RNSkia:
 * Eine Canvas kann (racebedingt, meist bei Szenenwechseln) dauerhaft
 * "einfrieren" — der innere Skia-Reconciler liefert dann nur noch das letzte
 * Bild, obwohl React weiter rendert und Pictures anliefert.
 *
 * Watchdog: alle ~1,2 s wird ein kleiner Picture-Snapshot verglichen; ist er
 * identisch zum vorherigen, ist die Canvas eingefroren → Remount über
 * key-Wechsel. Voraussetzung: der Canvas-Inhalt animiert dauerhaft sichtbar
 * (in der Welt-Canvas: Staub, Beacons, Uhr). Läuft dauerhaft, weil das
 * Einfrieren auch eine zunächst gesunde Canvas treffen kann.
 *
 * Native ist nicht betroffen (anderes Render-Backend) → dort reiner Wrapper.
 * Nur für ANIMIERTE Haupt-Canvases gedacht — statische (Backdrop, CRT) sehen
 * eingefroren identisch aus und brauchen keinen Watchdog.
 */
import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Canvas, useCanvasRef } from '@shopify/react-native-skia';

const CHECK_MS = 1200;

export default function LiveCanvas({ children, ...props }) {
  const ref = useCanvasRef();
  const [gen, setGen] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;
    let alive = true;
    let last = null;

    const snap = () => {
      try {
        const img = ref.current && ref.current.makeImageSnapshot({ x: 0, y: 0, width: 320, height: 120 });
        return img ? img.encodeToBase64() : null;
      } catch (_) {
        return null;
      }
    };

    const checkId = setInterval(() => {
      if (!alive) return;
      const cur = snap();
      if (cur && last && cur === last) {
        last = null;                 // frisch starten nach dem Remount
        setGen((g) => g + 1);        // eingefroren → Canvas neu mounten
      } else {
        last = cur;
      }
    }, CHECK_MS);

    return () => { alive = false; clearInterval(checkId); };
  }, [gen]);

  return (
    <Canvas key={gen} ref={ref} {...props}>
      {children}
    </Canvas>
  );
}
