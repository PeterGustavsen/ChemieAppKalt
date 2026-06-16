"""
Szene 1 — Homepage / Molars Labor (Hub mit Terminal)
256×224 px native, exported at ×4 for preview.

Layout (front-facing, slight depth suggestion):
  - Petrol tiled wall fills upper 60%, with neon strip light, PSE poster,
    pipe runs, and shelf silhouettes.
  - Wooden lab bench along bottom third.
  - CRT terminal centre-right: chunky bezel, glowing green phosphor screen.
  - Prof. Dr. Molar stands centre-left.
  - JRPG dialog box at bottom (~40 px tall).

Light source: fluorescent strip top-centre, warm glow from terminal screen.
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from PIL import Image, ImageDraw
from palette import *
from pixel_helpers import (
    draw_wall_tiles, draw_tile, dither_gradient, dither_radial,
    draw_glass_rect, draw_liquid, draw_text, text_width,
    draw_scanlines, apply_vignette, export, NATIVE_W, NATIVE_H, TILE
)

W, H = NATIVE_W, NATIVE_H   # 256 × 224

def make_scene():
    img = Image.new("RGB", (W, H), VOID)
    d   = ImageDraw.Draw(img)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 1. WALL (y 0–135) — petrol tiled
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    wall_bottom = 136
    draw_wall_tiles(img, 0, 0, W, wall_bottom,
                    WALL_DARK, WALL_MID, WALL_LIGHT, TILE_GROUT)

    # Ceiling darkening (top strip)
    dither_gradient(img, 0, 0, W-1, 10, SHADOW, WALL_DARK, axis='y')

    # Ambient light from strip — subtle upward fade
    for y in range(12, 30):
        t = (y - 12) / 18
        col = WALL_LIGHT if t < 0.4 else (WALL_MID if t < 0.7 else WALL_DARK)
        d.line([0, y, W-1, y], fill=col)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 2. NEON STRIP LIGHT (top-centre)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    strip_x0, strip_x1 = 60, 196
    # Housing
    d.rectangle([strip_x0-2, 2, strip_x1+2, 8], fill=METAL_DARK)
    d.rectangle([strip_x0,   3, strip_x1,   7], fill=METAL_MID)
    # Tube glow
    d.rectangle([strip_x0+2, 4, strip_x1-2, 6], fill=PURE_WHITE)
    # Glow spill downwards (dithered)
    dither_radial(img, (strip_x0+strip_x1)//2, 6, 0, 40, WALL_BRIGHT, WALL_MID)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 3. PSE POSTER (Periodic System, upper-left wall)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    px0, py0, px1, py1 = 8, 18, 72, 70
    d.rectangle([px0, py0, px1, py1], fill=FLOOR_MID)
    d.rectangle([px0, py0, px1, py1], outline=BRASS_DARK)
    # Grid of element boxes (simplified — 8 cols × 5 rows of tiny rectangles)
    ew, eh = 7, 9
    for row in range(5):
        for col in range(8):
            ex = px0 + 2 + col*(ew+1)
            ey = py0 + 4 + row*(eh+1)
            # Colour-code element groups
            if row == 0:
                ec = GLASS_DARK
            elif col < 2:
                ec = BRASS_DARK
            elif col > 5:
                ec = ACID_DARK
            else:
                ec = METAL_DARK
            d.rectangle([ex, ey, ex+ew-1, ey+eh-1], fill=ec)
            d.rectangle([ex, ey, ex+ew-1, ey+eh-1], outline=METAL_MID)
    # "PERIODENSYSTEM" caption
    draw_text(img, "PSE", px0+4, py1-8, color=TEXT_DIM, scale=1)
    # Pin tacks at corners
    for (cx,cy) in [(px0+2,py0+2),(px1-2,py0+2),(px0+2,py1-2),(px1-2,py1-2)]:
        d.point([(cx,cy)], fill=BRASS_MID)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 4. SHELF / CABINET SILHOUETTE (upper-right)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Dark wall-mounted cabinet
    cab_x0, cab_y0, cab_x1, cab_y1 = 190, 15, 250, 90
    d.rectangle([cab_x0, cab_y0, cab_x1, cab_y1], fill=WOOD_DARK)
    d.rectangle([cab_x0, cab_y0, cab_x1, cab_y1], outline=VOID)
    # Glass door (subtle)
    d.rectangle([cab_x0+2, cab_y0+2, cab_x1-2, cab_y1-2], fill=GLASS_DARK)
    d.line([cab_x0+2, (cab_y0+cab_y1)//2, cab_x1-2, (cab_y0+cab_y1)//2], fill=WOOD_DARK)
    # Door handle
    d.rectangle([(cab_x0+cab_x1)//2 - 1, cab_y0+20, (cab_x0+cab_x1)//2+1, cab_y0+28], fill=BRASS_MID)
    # Bottle silhouettes inside
    for bi, (bx, bh, bc) in enumerate([
        (cab_x0+8,  20, GLASS_MID),
        (cab_x0+16, 15, ACID_DARK),
        (cab_x0+24, 18, MAGENTA),
        (cab_x0+35, 22, GLASS_MID),
        (cab_x0+44, 14, AMBER),
    ]):
        by = cab_y0 + 4 + (25 - bh)
        d.rectangle([bx, by, bx+5, by+bh], fill=bc)
        d.rectangle([bx+1, max(0,by-3), bx+4, by], fill=bc)   # neck
        d.line([bx, by, bx+5, by], fill=GLASS_LIGHT)   # highlight

    # Pipe run (top-right wall)
    d.rectangle([245, 0, 250, wall_bottom], fill=METAL_DARK)
    d.line([246, 0, 246, wall_bottom], fill=METAL_MID)
    # Flange connectors
    for fy in [20, 60, 100]:
        d.rectangle([243, fy, 252, fy+4], fill=METAL_MID)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 5. LAB BENCH (y 136–175)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    bench_top = 136
    bench_bot = 175

    # Bench surface
    d.rectangle([0, bench_top, W-1, bench_top+3], fill=METAL_MID)    # lip
    d.rectangle([0, bench_top+3, W-1, bench_bot], fill=WOOD_MID)
    # Surface highlight
    d.line([0, bench_top+3, W-1, bench_top+3], fill=WOOD_LIGHT)
    # Under-bench shadow
    d.rectangle([0, bench_bot, W-1, bench_bot+4], fill=SHADOW)
    # Bench legs
    for lx in [16, W-16]:
        d.rectangle([lx-3, bench_bot, lx+3, H], fill=METAL_DARK)
        d.line([lx-2, bench_bot, lx-2, H], fill=METAL_MID)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 6. FLOOR (y 176–223)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    d.rectangle([0, bench_bot+4, W-1, H-1], fill=FLOOR_MID)
    # Floor tile lines (horizontal only at this angle)
    for fy in range(bench_bot+4, H, TILE):
        d.line([0, fy, W-1, fy], fill=FLOOR_DARK)
    # Perspective darkening near camera bottom
    dither_gradient(img, 0, H-20, W-1, H-1, FLOOR_MID, FLOOR_DARK, axis='y')

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 7. CRT TERMINAL (centre-right on bench)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    tx0, ty0 = 145, 75      # terminal top-left
    tx1, ty1 = 235, 138     # terminal bottom-right (sits on bench)

    # Main bezel (chunky 90s style)
    d.rectangle([tx0, ty0, tx1, ty1], fill=FLOOR_MID)
    d.rectangle([tx0, ty0, tx1, ty1], outline=VOID)
    # Bevel highlight (top-left)
    d.line([tx0+1, ty0+1, tx1-1, ty0+1], fill=FLOOR_LIGHT)
    d.line([tx0+1, ty0+1, tx0+1, ty1-1], fill=FLOOR_LIGHT)
    # Bevel shadow (bottom-right)
    d.line([tx0+1, ty1-1, tx1-1, ty1-1], fill=SHADOW)
    d.line([tx1-1, ty0+1, tx1-1, ty1-1], fill=SHADOW)

    # Screen area (inset)
    sx0, sy0 = tx0+6, ty0+5
    sx1, sy1 = tx1-6, ty0+48
    d.rectangle([sx0, sy0, sx1, sy1], fill=GLASS_DARK)
    d.rectangle([sx0, sy0, sx1, sy1], outline=VOID)

    # Phosphor glow — radial dither from centre of screen
    scx = (sx0+sx1)//2
    scy = (sy0+sy1)//2
    dither_radial(img, scx, scy, 0, 26, PHOSPHOR, GLASS_DARK)

    # Screen content: scanline texture on screen
    for sl in range(sy0+2, sy1-2, 2):
        d.line([sx0+2, sl, sx1-2, sl], fill=ACID_DARK)

    # "ENTER CODE:" prompt text on screen
    draw_text(img, "ENTER CODE:", sx0+4, sy0+4, color=PHOSPHOR, scale=1)
    # Blinking cursor block
    d.rectangle([sx0+4, sy0+14, sx0+10, sy0+20], fill=PHOSPHOR)

    # Keyboard (below screen)
    kx0, ky0 = tx0+4, ty0+55
    kx1, ky1 = tx1-4, ty1-6
    d.rectangle([kx0, ky0, kx1, ky1], fill=FLOOR_DARK)
    d.rectangle([kx0, ky0, kx1, ky1], outline=SHADOW)
    # Key rows (3 rows of tiny key rects)
    for kr in range(3):
        for kc in range(10):
            kpx = kx0 + 2 + kc * 8
            kpy = ky0 + 2 + kr * 6
            d.rectangle([kpx, kpy, kpx+5, kpy+4], fill=FLOOR_LIGHT)
            d.rectangle([kpx, kpy, kpx+5, kpy+4], outline=SHADOW)

    # Terminal base / stand
    d.rectangle([tx0+15, ty1, tx0+25, ty1+4], fill=FLOOR_DARK)

    # Glow from terminal screen hitting bench surface
    dither_radial(img, scx, bench_top+2, 0, 20, ACID_DARK, WOOD_MID)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 8. BENCH PROPS (beaker, flask, notes)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    # Small Erlenmeyer flask (left of terminal)
    fx, fy_base = 112, bench_top + 3
    # Body
    d.polygon([(fx-8, fy_base+1), (fx+8, fy_base+1),
               (fx+4, fy_base-18), (fx-4, fy_base-18)], fill=GLASS_MID)
    # Neck
    d.rectangle([fx-2, fy_base-26, fx+2, fy_base-18], fill=GLASS_LIGHT)
    # Liquid (acid green)
    d.polygon([(fx-7, fy_base), (fx+7, fy_base),
               (fx+3, fy_base-10), (fx-3, fy_base-10)], fill=ACID_MID)
    d.line([fx-3, fy_base-10, fx+3, fy_base-10], fill=ACID_BRIGHT)  # surface
    # Highlight
    d.line([fx-6, fy_base-5, fx-4, fy_base-15], fill=GLASS_LIGHT)
    d.line([fx-5, fy_base-5, fx-3, fy_base-15], fill=GLASS_SHINE)
    # Outline
    d.polygon([(fx-8, fy_base+1), (fx+8, fy_base+1),
               (fx+4, fy_base-18), (fx-4, fy_base-18)], outline=VOID)

    # Research notes / clipboard (far left on bench)
    d.rectangle([10, bench_top+4, 48, bench_top+30], fill=TEXT_WHITE)
    d.rectangle([10, bench_top+4, 48, bench_top+30], outline=SHADOW)
    d.rectangle([10, bench_top+4, 48, bench_top+9], fill=BRASS_DARK)  # top bar
    # Scribble lines (research notes)
    for ni in range(4):
        ny = bench_top + 12 + ni * 4
        d.line([13, ny, 45, ny], fill=TEXT_DIM)
    d.point([(15, bench_top+11),(18,bench_top+11)], fill=ACID_MID)  # diagram dots

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 9. PROF. DR. MOLAR SPRITE (centre-left)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    molar_path = os.path.join(os.path.dirname(__file__),
                              "../../assets/scenes/molar_idle.png")
    if os.path.exists(molar_path):
        molar = Image.open(molar_path)
        # Scale up ×2 for scene (64×96 on screen)
        molar_big = molar.resize((molar.width*2, molar.height*2), Image.NEAREST)
        # Place so feet land on bench_top
        mx = 55
        my = bench_top - molar_big.height + 4
        # Composite (green key = transparent)
        pixels = molar_big.load()
        for py in range(molar_big.height):
            for px_i in range(molar_big.width):
                if pixels[px_i, py] != (0, 255, 0):
                    if 0 <= mx+px_i < W and 0 <= my+py < H:
                        img.putpixel((mx+px_i, my+py), pixels[px_i, py])

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 10. PUZZLE UNLOCK INDICATORS (4 LEDs above terminal)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    for i in range(4):
        lx = tx0 + 8 + i * 12
        ly = ty0 - 8
        # LED body
        d.ellipse([lx-3, ly-3, lx+3, ly+3], fill=METAL_DARK)
        d.ellipse([lx-2, ly-2, lx+2, ly+2], fill=SHADOW)       # off state
        d.point([(lx-1, ly-1)], fill=TEXT_DIM)                  # dull glint

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 11. JRPG DIALOG BOX (bottom 42 px)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    db_y0 = H - 43
    # Background — dark navy, semi-opaque approximated by fill
    d.rectangle([2, db_y0, W-3, H-3], fill=DARK_BLUE)
    # Outer border — WALL_LIGHT
    d.rectangle([2, db_y0, W-3, H-3], outline=WALL_LIGHT)
    # Inner border highlight (1 px inset) — PURE_WHITE at corners only
    for (cx, cy) in [(3, db_y0+1),(4, db_y0+1),(3, db_y0+2),
                     (W-4, db_y0+1),(W-5,db_y0+1),(W-4,db_y0+2),
                     (3, H-4),(4, H-4),(3, H-5),
                     (W-4, H-4),(W-5,H-4),(W-4,H-5)]:
        d.point([(cx, cy)], fill=PURE_WHITE)

    # Speaker name "PROF. DR. MOLAR"
    draw_text(img, "PROF. DR. MOLAR", 6, db_y0+3, color=BRASS_LIGHT, scale=1)

    # Separator line
    d.line([6, db_y0+11, W-6, db_y0+11], fill=WALL_MID)

    # Dialog text (sample — will be driven by app at runtime)
    line1 = "WILLKOMMEN IN MEINEM LABOR!"
    line2 = "GEBEN SIE DIE CODES EIN..."
    draw_text(img, line1, 6, db_y0+14, color=TEXT_WHITE, scale=1)
    draw_text(img, line2, 6, db_y0+23, color=TEXT_WHITE, scale=1)

    # Blinking ▼ indicator (bottom-right of dialog)
    draw_text(img, "▼", W-12, H-10, color=TEXT_WHITE, scale=1)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 12. TITLE LABEL (upper-centre, above scene)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    title = "CHEM. ESCAPE ROOM"
    tw = text_width(title, scale=1)
    draw_text(img, title, (W - tw)//2, 14, color=TEXT_DIM, scale=1)

    return img


if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    img = make_scene()
    export(img, "../../assets/scenes/scene_01_lab_hub.png",
           preview_scale=4, scanlines=False, vignette=True)
