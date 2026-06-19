"""
Szene 4 — Rosten von Eisen / Wassertropfen-Korrosion (Hintergrund). 640x360.
  Eisenoberfläche (Querschnitt) mit Wassertropfen; Anoden-/Kathoden-Slots.
  Readout (Gesamtgleichung) {x:200,y:56,w:240,h:60}.
  Tropfen (Skia) {x:170,y:130,w:300,h:120}; Anoden-Slot {x:176,y:200,w:80,h:46};
  Kathoden-Slot {x:300,y:160,w:90,h:46}. Dials = Steuerleiste unten.
Dynamik (Tropfen, e⁻-Pfeile, Fe²⁺/OH⁻, Rost am Rand) = Skia in der Szene.
"""
import os
from palette import (STEEL, GLASS, GLASS_HI, BRASS, WOOD, ORANGE, INK, INK_SOFT, WHITE)
import pixel_helpers as H
import scene_common as SC

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "scenes")
W, Hh = H.SCENE_W, H.SCENE_H
ACC = (224, 180, 76)
READOUT = (200, 56, 240, 60)
SURF_Y = 250


def draw_iron(img, d):
    # Eisenoberfläche als dicke Metallplatte (Querschnitt)
    H.rect(d, 0, SURF_Y, W, 30, STEEL[1])
    H.rect(d, 0, SURF_Y, W, 3, STEEL[2])               # Lichtkante oben
    H.dither_rect(img, 0, SURF_Y + 3, W, 24, STEEL[1], STEEL[0], 0.5)
    H.hline(d, 0, SURF_Y, W, INK_SOFT)
    # Anoden-/Kathoden-Marker auf der Oberfläche
    for (mx, col) in [(216, (240, 120, 90)), (345, (120, 200, 240))]:
        H.rect(d, mx - 2, SURF_Y - 2, 4, 6, col)


def draw_slot(img, d, rect, accent):
    x, y, w, h = rect
    H.rect(d, x, y, w, h, (10, 16, 22)); H.outline(d, x, y, w, h, INK)
    H.rect(d, x, y, w, 2, STEEL[1])
    H.rect(d, x + 3, y + 3, w - 6, 8, INK_SOFT)        # Kopfzeile (App schreibt)
    H.hline(d, x + 5, y + 7, 16, accent)


def draw_dial_tray(img, d):
    ty = 300
    H.rect(d, 50, ty, W - 100, 14, WOOD[1]); H.rect(d, 50, ty, W - 100, 3, WOOD[2])
    H.rect(d, 50, ty + 11, W - 100, 3, WOOD[0])


def build():
    os.makedirs(OUT, exist_ok=True)
    img, d = H.new_canvas(W, Hh, (0, 0, 0, 255))
    SC.room_backdrop(img, d, floor_y=SURF_Y, accent=ACC)
    draw_iron(img, d)
    SC.display(img, d, *READOUT)
    draw_slot(img, d, (176, 200, 80, 46), (240, 120, 90))      # Anode
    draw_slot(img, d, (300, 160, 90, 46), (120, 200, 240))     # Kathode
    draw_dial_tray(img, d)
    H.save_png(img, os.path.join(OUT, "scene_04_rosten.png"))
    H.save_preview(img, os.path.join(OUT, "scene_04_rosten_preview.png"), 2)
    print("scene_04_rosten.png 640x360 OK")


if __name__ == "__main__":
    build()
