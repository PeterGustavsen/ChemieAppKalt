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

## Assets — Status
| Asset | Skript | Status |
|-------|--------|--------|
| Molar Idle-Sprite | `sprite_molar_idle.py` | in Arbeit |
| Szene 1 Hub | `scene_01_lab_hub.py` | in Arbeit |
| Szene 2 Titration | `scene_02_titration.py` | offen |
| Szene 3 Reagenzschrank | `scene_03_cabinet.py` | offen |
| Szene 4 PSE | `scene_04_periodic.py` | offen |
| Szene 5 Apparate | `scene_05_apparatus.py` | offen |
