# Restliche Arbeit — Aufteilung Konstantin / Ruben (6-Stationen-Version)

Basis: `origin/ruben` (6 Stationen, `src/fx/feedback.js` fertig, Timer/Persistence fertig).
**Regel: pro Datei genau EIN Owner** — dann keine Merge-Kollisionen mehr.
Beide rufen Sound nur über `import { FX } from '../fx/feedback'` (Rubens Datei, fertig).

Status der 6 neuen Szenen: alle sind noch **flache Text-Panels** über dem Bild,
**keine** nutzt Skia/`renderScene`, **keine** ruft `FX.*`. → genau das ist die Arbeit.

---

## RUBEN — Engine, Audio, Board-Szenen, Hub
**Dateien, die NUR Ruben anfasst:**
- `src/fx/feedback.js` — echte SFX-Dateien einbinden (SFX-Map einkommentieren)
- `assets/sfx/*` — echte Sounddateien anlegen (success/error/click/drip/clunk/alarm/radio)
- `src/config/game.js` — Puzzle-/Code-Tuning falls nötig
- `src/scenes/Scene1Hub.js`
  - die ~5 parallelen 32 ms-`setInterval` (glow/taskLamp/shutter/bob/walk) in **eine** Loop zusammenlegen
  - `FX.alarm()` beim Auslösen des Alarms, `FX.clunk()` beim Öffnen einer gelösten Kammer, `FX.click()` auf Hotspots
  - `<CRTOverlay/>` von Konstantin einsetzen (Komponente kommt von K., s.u.)
- **Board-Text-Szenen in-world bringen + FX** (Tafel-Hintergrund, eher Gleichungen/Text):
  - `src/scenes/Scene3Redox.js`  (scene_03 Tafel)
  - `src/scenes/Scene6Electrolysis.js`  (scene_02)
  - `src/scenes/Scene7Equilibrium.js`  (scene_03 Tafel)
  - je: Panel von der Bildmitte auf die gemalte Tafel/Apparatur holen, ✓/✗ statt nur Farbe, `FX.click/error/success`
- **(optional) neue Hintergründe** für Szene 6 & 7 (nutzen aktuell 2 & 3 doppelt)

## KONSTANTIN — Immersions-Infra + visuelle Szenen
**Dateien, die NUR ich anfasse:**
- `src/ui/CRTOverlay.js` *(NEU)* — eine wiederverwendbare Skia-Scanline+Vignette-Overlay-Komponente
  → liefere ich zuerst, damit Ruben sie im Hub einsetzen kann
- `src/scenes/SceneShell.js`
  - CRT-Overlay einbauen
  - **I4:** Intro nicht mehr als Vollbild-Dialog, sondern als antippbare „Lab-Notiz" im Bild
    (Szenen übergeben weiter nur `introLines` → Rubens Szenen profitieren automatisch)
- **Visuell reiche Szenen in-world bringen + FX:**
  - `src/scenes/Scene2Buffer.js`  (scene_02) → in-world Kolben, fallender Tropfen `FX.drip()`, Farb-Crossfade
  - `src/scenes/Scene4Galvanic.js` (scene_04 PSE) → Zellen im Bild, pulsierendes Glühen, angepinnte Lab-Notiz
  - `src/scenes/Scene5Ester.js`   (scene_05 Apparatur) → Pixel-Bechergläser, Wand-Monitor-Readout, heller werdende Flamme
- `src/ui/PixelDialog.js` (nur falls Notiz-Styling es braucht)

---

## Schnittstellen (damit nichts kollidiert)
1. **`CRTOverlay`** (K. baut): `<CRTOverlay scale offsetX offsetY w h intensity? />` — rein visuell, `pointerEvents="none"`.
   SceneShell nutzt sie (K.), Scene1Hub nutzt sie (R.).
2. **Intro-Notiz** lebt in `SceneShell` (K.). Alle Szenen geben weiter `introLines` mit → keine Änderung in Rubens Szenen nötig.
3. **FX**: `import { FX } from '../fx/feedback'` — jeder verdrahtet nur seine eigenen Szenen.

## Gemeinsame Geräusch-Auslöser (Konvention)
`FX.click()` Tap/Stepper · `FX.error()` falsch · `FX.success()` gelöst ·
`FX.drip()` Titrationstropfen · `FX.clunk()` Schließfach auf · `FX.alarm()` Alarm
