"""
Szene 3 — Chemikalienschrank (Chemical Cabinet)
256×224 px native, exported at ×4 for preview.

Layout:
  - Petrol tiled wall fills upper area.
  - Floor strip at y 185–186.
  - Tall metal cabinet centre-screen with glass door.
  - 5 shelves with 8–10 varied bottles (acid, magenta, amber liquids).
  - Brass lock with keyhole on door.
  - Warning sticker and hazard symbol.
  - Overhead lamp top-right light source.
  - JRPG dialog box at bottom.

Light source: top-right (single overhead lamp).
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
    new_canvas, draw_wall_tiles, dither_gradient, dither_radial,
    draw_glass_rect, draw_liquid, draw_text, export,
    NATIVE_W, NATIVE_H, TILE,
)

W, H = NATIVE_W, NATIVE_H   # 256 × 224


def draw_bottle_tall(img, d, x, y, liquid_color):
    """Tall thin bottle (4px wide, 12px tall). x,y = top-left."""
    # Body
    d.rectangle([x, y, x + 4, y + 12], fill=GLASS_MID)
    # Liquid (lower 8px)
    d.rectangle([x + 1, y + 4, x + 3, y + 11], fill=liquid_color)
    # Highlight
    d.line([x, y, x, y + 12], fill=GLASS_LIGHT)
    # Shadow
    d.line([x + 4, y, x + 4, y + 12], fill=GLASS_DARK)
    # Neck (2px wide, 3px tall above body)
    d.rectangle([x + 1, y - 3, x + 3, y], fill=GLASS_MID)
    d.line([x + 1, y - 3, x + 3, y - 3], fill=GLASS_SHINE)
    # Stopper / cap
    d.rectangle([x, y - 5, x + 4, y - 4], fill=VOID)
    # Small white label
    d.rectangle([x, y + 5, x + 4, y + 9], fill=PURE_WHITE)
    d.line([x + 1, y + 6, x + 3, y + 6], fill=VOID)
    d.line([x + 1, y + 8, x + 3, y + 8], fill=VOID)
    # Outline
    d.rectangle([x, y, x + 4, y + 12], outline=VOID)


def draw_bottle_short(img, d, x, y, liquid_color):
    """Short wide bottle (7px wide, 8px tall). x,y = top-left."""
    # Body
    d.rectangle([x, y, x + 7, y + 8], fill=GLASS_MID)
    # Liquid (lower 5px)
    d.rectangle([x + 1, y + 3, x + 6, y + 7], fill=liquid_color)
    # Highlight
    d.line([x, y, x, y + 8], fill=GLASS_LIGHT)
    img.putpixel((x + 1, y + 1), GLASS_SHINE)
    # Shadow
    d.line([x + 7, y, x + 7, y + 8], fill=GLASS_DARK)
    # Neck (3px wide, 2px tall)
    d.rectangle([x + 2, y - 2, x + 5, y], fill=GLASS_MID)
    # Cap
    d.rectangle([x + 1, y - 4, x + 6, y - 2], fill=VOID)
    # Label
    d.rectangle([x + 1, y + 3, x + 6, y + 7], fill=PURE_WHITE)
    d.line([x + 2, y + 4, x + 5, y + 4], fill=VOID)
    d.line([x + 2, y + 6, x + 5, y + 6], fill=VOID)
    # Outline
    d.rectangle([x, y, x + 7, y + 8], outline=VOID)


def draw_bottle_round(img, d, x, y, liquid_color):
    """Round flask (8px wide ellipse body). x,y = top-left of bounding box."""
    # Round body (ellipse)
    d.ellipse([x, y, x + 8, y + 8], fill=GLASS_MID)
    # Liquid fill (lower half of ellipse, approx)
    d.ellipse([x + 1, y + 4, x + 7, y + 8], fill=liquid_color)
    # Highlight
    img.putpixel((x + 2, y + 2), GLASS_SHINE)
    img.putpixel((x + 1, y + 3), GLASS_LIGHT)
    # Shadow arc (bottom-right)
    d.line([x + 6, y + 2, x + 8, y + 5], fill=GLASS_DARK)
    # Neck
    d.rectangle([x + 3, y - 3, x + 5, y + 1], fill=GLASS_MID)
    # Stopper
    d.rectangle([x + 2, y - 5, x + 6, y - 3], fill=VOID)
    d.line([x + 2, y - 5, x + 6, y - 5], fill=GLASS_SHINE)
    # Label on body
    d.rectangle([x + 2, y + 3, x + 6, y + 6], fill=PURE_WHITE)
    d.line([x + 3, y + 4, x + 5, y + 4], fill=VOID)
    # Outline
    d.ellipse([x, y, x + 8, y + 8], outline=VOID)


def main():
    img = Image.new("RGB", (W, H), VOID)
    d   = ImageDraw.Draw(img)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 1. WALL (y 0–185) — petrol tiled
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    wall_bottom = 185
    draw_wall_tiles(img, 0, 0, W, wall_bottom,
                    WALL_DARK, WALL_MID, WALL_LIGHT, TILE_GROUT)

    # Overhead lamp top-right: bright top-right, fades to top-left and down
    dither_gradient(img, W - 80, 0, W - 1, 18, WALL_BRIGHT, WALL_DARK, axis='y')
    dither_gradient(img, W - 80, 0, W - 1, wall_bottom - 1, WALL_LIGHT, WALL_DARK, axis='x')

    # Left-side shadow (away from lamp)
    dither_gradient(img, 0, 0, 40, wall_bottom - 1, WALL_DARK, WALL_MID, axis='x')

    # Subtle ambient shadow at wall base
    dither_gradient(img, 0, wall_bottom - 20, W - 1, wall_bottom - 1,
                    WALL_MID, WALL_DARK, axis='y')

    # Overhead lamp fixture top-right
    lamp_cx = W - 30
    lamp_y  = 6
    d.rectangle([lamp_cx - 14, lamp_y - 2, lamp_cx + 14, lamp_y + 4], fill=METAL_DARK)
    d.rectangle([lamp_cx - 10, lamp_y,     lamp_cx + 10, lamp_y + 3], fill=PURE_WHITE)
    d.line([lamp_cx - 10, lamp_y, lamp_cx + 10, lamp_y], fill=GLASS_SHINE)
    # Cone of light (radial dither downward)
    dither_radial(img, lamp_cx, lamp_y + 2, 0, 45, WALL_BRIGHT, WALL_MID)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 2. FLOOR STRIP (y 185–186)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    d.line([0, 185, W - 1, 185], fill=FLOOR_MID)
    d.line([0, 186, W - 1, 186], fill=FLOOR_DARK)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 3. CABINET FRAME (x 30–225, y 10–185)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    cab_x0, cab_x1 = 30, 225
    cab_y0, cab_y1 = 10, 185

    # Outer METAL_DARK frame
    d.rectangle([cab_x0, cab_y0, cab_x1, cab_y1], fill=METAL_DARK)
    # METAL_MID interior fill (inset 3px)
    d.rectangle([cab_x0 + 3, cab_y0 + 3, cab_x1 - 3, cab_y1 - 3], fill=METAL_MID)
    # 2px VOID outline
    d.rectangle([cab_x0, cab_y0, cab_x1, cab_y1], outline=VOID)
    d.rectangle([cab_x0 + 1, cab_y0 + 1, cab_x1 - 1, cab_y1 - 1], outline=VOID)

    # Frame highlight (top-right lit by lamp)
    d.line([cab_x1 - 3, cab_y0, cab_x1 - 3, cab_y1], fill=METAL_LIGHT)
    d.line([cab_x0, cab_y0, cab_x1, cab_y0], fill=METAL_LIGHT)
    # Frame shadow (left and bottom)
    d.line([cab_x0 + 3, cab_y0 + 3, cab_x0 + 3, cab_y1 - 3], fill=SHADOW)
    d.line([cab_x0 + 3, cab_y1 - 3, cab_x1 - 3, cab_y1 - 3], fill=SHADOW)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 4. GLASS DOOR (x 35–220, y 15–180)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    door_x0, door_x1 = 35, 220
    door_y0, door_y1 = 15, 180

    # GLASS_DARK fill (semi-dark tinted glass)
    d.rectangle([door_x0, door_y0, door_x1, door_y1], fill=GLASS_DARK)

    # Left highlight strip (x 35–38)
    d.rectangle([door_x0, door_y0, door_x0 + 3, door_y1], fill=GLASS_MID)
    d.line([door_x0, door_y0, door_x0, door_y1], fill=GLASS_LIGHT)

    # Top highlight (y 15–17)
    d.rectangle([door_x0, door_y0, door_x1, door_y0 + 2], fill=GLASS_LIGHT)
    img.putpixel((door_x0, door_y0), GLASS_SHINE)

    # Door outline
    d.rectangle([door_x0, door_y0, door_x1, door_y1], outline=VOID)

    # Grid dividing lines: 2 columns, 4 rows (WALL_LIGHT, 1px)
    col_mid = (door_x0 + door_x1) // 2
    d.line([col_mid, door_y0, col_mid, door_y1], fill=WALL_LIGHT)

    row_h = (door_y1 - door_y0) // 4
    for ri in range(1, 4):
        ry = door_y0 + ri * row_h
        d.line([door_x0, ry, door_x1, ry], fill=WALL_LIGHT)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 5. LOCK (x 125–131, y 92–100)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    lock_x0, lock_x1 = 125, 131
    lock_y0, lock_y1 = 92, 100

    # BRASS_MID rectangle
    d.rectangle([lock_x0, lock_y0, lock_x1, lock_y1], fill=BRASS_MID)
    # Top highlight
    d.line([lock_x0, lock_y0, lock_x1, lock_y0], fill=BRASS_LIGHT)
    d.line([lock_x0, lock_y0, lock_x0, lock_y1], fill=BRASS_LIGHT)
    # Bottom/right shadow
    d.line([lock_x0, lock_y1, lock_x1, lock_y1], fill=BRASS_DARK)
    d.line([lock_x1, lock_y0, lock_x1, lock_y1], fill=BRASS_DARK)
    # Outline
    d.rectangle([lock_x0, lock_y0, lock_x1, lock_y1], outline=VOID)

    # Keyhole: small circle (2px radius) + narrow slot below
    kx, ky = (lock_x0 + lock_x1) // 2, lock_y0 + 3
    d.ellipse([kx - 1, ky - 1, kx + 1, ky + 1], fill=VOID)
    d.rectangle([kx, ky + 1, kx, ky + 3], fill=VOID)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 6. SHELVES (5 shelves)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    shelf_ys = [30, 55, 80, 105, 130, 155]
    shelf_x0, shelf_x1 = 38, 218

    for sy in shelf_ys:
        # WOOD_MID horizontal bar (3px tall)
        d.rectangle([shelf_x0, sy, shelf_x1, sy + 3], fill=WOOD_MID)
        # Top highlight
        d.line([shelf_x0, sy, shelf_x1, sy], fill=WOOD_LIGHT)
        # Bottom shadow
        d.line([shelf_x0, sy + 3, shelf_x1, sy + 3], fill=WOOD_DARK)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 7. BOTTLES ON SHELVES
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Bottle y-positions: sit ON TOP of shelf (shelf_y - bottle_height)
    # Shelf y is top of shelf bar; bottles sit above that.

    # --- Shelf 0 (sy=30): two tall bottles
    draw_bottle_tall(img, d, 45,  30 - 17, ACID_MID)   # acid green
    draw_bottle_tall(img, d, 55,  30 - 17, GLASS_MID)  # clear/water

    # --- Shelf 1 (sy=55): short wide + tall
    draw_bottle_short(img, d, 45,  55 - 12, MAGENTA)   # magenta
    draw_bottle_tall(img, d,  57,  55 - 17, ACID_DARK) # dark acid
    draw_bottle_round(img, d, 130, 55 - 13, AMBER)     # round amber
    # Hazard symbol on the AMBER bottle
    haz_x = 131
    haz_y = 55 - 13 + 3
    d.polygon([
        (haz_x + 4, haz_y),
        (haz_x + 8, haz_y + 5),
        (haz_x,     haz_y + 5),
    ], fill=AMBER)
    d.polygon([
        (haz_x + 4, haz_y),
        (haz_x + 8, haz_y + 5),
        (haz_x,     haz_y + 5),
    ], outline=VOID)
    # Skull-ish 3 dots
    img.putpixel((haz_x + 3, haz_y + 3), VOID)
    img.putpixel((haz_x + 5, haz_y + 3), VOID)
    img.putpixel((haz_x + 4, haz_y + 4), VOID)

    # --- Shelf 2 (sy=80): short + round
    draw_bottle_short(img, d, 45,  80 - 12, ACID_MID)
    draw_bottle_round(img, d, 57,  80 - 13, MAGENTA)
    draw_bottle_tall(img, d,  130, 80 - 17, GLASS_MID)

    # --- Shelf 3 (sy=105): tall + short
    draw_bottle_tall(img, d,  45,  105 - 17, AMBER)
    draw_bottle_short(img, d, 57,  105 - 12, GLASS_DARK)
    draw_bottle_round(img, d, 130, 105 - 13, ACID_MID)

    # --- Shelf 4 (sy=130): two bottles
    draw_bottle_short(img, d, 45,  130 - 12, MAGENTA)
    draw_bottle_tall(img, d,  57,  130 - 17, ACID_DARK)

    # Right-column bottles (in the right door-pane)
    draw_bottle_tall(img, d,  150, 30  - 17, ACID_MID)
    draw_bottle_short(img, d, 163, 30  - 12, AMBER)
    draw_bottle_round(img, d, 150, 55  - 13, GLASS_MID)
    draw_bottle_tall(img, d,  162, 55  - 17, MAGENTA)
    draw_bottle_short(img, d, 150, 80  - 12, ACID_DARK)
    draw_bottle_tall(img, d,  162, 105 - 17, GLASS_MID)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 8. WARNING STICKER on cabinet door
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ws_x0, ws_y0 = 100, 150
    d.rectangle([ws_x0, ws_y0, ws_x0 + 8, ws_y0 + 5], fill=AMBER)
    d.rectangle([ws_x0, ws_y0, ws_x0 + 8, ws_y0 + 5], outline=VOID)
    # "!" pixel in centre
    img.putpixel((ws_x0 + 4, ws_y0 + 1), VOID)
    img.putpixel((ws_x0 + 4, ws_y0 + 2), VOID)
    img.putpixel((ws_x0 + 4, ws_y0 + 4), VOID)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 8b. KMnO4 — PROMINENT FEATURED BOTTLE (puzzle element)
    # Large bottle on shelf 2, right column, with clear label
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Bottle body (tall, dark purple-magenta)
    kmn_x, kmn_y = 175, 63
    d.rectangle([kmn_x, kmn_y, kmn_x+9, kmn_y+22], fill=MAGENTA)
    d.line([kmn_x, kmn_y, kmn_x, kmn_y+22], fill=VOID)         # left shadow
    d.line([kmn_x+9, kmn_y, kmn_x+9, kmn_y+22], fill=VOID)     # right shadow
    d.line([kmn_x+1, kmn_y, kmn_x+2, kmn_y], fill=GLASS_SHINE) # highlight top
    # Neck
    d.rectangle([kmn_x+3, kmn_y-5, kmn_x+6, kmn_y], fill=MAGENTA)
    d.rectangle([kmn_x+3, kmn_y-7, kmn_x+6, kmn_y-5], fill=GLASS_DARK)  # stopper
    # White label on bottle
    d.rectangle([kmn_x+1, kmn_y+5, kmn_x+8, kmn_y+15], fill=PURE_WHITE)
    d.rectangle([kmn_x+1, kmn_y+5, kmn_x+8, kmn_y+15], outline=VOID)
    # "KMnO4" label text (tiny, fits in 7px wide label)
    draw_text(img, "K", kmn_x+2, kmn_y+6, color=VOID, scale=1)
    draw_text(img, "MN", kmn_x+1, kmn_y+11, color=VOID, scale=1)
    # Glow around bottle (it's radioactive-ish purple)
    for gx in [kmn_x-1, kmn_x+10]:
        d.line([gx, kmn_y, gx, kmn_y+22], fill=SHADOW)

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

    # Title: "CHEMIKALIENSCHRANK" in BRASS_LIGHT
    draw_text(img, "CHEMIKALIENSCHRANK", 6, 193, color=BRASS_LIGHT, scale=1)
    # Separator
    d.line([6, 202, W - 6, 202], fill=WALL_MID)
    # Dialog line 1
    draw_text(img, "OXIDATIONSZAHL BESTIMMEN!", 6, 205, color=TEXT_WHITE, scale=1)
    # Scroll indicator ▼ in BRASS_LIGHT
    draw_text(img, "▼", 238, 213, color=BRASS_LIGHT, scale=1)

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Export
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    export(img, "../../assets/scenes/scene_03_cabinet.png", preview_scale=4)


if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    main()
