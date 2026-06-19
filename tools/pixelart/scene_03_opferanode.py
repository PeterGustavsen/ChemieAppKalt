"""
Szene 3 — Opferanode / Ferroxyl-Test (Hintergrund). 640x360, Licht oben-links.
  Petrischale (Aufsicht) mit Eisennagel mittig in Ferroxyl-Lösung.
  Ergebnis-Plakette {x:40,y:56,w:240,h:56}, Schale+Nagel {x:210,y:120,w:220,h:150}.
  Metall-Proben (Cu/Zn/Mg/Al) = Steuerleiste unten (App malt Chips).
Dynamik (Berliner-Blau-/Pink-Blooms, umwickeltes Metall) = Skia in der Szene.
"""
import os
from palette import (STEEL, GLASS, GLASS_HI, ACID, BRASS, WOOD, CRT, INK, INK_SOFT, WHITE)
import pixel_helpers as H
import scene_common as SC

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "scenes")
W, Hh = H.SCENE_W, H.SCENE_H
ACC = (227, 111, 176)

DISH = (210, 120, 220, 150)
LABEL = (40, 56, 240, 56)


def draw_label(img, d):
    x, y, w, h = LABEL
    H.rect(d, x - 3, y - 3, w + 6, h + 6, STEEL[1]); H.outline(d, x - 3, y - 3, w + 6, h + 6, INK)
    H.rect(d, x, y, w, h, (8, 20, 14)); H.outline(d, x, y, w, h, CRT[1])
    for ly in range(y, y + h, 2):
        H.hline(d, x, ly, w, (2, 14, 8))
    H.rect(d, x + 6, y + 5, 60, 8, INK_SOFT)
    H.hline(d, x + 9, y + 9, 48, CRT[2])              # "FERROXYL" Glow-Schild


def draw_dish(img, d):
    x, y, w, h = DISH
    cx, cy = x + w // 2, y + h // 2
    rx, ry = w // 2, h // 2
    H.soft_shadow(img, cx, cy + ry - 6, rx, 10, 70)
    # Glasrand + blasse Ferroxyl-Lösung (App malt Blooms drüber)
    PALE = (150, 170, 120)
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=GLASS[0])
    d.ellipse([cx - rx + 6, cy - ry + 6, cx + rx - 6, cy + ry - 6], fill=PALE)
    d.ellipse([cx - rx + 6, cy - ry + 6, cx + rx - 6, cy + ry - 6], outline=GLASS[2])
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=INK)
    d.arc([cx - rx + 4, cy - ry + 4, cx + rx - 4, cy + ry - 4], 200, 320, fill=GLASS_HI)
    # Eisennagel mittig (waagerecht)
    nl, nr, ny = cx - 70, cx + 64, cy + 4
    H.rect(d, nl, ny - 4, nr - nl, 8, STEEL[2]); H.outline(d, nl, ny - 4, nr - nl, 8, INK)
    H.rect(d, nl, ny - 4, nr - nl, 2, GLASS_HI)        # Lichtkante
    H.rect(d, nr, ny - 7, 8, 14, STEEL[2]); H.outline(d, nr, ny - 7, 8, 14, INK)   # Kopf
    d.polygon([(nl, ny - 4), (nl, ny + 4), (nl - 8, ny)], fill=STEEL[1])           # Spitze


def draw_shelf_tray(img, d):
    ty = 296
    H.rect(d, 60, ty, W - 120, 14, WOOD[1]); H.rect(d, 60, ty, W - 120, 3, WOOD[2])
    H.rect(d, 60, ty + 11, W - 120, 3, WOOD[0])
    H.soft_shadow(img, W // 2, ty + 16, (W - 120) // 2, 4, 50)


def build():
    os.makedirs(OUT, exist_ok=True)
    img, d = H.new_canvas(W, Hh, (0, 0, 0, 255))
    SC.room_backdrop(img, d, floor_y=250, accent=ACC)
    SC.table(img, d, 120, 250, W - 240, 12)
    draw_dish(img, d)
    draw_label(img, d)
    draw_shelf_tray(img, d)
    H.save_png(img, os.path.join(OUT, "scene_03_opferanode.png"))
    H.save_preview(img, os.path.join(OUT, "scene_03_opferanode_preview.png"), 2)
    print("scene_03_opferanode.png 640x360 OK")


if __name__ == "__main__":
    build()
