"""
Szene 2 — Titrationsstation (Titration Bench)
256×224 px native, exported at ×4 for preview.

Layout:
  - Petrol tiled wall fills upper area.
  - Wide wooden workbench across full width (y 160–185).
  - Retort stand with bürette (titrant-filled, brass stopcock).
  - Erlenmeyer flask with magenta indicator liquid.
  - Pipette leaning against stand.
  - Lab notebook open on bench.
  - Acid drip below bürette tip.
  - JRPG dialog box at bottom.

Light source: top-left.
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from PIL import Image, ImageDraw
from palette import (
    VOID, SHADOW, DARK_BLUE,
    WALL_DARK, WALL_MID, WALL_LIGHT, WALL_BRIGHT, TILE_GROUT,
    FLOOR_DARK, FLOOR_MID, FLOOR_LIGHT,
    WOOD_DARK, WOOD_MID, WOOD_LIGHT,
    METAL_DARK, METAL_MID, METAL_LIGHT,
    BRASS_DARK, BRASS_MID, BRASS_LIGHT,
    GLASS_DARK, GLASS_MID, GLASS_LIGHT, GLASS_SHINE,
    ACID_DARK, ACID_MID, ACID_BRIGHT,
    MAGENTA, AMBER, PHOSPHOR,
    TEXT_WHITE, TEXT_DIM, PURE_WHITE,
)
from pixel_helpers import (
    new_canvas, draw_wall_tiles, dither_gradient,
    draw_glass_rect, draw_liquid, draw_text, export,
    NATIVE_W, NATIVE_H, TILE,
)

W, H = NATIVE_W, NATIVE_H   # 256 × 224


def main():
    img = Image.new("RGB", (W, H), VOID)
    d   = ImageDraw.Draw(img)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 1. WALL (y 0–165) — petrol tiled
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    wall_bottom = 165
    draw_wall_tiles(img, 0, 0, W, wall_bottom,
                    WALL_DARK, WALL_MID, WALL_LIGHT, TILE_GROUT)

    # Top-left light source: brighter top-left corner, gradients outward
    dither_gradient(img, 0, 0, W - 1, 14, WALL_BRIGHT, WALL_DARK, axis='y')
    # Left-side brightness falloff
    dither_gradient(img, 0, 0, 28, wall_bottom - 1, WALL_LIGHT, WALL_MID, axis='x')

    # Ceiling edge darkening on the right side (away from light)
    dither_gradient(img, W - 48, 0, W - 1, 12, WALL_MID, WALL_DARK, axis='x')

    # Subtle ambient shadow at base of wall
    dither_gradient(img, 0, wall_bottom - 16, W - 1, wall_bottom - 1,
                    WALL_MID, WALL_DARK, axis='y')

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 2. WORKBENCH (y 160–185) — full width wooden bench
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    bench_top = 160
    bench_bot = 185

    # Bench surface fill
    d.rectangle([0, bench_top, W - 1, bench_bot], fill=WOOD_MID)
    # Top highlight line
    d.line([0, bench_top, W - 1, bench_top], fill=WOOD_LIGHT)
    d.line([0, bench_top + 1, W - 1, bench_top + 1], fill=WOOD_LIGHT)
    # Bottom shadow strip
    d.line([0, bench_bot - 1, W - 1, bench_bot - 1], fill=WOOD_DARK)
    d.line([0, bench_bot, W - 1, bench_bot], fill=SHADOW)
    # Wood grain lines (subtle horizontal streaks)
    for gy in [bench_top + 4, bench_top + 8, bench_top + 13, bench_top + 18]:
        for gx in range(0, W, 8):
            if (gx // 8) % 3 != 0:
                d.line([gx, gy, gx + 5, gy], fill=WOOD_DARK)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 3. RETORT STAND (x 90–95, y 60–165)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    stand_x0, stand_x1 = 90, 95
    stand_y0, stand_y1 = 60, 165

    # Vertical pole (METAL_DARK body)
    d.rectangle([stand_x0, stand_y0, stand_x1, stand_y1], fill=METAL_DARK)
    # Left edge highlight (top-left light source)
    d.line([stand_x0, stand_y0, stand_x0, stand_y1], fill=METAL_LIGHT)
    d.line([stand_x0 + 1, stand_y0, stand_x0 + 1, stand_y1], fill=METAL_MID)

    # Base plate on bench
    d.rectangle([82, stand_y1 - 4, 103, stand_y1 + 2], fill=METAL_MID)
    d.line([82, stand_y1 - 4, 103, stand_y1 - 4], fill=METAL_LIGHT)
    d.line([82, stand_y1 + 2, 103, stand_y1 + 2], fill=VOID)

    # Horizontal clamp rings (BRASS_MID) at two heights
    for clamp_y in [80, 140]:
        d.rectangle([85, clamp_y - 3, 100, clamp_y + 3], fill=BRASS_MID)
        d.line([85, clamp_y - 3, 100, clamp_y - 3], fill=BRASS_LIGHT)
        d.line([85, clamp_y + 3, 100, clamp_y + 3], fill=BRASS_DARK)
        d.line([85, clamp_y - 3, 85, clamp_y + 3], fill=BRASS_LIGHT)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 4. BÜRETTE (x 92–96, y 65–160)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    bur_x0, bur_x1 = 92, 96
    bur_y0, bur_y1 = 65, 160

    # Glass tube outer shell
    draw_glass_rect(img, bur_x0, bur_y0, bur_x1, bur_y1,
                    body=GLASS_MID, highlight=GLASS_LIGHT,
                    shadow=GLASS_DARK, shine_x=bur_x0 + 1)

    # Liquid fill — bottom 2/3 of the bürette (acid green titrant)
    liquid_y0 = bur_y0 + (bur_y1 - bur_y0) // 3
    draw_liquid(img, bur_x0, liquid_y0, bur_x1, bur_y1 - 1,
                color=ACID_MID, surface_highlight=ACID_BRIGHT)

    # Graduation markings (tiny lines on right side of tube)
    for gy in range(bur_y0 + 6, bur_y1 - 6, 8):
        d.line([bur_x1 + 1, gy, bur_x1 + 3, gy], fill=METAL_MID)

    # Brass stopcock (x 91–97, y 155 — 3px tall)
    d.rectangle([91, 155, 97, 158], fill=BRASS_MID)
    d.line([91, 155, 97, 155], fill=BRASS_LIGHT)
    d.line([91, 158, 97, 158], fill=BRASS_DARK)
    # Stopcock handle (horizontal bar sticking out)
    d.rectangle([98, 156, 104, 157], fill=BRASS_MID)
    img.putpixel((104, 156), BRASS_LIGHT)

    # Bürette tip below stopcock (narrow nozzle)
    d.line([93, 159, 93, 162], fill=GLASS_MID)
    d.line([94, 159, 94, 162], fill=GLASS_LIGHT)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 5. ERLENMEYER FLASK (x 55–85, y 130–165)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    # Neck (narrow): x 67–73, y 130–145
    neck_x0, neck_x1 = 67, 73
    neck_y0, neck_y1 = 130, 145
    draw_glass_rect(img, neck_x0, neck_y0, neck_x1, neck_y1,
                    body=GLASS_MID, highlight=GLASS_LIGHT, shadow=GLASS_DARK)

    # Body (wider trapezoid): x 55–85, y 145–165
    body_x0, body_x1 = 55, 85
    body_y0, body_y1 = 145, 165

    # Draw trapezoid body manually (flared sides)
    d.polygon([
        (neck_x0, body_y0),
        (neck_x1, body_y0),
        (body_x1, body_y1),
        (body_x0, body_y1),
    ], fill=GLASS_MID)

    # Magenta liquid inside body (after colour-change endpoint)
    liquid_top = body_y0 + 6
    d.polygon([
        (neck_x0 + 1, liquid_top),
        (neck_x1 - 1, liquid_top),
        (body_x1 - 1, body_y1 - 1),
        (body_x0 + 1, body_y1 - 1),
    ], fill=MAGENTA)

    # Surface highlight of liquid
    d.line([neck_x0 + 1, liquid_top, neck_x1 - 1, liquid_top], fill=GLASS_LIGHT)

    # Body glass edges / highlights
    d.line([neck_x0, body_y0, body_x0, body_y1], fill=GLASS_LIGHT)
    d.line([neck_x1, body_y0, body_x1, body_y1], fill=GLASS_DARK)
    d.line([body_x0, body_y1, body_x1, body_y1], fill=GLASS_DARK)
    d.line([neck_x0, body_y0, neck_x1, body_y0], fill=GLASS_LIGHT)

    # Surface specular shine line on body
    d.line([body_x0 + 3, body_y0 + 8, body_x0 + 5, body_y1 - 4], fill=GLASS_SHINE)

    # Outline trapezoid body
    d.polygon([
        (neck_x0, body_y0),
        (neck_x1, body_y0),
        (body_x1, body_y1),
        (body_x0, body_y1),
    ], outline=VOID)

    # Outline neck
    d.rectangle([neck_x0, neck_y0, neck_x1, neck_y1], outline=VOID)

    # Stopper/rim at very top of neck
    d.rectangle([neck_x0 - 1, neck_y0 - 2, neck_x1 + 1, neck_y0 + 1], fill=GLASS_LIGHT)
    d.line([neck_x0 - 1, neck_y0 - 2, neck_x1 + 1, neck_y0 - 2], fill=VOID)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 6. PIPETTE (leaning against stand, x 100–102, y 80–160)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    pip_x = 100
    pip_y0, pip_y1 = 80, 160
    # Thin glass tube (two pixels wide)
    for py in range(pip_y0, pip_y1):
        img.putpixel((pip_x, py), GLASS_MID)
        img.putpixel((pip_x + 1, py), GLASS_LIGHT)

    # Bulge in middle of pipette
    bulge_y0, bulge_y1 = pip_y0 + 30, pip_y0 + 50
    for py in range(bulge_y0, bulge_y1):
        img.putpixel((pip_x - 1, py), GLASS_MID)
        img.putpixel((pip_x + 2, py), GLASS_DARK)

    # Tip at bottom (taper to 1px)
    d.line([pip_x, pip_y1, pip_x, pip_y1 + 4], fill=GLASS_MID)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 7. LAB NOTEBOOK (x 20–50, y 155–165)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    nb_x0, nb_x1 = 20, 50
    nb_y0, nb_y1 = 155, 165

    # Spine (left edge)
    d.rectangle([nb_x0, nb_y0, nb_x0 + 2, nb_y1], fill=SHADOW)
    # Pages (right portion)
    d.rectangle([nb_x0 + 3, nb_y0, nb_x1, nb_y1], fill=PURE_WHITE)
    # Page edge shadow
    d.line([nb_x1, nb_y0, nb_x1, nb_y1], fill=TEXT_DIM)
    d.line([nb_x0 + 3, nb_y1, nb_x1, nb_y1], fill=TEXT_DIM)
    # Text lines on page
    for li, ly in enumerate([nb_y0 + 2, nb_y0 + 4, nb_y0 + 6, nb_y0 + 8]):
        line_len = 20 if li % 2 == 0 else 14
        d.line([nb_x0 + 5, ly, nb_x0 + 5 + line_len, ly], fill=VOID)
    # Page separator (middle fold)
    d.line([(nb_x0 + nb_x1) // 2, nb_y0, (nb_x0 + nb_x1) // 2, nb_y1], fill=TEXT_DIM)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 8. ACID DRIP (x 93, y 160–162) — below bürette tip
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    img.putpixel((93, 163), ACID_MID)
    img.putpixel((93, 164), ACID_MID)
    img.putpixel((94, 164), ACID_BRIGHT)

    # Tiny splash dot on bench surface
    img.putpixel((92, bench_top + 1), ACID_DARK)
    img.putpixel((94, bench_top + 1), ACID_DARK)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Extra: safety goggles hanging on stand
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    gogg_y = 70
    # Strap
    d.line([78, gogg_y, 90, gogg_y], fill=METAL_MID)
    # Left lens
    d.rectangle([78, gogg_y - 3, 83, gogg_y + 3], fill=GLASS_DARK)
    d.rectangle([78, gogg_y - 3, 83, gogg_y + 3], outline=VOID)
    img.putpixel((79, gogg_y - 2), GLASS_SHINE)
    # Right lens
    d.rectangle([85, gogg_y - 3, 90, gogg_y + 3], fill=GLASS_DARK)
    d.rectangle([85, gogg_y - 3, 90, gogg_y + 3], outline=VOID)
    img.putpixel((86, gogg_y - 2), GLASS_SHINE)
    # Bridge
    d.line([83, gogg_y, 85, gogg_y], fill=METAL_MID)

    # Small beaker on far-right of bench (context detail)
    bk_x0, bk_x1 = 200, 218
    bk_y0, bk_y1 = 145, 163
    draw_glass_rect(img, bk_x0, bk_y0, bk_x1, bk_y1,
                    body=GLASS_MID, highlight=GLASS_LIGHT, shadow=GLASS_DARK)
    draw_liquid(img, bk_x0, bk_y0 + 6, bk_x1, bk_y1 - 1,
                color=GLASS_MID, surface_highlight=GLASS_LIGHT)
    for gm in range(bk_y0 + 4, bk_y1 - 2, 4):
        img.putpixel((bk_x1 + 1, gm), METAL_MID)

    # pH meter probe on right side of bench
    ph_x = 228
    d.rectangle([ph_x, bench_top + 2, ph_x + 4, bench_top + 12], fill=METAL_MID)
    d.line([ph_x, bench_top + 2, ph_x + 4, bench_top + 2], fill=METAL_LIGHT)
    d.line([ph_x + 2, bench_top + 12, ph_x + 2, bench_top + 18], fill=METAL_DARK)
    d.rectangle([ph_x - 2, bench_top + 14, ph_x + 6, bench_top + 22], fill=DARK_BLUE)
    d.rectangle([ph_x - 2, bench_top + 14, ph_x + 6, bench_top + 22], outline=VOID)
    draw_text(img, "7", ph_x - 1, bench_top + 15, color=PHOSPHOR, scale=1)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 9. DIALOG BOX (y 186–223)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    db_y0 = 186
    db_y1 = H - 1

    # Dark navy fill
    d.rectangle([0, db_y0, W - 1, db_y1], fill=DARK_BLUE)
    # 1px border top (WALL_LIGHT)
    d.line([0, db_y0, W - 1, db_y0], fill=WALL_LIGHT)
    # Outer border
    d.rectangle([2, db_y0 + 1, W - 3, db_y1 - 1], outline=WALL_LIGHT)
    # Inner corner accents (PURE_WHITE)
    for (cx, cy) in [
        (3, db_y0 + 2), (4, db_y0 + 2),
        (W - 4, db_y0 + 2), (W - 5, db_y0 + 2),
        (3, db_y1 - 2), (4, db_y1 - 2),
        (W - 4, db_y1 - 2), (W - 5, db_y1 - 2),
    ]:
        img.putpixel((cx, cy), PURE_WHITE)

    # Title: "TITRATIONSSTATION" in BRASS_LIGHT
    draw_text(img, "TITRATIONSSTATION", 6, 193, color=BRASS_LIGHT, scale=1)
    # Separator
    d.line([6, 202, W - 6, 202], fill=WALL_MID)
    # Dialog line 1
    draw_text(img, "FARBUMSCHLAG BEOBACHTEN...", 6, 205, color=TEXT_WHITE, scale=1)
    # Scroll indicator ▼ in BRASS_LIGHT
    draw_text(img, "▼", 238, 213, color=BRASS_LIGHT, scale=1)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Export
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    export(img, "../../assets/scenes/scene_02_titration.png", preview_scale=4)


if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    main()
