"""
Szene 2 — Galvanische Zelle (Hintergrund). 640x360, Licht oben-links.
Gemalte Apparatur exakt an den interaktiven Rects:
  Voltmeter-Readout {x:248,y:56,w:144,h:60}  (App malt Nadel + Wert per Skia)
  L-Slot (Anode)    {x:150,y:150,w:70,h:90}
  R-Slot (Kathode)  {x:420,y:150,w:70,h:90}
  Chip-Leiste unten (control band)
Dynamik (Nadel, Elektronenpfeile, Blasen, Elektrodenfarbe) = Skia in der Szene.
"""
import os
from palette import (STEEL, GLASS, GLASS_HI, BRASS, WOOD, CRT, INK, INK_SOFT, WHITE)
import pixel_helpers as H
import scene_common as SC

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "scenes")
W, Hh = H.SCENE_W, H.SCENE_H
ACC = (111, 211, 221)

VM = (248, 56, 144, 60)
LSLOT = (150, 150, 70, 90)
RSLOT = (420, 150, 70, 90)


def draw_voltmeter(img, d):
    x, y, w, h = VM
    H.rect(d, x - 4, y - 4, w + 8, h + 8, STEEL[1]); H.outline(d, x - 4, y - 4, w + 8, h + 8, INK)
    H.rect(d, x - 4, y - 4, w + 8, 2, STEEL[2])
    H.rect(d, x, y, w, h, (8, 14, 20))               # dunkle Anzeige
    H.outline(d, x, y, w, h, INK)
    cx, cy = x + w // 2, y + h - 8                   # Nadel-Drehpunkt (App)
    # Skala-Bogen + Ticks
    d.arc([cx - 56, cy - 44, cx + 56, cy + 44], 200, 340, fill=GLASS[2])
    import math
    for i in range(9):
        a = math.radians(200 + i * (140 / 8))
        x1, y1 = cx + int(52 * math.cos(a)), cy + int(52 * math.sin(a))
        x2, y2 = cx + int(44 * math.cos(a)), cy + int(44 * math.sin(a))
        d.line([x1, y1, x2, y2], fill=GLASS_HI if i % 2 == 0 else GLASS[1])
    H.rect(d, cx - 2, cy - 2, 4, 4, BRASS[2])        # Pivot
    H.rect(d, x + 6, y + 4, 18, 8, INK_SOFT)         # "V" Schildchen
    H.hline(d, x + 9, y + 8, 6, CRT[2])


def draw_beaker_slot(img, d, slot, label):
    x, y, w, h = slot
    H.soft_shadow(img, x + w // 2, y + h + 4, w // 2, 4, 60)
    # Glas
    H.rect(d, x, y, w, h, GLASS[0])
    H.dither_rect(img, x + 2, y + 2, w - 4, h - 4, GLASS[1], GLASS[0], 0.35)
    # Fluessigkeit (untere 2/3) — App faerbt zusaetzlich per Skia
    H.rect(d, x + 3, y + h // 3, w - 6, h - h // 3 - 3, GLASS[1])
    H.rect(d, x + 3, y + h // 3, w - 6, 2, GLASS[2])
    H.vline(d, x + 4, y + 3, h - 8, GLASS_HI)        # Glanzkante
    H.outline(d, x, y, w, h, INK)
    # Elektroden-Schacht oben mittig (Chip wird hier "eingesteckt")
    sx = x + w // 2 - 7
    H.rect(d, sx, y - 6, 14, 18, INK_SOFT); H.outline(d, sx, y - 6, 14, 18, INK)
    # Label-Plakette
    H.rect(d, x + w // 2 - 12, y + h - 16, 24, 12, STEEL[0]); H.outline(d, x + w // 2 - 12, y + h - 16, 24, 12, INK)
    H.hline(d, x + w // 2 - 7, y + h - 11, 14, ACC)


def draw_salt_bridge(img, d):
    # Inverse-U Bruecke von L-Beaker-Top zu R-Beaker-Top
    ax = LSLOT[0] + LSLOT[2] // 2
    bx = RSLOT[0] + RSLOT[2] // 2
    top = 122
    H.rect(d, ax - 4, top, bx - ax + 8, 8, BRASS[1]); H.outline(d, ax - 4, top, bx - ax + 8, 8, INK)
    H.rect(d, ax - 4, top, bx - ax + 8, 2, BRASS[2])
    H.rect(d, ax - 4, top, 8, LSLOT[1] - top + 4, BRASS[1])
    H.rect(d, bx - 4, top, 8, RSLOT[1] - top + 4, BRASS[1])


def draw_chip_tray(img, d):
    # Ablage-Leiste fuer die Metall-Chips (App malt Chips darauf)
    ty = 296
    H.rect(d, 70, ty, W - 140, 14, WOOD[1]); H.rect(d, 70, ty, W - 140, 3, WOOD[2])
    H.rect(d, 70, ty + 11, W - 140, 3, WOOD[0])
    H.soft_shadow(img, W // 2, ty + 16, (W - 140) // 2, 4, 50)


def build():
    os.makedirs(OUT, exist_ok=True)
    img, d = H.new_canvas(W, Hh, (0, 0, 0, 255))
    SC.room_backdrop(img, d, floor_y=250, accent=ACC)
    SC.table(img, d, 90, 244, W - 180, 14)
    draw_salt_bridge(img, d)
    draw_beaker_slot(img, d, LSLOT, "A")
    draw_beaker_slot(img, d, RSLOT, "K")
    draw_voltmeter(img, d)
    draw_chip_tray(img, d)
    H.save_png(img, os.path.join(OUT, "scene_02_galvanic.png"))
    H.save_preview(img, os.path.join(OUT, "scene_02_galvanic_preview.png"), 2)
    print("scene_02_galvanic.png 640x360 OK")


if __name__ == "__main__":
    build()
