/*
 * useCamera — sanfte "Kopfdreh"-Kamera für die 640×360-Bühne.
 *
 * Die Kamera ist ein Punkt (cx, cy) + Zoom z im Szenen-Koordinatensystem.
 * flyTo(rect) schwenkt/zoomt mit Ease-In-Out auf ein Ziel (der Spieler "dreht
 * den Kopf" zu einer Station), reset() fährt zurück zur Übersicht. Optionaler
 * Idle-Drift lässt das Bild minimal atmen, damit die Szene nie ganz statisch
 * wirkt. Ein einziger rAF-Loop, dt-basiert, ~30 fps im Idle, 60 fps im Flug.
 *
 * Anwendung im Skia-Baum (nach dem Bühnen-Transform):
 *   <Group transform={camTransform(cam)}> …Welt… </Group>
 * Für RN-Overlays, die an Welt-Objekten kleben: toScreenCam(L, cam, rect).
 */
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { SCENE_W, SCENE_H } from '../config/game';

const HOME = { cx: SCENE_W / 2, cy: SCENE_H / 2, z: 1 };
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Kamera so klemmen, dass der sichtbare Ausschnitt in der Bühne bleibt.
function clampCam(cx, cy, z) {
  const hw = SCENE_W / (2 * z);
  const hh = SCENE_H / (2 * z);
  return {
    cx: Math.min(SCENE_W - hw, Math.max(hw, cx)),
    cy: Math.min(SCENE_H - hh, Math.max(hh, cy)),
    z,
  };
}

export function camTransform(cam) {
  return [
    { translateX: SCENE_W / 2 },
    { translateY: SCENE_H / 2 },
    { scale: cam.z },
    { translateX: -cam.cx },
    { translateY: -cam.cy },
  ];
}

// Welt-Rect -> Bildschirm-Pixel unter Berücksichtigung der Kamera.
export function toScreenCam(L, cam, r) {
  const s = L.scale * cam.z;
  return {
    left: L.offsetX + (SCENE_W / 2 + (r.x - cam.cx) * cam.z) * L.scale,
    top: L.offsetY + (SCENE_H / 2 + (r.y - cam.cy) * cam.z) * L.scale,
    width: r.w * s,
    height: r.h * s,
  };
}

export function useCamera({ drift = false, baseZoom = 1, start = null } = {}) {
  const base = useMemo(
    () => clampCam(HOME.cx, HOME.cy, baseZoom),
    [baseZoom]
  );
  const [cam, setCam] = useState(() => (start ? clampCam(start.cx, start.cy, start.z) : base));
  const [flying, setFlying] = useState(false);

  const flight = useRef(null);          // { from, to, t0, ms, resolve }
  const camRef = useRef(cam);
  camRef.current = cam;
  const driftRef = useRef(drift);
  driftRef.current = drift;
  // Ruheanker: dorthin kehrt der Drift zurück (base oder letztes Flugziel).
  const anchorRef = useRef(start ? null : base);

  useEffect(() => {
    let raf;
    let lastSet = 0;
    const loop = (now) => {
      const f = flight.current;
      if (f) {
        const k = Math.min(1, (now - f.t0) / f.ms);
        const e = easeInOut(k);
        const next = clampCam(
          f.from.cx + (f.to.cx - f.from.cx) * e,
          f.from.cy + (f.to.cy - f.from.cy) * e,
          f.from.z + (f.to.z - f.from.z) * e
        );
        setCam(next);
        if (k >= 1) {
          flight.current = null;
          anchorRef.current = f.to;
          setFlying(false);
          f.resolve && f.resolve();
        }
      } else if (driftRef.current && anchorRef.current) {
        // Idle: minimales Atmen um den Anker (nur ~30 fps setzen).
        if (now - lastSet > 33) {
          lastSet = now;
          const a = anchorRef.current;
          const t = now / 1000;
          const next = clampCam(
            a.cx + Math.sin(t * 0.33) * 3.0,
            a.cy + Math.cos(t * 0.21) * 1.8,
            a.z + Math.sin(t * 0.14) * 0.006
          );
          setCam(next);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const flyTo = useCallback((rect, { zoom, ms = 620 } = {}) => {
    const z = zoom || Math.min(2.4, Math.max(1.35, (SCENE_W / (rect.w * 3.4))));
    const to = clampCam(rect.x + rect.w / 2, rect.y + rect.h / 2, z);
    const from = { ...camRef.current };
    setFlying(true);
    return new Promise((resolve) => {
      flight.current = { from, to, t0: performance.now(), ms, resolve };
    });
  }, []);

  const reset = useCallback((ms = 520) => {
    const from = { ...camRef.current };
    setFlying(true);
    return new Promise((resolve) => {
      flight.current = { from, to: base, t0: performance.now(), ms, resolve };
    });
  }, [base]);

  return { cam, flying, flyTo, reset };
}
