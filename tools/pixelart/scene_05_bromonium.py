"""
Szene 5 — Bromonium-Mechanismus ordnen (Hintergrund). 640x360.
  Laborbank mit 3 gerahmten Mechanismus-Platten (App malt Inhalt/Skia) + Br₂-Flasche.
  Platten {56,132,120,104} {192,132,120,104} {328,132,120,104}; Code-Readout {470,60,140,56}.
Dynamik (Br₂ -> Bromonium-Brücke -> Br⁻-Rückseitenangriff) = Skia in der Szene.
"""
import os
from palette import (STEEL, GLASS, GLASS_HI, BRASS, WOOD, ORANGE, INK, INK_SOFT, WHITE)
import pixel_helpers as H
import scene_common as SC

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "scenes")
W, Hh = H.SCENE_W, H.SCENE_H
ACC = (150, 96, 200)
PLATES = [(56, 132, 120, 104), (192, 132, 120, 104), (328, 132, 120, 104)]
READOUT = (470, 60, 140, 56)


def draw_plate(img, d, rect):
    x, y, w, h = rect
    H.soft_shadow(img, x + w // 2, y + h + 3, w // 2, 4, 55)
    H.rect(d, x - 3, y - 3, w + 6, h + 6, WOOD[1])      # Holzrahmen
    H.rect(d, x - 3, y - 3, w + 6, 3, WOOD[2])
    H.outline(d, x - 3, y - 3, w + 6, h + 6, INK)
    H.rect(d, x, y, w, h, (16, 20, 30))                 # dunkle Platte (App malt Skizze)
    H.dither_rect(img, x + 2, y + 2, w - 4, h - 4, (16, 20, 30), (24, 30, 44), 0.2)
    H.outline(d, x, y, w, h, INK_SOFT)
    H.rect(d, x + 6, y + h - 18, 22, 12, INK)           # Ziffern-Plakette unten links (App)
    # Reissnagel oben mittig
    H.rect(d, x + w // 2 - 3, y - 6, 6, 6, BRASS[2]); H.outline(d, x + w // 2 - 3, y - 6, 6, 6, INK)


def draw_br2_bottle(img, d):
    x, y = 500, 150
    H.soft_shadow(img, x + 18, y + 92, 24, 5, 60)
    H.rect(d, x, y + 14, 36, 78, GLASS[0])              # Flasche
    H.dither_rect(img, x + 2, y + 16, 32, 74, GLASS[1], GLASS[0], 0.3)
    H.rect(d, x + 3, y + 50, 30, 40, ORANGE[1])         # Br2 (orange-braun)
    H.rect(d, x + 3, y + 50, 30, 3, ORANGE[0])
    H.vline(d, x + 5, y + 18, 70, GLASS_HI)
    H.rect(d, x + 12, y + 4, 12, 12, STEEL[1]); H.outline(d, x + 12, y + 4, 12, 12, INK)   # Stopfen
    H.outline(d, x, y + 14, 36, 78, INK)
    H.rect(d, x + 6, y + 60, 24, 14, WHITE)             # Etikett
    H.hline(d, x + 9, y + 64, 18, ORANGE[0]); H.hline(d, x + 9, y + 68, 14, INK_SOFT)


def build():
    os.makedirs(OUT, exist_ok=True)
    img, d = H.new_canvas(W, Hh, (0, 0, 0, 255))
    SC.room_backdrop(img, d, floor_y=250, accent=ACC)
    SC.table(img, d, 40, 248, W - 80, 12)
    for r in PLATES:
        draw_plate(img, d, r)
    draw_br2_bottle(img, d)
    SC.display(img, d, *READOUT)
    H.save_png(img, os.path.join(OUT, "scene_05_bromonium.png"))
    H.save_preview(img, os.path.join(OUT, "scene_05_bromonium_preview.png"), 2)
    print("scene_05_bromonium.png 640x360 OK")


if __name__ == "__main__":
    build()
