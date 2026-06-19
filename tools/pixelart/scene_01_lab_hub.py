"""
Szene 1 — Molars Labor (Hub), NEUE Komposition. 640x360, Licht oben-links.
  OBEN     : 6 Wandschraenke in einem 3x2-Raster (je Raum ein Akzent + Icon)
  UNTEN    : Konsolen-Pult mittig mit CRT-Screen (App malt Status/Codes hinein)

Tap-Rects sind deckungsgleich mit ROOMS in src/config/game.js (Handoff #1):
Die Schrankgrafik ist so eingerueckt, dass die Rects exakt auf dem Schrank liegen.
Status-LED + Icon werden in der App eingefaerbt; hier Default-Gehaeuse + Icon.

Exportiert assets/scenes/scene_01_lab_hub.png (+ _preview.png) + scene_01_hotspots.json.
"""
import os, json
from palette import (WALL, FLOOR, GROUT, WOOD, BRASS, STEEL, GLASS, GLASS_HI,
                     CRT, GLOW, INK, INK_SOFT, WHITE)
import pixel_helpers as H

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "scenes")
W, Hh = H.SCENE_W, H.SCENE_H
FLOOR_Y = 250

# Deckungsgleich mit der App (src/config/game.js) — Handoff #1
HOTSPOTS = {
    "door1": {"x": 44,  "y": 56,  "w": 104, "h": 76},
    "door2": {"x": 268, "y": 56,  "w": 104, "h": 76},
    "door3": {"x": 492, "y": 56,  "w": 104, "h": 76},
    "door4": {"x": 44,  "y": 158, "w": 104, "h": 76},
    "door5": {"x": 268, "y": 158, "w": 104, "h": 76},
    "door6": {"x": 492, "y": 158, "w": 104, "h": 76},
    "console": {"x": 258, "y": 262, "w": 124, "h": 70},
}

# Akzentfarben je Schrank (Reihenfolge = door1..door6 = scene2..7)
ACC = {
    "door1": (111, 211, 221),   # Galvanische Zelle  #6fd3dd
    "door2": (227, 111, 176),   # Opferanode         #e36fb0
    "door3": (224, 180, 76),    # Rosten             #e0b44c
    "door4": (150, 96, 200),    # Bromonium          #9660c8
    "door5": (111, 224, 138),   # Bromwasser         #6fe08a
    "door6": (240, 178, 58),    # Isomerie E/Z       #f0b23a
}
ICON = {
    "door1": "battery", "door2": "nail", "door3": "rust",
    "door4": "bridge",  "door5": "tube", "door6": "ez",
}


def draw_wall(img, d):
    H.vgradient(img, 0, 0, W, FLOOR_Y, WALL[1], WALL[0])
    for x in range(0, W, 32):
        H.vline(d, x, 0, FLOOR_Y, WALL[0])
    for y in range(0, FLOOR_Y, 32):
        H.hline(d, 0, y, W, WALL[0])
    H.rect(d, 0, FLOOR_Y - 6, W, 6, WALL[2])
    H.rect(d, 0, FLOOR_Y - 6, W, 2, GLOW[0])


def draw_floor(img, d):
    H.tile_floor(img, 0, FLOOR_Y, W, Hh - FLOOR_Y, FLOOR, tile=32, grout=GROUT)
    H.dither_rect(img, 200, FLOOR_Y, 240, 26, FLOOR[2], FLOOR[1], 0.4)


def draw_lamp(img, d):
    H.rect(d, W // 2 - 36, 0, 72, 8, STEEL[0])
    H.rect(d, W // 2 - 28, 8, 56, 6, GLOW[1])
    H.blend_poly(img, [(W // 2 - 28, 14), (W // 2 + 28, 14),
                       (W // 2 + 80, 150), (W // 2 - 80, 150)], GLOW[1], 22)


def draw_icon(img, d, kind, cx, cy, acc):
    if kind == "battery":                              # galvanische Zelle
        H.rect(d, cx - 11, cy - 7, 22, 15, STEEL[1]); H.outline(d, cx - 11, cy - 7, 22, 15, INK)
        H.rect(d, cx + 11, cy - 3, 3, 6, STEEL[2])
        H.rect(d, cx - 7, cy - 1, 5, 2, acc); H.rect(d, cx - 5, cy - 3, 2, 6, acc)  # +
        H.rect(d, cx + 2, cy - 1, 5, 2, acc)                                          # -
    elif kind == "nail":                               # Opferanode (Nagel im Tropfen)
        d.ellipse([cx - 12, cy - 6, cx + 12, cy + 8], outline=acc)
        H.rect(d, cx - 1, cy - 9, 3, 16, STEEL[2]); H.rect(d, cx - 3, cy - 9, 7, 3, STEEL[2])
    elif kind == "rust":                               # Rosten (Tropfen + Rostkante)
        d.ellipse([cx - 11, cy - 8, cx + 11, cy + 8], fill=GLASS[0])
        d.arc([cx - 11, cy - 8, cx + 11, cy + 8], 20, 160, fill=acc)
        H.rect(d, cx - 2, cy - 2, 4, 4, acc)
    elif kind == "bridge":                             # Bromonium-Bruecke
        d.arc([cx - 11, cy - 4, cx + 11, cy + 14], 180, 360, fill=acc)
        H.rect(d, cx - 11, cy + 4, 5, 4, STEEL[2]); H.rect(d, cx + 6, cy + 4, 5, 4, STEEL[2])
        img.putpixel((cx, cy - 4), (*WHITE, 200))
    elif kind == "tube":                               # Reagenzglas
        H.rect(d, cx - 5, cy - 10, 10, 18, GLASS[1]);
        d.ellipse([cx - 5, cy + 4, cx + 5, cy + 10], fill=acc)
        H.rect(d, cx - 5, cy + 2, 10, 6, acc); H.outline(d, cx - 5, cy - 10, 10, 18, INK_SOFT)
        H.rect(d, cx - 6, cy - 11, 12, 3, BRASS[2])
    elif kind == "ez":                                 # E/Z Doppelbindung
        H.hline(d, cx - 10, cy - 2, 20, acc); H.hline(d, cx - 10, cy + 1, 20, acc)
        H.rect(d, cx - 12, cy - 5, 4, 4, STEEL[2]); H.rect(d, cx + 8, cy + 1, 4, 4, STEEL[2])
        H.rect(d, cx - 12, cy + 1, 4, 4, STEEL[1]); H.rect(d, cx + 8, cy - 5, 4, 4, STEEL[1])


def draw_cabinet(img, d, key):
    hs = HOTSPOTS[key]
    x, y, w, h = hs["x"], hs["y"], hs["w"], hs["h"]
    acc = ACC[key]
    H.soft_shadow(img, x + w // 2, y + h + 4, w // 2, 5, 60)
    # Gehaeuse
    H.rect(d, x, y, w, h, STEEL[0]); H.outline(d, x, y, w, h, INK)
    H.rect(d, x + 4, y + 4, w - 8, h - 8, STEEL[1])
    H.rect(d, x + 4, y + 4, w - 8, 2, STEEL[2])              # Lichtkante oben
    H.dither_rect(img, x + w - 16, y + 6, 10, h - 12, STEEL[1], STEEL[0], 0.6)
    # Sichtfenster oben (accent-getoent)
    H.rect(d, x + 12, y + 10, w - 24, 22, INK_SOFT)
    H.dither_rect(img, x + 14, y + 12, w - 28, 18, acc, INK_SOFT, 0.22)
    H.outline(d, x + 12, y + 10, w - 24, 22, INK)
    # Etched icon (accent)
    draw_icon(img, d, ICON[key], x + w // 2, y + 50, acc)
    # Griff rechts + Status-LED-Sockel (App malt Farbe)
    H.rect(d, x + w - 14, y + h // 2 - 6, 6, 16, BRASS[2])
    H.rect(d, x + 12, y + h - 14, 8, 8, INK)
    img.putpixel((x + 13, y + h - 13), (*acc, 120))


def draw_console(img, d):
    hs = HOTSPOTS["console"]
    sx, sy, sw, sh = hs["x"], hs["y"], hs["w"], hs["h"]
    # Pult (Holz) unter dem Screen, ueber die ganze Mitte
    dx, dw = sx - 40, sw + 80
    H.soft_shadow(img, sx + sw // 2, sy + sh + 8, dw // 2, 7, 80)
    H.rect(d, dx, sy - 10, dw, sh + 26, WOOD[1])
    H.rect(d, dx, sy - 10, dw, 4, WOOD[2])
    H.rect(d, dx, sy + sh + 12, dw, 4, WOOD[0])
    # Screen-Gehaeuse + dunkles Phosphor (App malt Inhalt)
    H.rect(d, sx - 4, sy - 4, sw + 8, sh + 8, STEEL[1]); H.outline(d, sx - 4, sy - 4, sw + 8, sh + 8, INK)
    H.rect(d, sx, sy, sw, sh, CRT[0])
    H.dither_rect(img, sx, sy, sw, sh, CRT[0], CRT[1], 0.16)
    for ly in range(sy, sy + sh, 2):
        H.hline(d, sx, ly, sw, (2, 14, 8))
    d.polygon([(sx, sy), (sx + 24, sy), (sx, sy + 20)], fill=(*GLASS_HI, 36))
    # Tastatur vorne
    ky = sy + sh + 14
    H.rect(d, sx + 6, ky, sw - 12, 12, STEEL[0]); H.rect(d, sx + 6, ky, sw - 12, 2, STEEL[2])
    for kx in range(sx + 12, sx + sw - 12, 10):
        H.rect(d, kx, ky + 3, 7, 5, STEEL[1])


def build():
    os.makedirs(OUT, exist_ok=True)
    img, d = H.new_canvas(W, Hh, (0, 0, 0, 255))
    draw_wall(img, d)
    draw_floor(img, d)
    draw_lamp(img, d)
    for key in ["door1", "door2", "door3", "door4", "door5", "door6"]:
        draw_cabinet(img, d, key)
    draw_console(img, d)
    H.save_png(img, os.path.join(OUT, "scene_01_lab_hub.png"))
    H.save_preview(img, os.path.join(OUT, "scene_01_lab_hub_preview.png"), 2)
    with open(os.path.join(os.path.dirname(__file__), "scene_01_hotspots.json"), "w") as f:
        json.dump(HOTSPOTS, f, indent=2)
    print("scene_01_lab_hub.png 640x360 OK")


if __name__ == "__main__":
    build()
