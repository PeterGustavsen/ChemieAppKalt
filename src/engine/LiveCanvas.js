/*
 * LiveCanvas — Canvas mit Watchdog für einen Web-Renderer-Bug in RNSkia:
 * Eine Canvas kann (racebedingt, meist bei Szenenwechseln) dauerhaft
 * "einfrieren" — der innere Skia-Reconciler liefert dann nur noch das letzte
 * Bild, obwohl React weiter rendert und Pictures anliefert.
 *
 * Watchdog: ein Herzschlag-Pixel (Ecke oben links, 1 Farbstufe Wechsel — fürs
 * Auge unsichtbar) verändert das Bild bei jedem Tick. Alle ~1,2 s wird ein
 * 24×24-Snapshot des Pictures verglichen; ist er identisch zum vorherigen,
 * ist die Canvas eingefroren → Remount über key-Wechsel. Läuft dauerhaft,
 * weil das Einfrieren auch eine zunächst gesunde Canvas treffen kann.
 * Kosten: Snapshot+Base64 von 24×24 px, deutlich unter 1 ms pro Prüfung.
 *
 * Native ist nicht betroffen (anderes Render-Backend) → dort reiner Wrapper.
 * Nur für ANIMIERTE Haupt-Canvases gedacht — statische (Backdrop, CRT) sehen
 * eingefroren identisch aus und brauchen keinen Watchdog.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Canvas, Rect, useCanvasRef } from '@shopify/react-native-skia';

const CHECK_MS = 1200;

export default function LiveCanvas({ children, ...props }) {
  const ref = useCanvasRef();
  const [gen, setGen] = useState(0);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;
    let alive = true;
    let last = null;

    const snap = () => {
      try {
        const img = ref.current && ref.current.makeImageSnapshot({ x: 0, y: 0, width: 24, height: 24 });
        return img ? img.encodeToBase64() : null;
      } catch (_) {
        return null;
      }
    };

    // Herzschlag: erzwingt bei lebender Canvas eine Bildänderung pro Tick.
    const beatId = setInterval(() => { if (alive) setBeat((b) => b + 1); }, 300);
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

    return () => { alive = false; clearInterval(beatId); clearInterval(checkId); };
  }, [gen]);

  return (
    <Canvas key={gen} ref={ref} {...props}>
      {children}
      {/* Herzschlag im Snapshot-Fenster (24×24, Ecke oben links): Wechsel um
          1 Farbkanalstufe — unsichtbar, aber im Byte-Vergleich eindeutig
          (Alpha-Varianten würden auf dunklen Szenen identisch quantisieren). */}
      <Rect x={0} y={0} width={3} height={3} color={beat % 2 ? '#0b0a0c' : '#0a0a0c'} />
    </Canvas>
  );
}
