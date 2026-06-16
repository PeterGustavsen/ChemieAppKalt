"""
Scene 4 — PSE-Wand (Periodic Table Wall)
Puzzle: stoichiometry  2H₂ + O₂ → 2H₂O  → answer = 36 g

Layout:
  Left 1/3  : partial periodic table on wall (context)
  Centre/Right: large blackboard with the equation written in chalk
  Bottom 38px: JRPG dialog box
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from PIL import Image, ImageDraw
from palette import (
    VOID, SHADOW, DARK_BLUE, WALL_DARK, WALL_MID, WALL_LIGHT, WALL_BRIGHT,
    TILE_GROUT, FLOOR_DARK, FLOOR_MID, WOOD_DARK, WOOD_MID,
    METAL_DARK, METAL_MID,
    BRASS_LIGHT, GLASS_DARK, GLASS_MID,
    ACID_DARK, ACID_MID, ACID_BRIGHT,
    AMBER, TEXT_WHITE, TEXT_DIM, PURE_WHITE,
)
from pixel_helpers import (
    new_canvas, draw_wall_tiles, dither_gradient, draw_text, export,
    NATIVE_W, NATIVE_H, TILE,
)

W, H = NATIVE_W, NATIVE_H  # 256 × 224


def chalk(img, pts, col=None):
    c = col or PURE_WHITE
    for (x, y) in pts:
        if 0 <= x < W and 0 <= y < H:
            img.putpixel((x, y), c)


def chalk_line(img, x0, y0, x1, y1, col=None):
    """Bresenham line in chalk style (1px wide)."""
    c = col or PURE_WHITE
    dx, dy = abs(x1-x0), abs(y1-y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1
    err = dx - dy
    while True:
        if 0 <= x0 < W and 0 <= y0 < H:
            img.putpixel((x0, y0), c)
        if x0 == x1 and y0 == y1:
            break
        e2 = 2 * err
        if e2 > -dy:
            err -= dy; x0 += sx
        if e2 < dx:
            err += dx; y0 += sy


def draw_chalk_text_large(img, text, x, y, col=None):
    """
    Draw pixel text at 2× scale in chalk-white.
    Uses the built-in 5×7 bitmap font from pixel_helpers scaled up.
    """
    from pixel_helpers import _FONT5
    c = col or PURE_WHITE
    cx = x
    for ch in text.upper():
        rows = _FONT5.get(ch, _FONT5[' '])
        for ry, row in enumerate(rows):
            for rx, bit in enumerate(row):
                if bit == '1':
                    px, py = cx + rx*2, y + ry*2
                    for ddx in range(2):
                        for ddy in range(2):
                            if 0 <= px+ddx < W and 0 <= py+ddy < H:
                                img.putpixel((px+ddx, py+ddy), c)
        cx += 12   # 6 cols × 2


def main():
    img = Image.new("RGB", (W, H), WALL_MID)
    d   = ImageDraw.Draw(img)

    # ── WALL ──────────────────────────────────────────────────────────
    draw_wall_tiles(img, 0, 0, W, 186, WALL_DARK, WALL_MID, WALL_LIGHT, TILE_GROUT)
    # Overhead light strip
    dither_gradient(img, 0, 0, W-1, 8, WALL_LIGHT, WALL_MID, axis='y')

    # ── FLOOR ─────────────────────────────────────────────────────────
    d.rectangle([0, 182, W-1, 185], fill=FLOOR_MID)
    d.rectangle([0, 185, W-1, 185], fill=FLOOR_DARK)

    # ════════════════════════════════════════════════════════════════
    # LEFT: mini periodic table (x 4–88, y 10–175) — background ref
    # ════════════════════════════════════════════════════════════════
    d.rectangle([4, 10, 88, 175], fill=DARK_BLUE)
    d.rectangle([4, 10, 88, 175], outline=WALL_DARK)

    # Simplified 9-col × 7-row mini grid (shows first 9 groups only)
    MCOLS, MROWS = 9, 7
    MCW, MCH = 9, 22
    MGX0, MGY0 = 7, 14

    def mini_empty(c, r):
        if r == 0 and 1 <= c <= 7: return True
        if r in (1,2) and 2 <= c <= 7: return True
        return False

    def mini_color(c, r):
        if c == 0: return ACID_DARK
        if c == 1: return WALL_DARK
        if 2 <= c <= 7: return GLASS_DARK
        return WALL_DARK

    for r in range(MROWS):
        for c in range(MCOLS):
            if mini_empty(c, r): continue
            mx0 = MGX0 + c*MCW
            my0 = MGY0 + r*MCH
            mx1, my1 = mx0+MCW-1, my0+MCH-1
            d.rectangle([mx0, my0, mx1, my1], fill=mini_color(c,r))
            d.rectangle([mx0, my0, mx1, my1], outline=WALL_LIGHT)

    # Mini label
    draw_text(img, "PSE", 6, 2, color=TEXT_DIM, scale=1)

    # Mini chalk tray
    d.rectangle([4, 173, 88, 176], fill=FLOOR_MID)
    for cx in [10, 25, 40, 55, 70]:
        d.rectangle([cx, 174, cx+2, 175], fill=PURE_WHITE)

    # ════════════════════════════════════════════════════════════════
    # RIGHT: BLACKBOARD (x 96–252, y 8–178)
    # The puzzle equation is written here in chalk
    # ════════════════════════════════════════════════════════════════
    BB_X0, BB_Y0, BB_X1, BB_Y1 = 96, 8, 252, 178

    # Board surface (dark green-black, approximated with DARK_BLUE)
    d.rectangle([BB_X0, BB_Y0, BB_X1, BB_Y1], fill=VOID)
    # Aged board slightly lighter centre
    d.rectangle([BB_X0+2, BB_Y0+2, BB_X1-2, BB_Y1-2], fill=SHADOW)
    # Wooden frame around board
    d.rectangle([BB_X0-3, BB_Y0-3, BB_X1+3, BB_Y1+3], outline=WOOD_DARK)
    d.rectangle([BB_X0-2, BB_Y0-2, BB_X1+2, BB_Y1+2], outline=WOOD_MID)
    d.rectangle([BB_X0-1, BB_Y0-1, BB_X1+1, BB_Y1+1], outline=WOOD_DARK)
    # Chalk dust smudge at bottom
    for sx in range(BB_X0+5, BB_X1-5, 3):
        img.putpixel((sx, BB_Y1-3), TEXT_DIM)

    # ── CHALK TRAY at bottom of blackboard ────────────────────────
    d.rectangle([BB_X0-3, BB_Y1+1, BB_X1+3, BB_Y1+6], fill=WOOD_DARK)
    for cx in [105, 125, 148, 170, 195, 218, 238]:
        d.rectangle([cx, BB_Y1+2, cx+4, BB_Y1+4], fill=PURE_WHITE)
    d.rectangle([160, BB_Y1+2, 165, BB_Y1+4], fill=AMBER)  # coloured chalk

    # ── BLACKBOARD CONTENT ────────────────────────────────────────
    # Heading (smudged old text, dim)
    draw_chalk_text_large(img, "STOCHIOMETRIE", BB_X0+4, BB_Y0+6, col=TEXT_DIM)
    # Underline
    chalk_line(img, BB_X0+4, BB_Y0+21, BB_X0+152, BB_Y0+21, col=TEXT_DIM)

    # Given data (smaller, draw_text scale=1)
    draw_text(img, "GEGEBEN:", BB_X0+6, BB_Y0+28, color=TEXT_DIM, scale=1)
    draw_text(img, "M(H2)  = 2 G/MOL", BB_X0+6, BB_Y0+38, color=TEXT_WHITE, scale=1)
    draw_text(img, "M(H2O) = 18 G/MOL", BB_X0+6, BB_Y0+48, color=TEXT_WHITE, scale=1)
    draw_text(img, "4 G H2 REAGIEREN VOLLST.", BB_X0+6, BB_Y0+58, color=TEXT_WHITE, scale=1)

    # Divider
    chalk_line(img, BB_X0+4, BB_Y0+69, BB_X1-4, BB_Y0+69, col=WALL_MID)

    # The equation — large, centred, MOST PROMINENT element
    draw_chalk_text_large(img, "2H2 + O2", BB_X0+8, BB_Y0+76, col=PURE_WHITE)
    # Arrow  →
    ax, ay = BB_X0+8, BB_Y0+96
    chalk_line(img, ax, ay+6, ax+28, ay+6, col=PURE_WHITE)
    chalk_line(img, ax+22, ay+2, ax+28, ay+6, col=PURE_WHITE)
    chalk_line(img, ax+22, ay+10, ax+28, ay+6, col=PURE_WHITE)
    # RHS
    draw_chalk_text_large(img, "2H2O", ax+34, BB_Y0+76, col=PURE_WHITE)

    # Question
    chalk_line(img, BB_X0+4, BB_Y0+111, BB_X1-4, BB_Y0+111, col=WALL_MID)
    draw_text(img, "GESUCHT:", BB_X0+6, BB_Y0+116, color=AMBER, scale=1)
    draw_text(img, "WIE VIELE GRAMM H2O", BB_X0+6, BB_Y0+128, color=TEXT_WHITE, scale=1)
    draw_text(img, "ENTSTEHEN?", BB_X0+6, BB_Y0+138, color=TEXT_WHITE, scale=1)

    # Answer box (empty, player fills in)
    d.rectangle([BB_X0+6, BB_Y0+150, BB_X0+70, BB_Y0+162], outline=ACID_MID)
    draw_text(img, "=", BB_X0+8, BB_Y0+153, color=ACID_MID, scale=1)
    draw_text(img, "G", BB_X0+56, BB_Y0+153, color=ACID_MID, scale=1)

    # Chalk smudge / erased attempt near answer box
    for ex in range(BB_X0+20, BB_X0+52, 2):
        img.putpixel((ex, BB_Y0+157), TEXT_DIM)

    # ── DIALOG BOX ────────────────────────────────────────────────
    DB_Y0 = 187
    d.rectangle([2, DB_Y0, W-3, H-3], fill=DARK_BLUE)
    d.rectangle([2, DB_Y0, W-3, H-3], outline=WALL_LIGHT)
    draw_text(img, "PSE-WAND", 6, DB_Y0+7, color=BRASS_LIGHT, scale=1)
    draw_text(img, "BERECHNE DIE MASSE DES WASSERS.", 6, DB_Y0+19, color=TEXT_WHITE, scale=1)
    draw_text(img, "▼", 238, DB_Y0+26, color=BRASS_LIGHT, scale=1)

    return img


if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    img = main()
    export(img, "../../assets/scenes/scene_04_periodic.png", preview_scale=4)
