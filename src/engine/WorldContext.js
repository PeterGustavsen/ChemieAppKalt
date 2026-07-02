/*
 * WorldContext — Brücke zwischen der EINEN Welt-Canvas (WorldLab) und den
 * Rätsel-Szenen. Die Szenen bleiben unverändert; ihr SceneShell publiziert
 * den Skia-Layer hierüber in die Welt-Canvas, statt eine eigene zu mounten.
 *
 *   setLayer(fn)  — schreibt nur in eine Ref (kein State!), die Welt liest
 *                   sie bei ihrem nächsten Frame — keine Render-Schleifen.
 *   L             — welt-bewusstes Layout: toScreen() rechnet Szenen-Koords
 *                   (0..640) über Segment-Offset und Kamera in Bildschirm-px.
 *   traveling     — Kamera fährt gerade → Overlays gelten als busy.
 */
import { createContext, useContext } from 'react';

export const WorldContext = createContext(null);
export const useWorld = () => useContext(WorldContext);
