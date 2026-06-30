"""
Szene 1 — Molars Labor (Hub). Komposition OHNE Schrank-Boxen: die Navigation
laeuft jetzt ueber die untere Leiste (NavBar) in der App. Die Wandflaeche ist
stattdessen mit Labor-DEKO gefuellt — Periodensystem-Poster, Reagenz-Regale,
Pinnwand, Uhr, Feuerloescher. Mitte unten bleibt das Konsolen-Pult (Terminal),
mitte oben bleibt Platz fuer das (in der App animierte) Fenster.

640x360, Licht oben-links. Exportiert assets/scenes/scene_01_lab_hub.png.
"""
import os, json
from palette import (WALL, FLOOR, GROUT, WOOD, BRASS, STEEL, GLASS, GLASS_HI,
                     CRT, GLOW, INK, INK_SOFT, WHITE,
                     ACID, BASE, PINK, PURPLE, ORANGE, RED)
import pixel_helpers as H

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "scenes")
W, Hh = H.SCENE_W, H.SCENE_H
FLOOR_Y = 250

# Nur noch der PC ist ein Hotspot (Navigation laeuft ueber die NavBar).
# Grosser zentraler CRT-Monitor (wie frueher), Fenster dahinter.
HOTSPOTS = {
    "terminal": {"x": 246, "y": 120, "w": 150, "h": 150},
}

# Frei zu haltende Bereiche (App malt darauf): Fenster + Molar-Standplatz.
WIN = (205, 14, 230, 94)        # x,y,w,h — Fenster (App)
CORK = (90, 80, 60)             # Pinnwand-Kork


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


# ── Deko-Bausteine ────────────────────────────────────────────────────────────
def draw_beaker(img, d, x, y, ramp):
    w, h = 16, 22
    H.rect(d, x, y, w, h, GLASS[0])
    H.dither_rect(img, x + 1, y + 2, w - 2, h - 3, GLASS[1], GLASS[0], 0.4)
    H.rect(d, x + 2, y + h - 10, w - 4, 8, ramp[-1])
    H.rect(d, x + 2, y + h - 10, w - 4, 2, ramp[0])
    H.vline(d, x + 3, y + 2, h - 5, GLASS_HI)
    H.outline(d, x, y, w, h, INK_SOFT)
    img.putpixel((x + 3, y + 3), (*GLASS_HI, 200))


def draw_bottle(img, d, x, y, ramp):
    H.rect(d, x + 3, y, 4, 5, GLASS[1])          # Hals
    H.rect(d, x + 2, y - 2, 6, 3, BRASS[2])      # Kappe
    H.rect(d, x, y + 5, 10, 20, GLASS[0])        # Koerper
    H.dither_rect(img, x + 1, y + 6, 8, 18, GLASS[1], GLASS[0], 0.4)
    H.rect(d, x + 1, y + 16, 8, 9, ramp[-1])     # Fuellung
    H.rect(d, x + 1, y + 16, 8, 2, ramp[0])
    H.vline(d, x + 2, y + 6, 16, GLASS_HI)
    H.outline(d, x, y + 5, 10, 20, INK_SOFT)


def draw_shelf(img, d, sx, sy, sw, items, kind="beaker"):
    H.rect(d, sx, sy, sw, 6, WOOD[1])
    H.rect(d, sx, sy, sw, 2, WOOD[2])
    H.rect(d, sx, sy + 6, sw, 2, WOOD[0])
    H.soft_shadow(img, sx + sw // 2, sy + 9, sw // 2, 3, 50)
    n = len(items)
    gap = (sw - 12) // n
    for i, ramp in enumerate(items):
        gx = sx + 8 + i * gap
        if kind == "bottle":
            draw_bottle(img, d, gx, sy - 27, ramp)
        else:
            draw_beaker(img, d, gx, sy - 24, ramp)


def draw_poster(img, d, x, y, w, h):
    H.rect(d, x - 3, y - 3, w + 6, h + 6, WOOD[0])      # Rahmen
    H.rect(d, x, y, w, h, STEEL[0])
    cols, rows = 9, 5
    cw = (w - 8) // cols
    ch = (h - 14) // rows
    for r in range(rows):
        for c in range(cols):
            cell = PURPLE[0] if (r + c) % 5 == 0 else STEEL[1]
            H.rect(d, x + 4 + c * cw, y + 12 + r * ch, cw - 1, ch - 1, cell)
    H.rect(d, x + 6, y + 2, 52, 8, INK_SOFT)           # Titelschild
    H.hline(d, x + 9, y + 6, 40, CRT[2])               # "PSE"-Glow


def draw_corkboard(img, d, x, y, w, h):
    H.rect(d, x - 3, y - 3, w + 6, h + 6, WOOD[0])
    H.rect(d, x, y, w, h, CORK)
    H.dither_rect(img, x, y, w, h, CORK, (70, 60, 44), 0.4)
    notes = [(x + 10, y + 10, 42, 32, WHITE),
             (x + 64, y + 16, 48, 36, (228, 230, 214)),
             (x + 124, y + 9, 42, 30, WHITE)]
    for (nx, ny, nw, nh, col) in notes:
        H.soft_shadow(img, nx + nw // 2, ny + nh, nw // 2, 2, 50)
        H.rect(d, nx, ny, nw, nh, col)
        H.outline(d, nx, ny, nw, nh, INK_SOFT)
        for ly in range(ny + 6, ny + nh - 3, 5):
            H.hline(d, nx + 4, ly, nw - 8, STEEL[0])
        H.rect(d, nx + nw // 2 - 2, ny - 2, 4, 4, RED[1])   # Pinnnadel


def draw_clock(img, d, cx, cy, r):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=STEEL[0], outline=INK)
    d.ellipse([cx - r + 2, cy - r + 2, cx + r - 2, cy + r - 2], fill=WHITE)
    H.vline(d, cx, cy - r + 4, r - 5, INK)    # Stundenzeiger
    H.hline(d, cx, cy, r - 7, INK)            # Minutenzeiger
    img.putpixel((cx, cy), (*INK, 255))


def draw_extinguisher(img, d, x, y):
    H.soft_shadow(img, x + 7, y + 30, 9, 3, 60)
    H.rect(d, x, y, 14, 30, RED[0])
    H.rect(d, x, y, 14, 4, RED[1])
    H.rect(d, x + 4, y - 5, 6, 6, STEEL[0])   # Hals
    H.rect(d, x + 2, y - 8, 10, 3, STEEL[1])  # Griff
    H.rect(d, x + 5, y + 9, 4, 13, WHITE)     # Etikett
    H.outline(d, x, y, 14, 30, INK)


def draw_pipes(img, d):
    # Rohrleitung oben rechts + Ventil
    H.rect(d, 440, 16, 200, 6, STEEL[1])
    H.rect(d, 440, 16, 200, 2, STEEL[2])
    for vx in range(470, 640, 46):
        H.rect(d, vx, 22, 4, 18, STEEL[0])
    H.rect(d, 556, 14, 10, 10, BRASS[1])      # Ventilrad
    H.outline(d, 556, 14, 10, 10, INK_SOFT)


def draw_terminal(img, d):
    """Grosser zentraler CRT-Monitor auf Holztisch (wie vor dem 6er-Umbau).
    App malt Status/Codes in TERMINAL_SCREEN = {258,132,126,106}."""
    hs = HOTSPOTS["terminal"]
    x, y, w, h = hs["x"], hs["y"], hs["w"], hs["h"]
    # Tisch unter dem Monitor
    H.rect(d, x - 30, y + h - 6, w + 60, Hh - (y + h - 6) - 20, WOOD[1])
    H.rect(d, x - 30, y + h - 6, w + 60, 4, WOOD[2])
    H.rect(d, x - 30, Hh - 22, w + 60, 4, WOOD[0])
    H.soft_shadow(img, x + w // 2, y + h + 4, w // 2 + 20, 6, 70)
    # Gehaeuse (Stahl)
    H.rect(d, x, y, w, h, STEEL[1])
    H.outline(d, x, y, w, h, INK)
    H.rect(d, x, y, w, 3, STEEL[2])                       # Lichtkante oben
    H.dither_rect(img, x + w - 16, y + 4, 14, h - 8, STEEL[1], STEEL[0], 0.6)
    # Bildschirm-Vertiefung (dunkles Phosphor — App malt Inhalt)
    sx, sy, sw, sh = x + 12, y + 12, w - 24, h - 44
    H.rect(d, sx - 2, sy - 2, sw + 4, sh + 4, INK)
    H.rect(d, sx, sy, sw, sh, CRT[0])
    H.dither_rect(img, sx, sy, sw, sh, CRT[0], CRT[1], 0.18)
    for ly in range(sy, sy + sh, 2):
        H.hline(d, sx, ly, sw, (2, 14, 8))               # Scanlines
    d.polygon([(sx, sy), (sx + 26, sy), (sx, sy + 22)], fill=(*GLASS_HI, 40))
    # Tastatur auf dem Tisch
    ky = y + h + 4
    H.rect(d, x + 6, ky, w - 12, 14, STEEL[0])
    H.rect(d, x + 6, ky, w - 12, 2, STEEL[2])
    for kx in range(x + 12, x + w - 12, 10):
        H.rect(d, kx, ky + 4, 7, 6, STEEL[1])
    # Standfuss
    H.rect(d, x + w // 2 - 8, y + h - 2, 16, 8, STEEL[0])


def build():
    os.makedirs(OUT, exist_ok=True)
    img, d = H.new_canvas(W, Hh, (0, 0, 0, 255))
    draw_wall(img, d)
    draw_floor(img, d)
    draw_lamp(img, d)
    draw_pipes(img, d)

    # LINKS: Periodensystem-Poster + Reagenz-Regal (hinter Molars Standplatz)
    draw_poster(img, d, 16, 34, 122, 82)
    draw_shelf(img, d, 14, 182, 168, [ACID, BASE, PINK, ORANGE, PURPLE], "beaker")

    # MITTE: grosser CRT-Monitor; darueber zeichnet die App das Fenster.

    # RECHTS: zwei Regale + Uhr + Feuerloescher (rechts vom Tisch, x>456)
    draw_shelf(img, d, 462, 70, 150, [PURPLE, ACID, ORANGE, BASE], "bottle")
    draw_shelf(img, d, 462, 152, 150, [PINK, BASE, ACID, ORANGE], "bottle")
    draw_clock(img, d, 614, 40, 14)
    draw_extinguisher(img, d, 606, 156)

    draw_terminal(img, d)

    H.save_png(img, os.path.join(OUT, "scene_01_lab_hub.png"))
    H.save_preview(img, os.path.join(OUT, "scene_01_lab_hub_preview.png"), 2)
    with open(os.path.join(os.path.dirname(__file__), "scene_01_hotspots.json"), "w") as f:
        json.dump(HOTSPOTS, f, indent=2)
    print("scene_01_lab_hub.png 640x360 OK (Deko statt Boxen)")


if __name__ == "__main__":
    build()
