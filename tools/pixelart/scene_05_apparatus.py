"""
Szene 5 — Organik / Reaktionsmechanismus (Apparate-Tisch). 640x360.
Links Glasapparatur ueber Bunsenbrenner (Flamme animiert die App), mittig drei
Molekuel-Karten (Strukturformeln legt die App drueber), oben ein Code-Display.
"""
import os
from palette import (STEEL, GLASS, GLASS_HI, BRASS, ORANGE, WOOD, INK,
                     INK_SOFT, WHITE, CRT, ACID)
import pixel_helpers as H
import scene_common as SC

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "scenes")

# 3 Molekuel-Karten (deckungsgleich mit Scene5Organik.js)
CARDS = [dict(x=56, y=132, w=120, h=112),
         dict(x=192, y=132, w=120, h=112),
         dict(x=328, y=132, w=120, h=112)]
DISPLAY = dict(x=470, y=60, w=140, h=56)


def draw_card(img, d, c):
    H.soft_shadow(img, c["x"] + c["w"] // 2, c["y"] + c["h"] + 4, c["w"] // 2, 5, 60)
    H.rect(d, c["x"] - 4, c["y"] - 4, c["w"] + 8, c["h"] + 8, STEEL[0])
    H.outline(d, c["x"] - 4, c["y"] - 4, c["w"] + 8, c["h"] + 8, INK)
    H.rect(d, c["x"], c["y"], c["w"], c["h"], (14, 20, 30))
    H.outline(d, c["x"], c["y"], c["w"], c["h"], STEEL[2])
    H.rect(d, c["x"], c["y"], c["w"], 14, STEEL[0])      # Kopfleiste (App: Name)
    H.rect(d, c["x"] + 6, c["y"] + c["h"] - 18, c["w"] - 12, 12, (8, 14, 22))  # Ziffern-Feld


def draw_apparatus(img, d):
    bx = 520
    # Stativ
    H.rect(d, bx - 40, 240, 96, 10, STEEL[0])
    H.rect(d, bx + 36, 70, 7, 178, STEEL[1])
    # Ring + Drahtnetz
    H.rect(d, bx - 30, 150, 72, 5, STEEL[1])
    H.rect(d, bx - 26, 148, 64, 3, BRASS[1])
    # Rundkolben
    d.ellipse([bx - 24, 108, bx + 32, 156], fill=GLASS[0], outline=INK)
    H.dither_rect(img, bx - 20, 112, 48, 40, GLASS[1], GLASS[0], 0.25)
    H.rect(d, bx, 92, 8, 20, GLASS[0]); H.outline(d, bx, 92, 8, 20, INK_SOFT)
    img.putpixel((bx - 10, 120), (*GLASS_HI, 200))
    # Bunsenbrenner
    H.rect(d, bx, 200, 8, 40, STEEL[1])                 # Rohr
    H.rect(d, bx - 12, 238, 32, 8, STEEL[0])            # Fuss
    H.rect(d, bx - 14, 244, 36, 6, STEEL[0])
    # Pilot-Glut (Flamme zeichnet die App animiert)
    H.blend_poly(img, [(bx + 1, 196), (bx + 7, 196), (bx + 4, 184)], ORANGE[1], 120)


def build():
    os.makedirs(OUT, exist_ok=True)
    img, d = H.new_canvas(SC.W, SC.Hh, (0, 0, 0, 255))
    SC.room_backdrop(img, d, floor_y=250, accent=ACID[1])
    SC.table(img, d, 30, 250, 460, 16)
    draw_apparatus(img, d)
    for c in CARDS:
        draw_card(img, d, c)
    SC.display(img, d, DISPLAY["x"], DISPLAY["y"], DISPLAY["w"], DISPLAY["h"])
    SC.note(img, d, 300, 232)
    H.save_png(img, os.path.join(OUT, "scene_05_apparatus.png"))
    H.save_preview(img, os.path.join(OUT, "scene_05_apparatus_preview.png"), 2)
    print("scene_05_apparatus.png OK")


if __name__ == "__main__":
    build()
