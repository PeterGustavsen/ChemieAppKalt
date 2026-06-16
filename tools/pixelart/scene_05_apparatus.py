"""
Szene 5 — Reaktionsapparat-Tisch (Reaction Apparatus Table)
256×224 px native, exported at ×4 for preview.

Layout:
  - Dark dramatic scene with Bunsen burner flame as primary light source.
  - Wooden lab bench in lower third.
  - Retort stand, round-bottom flask, condenser, Bunsen burner, receiving flask.
  - Warm AMBER glow radiates from flame.
  - JRPG dialog box at bottom 38 px.

Light: Bunsen burner flame (lower-centre, warm) + faint cold overhead strip.
"""

import sys, os, math, random
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
    new_canvas, draw_wall_tiles, dither_gradient, draw_glass_rect,
    draw_liquid, draw_text, export,
    NATIVE_W, NATIVE_H, TILE,
)

W, H = NATIVE_W, NATIVE_H   # 256 × 224

# Seeded RNG for reproducible scatter patterns
RNG = random.Random(42)


def draw_ellipse_outline(img, cx, cy, rx, ry, color, step=1):
    """Draw an axis-aligned ellipse outline using putpixel."""
    d = ImageDraw.Draw(img)
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=color)


def draw_circle_fill(img, cx, cy, r, color):
    """Draw a filled circle using the ImageDraw ellipse helper."""
    d = ImageDraw.Draw(img)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)


def draw_circle_outline(img, cx, cy, r, color):
    d = ImageDraw.Draw(img)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color)


def main():
    img = Image.new("RGB", (W, H), DARK_BLUE)
    d = ImageDraw.Draw(img)

    # ──────────────────────────────────────────────────────────────
    # 1. WALL (y 0–165) — dark, dramatic
    # ──────────────────────────────────────────────────────────────
    # Base DARK_BLUE fill already applied via Image.new
    # Draw dark wall tiles overtop for texture
    draw_wall_tiles(img, 0, 0, W, 165, DARK_BLUE, WALL_DARK, WALL_MID, TILE_GROUT)

    # Darken top with shadow gradient
    dither_gradient(img, 0, 0, W - 1, 20, VOID, SHADOW, axis='y')

    # Faint cold overhead strip (fluorescent, barely on)
    d.rectangle([60, 2, 196, 4], fill=WALL_DARK)
    d.rectangle([62, 3, 194, 3], fill=WALL_LIGHT)

    # ──────────────────────────────────────────────────────────────
    # 2. BENCH (y 160–185) — wooden surface
    # ──────────────────────────────────────────────────────────────
    # Main bench body
    d.rectangle([0, 163, W - 1, 185], fill=WOOD_DARK)
    # Top highlight strip
    d.rectangle([0, 160, W - 1, 162], fill=WOOD_MID)
    d.line([0, 163, W - 1, 163], fill=WOOD_LIGHT)
    # Bench front face shadow
    d.rectangle([0, 183, W - 1, 185], fill=SHADOW)

    # ──────────────────────────────────────────────────────────────
    # 3. RETORT STAND LEFT (x 30–34, y 40–162)
    # ──────────────────────────────────────────────────────────────
    # Base plate
    d.rectangle([22, 158, 42, 163], fill=METAL_DARK)
    d.line([22, 158, 42, 158], fill=METAL_MID)
    # Vertical pole
    d.rectangle([30, 40, 33, 162], fill=METAL_DARK)
    d.line([31, 40, 31, 162], fill=METAL_MID)
    # Boss ring (clamp attachment point)
    d.rectangle([27, 95, 36, 102], fill=METAL_MID)
    d.rectangle([27, 95, 36, 102], outline=METAL_DARK)
    # Horizontal arm for flask clamp
    d.rectangle([33, 97, 55, 99], fill=METAL_DARK)
    d.line([33, 97, 55, 97], fill=METAL_MID)

    # ──────────────────────────────────────────────────────────────
    # 4. ROUND-BOTTOM FLASK (x 40–80, y 100–155)
    # ──────────────────────────────────────────────────────────────
    # Flask body — ellipse 40px wide, 35px tall, centred at (60, 135)
    FLASK_CX, FLASK_CY = 60, 135
    FLASK_RX, FLASK_RY = 20, 17

    # Draw filled ellipse for flask body (GLASS_MID)
    d.ellipse([FLASK_CX - FLASK_RX, FLASK_CY - FLASK_RY,
               FLASK_CX + FLASK_RX, FLASK_CY + FLASK_RY], fill=GLASS_MID)

    # Acid liquid in lower 60% of flask
    # Liquid fills from bottom of flask up to about 40% from bottom
    liquid_top_y = FLASK_CY + int(FLASK_RY * 0.1)   # just below centre
    d.ellipse([FLASK_CX - FLASK_RX + 1, liquid_top_y,
               FLASK_CX + FLASK_RX - 1, FLASK_CY + FLASK_RY - 1],
              fill=ACID_DARK)
    # Surface line
    d.line([FLASK_CX - FLASK_RX + 3, liquid_top_y,
            FLASK_CX + FLASK_RX - 3, liquid_top_y], fill=ACID_MID)

    # GLASS_LIGHT left highlight arc
    d.arc([FLASK_CX - FLASK_RX, FLASK_CY - FLASK_RY,
           FLASK_CX + FLASK_RX, FLASK_CY + FLASK_RY],
          start=200, end=280, fill=GLASS_LIGHT)
    d.arc([FLASK_CX - FLASK_RX + 1, FLASK_CY - FLASK_RY + 1,
           FLASK_CX + FLASK_RX - 1, FLASK_CY + FLASK_RY - 1],
          start=205, end=270, fill=GLASS_LIGHT)

    # GLASS_SHINE top glint (2px)
    d.point([(FLASK_CX - 8, FLASK_CY - 12)], fill=GLASS_SHINE)
    d.point([(FLASK_CX - 7, FLASK_CY - 12)], fill=GLASS_SHINE)
    d.point([(FLASK_CX - 9, FLASK_CY - 11)], fill=PURE_WHITE)

    # Flask outline
    d.ellipse([FLASK_CX - FLASK_RX, FLASK_CY - FLASK_RY,
               FLASK_CX + FLASK_RX, FLASK_CY + FLASK_RY], outline=GLASS_DARK)

    # Gas bubbles in flask liquid — 3 small circles (3px) in GLASS_SHINE
    bubble_positions = [
        (FLASK_CX - 5, liquid_top_y + 6),
        (FLASK_CX + 6, liquid_top_y + 10),
        (FLASK_CX - 2, liquid_top_y + 14),
        (FLASK_CX + 3, liquid_top_y + 4),
    ]
    for (bx, by) in bubble_positions:
        draw_circle_outline(img, bx, by, 1, GLASS_SHINE)

    # Flask NECK (x 56–64, y 75–100)
    d.rectangle([56, 75, 64, FLASK_CY - FLASK_RY + 2], fill=GLASS_MID)
    d.line([57, 75, 57, FLASK_CY - FLASK_RY + 2], fill=GLASS_LIGHT)
    d.line([63, 75, 63, FLASK_CY - FLASK_RY + 2], fill=GLASS_DARK)
    # Neck opening
    d.rectangle([55, 74, 65, 77], fill=GLASS_DARK)
    d.line([55, 74, 65, 74], fill=GLASS_LIGHT)

    # ──────────────────────────────────────────────────────────────
    # 5. RUBBER TUBING (flask neck → condenser)
    # ──────────────────────────────────────────────────────────────
    # Diagonal line from x=64,y=80 to x=80,y=70
    d.line([64, 80, 80, 70], fill=METAL_DARK, width=2)
    d.line([65, 80, 81, 70], fill=SHADOW)

    # ──────────────────────────────────────────────────────────────
    # 6. CONDENSER / KÜHLER (x 80–140, y 55–130)
    # ──────────────────────────────────────────────────────────────
    COND_X0, COND_Y0 = 80, 55
    COND_X1, COND_Y1 = 140, 130

    # Outer tube (x 80–95)
    d.rectangle([COND_X0, COND_Y0, COND_X0 + 15, COND_Y1], fill=GLASS_MID)
    d.line([COND_X0, COND_Y0, COND_X0, COND_Y1], fill=GLASS_LIGHT)
    d.line([COND_X0 + 15, COND_Y0, COND_X0 + 15, COND_Y1], fill=GLASS_DARK)

    # Inner tube (x 85–90) — darker glass
    d.rectangle([COND_X0 + 5, COND_Y0 + 2, COND_X0 + 10, COND_Y1 - 2], fill=GLASS_DARK)

    # Water jacket indication — GLASS_LIGHT horizontal lines at intervals
    for wy in range(COND_Y0 + 6, COND_Y1, 8):
        d.line([COND_X0 + 1, wy, COND_X0 + 14, wy], fill=GLASS_LIGHT)

    # Outline the condenser
    d.rectangle([COND_X0, COND_Y0, COND_X0 + 15, COND_Y1], outline=GLASS_DARK)

    # Rubber nubs (METAL_DARK) at top and bottom connection points
    d.rectangle([COND_X0 - 2, COND_Y0, COND_X0 + 17, COND_Y0 + 5], fill=METAL_DARK)
    d.rectangle([COND_X0 - 2, COND_Y1 - 5, COND_X0 + 17, COND_Y1], fill=METAL_DARK)

    # Side water inlet/outlet nubs
    d.rectangle([COND_X0 + 16, COND_Y0 + 15, COND_X0 + 20, COND_Y0 + 20], fill=METAL_DARK)
    d.rectangle([COND_X0 + 16, COND_Y1 - 20, COND_X0 + 20, COND_Y1 - 15], fill=METAL_DARK)

    # Condenser outlet drip tube (going right toward receiving flask)
    d.line([COND_X0 + 7, COND_Y1, COND_X0 + 7, COND_Y1 + 15], fill=GLASS_MID, width=2)
    # Drip connection to receiving flask
    d.line([COND_X0 + 8, COND_Y1 + 14, 155, COND_Y1 + 10], fill=GLASS_MID)

    # ──────────────────────────────────────────────────────────────
    # 7. BUNSEN BURNER (x 110–130, y 140–165)
    # ──────────────────────────────────────────────────────────────
    BURN_X0 = 110
    BURN_TOP = 140

    # Base rectangle 20×8 px
    d.rectangle([BURN_X0, 157, BURN_X0 + 20, 165], fill=METAL_DARK)
    d.line([BURN_X0, 157, BURN_X0 + 20, 157], fill=METAL_MID)
    d.line([BURN_X0, 157, BURN_X0, 165], fill=METAL_MID)

    # Thin tube 3px wide, from base up to y=140
    d.rectangle([BURN_X0 + 8, BURN_TOP, BURN_X0 + 11, 157], fill=METAL_DARK)
    d.line([BURN_X0 + 9, BURN_TOP, BURN_X0 + 9, 157], fill=METAL_MID)

    # Burner nozzle / collar at top
    d.rectangle([BURN_X0 + 6, BURN_TOP, BURN_X0 + 13, BURN_TOP + 4], fill=METAL_MID)
    d.line([BURN_X0 + 6, BURN_TOP, BURN_X0 + 13, BURN_TOP], fill=METAL_LIGHT)

    # Gas cock knob (BRASS_MID 4×3px) on side of tube
    d.rectangle([BURN_X0 + 12, 150, BURN_X0 + 16, 153], fill=BRASS_MID)
    d.point([(BURN_X0 + 14, 150)], fill=BRASS_LIGHT)

    # Gas supply hose
    d.line([BURN_X0, 162, BURN_X0 - 10, 165], fill=METAL_DARK, width=2)

    # ──────────────────────────────────────────────────────────────
    # 8. FLAME (x 116–124, y 120–142)
    # ──────────────────────────────────────────────────────────────
    FLAME_CX = BURN_X0 + 9   # 119
    FLAME_BASE_Y = BURN_TOP   # 140

    # Flame pixel layers (bottom to top = wider to narrower)
    # y 140: AMBER 8px wide
    d.line([FLAME_CX - 4, FLAME_BASE_Y,
            FLAME_CX + 4, FLAME_BASE_Y], fill=AMBER)
    # y 137: AMBER 6px, ACID_BRIGHT center 2px
    d.line([FLAME_CX - 3, FLAME_BASE_Y - 3,
            FLAME_CX + 3, FLAME_BASE_Y - 3], fill=AMBER)
    d.line([FLAME_CX - 1, FLAME_BASE_Y - 3,
            FLAME_CX + 1, FLAME_BASE_Y - 3], fill=ACID_BRIGHT)
    # y 134: AMBER 4px, ACID_BRIGHT 2px
    d.line([FLAME_CX - 2, FLAME_BASE_Y - 6,
            FLAME_CX + 2, FLAME_BASE_Y - 6], fill=AMBER)
    d.line([FLAME_CX - 1, FLAME_BASE_Y - 6,
            FLAME_CX + 1, FLAME_BASE_Y - 6], fill=ACID_BRIGHT)
    # y 131: AMBER 2px, PURE_WHITE center 1px
    d.line([FLAME_CX - 1, FLAME_BASE_Y - 9,
            FLAME_CX + 1, FLAME_BASE_Y - 9], fill=AMBER)
    img.putpixel((FLAME_CX, FLAME_BASE_Y - 9), PURE_WHITE)
    # y 128: ACID_BRIGHT 2px
    d.line([FLAME_CX - 1, FLAME_BASE_Y - 12,
            FLAME_CX + 1, FLAME_BASE_Y - 12], fill=ACID_BRIGHT)
    # y 126: ACID_BRIGHT 1px tip
    img.putpixel((FLAME_CX, FLAME_BASE_Y - 14), ACID_BRIGHT)
    # y 124: fading tip
    img.putpixel((FLAME_CX, FLAME_BASE_Y - 16), AMBER)

    # ──────────────────────────────────────────────────────────────
    # 9. FLAME GLOW — radial AMBER scatter around burner area
    # ──────────────────────────────────────────────────────────────
    # Dithered warm glow: scatter AMBER pixels around flame
    GLOW_CX = FLAME_CX
    GLOW_CY = FLAME_BASE_Y - 5
    GLOW_R = 22

    for gy in range(GLOW_CY - GLOW_R, GLOW_CY + GLOW_R + 1):
        for gx in range(GLOW_CX - GLOW_R, GLOW_CX + GLOW_R + 1):
            if not (0 <= gx < W and 0 <= gy < H):
                continue
            dist = math.sqrt((gx - GLOW_CX) ** 2 + (gy - GLOW_CY) ** 2)
            if dist > GLOW_R:
                continue
            # t = 0 at centre, 1 at edge
            t = dist / GLOW_R
            # Only scatter beyond inner core (flame already drawn)
            if dist < 5:
                continue
            # Probability of placing AMBER pixel decreases with distance
            prob = max(0.0, (1.0 - t) * 0.55)
            if RNG.random() < prob:
                # Blend current pixel with AMBER
                cur = img.getpixel((gx, gy))
                blend = tuple(min(255, int(cur[c] * 0.4 + AMBER[c] * 0.6))
                              for c in range(3))
                img.putpixel((gx, gy), blend)

    # Larger subtle glow radius with lower density
    GLOW_R2 = 38
    for gy in range(max(0, GLOW_CY - GLOW_R2), min(H, GLOW_CY + GLOW_R2 + 1)):
        for gx in range(max(0, GLOW_CX - GLOW_R2), min(W, GLOW_CX + GLOW_R2 + 1)):
            dist = math.sqrt((gx - GLOW_CX) ** 2 + (gy - GLOW_CY) ** 2)
            if dist <= GLOW_R or dist > GLOW_R2:
                continue
            t = (dist - GLOW_R) / (GLOW_R2 - GLOW_R)
            prob = max(0.0, (1.0 - t) * 0.18)
            if RNG.random() < prob:
                cur = img.getpixel((gx, gy))
                blend = tuple(min(255, int(cur[c] * 0.65 + AMBER[c] * 0.35))
                              for c in range(3))
                img.putpixel((gx, gy), blend)

    # ──────────────────────────────────────────────────────────────
    # 10. RECEIVING FLASK / ERLENMEYER (x 145–175, y 130–160)
    # ──────────────────────────────────────────────────────────────
    # Triangular Erlenmeyer body
    ERX0, ERY0 = 145, 130
    ERX1, ERY1 = 175, 160

    flask_body = [
        (ERX0 + 15, ERY0),       # neck top
        (ERX0 + 13, ERY0 + 8),   # shoulder start
        (ERX0, ERY1),             # bottom-left
        (ERX1, ERY1),             # bottom-right
        (ERX0 + 17, ERY0 + 8),   # shoulder end
        (ERX0 + 15, ERY0),       # back to top
    ]
    d.polygon(flask_body, fill=GLASS_MID)
    d.polygon(flask_body, outline=GLASS_DARK)

    # Liquid (distillate — ACID_BRIGHT) in lower 40%
    liq_y = ERY0 + int((ERY1 - ERY0) * 0.6)
    # Approximate triangular liquid region
    width_at_liq = int((ERX1 - ERX0) * ((ERY1 - liq_y) / (ERY1 - ERY0)))
    liq_x0 = (ERX0 + ERX1) // 2 - width_at_liq // 2
    liq_x1 = liq_x0 + width_at_liq
    liq_poly = [
        (liq_x0 + 2, liq_y),
        (ERX0 + 1, ERY1 - 1),
        (ERX1 - 1, ERY1 - 1),
        (liq_x1 - 2, liq_y),
    ]
    d.polygon(liq_poly, fill=ACID_BRIGHT)
    # Surface glint
    d.line([liq_x0 + 2, liq_y, liq_x1 - 2, liq_y], fill=GLASS_SHINE)

    # Left highlight
    d.line([ERX0 + 1, ERY1 - 5, ERX0 + 10, ERY0 + 8], fill=GLASS_LIGHT)
    d.point([(ERX0 + 11, ERY0 + 3)], fill=GLASS_SHINE)

    # Neck
    d.rectangle([ERX0 + 13, ERY0 - 12, ERX0 + 17, ERY0 + 1], fill=GLASS_MID)
    d.line([ERX0 + 13, ERY0 - 12, ERX0 + 13, ERY0 + 1], fill=GLASS_LIGHT)
    d.line([ERX0 + 17, ERY0 - 12, ERX0 + 17, ERY0 + 1], fill=GLASS_DARK)
    # Neck stopper hint
    d.rectangle([ERX0 + 12, ERY0 - 13, ERX0 + 18, ERY0 - 10], fill=METAL_DARK)

    # ──────────────────────────────────────────────────────────────
    # 11. DIALOG BOX (y 186–223)
    # ──────────────────────────────────────────────────────────────
    DB_Y0 = 186
    d.rectangle([2, DB_Y0, W - 3, H - 3], fill=DARK_BLUE)
    d.rectangle([2, DB_Y0, W - 3, H - 3], outline=WALL_LIGHT)
    d.line([2, DB_Y0, W - 3, DB_Y0], fill=WALL_LIGHT)

    draw_text(img, "REAKTIONSAPPARAT", 6, 193, color=BRASS_LIGHT, scale=1)
    draw_text(img, "DESTILLATION LAEUFT...", 6, 205, color=TEXT_WHITE, scale=1)
    draw_text(img, "▼", 238, 213, color=BRASS_LIGHT, scale=1)

    return img


if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    img = main()
    export(img, "../../assets/scenes/scene_05_apparatus.png", preview_scale=4)
