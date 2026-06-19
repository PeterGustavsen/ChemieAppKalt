"""
Szene 7 — Gleichgewichts-Reaktor. 640x360, Licht oben-links.
Geschlossener Glaskolben (H2 + I2 <=> 2 HI) mit violettem Iod-Dampf, auf einer
Stahl-Heizhaube, verschlossen mit Stopfen + Klemmen, Manometer oben, gebogenes
Rohr zurueck in den Reaktor (geschlossenes System). Eigenes Hintergrundbild —
keine Wiederverwendung von Szene 3.
"""
import os
from palette import (STEEL, GLASS, GLASS_HI, WOOD, BRASS, WHITE,
                     INK, INK_SOFT, CRT, GLOW)
import pixel_helpers as H
import scene_common as SC

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "scenes")

# Violetter Iod-Dampf
PUR = [(70, 40, 96), (126, 72, 168), (176, 120, 214)]
ACCENT = PUR[1]

FLASK = dict(cx=320, cy=176, r=58)          # Rundkolben
MANTLE = dict(x=270, y=224, w=100, h=26)    # Heizhaube
DISPLAY = dict(x=452, y=70, w=150, h=60)


def draw_mantle(img, d):
    x, y, w, h = MANTLE["x"], MANTLE["y"], MANTLE["w"], MANTLE["h"]
    H.soft_shadow(img, x + w // 2, y + h, w // 2 + 10, 6, 80)
    H.rect(d, x, y, w, h, STEEL[1])
    H.rect(d, x, y, w, 4, STEEL[2])
    H.rect(d, x, y + h - 5, w, 5, STEEL[0])
    H.outline(d, x, y, w, h, INK)
    # rotglühende Heizschlitze
    for lx in range(x + 10, x + w - 8, 14):
        H.rect(d, lx, y + 9, 8, 8, ORANGE_GLOW)
    # Mulde fuer den Kolben
    d.ellipse([x + w // 2 - 30, y - 8, x + w // 2 + 30, y + 10], fill=STEEL[0])


ORANGE_GLOW = (224, 96, 40)


def draw_flask(img, d):
    cx, cy, r = FLASK["cx"], FLASK["cy"], FLASK["r"]
    # Glaskugel
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=GLASS[0], outline=INK)
    # Violetter Dampf (dithered, oben) + etwas Bodensatz
    H.blend_poly(img, [(cx - r + 8, cy - r + 10), (cx + r - 8, cy - r + 10),
                       (cx + r - 6, cy + 6), (cx - r + 6, cy + 6)], PUR[1], 150)
    H.blend_poly(img, [(cx - r + 10, cy - 18), (cx + r - 10, cy - 18),
                       (cx + r - 12, cy - 38), (cx - r + 12, cy - 38)], PUR[2], 90)
    # dunklere Iod-Kristalle am Boden
    for bx in range(cx - 22, cx + 22, 8):
        H.rect(d, bx, cy + r - 18, 5, 4, PUR[0])
    # Glanz-Sichel
    d.arc([cx - r + 6, cy - r + 6, cx + r - 20, cy + r - 20], 200, 280, fill=GLASS_HI)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=INK)

    # Hals + Stopfen
    H.rect(d, cx - 9, cy - r - 26, 18, 30, GLASS[0])
    H.outline(d, cx - 9, cy - r - 26, 18, 30, INK_SOFT)
    H.rect(d, cx - 11, cy - r - 30, 22, 8, WOOD[1])         # Gummistopfen
    H.outline(d, cx - 11, cy - r - 30, 22, 8, INK)
    # Klemme am Hals (versiegelt)
    H.rect(d, cx - 16, cy - r - 12, 32, 6, BRASS[1])
    H.outline(d, cx - 16, cy - r - 12, 32, 6, INK_SOFT)


def draw_gauge(img, d):
    # Manometer oben auf dem Stopfen
    gx, gy = FLASK["cx"], FLASK["cy"] - FLASK["r"] - 44
    d.ellipse([gx - 16, gy - 16, gx + 16, gy + 16], fill=WHITE, outline=INK)
    d.ellipse([gx - 16, gy - 16, gx + 16, gy + 16], outline=INK)
    for a in range(0, 360, 45):                # Skalenstriche
        import math
        rad = math.radians(a)
        x1 = gx + int(11 * math.cos(rad)); y1 = gy + int(11 * math.sin(rad))
        x2 = gx + int(14 * math.cos(rad)); y2 = gy + int(14 * math.sin(rad))
        d.line([(x1, y1), (x2, y2)], fill=INK_SOFT)
    d.line([(gx, gy), (gx + 9, gy - 7)], fill=(196, 40, 30), width=2)   # Nadel
    d.ellipse([gx - 2, gy - 2, gx + 2, gy + 2], fill=INK)
    # kurzes Verbindungsrohr Stopfen -> Manometer
    H.rect(d, gx - 2, gy + 14, 4, 14, STEEL[1])


def draw_loop_pipe(img, d):
    # Geschlossenes Rueckfuehrungsrohr rechts (geschlossenes System)
    cx, cy, r = FLASK["cx"], FLASK["cy"], FLASK["r"]
    pts = [(cx + 6, cy - r - 18), (cx + 64, cy - r - 18),
           (cx + 92, cy - 10), (cx + 64, cy + 40), (cx + r - 6, cy + 30)]
    d.line(pts, fill=STEEL[1], width=5)
    d.line(pts, fill=STEEL[2], width=1)


def draw_chart(img, d):
    x, y = 26, 28
    H.rect(d, x - 3, y - 3, 156, 58, WOOD[0])
    H.rect(d, x, y, 150, 52, (10, 28, 18))
    H.outline(d, x, y, 150, 52, CRT[1])
    H.hline(d, x + 8, y + 12, 120, CRT[2])      # H2 + I2 <=> 2 HI
    H.hline(d, x + 8, y + 26, 70, CRT[1])
    H.hline(d, x + 8, y + 38, 96, CRT[1])
    H.rect(d, x + 110, y + 30, 30, 14, PUR[1])  # violetter Swatch
    H.outline(d, x + 110, y + 30, 30, 14, INK_SOFT)


def build():
    os.makedirs(OUT, exist_ok=True)
    img, d = H.new_canvas(SC.W, SC.Hh, (0, 0, 0, 255))
    SC.room_backdrop(img, d, floor_y=250, accent=ACCENT)
    draw_chart(img, d)
    SC.table(img, d, 150, 250, 360, 16)
    draw_mantle(img, d)
    draw_loop_pipe(img, d)
    draw_flask(img, d)
    draw_gauge(img, d)
    SC.display(img, d, DISPLAY["x"], DISPLAY["y"], DISPLAY["w"], DISPLAY["h"])
    SC.note(img, d, 408, 232)
    H.save_png(img, os.path.join(OUT, "scene_07_equilibrium.png"))
    H.save_preview(img, os.path.join(OUT, "scene_07_equilibrium_preview.png"), 2)
    print("scene_07_equilibrium.png OK")


if __name__ == "__main__":
    build()
