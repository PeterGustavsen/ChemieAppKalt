# Chemischer Escape Room — Pixel-Art Style Guide

## Aesthetic
SNES / 32-bit JRPG era (1992–1996 feel). Think *EarthBound*, *Final Fantasy VI*,
*Chrono Trigger*. Dense, readable scenes with selective detail. Not flat. Not modern.

## Canvas
- Native resolution: **256 × 224 px** (SNES NTSC)
- Upscale: **integer only** (×3, ×4) — never bicubic/bilinear
- All assets authored at native res, scaled at render time

## Palette (`palette.py`)
32 named colours. Never use an RGB value not in this list.

| Group          | Names                                      |
|----------------|--------------------------------------------|
| Shadow/BG      | VOID, SHADOW, DARK_BLUE                   |
| Wall (Petrol)  | WALL_DARK, WALL_MID, WALL_LIGHT, WALL_BRIGHT, TILE_GROUT |
| Floor/Bench    | FLOOR_DARK, FLOOR_MID, FLOOR_LIGHT, WOOD_DARK, WOOD_MID, WOOD_LIGHT |
| Metal          | METAL_DARK, METAL_MID, METAL_LIGHT        |
| Brass/Amber    | BRASS_DARK, BRASS_MID, BRASS_LIGHT        |
| Glass/Liquid   | GLASS_DARK, GLASS_MID, GLASS_LIGHT, GLASS_SHINE |
| Chem Accents   | ACID_DARK, ACID_MID, ACID_BRIGHT, MAGENTA, AMBER |
| UI/Glow        | PHOSPHOR, TEXT_WHITE, TEXT_DIM, PURE_WHITE |

### Hex reference
```
VOID        #080810    SHADOW      #141828    DARK_BLUE   #1c243c
WALL_DARK   #1e3e4e    WALL_MID    #2c5462    WALL_LIGHT  #3c6e7c
WALL_BRIGHT #528e9c    TILE_GROUT  #18303c
FLOOR_DARK  #282420    FLOOR_MID   #3c362e    FLOOR_LIGHT #544c40
WOOD_DARK   #3a2616    WOOD_MID    #583c22    WOOD_LIGHT  #7a5834
METAL_DARK  #383840    METAL_MID   #585c68    METAL_LIGHT #888c98
BRASS_DARK  #6a5018    BRASS_MID   #a87c28    BRASS_LIGHT #d4a848
GLASS_DARK  #144458    GLASS_MID   #2880a0    GLASS_LIGHT #60b8d0  GLASS_SHINE #b8e8f0
ACID_DARK   #286008    ACID_MID    #50a010    ACID_BRIGHT #88d828
MAGENTA     #a01070    AMBER       #d89410
PHOSPHOR    #18d848    TEXT_WHITE  #e0e4d8    TEXT_DIM    #889888  PURE_WHITE  #ffffff
```

## Lighting
- One dominant light source per scene (position specified per scene).
- Shadows: use the next-darker palette step, not black.
- Highlights: use the next-brighter palette step.
- Glow sources (terminal screen, neon lights, chemical glows): dithered radial spread.

## Tiles
- Walls and floors built from **16 × 16 px tiles**.
- Tile grid: subtle grout lines in TILE_GROUT. Not every tile must be identical
  — use WALL_DARK / WALL_MID alternation for texture.
- Bevel inner corners. Avoid solid flat walls.

## Dithering
- **Bayer 4 × 4 ordered dithering** for gradients, glow, glass transparency, liquid depth.
- Flat-coloured areas (walls, benches, solid objects): NO dithering.
- Floyd-Steinberg only if generating palette-quantised final exports.

## Outlines
- **Selective outlines**: dark (VOID or SHADOW), not solid all-around.
- Bottom and right edges of objects get the darkest outline.
- Top / left get the highlight. Mimics SNES sprite feel.
- No outline on individual tiles (only on tile-group borders / large objects).

## Characters
- Prof. Dr. Molar: old chemist, wild grey hair, round wire glasses, stained lab coat,
  slightly hunched, eccentric expression.
- Sprite sheets: Idle frame + Speaking frame (mouth open).
- Same palette, same outline style as environment.

## Scenes
Each scene must be **immediately readable** as a specific lab area.
Narrative legibility > visual complexity.

## JRPG Dialog Box
- Bottom ~40 px of screen.
- Dark navy background (DARK_BLUE at ~80% opacity approximated by fill).
- Border: 2 px outer WALL_LIGHT, 1 px inner PURE_WHITE corners.
- Speaker name: BRASS_LIGHT, pixel font ×1.
- Body text: TEXT_WHITE, pixel font ×1.
- Blinking ▼ indicator bottom-right.

## Files
| Path | Purpose |
|------|---------|
| `tools/pixelart/palette.py` | Master colour constants |
| `tools/pixelart/pixel_helpers.py` | Drawing primitives |
| `tools/pixelart/STYLE.md` | This file |
| `tools/pixelart/PROGRESS.md` | Per-scene decisions log |
| `tools/pixelart/scene_*.py` | Scene generators |
| `assets/scenes/*.png` | Native-res outputs |
| `assets/scenes/*_x4.png` | ×4 preview exports |
