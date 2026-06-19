"""
Szene 6 — Bromwasser-Test (Hintergrund, NEU). 640x360.
  Reagenzglas-Ständer mit 3 Gläsern + Bromwasser-Tropffläschchen.
  Gläser {120,120,60,140} {290,120,60,140} {460,120,60,140}; Readout {40,56,200,56}.
  „Schütteln" = Steuerleiste. Dynamik (Öl-/Brom-Schichten, Entfärben, Schütteln) = Skia.
"""
import os
from palette import (STEEL, GLASS, GLASS_HI, BRASS, WOOD, ORANGE, INK, INK_SOFT, WHITE)
import pixel_helpers as H
import scene_common as SC

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "scenes")
W, Hh = H.SCENE_W, H.SCENE_H
ACC = (111, 224, 138)
TUBES = [(120, 120, 60, 140), (290, 120, 60, 140), (460, 120, 60, 140)]
READOUT = (40, 56, 200, 56)


def draw_rack(img, d):
    # Holz-Ständer: obere Halteleiste + Bodenbrett
    x0, x1 = 96, 544
    H.soft_shadow(img, (x0 + x1) // 2, 268, (x1 - x0) // 2, 6, 70)
    H.rect(d, x0, 132, x1 - x0, 16, WOOD[1]); H.rect(d, x0, 132, x1 - x0, 3, WOOD[2])  # Halteleiste
    H.outline(d, x0, 132, x1 - x0, 16, INK)
    for (tx, ty, tw, th) in TUBES:                # Löcher in der Leiste
        H.rect(d, tx + 6, 134, tw - 12, 12, INK_SOFT)
    H.rect(d, x0, 256, x1 - x0, 12, WOOD[1]); H.rect(d, x0, 256, x1 - x0, 3, WOOD[2])  # Bodenbrett
    H.rect(d, x0 + 8, 268, 10, 16, WOOD[0]); H.rect(d, x1 - 18, 268, 10, 16, WOOD[0])  # Füße


def draw_tube(img, d, rect, label_col):
    x, y, w, h = rect
    # Glas (App füllt Öl/Brom per Skia), rundes Bodenende
    H.rect(d, x, y, w, h - 12, GLASS[0])
    d.ellipse([x, y + h - 24, x + w, y + h], fill=GLASS[0])
    H.dither_rect(img, x + 2, y + 2, w - 4, h - 16, GLASS[1], GLASS[0], 0.28)
    H.vline(d, x + 5, y + 4, h - 24, GLASS_HI)             # Glanzkante
    H.rect(d, x - 2, y - 4, w + 4, 6, GLASS[2]); H.outline(d, x - 2, y - 4, w + 4, 6, INK)   # Rand oben
    H.outline(d, x, y, w, h - 12, INK)
    # Etiketten-Plakette unter dem Glas (App schreibt Namen)
    H.rect(d, x - 4, y + h + 2, w + 8, 14, STEEL[1]); H.outline(d, x - 4, y + h + 2, w + 8, 14, INK)
    H.hline(d, x + 4, y + h + 9, w - 8, label_col)


def draw_dropper(img, d):
    x, y = 566, 150
    H.soft_shadow(img, x + 14, y + 86, 18, 4, 55)
    H.rect(d, x, y + 18, 28, 64, GLASS[0])
    H.dither_rect(img, x + 2, y + 20, 24, 60, GLASS[1], GLASS[0], 0.3)
    H.rect(d, x + 3, y + 44, 22, 34, ORANGE[1]); H.rect(d, x + 3, y + 44, 22, 3, ORANGE[0])   # Bromwasser
    H.outline(d, x, y + 18, 28, 64, INK)
    H.rect(d, x + 6, y, 16, 20, BRASS[1]); H.outline(d, x + 6, y, 16, 20, INK)                # Gummihütchen
    H.rect(d, x + 10, y + 78, 8, 10, GLASS[1]); d.polygon([(x + 10, y + 88), (x + 18, y + 88), (x + 14, y + 96)], fill=GLASS[1])


def build():
    os.makedirs(OUT, exist_ok=True)
    img, d = H.new_canvas(W, Hh, (0, 0, 0, 255))
    SC.room_backdrop(img, d, floor_y=250, accent=ACC)
    draw_rack(img, d)
    cols = [(240, 220, 120), (235, 235, 235), (200, 224, 140)]
    for r, c in zip(TUBES, cols):
        draw_tube(img, d, r, c)
    draw_dropper(img, d)
    SC.display(img, d, *READOUT)
    H.save_png(img, os.path.join(OUT, "scene_06_bromwasser.png"))
    H.save_preview(img, os.path.join(OUT, "scene_06_bromwasser_preview.png"), 2)
    print("scene_06_bromwasser.png 640x360 OK")


if __name__ == "__main__":
    build()
