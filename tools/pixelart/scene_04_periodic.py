"""
Szene 4 — Periodensystem / Atombau. 640x360.
Grosse Wandtafel mit farbigen Elementfeldern (Perioden 1-3, korrekte
Gruppen-Anordnung). Symbole/Ordnungszahlen + Auswahl zeichnet die App
deckungsgleich ueber das Raster (siehe PSE_LAYOUT).
"""
import os
from palette import (STEEL, ORANGE, BRASS, ACID, PINK, BASE, PURPLE, INK,
                     INK_SOFT, WHITE, CRT)
import pixel_helpers as H
import scene_common as SC

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "scenes")

PANEL = dict(x=36, y=44, w=568, h=188)
CELL_W, CELL_H, GAP = 28, 30, 2
GRID_X, GRID_Y = 52, 84

CAT = {  # Kategorie -> Farbe
    "alkali": ORANGE[1], "erdalkali": BRASS[2], "nichtmetall": ACID[0],
    "halogen": PINK[0], "edelgas": BASE[0], "halbmetall": STEEL[2], "metall": STEEL[1],
}
# (col, row, kategorie)  — deckungsgleich mit Scene4Periodic.js
ELEMENTS = [
    (0, 0, "nichtmetall"), (17, 0, "edelgas"),
    (0, 1, "alkali"), (1, 1, "erdalkali"), (12, 1, "halbmetall"), (13, 1, "nichtmetall"),
    (14, 1, "nichtmetall"), (15, 1, "nichtmetall"), (16, 1, "halogen"), (17, 1, "edelgas"),
    (0, 2, "alkali"), (1, 2, "erdalkali"), (12, 2, "metall"), (13, 2, "halbmetall"),
    (14, 2, "nichtmetall"), (15, 2, "nichtmetall"), (16, 2, "halogen"), (17, 2, "edelgas"),
]


def cell_xy(col, row):
    return GRID_X + col * (CELL_W + GAP), GRID_Y + row * (CELL_H + GAP)


def build():
    os.makedirs(OUT, exist_ok=True)
    img, d = H.new_canvas(SC.W, SC.Hh, (0, 0, 0, 255))
    SC.room_backdrop(img, d, floor_y=250, accent=PURPLE[0])

    p = PANEL
    H.soft_shadow(img, p["x"] + p["w"] // 2, p["y"] + p["h"] + 6, p["w"] // 2, 6, 60)
    H.rect(d, p["x"] - 6, p["y"] - 6, p["w"] + 12, p["h"] + 12, STEEL[0])
    H.outline(d, p["x"] - 6, p["y"] - 6, p["w"] + 12, p["h"] + 12, INK)
    H.rect(d, p["x"], p["y"], p["w"], p["h"], (16, 22, 34))
    H.outline(d, p["x"], p["y"], p["w"], p["h"], STEEL[2])
    # Titelleiste
    H.rect(d, p["x"], p["y"], p["w"], 16, STEEL[0])
    H.hline(d, p["x"] + 6, p["y"] + 12, 120, CRT[2])

    # Elementfelder (farbig, ohne Text — App legt Symbol/Zahl drueber)
    for (col, row, cat) in ELEMENTS:
        x, y = cell_xy(col, row)
        H.rect(d, x, y, CELL_W, CELL_H, CAT[cat])
        H.rect(d, x, y, CELL_W, 2, WHITE)            # Lichtkante oben
        H.dither_rect(img, x + CELL_W - 6, y + 2, 5, CELL_H - 4, CAT[cat], INK_SOFT, 0.4)
        H.outline(d, x, y, CELL_W, CELL_H, INK)

    SC.table(img, d, 150, 250, 340, 16)
    SC.note(img, d, 300, 232)
    H.save_png(img, os.path.join(OUT, "scene_04_periodic.png"))
    H.save_preview(img, os.path.join(OUT, "scene_04_periodic_preview.png"), 2)
    print("scene_04_periodic.png OK")


if __name__ == "__main__":
    build()
