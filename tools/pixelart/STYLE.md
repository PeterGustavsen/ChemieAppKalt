# STYLE GUIDE — Chemischer Escape Room (Pixel-Art)

## Auflösung & Rendering
- **Native Asset-Auflösung: 640×360** (16:9). "High-res pixel art" — Dichte wie
  Stardew Valley / Dead Cells, **kein grobes 256er-SNES-Korn**.
- App rendert auf ein 640×360-Canvas (react-native-skia) und skaliert **integer**
  (nearest-neighbor) auf die Bildschirmgröße, Letterbox bei Bedarf.
- Sprites: horizontale Sprite-Sheets, alle Frames gleich breit.

## Palette (`palette.py` — verbindlich, ~46 Farben)
Material-Ramps (dunkel → hell), Lichtquelle **immer oben-links**:

| Ramp | Verwendung |
|------|-----------|
| `wall`  | Petrol/Teal-Wände |
| `floor` / `grout` | Boden + Fugen |
| `wood`  | Laborbank, Türrahmen |
| `brass` | Apparate, Beschläge, Messing |
| `steel` | Metall, Geräte, Terminalgehäuse |
| `glass` (+`glass_hi`) | Glaswaren, Bildschirme, Reagenzgläser |
| `acid`/`base`/`pink`/`purple`/`orange` | Chemikalien & Indikatoren |
| `crt` (+`crt_amber`) | Terminal-Phosphor |
| `glow`  | Lampen, Lichtschein |
| `skin`/`coat`/`hair`/`glasses` | Prof. Dr. Molar |
| `red`/`green_ok`/`white` | Status / UI |

## Regeln
1. **Outlines selektiv & dunkel** (`INK`), nicht flächig um jedes Pixel — nur
   Silhouetten & Materialgrenzen. `selective_outline()` für Sprites.
2. **Dithering** (Bayer 4×4, `dither_rect`/`vgradient`) für Verläufe, Glas, Licht —
   keine glatten Gradienten.
3. **Konsistentes Licht oben-links**: Highlights oben/links, Schatten unten/rechts,
   Bodenschatten unter Objekten (`soft_shadow`).
4. **Tiles 16×16 oder 32×32** für Wände/Boden.
5. **Lesbarkeit zuerst**: Jede Szene erzählt auf einen Blick, was zu tun ist.
   Interaktive Objekte deutlich silhouettiert, mit Platz für Hover-Glow.
6. Jedes Asset hat ein eigenes Skript, exportiert nach `assets/scenes/` bzw.
   `assets/sprites/`, plus optional `*_preview.png` (3× Upscale) zur Sichtkontrolle.

## Hover/Interaktion (Renderer-Seite)
- Hotspots bekommen bei Hover/Touch eine 1–2px **Outline + leichtes Glow**, Cursor
  wechselt. Klick → Reaktion/Animation in der Szene. Das Rätsel wird **durch die
  Interaktion** gelöst, nicht durch blinde Code-Eingabe.
