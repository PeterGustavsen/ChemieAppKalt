"""
Szene 4 — Periodensystem-Wand (Periodic Table Wall)
256×224 px native, exported at ×4 for preview.

Layout:
  - Bright, evenly-lit lab wall with large blackboard-style periodic table.
  - Periodic table board (dark blue, 18×7 grid of element cells).
  - Chalk tray at board bottom.
  - JRPG dialog box at bottom 38 px.

Light: even overhead, slightly brighter top-centre.
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from PIL import Image, ImageDraw
from palette import (
    VOID, SHADOW, DARK_BLUE, WALL_DARK, WALL_MID, WALL_LIGHT, WALL_BRIGHT,
    TILE_GROUT, FLOOR_DARK, FLOOR_MID, FLOOR_LIGHT,
    WOOD_DARK, WOOD_MID, WOOD_LIGHT,
    METAL_DARK, METAL_MID, METAL_LIGHT,
    BRASS_DARK, BRASS_MID, BRASS_LIGHT,
    GLASS_DARK, GLASS_MID, GLASS_LIGHT, GLASS_SHINE,
    ACID_DARK, ACID_MID, ACID_BRIGHT,
    MAGENTA, AMBER, PHOSPHOR,
    TEXT_WHITE, TEXT_DIM, PURE_WHITE,
)
from pixel_helpers import (
    new_canvas, draw_wall_tiles, dither_gradient, draw_text, export,
    NATIVE_W, NATIVE_H, TILE,
)

W, H = NATIVE_W, NATIVE_H   # 256 × 224


def main():
    img = Image.new("RGB", (W, H), WALL_MID)
    d = ImageDraw.Draw(img)

    # ──────────────────────────────────────────────────────────────
    # 1. WALL BACKGROUND (y 0–185)
    # ──────────────────────────────────────────────────────────────
    draw_wall_tiles(img, 0, 0, W, 186, WALL_MID, WALL_LIGHT, WALL_BRIGHT, TILE_GROUT)

    # Subtle overhead brightness — slightly brighter top-centre strip
    dither_gradient(img, 0, 0, W - 1, 6, WALL_BRIGHT, WALL_LIGHT, axis='y')
    # Centre highlight arc (very gentle)
    for y in range(0, 30):
        t = y / 29
        span = int(40 * (1 - t))
        cx = W // 2
        col = WALL_BRIGHT if t < 0.2 else WALL_LIGHT
        if span > 0:
            d.line([cx - span, y, cx + span, y], fill=col)

    # ──────────────────────────────────────────────────────────────
    # 2. FLOOR STRIP (y 185–186)
    # ──────────────────────────────────────────────────────────────
    d.rectangle([0, 185, W - 1, 186], fill=FLOOR_DARK)

    # ──────────────────────────────────────────────────────────────
    # 3. LARGE PERIODIC TABLE BOARD (x 8–248, y 8–170)
    # ──────────────────────────────────────────────────────────────
    BX0, BY0, BX1, BY1 = 8, 8, 248, 170

    # DARK_BLUE background
    d.rectangle([BX0, BY0, BX1, BY1], fill=DARK_BLUE)
    # 2px WALL_DARK border
    d.rectangle([BX0, BY0, BX1, BY1], outline=WALL_DARK)
    d.rectangle([BX0 + 1, BY0 + 1, BX1 - 1, BY1 - 1], outline=WALL_DARK)

    # ──────────────────────────────────────────────────────────────
    # 4. ELEMENT GRID — 18 cols × 7 rows inside x 12–244, y 14–162
    # ──────────────────────────────────────────────────────────────
    GX0, GY0, GX1, GY1 = 12, 14, 244, 162
    COLS, ROWS = 18, 7
    CELL_W = (GX1 - GX0) // COLS   # ~12 px
    CELL_H = (GY1 - GY0) // ROWS   # ~21 px

    def cell_color(col, row):
        if col == 0:
            return ACID_DARK         # alkali metals (col 1 in PSE)
        if col == 1:
            return WALL_DARK         # alkaline earth metals
        if col == 17:
            return GLASS_DARK        # noble gases
        if col == 16:
            return SHADOW            # halogens (dim)
        if 2 <= col <= 11:
            return DARK_BLUE         # transition metals
        return WALL_DARK             # p-block main group

    def is_empty(col, row):
        # Period 1: only H (col 0) and He (col 17)
        if row == 0 and 1 <= col <= 16:
            return True
        # Periods 2–3: no d-block (cols 2–11)
        if row in (1, 2) and 2 <= col <= 11:
            return True
        return False

    for row in range(ROWS):
        for col in range(COLS):
            cx0 = GX0 + col * CELL_W
            cy0 = GY0 + row * CELL_H
            cx1 = cx0 + CELL_W - 1
            cy1 = cy0 + CELL_H - 1

            if is_empty(col, row):
                continue

            # Puzzle highlight: Period 4, Group 7 (Mn) = row 3, col 6 (0-based)
            if row == 3 and col == 6:
                fill = AMBER
            else:
                fill = cell_color(col, row)

            d.rectangle([cx0, cy0, cx1, cy1], fill=fill)
            d.rectangle([cx0, cy0, cx1, cy1], outline=WALL_LIGHT)

            # Add subtle inner definition to transition metal cells
            if fill == DARK_BLUE and CELL_W >= 6 and CELL_H >= 8:
                d.rectangle([cx0 + 2, cy0 + 3, cx1 - 2, cy1 - 3], fill=WALL_DARK)

    # ──────────────────────────────────────────────────────────────
    # 5. SYMBOL & CHALK ANNOTATION on Mn cell
    # ──────────────────────────────────────────────────────────────
    mn_cx0 = GX0 + 6 * CELL_W
    mn_cy0 = GY0 + 3 * CELL_H

    # Draw "MN" inside the Mn cell
    draw_text(img, "MN", mn_cx0 + 1, mn_cy0 + 2, color=TEXT_WHITE, scale=1)

    # Chalk "?" annotation just to the right of the Mn cell
    ann_x = GX0 + 7 * CELL_W + 2
    ann_y = GY0 + 3 * CELL_H + 4
    chalk_q = [
        (0, 0), (1, 0), (2, 0),
        (3, 1),
        (1, 2), (2, 2),
        (1, 5), (1, 6),
    ]
    for (dx, dy) in chalk_q:
        px, py = ann_x + dx, ann_y + dy
        if 0 <= px < W and 0 <= py < H:
            img.putpixel((px, py), PURE_WHITE)

    # Dashed chalk box around the Mn cell
    mn_bx0 = mn_cx0 - 1
    mn_by0 = mn_cy0 - 1
    mn_bx1 = mn_cx0 + CELL_W + 1
    mn_by1 = mn_cy0 + CELL_H + 1
    for x in range(mn_bx0, mn_bx1 + 1, 2):
        for y in (mn_by0, mn_by1):
            if 0 <= x < W and 0 <= y < H:
                img.putpixel((x, y), PURE_WHITE)
    for y in range(mn_by0, mn_by1 + 1, 2):
        for x in (mn_bx0, mn_bx1):
            if 0 <= x < W and 0 <= y < H:
                img.putpixel((x, y), PURE_WHITE)

    # ──────────────────────────────────────────────────────────────
    # 6. BOARD TITLE AND SEPARATOR
    # ──────────────────────────────────────────────────────────────
    draw_text(img, "PSE", BX0 + 4, BY0 + 3, color=TEXT_DIM, scale=1)
    d.line([BX0 + 1, BY0 + 1, BX0 + 1, BY1 - 1], fill=WALL_LIGHT)

    # ──────────────────────────────────────────────────────────────
    # 7. CHALK TRAY (x 8–248, y 168–172)
    # ──────────────────────────────────────────────────────────────
    d.rectangle([8, 168, 248, 172], fill=FLOOR_MID)
    chalk_positions = [20, 40, 60, 85, 120, 155, 180, 210, 230]
    for cx in chalk_positions:
        d.rectangle([cx, 169, cx + 2, 170], fill=PURE_WHITE)
    # Coloured chalk
    d.rectangle([100, 169, 102, 170], fill=ACID_BRIGHT)
    d.rectangle([140, 169, 142, 170], fill=AMBER)
    d.line([8, 173, 248, 173], fill=FLOOR_DARK)

    # ──────────────────────────────────────────────────────────────
    # 8. DIALOG BOX (y 186–223)
    # ──────────────────────────────────────────────────────────────
    DB_Y0 = 186
    d.rectangle([2, DB_Y0, W - 3, H - 3], fill=DARK_BLUE)
    d.rectangle([2, DB_Y0, W - 3, H - 3], outline=WALL_LIGHT)

    draw_text(img, "PERIODENSYSTEM", 6, 193, color=BRASS_LIGHT, scale=1)
    draw_text(img, "ELEMENT-ORDNUNGSZAHL BERECHNEN", 6, 205, color=TEXT_WHITE, scale=1)
    draw_text(img, "▼", 238, 213, color=BRASS_LIGHT, scale=1)

    return img


if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    img = main()
    export(img, "../../assets/scenes/scene_04_periodic.png", preview_scale=4)
