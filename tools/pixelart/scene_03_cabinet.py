"""
Szene 3 — Stoechiometrie (Reagenzschrank). 640x360.
Zwei Reagenzschraenke mit Flaschen, mittig eine beleuchtete Reaktionstafel.
Gleichung + Koeffizienten-Steller werden in der App ueber das BOARD gelegt.
"""
import os
from palette import (WOOD, STEEL, GLASS, GLASS_HI, ACID, BASE, PINK, ORANGE,
                     BRASS, CRT, INK, INK_SOFT, WHITE, GROUT)
import pixel_helpers as H
import scene_common as SC

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "scenes")
BOARD = dict(x=176, y=60, w=288, h=134)


def draw_bottle(img, d, x, y, liquid, h=30):
    w = 18
    H.rect(d, x + 5, y - 6, 8, 6, STEEL[1])         # Hals
    H.rect(d, x + 4, y - 9, 10, 4, BRASS[2])        # Deckel
    H.rect(d, x, y, w, h, GLASS[0])
    H.dither_rect(img, x + 1, y + 1, w - 2, h - 2, GLASS[1], GLASS[0], 0.25)
    H.rect(d, x + 2, y + h - (h - 8), w - 4, h - 10, liquid[-1])
    H.rect(d, x + 2, y + 10, w - 4, 2, liquid[0])
    H.rect(d, x + 2, y + h - 18, w - 4, 10, WHITE)  # Etikett
    H.outline(d, x, y, w, h, INK_SOFT)
    H.vline(d, x + 3, y + 2, h - 4, GLASS_HI)


def draw_cabinet(img, d, x, w):
    y, h = 40, 206
    H.soft_shadow(img, x + w // 2, y + h, w // 2, 6, 60)
    H.rect(d, x, y, w, h, WOOD[0])
    H.rect(d, x + 4, y + 4, w - 8, h - 8, WOOD[1])
    H.rect(d, x + 4, y + 4, w - 8, 3, WOOD[2])
    shelves = [y + 18, y + 78, y + 138, y + 196]
    liquids = [ACID, BASE, PINK, ORANGE]
    for i, sy in enumerate(shelves[:-1]):
        H.rect(d, x + 6, shelves[i + 1] - 4, w - 12, 5, WOOD[0])   # Brett
        for j in range(3):
            draw_bottle(img, d, x + 12 + j * (w - 24) // 3, sy, liquids[(i + j) % 4])
    H.outline(d, x, y, w, h, INK)


def draw_board(img, d):
    b = BOARD
    H.rect(d, b["x"] - 6, b["y"] - 6, b["w"] + 12, b["h"] + 12, STEEL[0])
    H.outline(d, b["x"] - 6, b["y"] - 6, b["w"] + 12, b["h"] + 12, INK)
    H.rect(d, b["x"], b["y"], b["w"], b["h"], (10, 22, 30))   # dunkle Tafel
    H.outline(d, b["x"], b["y"], b["w"], b["h"], STEEL[2])
    # feines Raster
    for gx in range(b["x"], b["x"] + b["w"], 16):
        H.vline(d, gx, b["y"], b["h"], (14, 28, 38))
    for gy in range(b["y"], b["y"] + b["h"], 16):
        H.hline(d, b["x"], gy, b["w"], (14, 28, 38))
    # Status-Lampe oben
    H.rect(d, b["x"] + b["w"] - 16, b["y"] - 16, 12, 10, INK)


def build():
    os.makedirs(OUT, exist_ok=True)
    img, d = H.new_canvas(SC.W, SC.Hh, (0, 0, 0, 255))
    SC.room_backdrop(img, d, floor_y=250, accent=BRASS[2])
    draw_cabinet(img, d, 8, 156)
    draw_cabinet(img, d, 476, 156)
    SC.table(img, d, 150, 250, 340, 16)
    draw_board(img, d)
    draw_bottle(img, d, 250, 222, ACID)
    draw_bottle(img, d, 360, 222, BASE)
    SC.note(img, d, 300, 232)
    H.save_png(img, os.path.join(OUT, "scene_03_cabinet.png"))
    H.save_preview(img, os.path.join(OUT, "scene_03_cabinet_preview.png"), 2)
    print("scene_03_cabinet.png OK")


if __name__ == "__main__":
    build()
