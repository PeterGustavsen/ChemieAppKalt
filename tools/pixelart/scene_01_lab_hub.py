"""
Szene 1 — Molars Labor (Hub). 640x360, Licht oben-links.
Komposition:
  LINKS   : Periodensystem-Poster, Glaswaren-Bank (Molar steht hier, App-Sprite)
  MITTE   : Haupt-Terminal (CRT mit Phosphor-Gluehen) auf Stahltisch
  RECHTS  : 2x2 Raum-Tueren zu den 4 Raetselraeumen (Drop/Waage/Atom/Kolben)

Das Terminal-Screen-Feld und die Tuer-Status (LED/Schloss) werden in der App
dynamisch dargestellt; hier nur Gehaeuse/Rahmen + dunkler Screen + Default-Icons.

Exportiert assets/scenes/scene_01_lab_hub.png  (+ _preview.png).
Hotspot-Koordinaten siehe HOTSPOTS unten (deckungsgleich mit src/scenes config).
"""
import os, json
from palette import (WALL, FLOOR, GROUT, WOOD, BRASS, STEEL, GLASS, GLASS_HI,
                     ACID, BASE, PINK, PURPLE, ORANGE, CRT, CRT_AMBER, GLOW,
                     INK, INK_SOFT, WHITE)
import pixel_helpers as H

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "scenes")
W, Hh = H.SCENE_W, H.SCENE_H
FLOOR_Y = 250

# Deckungsgleich mit der App (src/scenes/scene1.config)
HOTSPOTS = {
    "terminal": {"x": 246, "y": 120, "w": 150, "h": 150},
    # 3x2 Tueren rechts (deckungsgleich mit ROOMS in src/config/game.js)
    "door1":    {"x": 404, "y": 60,  "w": 72, "h": 104},   # Saeure-Base / Puffer
    "door2":    {"x": 482, "y": 60,  "w": 72, "h": 104},   # Redox
    "door3":    {"x": 560, "y": 60,  "w": 72, "h": 104},   # Elektrochemie
    "door4":    {"x": 404, "y": 176, "w": 72, "h": 104},   # Organik
    "door5":    {"x": 482, "y": 176, "w": 72, "h": 104},   # Elektrolyse
    "door6":    {"x": 560, "y": 176, "w": 72, "h": 104},   # Gleichgewicht
}


# ----------------------------------------------------------------------
def draw_wall(img, d):
    H.vgradient(img, 0, 0, W, FLOOR_Y, WALL[1], WALL[0])
    # Fliesenraster 32px
    for x in range(0, W, 32):
        H.vline(d, x, 0, FLOOR_Y, WALL[0])
    for y in range(0, FLOOR_Y, 32):
        H.hline(d, 0, y, W, WALL[0])
    # Sockelleiste
    H.rect(d, 0, FLOOR_Y - 6, W, 6, WALL[2])
    H.rect(d, 0, FLOOR_Y - 6, W, 2, GLOW[0])  # Lichtkante


def draw_floor(img, d):
    H.tile_floor(img, 0, FLOOR_Y, W, Hh - FLOOR_Y, FLOOR, tile=32, grout=GROUT)
    # Lichtschein vorne (Lampe oben)
    H.dither_rect(img, 200, FLOOR_Y, 260, 30, FLOOR[2], FLOOR[1], 0.4)


def draw_lamp(img, d):
    # Deckenlampe mittig oben -> Lichtkegel
    H.rect(d, W // 2 - 36, 0, 72, 8, STEEL[0])
    H.rect(d, W // 2 - 28, 8, 56, 6, GLOW[1])
    H.blend_poly(img, [(W // 2 - 28, 14), (W // 2 + 28, 14),
                       (W // 2 + 70, 120), (W // 2 - 70, 120)], GLOW[1], 26)


def draw_poster(img, d):
    # Periodensystem-Mini-Poster (Deko, Hinweis auf Raum PSE)
    x, y, w, h = 26, 30, 130, 86
    H.rect(d, x - 3, y - 3, w + 6, h + 6, WOOD[0])      # Rahmen
    H.rect(d, x, y, w, h, STEEL[0])
    for r in range(6):
        for c in range(9):
            cell = PURPLE[0] if (r + c) % 5 == 0 else STEEL[1]
            H.rect(d, x + 4 + c * 14, y + 4 + r * 13, 12, 11, cell)
    H.rect(d, x + 6, y - 2, 40, 8, INK_SOFT)
    H.hline(d, x + 8, y + 2, 30, CRT[2])               # "PSE" Schildchen-Glow


def draw_shelf(img, d):
    # Wandregal mit Glaswaren links-mitte
    sx, sy, sw = 18, 150, 200
    H.rect(d, sx, sy, sw, 6, WOOD[1])
    H.rect(d, sx, sy, sw, 2, WOOD[2])
    H.soft_shadow(img, sx + sw // 2, sy + 8, sw // 2, 3, 50)
    glas = [(sx + 12, ACID), (sx + 44, BASE), (sx + 78, PINK),
            (sx + 112, GLASS), (sx + 150, ORANGE)]
    for gx, ramp in glas:
        draw_beaker(img, d, gx, sy - 26, ramp)


def draw_beaker(img, d, x, y, liquid):
    # kleines Becherglas mit Fluessigkeit
    w, h = 18, 24
    H.rect(d, x, y, w, h, GLASS[0])
    H.dither_rect(img, x + 1, y + 2, w - 2, h - 3, GLASS[1], GLASS[0], 0.4)
    H.rect(d, x + 2, y + h - 12, w - 4, 10, liquid[-1])     # Fuellung
    H.rect(d, x + 2, y + h - 12, w - 4, 2, liquid[0])
    H.vline(d, x + 3, y + 2, h - 5, GLASS_HI)               # Glanzkante
    H.outline(d, x, y, w, h, INK_SOFT)
    img.putpixel((x + 3, y + 3), (*GLASS_HI, 200))


def draw_terminal(img, d):
    hs = HOTSPOTS["terminal"]
    x, y, w, h = hs["x"], hs["y"], hs["w"], hs["h"]
    # Tisch
    H.rect(d, x - 30, y + h - 6, w + 60, Hh - (y + h - 6) - 20, WOOD[1])
    H.rect(d, x - 30, y + h - 6, w + 60, 4, WOOD[2])
    H.soft_shadow(img, x + w // 2, y + h + 4, w // 2 + 20, 6, 70)
    # Gehaeuse (Stahl, CRT)
    H.rect(d, x, y, w, h, STEEL[1])
    H.outline(d, x, y, w, h, INK)
    H.rect(d, x, y, w, 3, STEEL[2])                  # Lichtkante oben
    H.dither_rect(img, x + w - 16, y + 4, 14, h - 8, STEEL[1], STEEL[0], 0.6)
    # Bildschirm-Vertiefung
    sx, sy, sw, sh = x + 12, y + 12, w - 24, h - 44
    H.rect(d, sx - 2, sy - 2, sw + 4, sh + 4, INK)
    H.rect(d, sx, sy, sw, sh, CRT[0])                # dunkles Phosphor (App malt Inhalt)
    # Phosphor-Gluehen
    H.dither_rect(img, sx, sy, sw, sh, CRT[0], (*CRT[1],), 0.18)
    for ly in range(sy, sy + sh, 2):
        H.hline(d, sx, ly, sw, (*CRT[0], 255))       # Scanlines
    # Glanz oben-links auf Glas
    d.polygon([(sx, sy), (sx + 26, sy), (sx, sy + 22)], fill=(*GLASS_HI, 40))
    # Tastatur auf dem Tisch
    ky = y + h + 4
    H.rect(d, x + 6, ky, w - 12, 14, STEEL[0])
    H.rect(d, x + 6, ky, w - 12, 2, STEEL[2])
    for kx in range(x + 12, x + w - 12, 10):
        H.rect(d, kx, ky + 4, 7, 6, STEEL[1])
    # Standfuss
    H.rect(d, x + w // 2 - 8, y + h - 2, 16, 8, STEEL[0])


THEMES = [  # (icon, accent) fuer die 6 Tueren
    ("drop", PINK), ("atom", BRASS), ("battery", BASE),
    ("flask", ACID), ("bolt", ORANGE), ("balance", PURPLE),
]


def draw_icon(img, d, kind, cx, cy, accent):
    if kind == "drop":
        d.polygon([(cx, cy - 9), (cx + 7, cy + 4), (cx - 7, cy + 4)], fill=accent[-1])
        d.ellipse([cx - 7, cy - 1, cx + 7, cy + 9], fill=accent[-1])
        img.putpixel((cx - 3, cy), (*WHITE, 180))
    elif kind == "balance":
        H.vline(d, cx, cy - 9, 18, BRASS[2]); H.hline(d, cx - 11, cy - 7, 23, BRASS[2])
        H.rect(d, cx - 15, cy - 5, 8, 4, BRASS[1]); H.rect(d, cx + 8, cy - 5, 8, 4, BRASS[1])
        H.rect(d, cx - 4, cy + 9, 8, 3, BRASS[1])
    elif kind == "atom":
        d.ellipse([cx - 10, cy - 5, cx + 10, cy + 5], outline=accent[-1])
        d.ellipse([cx - 5, cy - 10, cx + 5, cy + 10], outline=accent[-1])
        H.rect(d, cx - 2, cy - 2, 4, 4, CRT_AMBER)
    elif kind == "flask":
        d.polygon([(cx - 3, cy - 9), (cx + 3, cy - 9), (cx + 8, cy + 8),
                   (cx - 8, cy + 8)], fill=GLASS[1])
        H.rect(d, cx - 6, cy + 2, 12, 6, accent[-1])
        H.rect(d, cx - 3, cy - 11, 6, 3, GLASS[2])
    elif kind == "battery":
        H.rect(d, cx - 9, cy - 6, 18, 13, STEEL[1])      # Gehaeuse
        H.outline(d, cx - 9, cy - 6, 18, 13, INK)
        H.rect(d, cx + 9, cy - 2, 3, 5, STEEL[2])        # Pluspol-Kappe
        H.rect(d, cx - 6, cy - 1, 4, 2, accent[-1])      # +
        H.rect(d, cx - 5, cy - 2, 2, 4, accent[-1])
        H.rect(d, cx + 2, cy - 1, 4, 2, accent[-1])      # -
    elif kind == "bolt":
        d.polygon([(cx + 2, cy - 10), (cx - 6, cy + 1), (cx - 1, cy + 1),
                   (cx - 3, cy + 10), (cx + 6, cy - 2), (cx + 1, cy - 2)],
                  fill=accent[-1])


def draw_door(img, d, key, theme):
    hs = HOTSPOTS[key]
    x, y, w, h = hs["x"], hs["y"], hs["w"], hs["h"]
    icon, accent = theme
    # Tuerrahmen (Stahlluke)
    H.rect(d, x, y, w, h, STEEL[0])
    H.outline(d, x, y, w, h, INK)
    H.rect(d, x + 4, y + 4, w - 8, h - 8, STEEL[1])
    H.rect(d, x + 4, y + 4, w - 8, 2, STEEL[2])           # Lichtkante
    H.dither_rect(img, x + w - 14, y + 6, 10, h - 12, STEEL[1], STEEL[0], 0.6)
    # Sichtfenster
    H.rect(d, x + 14, y + 12, w - 28, 30, INK_SOFT)
    H.dither_rect(img, x + 16, y + 14, w - 32, 26, accent[0], INK_SOFT, 0.25)
    # Icon-Plakette
    draw_icon(img, d, icon, x + w // 2, y + 64, accent)
    # Griff
    H.rect(d, x + w - 16, y + h // 2, 6, 14, BRASS[2])
    # Status-LED-Sockel (App malt Farbe rein)
    H.rect(d, x + 10, y + h - 14, 8, 8, INK)


def build():
    os.makedirs(OUT, exist_ok=True)
    img, d = H.new_canvas(W, Hh, (0, 0, 0, 255))
    draw_wall(img, d)
    draw_floor(img, d)
    draw_lamp(img, d)
    draw_poster(img, d)
    draw_shelf(img, d)
    draw_terminal(img, d)
    for key, theme in zip(
        ["door1", "door2", "door3", "door4", "door5", "door6"], THEMES):
        draw_door(img, d, key, theme)
    H.save_png(img, os.path.join(OUT, "scene_01_lab_hub.png"))
    H.save_preview(img, os.path.join(OUT, "scene_01_lab_hub_preview.png"), 2)
    with open(os.path.join(os.path.dirname(__file__), "scene_01_hotspots.json"), "w") as f:
        json.dump(HOTSPOTS, f, indent=2)
    print("scene_01_lab_hub.png  640x360 OK")


if __name__ == "__main__":
    build()
