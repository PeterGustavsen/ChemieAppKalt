"""
Szene 7 — Isomerie E/Z (Hintergrund, NEU). 640x360.
  Molekül-Viewer-Schirm + gemalter CIP-Helfer (Ordnungszahlen).
  Viewer {160,120,320,140}; CIP-Helfer {40,56,220,56}; Fortschritt/Code {470,56,140,56}.
  E/Z-Buttons = Steuerleiste. Dynamik (Molekül, Prioritätspfeile) = Skia.
"""
import os
from palette import (STEEL, GLASS, GLASS_HI, BRASS, WOOD, CRT, PURPLE, ORANGE,
                     INK, INK_SOFT, WHITE)
import pixel_helpers as H
import scene_common as SC

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "scenes")
W, Hh = H.SCENE_W, H.SCENE_H
ACC = (240, 178, 58)
VIEWER = (160, 120, 320, 140)
CIP = (40, 56, 220, 56)
PROG = (470, 56, 140, 56)


def draw_viewer(img, d):
    x, y, w, h = VIEWER
    H.rect(d, x - 6, y - 6, w + 12, h + 12, STEEL[1]); H.outline(d, x - 6, y - 6, w + 12, h + 12, INK)
    H.rect(d, x - 6, y - 6, w + 12, 3, STEEL[2])
    H.rect(d, x, y, w, h, (8, 16, 22))                 # dunkler Schirm (App malt Molekül)
    # feines Raster
    for gx in range(x, x + w, 20):
        H.vline(d, gx, y, h, (14, 26, 32))
    for gy in range(y, y + h, 20):
        H.hline(d, x, gy, w, (14, 26, 32))
    H.outline(d, x, y, w, h, CRT[1])
    d.polygon([(x, y), (x + 26, y), (x, y + 20)], fill=(*GLASS_HI, 30))
    # Standfuss
    H.rect(d, x + w // 2 - 18, y + h + 6, 36, 8, STEEL[0])
    H.rect(d, x + w // 2 - 30, y + h + 14, 60, 6, STEEL[1])


def draw_cip(img, d):
    x, y, w, h = CIP
    H.rect(d, x - 3, y - 3, w + 6, h + 6, STEEL[1]); H.outline(d, x - 3, y - 3, w + 6, h + 6, INK)
    H.rect(d, x, y, w, h, (12, 18, 26)); H.outline(d, x, y, w, h, INK_SOFT)
    H.rect(d, x + 5, y + 4, 70, 9, INK_SOFT); H.hline(d, x + 8, y + 8, 58, ACC)   # "CIP-PRIORITÄT"
    # kleine Element-Kacheln mit Ordnungszahl-Hinweis (App ergänzt)
    tiles = [("H", STEEL[1]), ("C", STEEL[2]), ("Cl", (120, 200, 240)), ("Br", ORANGE[1])]
    for i, (sym, col) in enumerate(tiles):
        tx = x + 6 + i * 50
        H.rect(d, tx, y + 18, 44, 28, STEEL[0]); H.outline(d, tx, y + 18, 44, 28, INK)
        H.rect(d, tx, y + 18, 44, 3, col)


def draw_band_tray(img, d):
    ty = 300
    H.rect(d, 120, ty, W - 240, 14, WOOD[1]); H.rect(d, 120, ty, W - 240, 3, WOOD[2])


def build():
    os.makedirs(OUT, exist_ok=True)
    img, d = H.new_canvas(W, Hh, (0, 0, 0, 255))
    SC.room_backdrop(img, d, floor_y=250, accent=ACC)
    draw_viewer(img, d)
    draw_cip(img, d)
    SC.display(img, d, *PROG)
    draw_band_tray(img, d)
    H.save_png(img, os.path.join(OUT, "scene_07_isomerie.png"))
    H.save_preview(img, os.path.join(OUT, "scene_07_isomerie_preview.png"), 2)
    print("scene_07_isomerie.png 640x360 OK")


if __name__ == "__main__":
    build()
