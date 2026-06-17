# PROGRESS — Pixel-Art Pipeline

Log: probiert / verworfen / warum — damit Stil & Interaktions-Pattern konsistent bleiben.

## Architektur-Entscheidungen
- **640×360 statt 256×224**: alter Stand war grobes SNES-Korn; Vorgabe ist feinere
  Dichte. Integer-Scaling in der App hält Pixel scharf.
- **react-native-skia**: Canvas-Renderer, nearest-neighbor, in Expo Go (SDK 52)
  enthalten → kein Custom-Dev-Client nötig. Zielplattform: iOS/Android.
- **Ramp-basierte Palette** (`palette.py`): konsistentes Licht oben-links, Dithering
  statt glatter Verläufe.

## Verworfen
- **Alter Look komplett entfernt**: View-basiertes Professor-Sprite, Dialog-only-Intro,
  256×224-Hintergründe, blinde Code-Eingabe-Maske. Grund: kein interaktives
  Point-and-Click, Maskottchen passte nicht zum Pixel-Stil.

## Wichtiger Fix
- **Alpha-Kompositing**: PIL `ImageDraw` ERSETZT Pixel (kein Blending). Lichtkegel
  und Schatten muessen ueber `alpha_composite` einer eigenen Ebene
  (`blend_poly`/`soft_shadow`), sonst werden Wandpixel geloescht statt ueberstrahlt.

## Interaktions-Pattern (alle Raetselszenen)
- `SceneShell` = Huelle (Skia-Stage, Intro-Dialog, Hinweis, Zurueck, Geloest-Panel).
- Statische Apparatur kommt aus dem PNG; dynamische Teile (Fluessigkeit, Gleichung,
  Symbole, Flamme) zeichnet die App (Skia-Pfade/Rects + RN-Overlay).
- Code wird im Raum per Interaktion erspielt, dann am Haupt-Terminal eingegeben.

## Assets — Status
| Asset | Skript | Status |
|-------|--------|--------|
| Molar Idle-Sprite | `sprite_molar_idle.py` | fertig |
| Szene 1 Hub | `scene_01_lab_hub.py` | fertig |
| Szene 2 Titration | `scene_02_titration.py` | fertig |
| Szene 3 Reagenzschrank | `scene_03_cabinet.py` | fertig |
| Szene 4 PSE | `scene_04_periodic.py` | fertig |
| Szene 5 Apparate | `scene_05_apparatus.py` | fertig |
