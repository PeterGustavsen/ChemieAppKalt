# Pixel-Art Pipeline — Progress Log

## Foundation (done)
- `palette.py`: 32+1 colours finalised. Petrol/teal walls, wood bench, brass/amber accents,
  glass cyan, acid green, magenta, phosphor green for terminal, PURE_WHITE reserved for
  pure glints only.
- `pixel_helpers.py`: draw_tile, draw_wall_tiles, dither_gradient, dither_radial,
  draw_glass_rect, draw_liquid, selective_outline, draw_glow, draw_scanlines,
  apply_vignette, draw_text (5×7 bitmap font), export (nearest-neighbour ×N).
- `STYLE.md`: style guide with palette hex table, lighting rules, tile rules.

## Prof. Dr. Molar Sprite
- 32×48 px per frame, green chroma-key background.
- Idle: closed-mouth slight smirk.
- Speaking: oval open mouth with visible teeth row.
- Style: selective VOID outlines bottom+right, SKIN_MID=BRASS_MID, HAIR=METAL_LIGHT.
- Scaled ×2 when placed in scenes (renders as 64×96 on 256×224 canvas).

**Decisions:**
- Used WOOD_DARK for skin shadow (warm brown fits 32-colour constraint better than a
  dedicated skin-dark).
- Hair represented by METAL_MID/METAL_LIGHT (grey-blue, lab-appropriate).
- Coat stain: ACID_MID + GLASS_MID dots for "chemical spatter" personality detail.

## Scene 1 — Molars Labor / Hub
- Light source: fluorescent strip top-centre + terminal screen phosphor glow.
- Wall: 16×16 petrol tiles with WALL_DARK/WALL_MID checkerboard + TILE_GROUT lines.
- PSE poster upper-left: 8×5 miniature element grid, colour-coded groups.
- Cabinet upper-right: dark wood with glass door, bottle silhouettes in accent colours.
- Pipe run far right: vertical METAL conduit with flanges.
- Bench: METAL_MID lip + WOOD_MID surface across full width.
- Terminal (centre-right): chunky bezel, phosphor green screen glow (dithered radial),
  "ENTER CODE:" prompt, keyboard rows. 4 LED unlock indicators above.
- Molar placed left of terminal, ×2 scaled, chroma-keyed composite.
- JRPG dialog box: DARK_BLUE fill, WALL_LIGHT border, BRASS_LIGHT speaker name,
  TEXT_WHITE body, ▼ indicator.

**Decisions:**
- Vignette applied on export (not baked — can be toggled).
- Scanlines off by default on preview (would darken too much at ×4; will be a shader
  in-app).
- Terminal glow bleeds onto bench surface via dither_radial — intentional warm detail.
