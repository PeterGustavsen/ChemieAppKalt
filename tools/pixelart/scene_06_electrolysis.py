"""
Szene 6 — Elektrolyse-Wanne. 640x360, Licht oben-links.
Glaswanne mit Kupfersalz-Loesung (blau), zwei Elektroden (Stahl-Anode +
Kupfer-Kathode), DC-Netzteil mit +/- Klemmen und Kabeln, Blasen an der
Kathode. Rechts ein digitales Zeit-Display. Eigenes Hintergrundbild —
keine Wiederverwendung von Szene 2.
"""
import os
from palette import (STEEL, GLASS, GLASS_HI, BASE, WOOD, BRASS, ORANGE, WHITE,
                     INK, INK_SOFT, CRT, GLOW)
import pixel_helpers as H
import scene_common as SC

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "scenes")

COPPER = [(120, 66, 34), (176, 96, 44), (224, 150, 92)]
WIRE_POS = (196, 60, 52)     # rotes Pluskabel
WIRE_NEG = (28, 30, 40)      # schwarzes Minuskabel

TANK = dict(x=250, y=150, w=150, h=96)
PSU = dict(x=150, y=188, w=86, h=58)
DISPLAY = dict(x=452, y=70, w=150, h=60)


def draw_psu(img, d):
    x, y, w, h = PSU["x"], PSU["y"], PSU["w"], PSU["h"]
    H.soft_shadow(img, x + w // 2, y + h, w // 2 + 8, 6, 70)
    H.rect(d, x, y, w, h, STEEL[1])
    H.rect(d, x, y, w, 4, STEEL[2])
    H.rect(d, x, y + h - 5, w, 5, STEEL[0])
    H.outline(d, x, y, w, h, INK)
    # Amber-Anzeige
    H.rect(d, x + 8, y + 8, w - 16, 18, (8, 6, 2))
    H.outline(d, x + 8, y + 8, w - 16, 18, BRASS[0])
    for lx in range(x + 12, x + w - 12, 6):
        H.vline(d, lx, y + 11, 12, BRASS[2])
    # Drehknopf
    d.ellipse([x + 12, y + 32, x + 28, y + 48], fill=STEEL[0], outline=INK)
    H.rect(d, x + 19, y + 33, 2, 8, GLOW[1])
    # Klemmen + / -
    d.ellipse([x + w - 26, y + 32, x + w - 16, y + 42], fill=WIRE_POS, outline=INK)  # +
    d.ellipse([x + w - 26, y + 44, x + w - 16, y + 54], fill=WIRE_NEG, outline=INK)  # -
    H.rect(d, x + w - 23, y + 35, 5, 2, WHITE)              # + Symbol h
    H.rect(d, x + w - 22, y + 33, 2, 5, WHITE)              # + Symbol v
    H.rect(d, x + w - 23, y + 48, 5, 2, WHITE)              # - Symbol


def draw_tank(img, d):
    x, y, w, h = TANK["x"], TANK["y"], TANK["w"], TANK["h"]
    H.soft_shadow(img, x + w // 2, y + h, w // 2 + 12, 7, 80)
    # Glaswanne
    H.rect(d, x, y, w, h, GLASS[0])
    # Kupfersulfat-Loesung (blau, dithered)
    sol_y = y + 20
    H.dither_rect(img, x + 3, sol_y, w - 6, h - 24, BASE[1], BASE[0], 0.34)
    H.rect(d, x + 3, sol_y, w - 6, 3, BASE[1])             # Oberflaeche
    # Glasglanz + Kanten
    H.vline(d, x + 4, y + 4, h - 8, GLASS_HI)
    H.outline(d, x, y, w, h, INK)
    H.rect(d, x - 2, y - 4, w + 4, 6, GLASS[1])            # oberer Rand
    H.outline(d, x - 2, y - 4, w + 4, 6, INK_SOFT)

    # Elektroden
    a_x = x + 36          # Anode (Stahl, links)
    c_x = x + w - 44      # Kathode (Kupfer, rechts)
    H.rect(d, a_x, y - 16, 12, h - 6, STEEL[2])
    H.rect(d, a_x, y - 16, 12, 4, GLASS_HI)
    H.outline(d, a_x, y - 16, 12, h - 6, INK)
    H.rect(d, c_x, y - 16, 12, h - 6, COPPER[1])
    H.rect(d, c_x, y - 16, 12, 4, COPPER[2])
    H.outline(d, c_x, y - 16, 12, h - 6, INK)

    # Blasen an der Kathode (Cu-Abscheidung / H2)
    for i, (bx, by) in enumerate([(c_x - 4, sol_y + 12), (c_x + 14, sol_y + 26),
                                  (c_x - 2, sol_y + 40), (a_x + 14, sol_y + 18),
                                  (a_x - 3, sol_y + 34)]):
        r = 2 + (i % 2)
        d.ellipse([bx, by, bx + r, by + r], fill=GLASS_HI)
    return a_x, c_x


def draw_wires(img, d, a_x, c_x):
    tx, ty = PSU["x"] + PSU["w"] - 21, PSU["y"] + 37
    # Pluskabel -> Anode (Stahl)
    d.line([(tx, ty), (a_x + 6, TANK["y"] - 30), (a_x + 6, TANK["y"] - 16)],
           fill=WIRE_POS, width=3)
    # Minuskabel -> Kathode (Kupfer)
    d.line([(tx, ty + 12), (c_x + 6, TANK["y"] - 38), (c_x + 6, TANK["y"] - 16)],
           fill=WIRE_NEG, width=3)


def draw_chart(img, d):
    # Mini-Tafel: Cu2+ + 2e- -> Cu
    x, y = 26, 28
    H.rect(d, x - 3, y - 3, 150, 58, WOOD[0])
    H.rect(d, x, y, 144, 52, (10, 28, 18))
    H.outline(d, x, y, 144, 52, CRT[1])
    H.hline(d, x + 8, y + 12, 80, CRT[2])
    H.hline(d, x + 8, y + 24, 110, CRT[1])
    H.hline(d, x + 8, y + 36, 64, CRT[1])
    H.rect(d, x + 96, y + 30, 34, 14, ORANGE[1])          # Kupfer-Swatch
    H.outline(d, x + 96, y + 30, 34, 14, INK_SOFT)


def build():
    os.makedirs(OUT, exist_ok=True)
    img, d = H.new_canvas(SC.W, SC.Hh, (0, 0, 0, 255))
    SC.room_backdrop(img, d, floor_y=250, accent=ORANGE[1])
    draw_chart(img, d)
    SC.table(img, d, 140, 250, 380, 16)
    draw_psu(img, d)
    a_x, c_x = draw_tank(img, d)
    draw_wires(img, d, a_x, c_x)
    SC.display(img, d, DISPLAY["x"], DISPLAY["y"], DISPLAY["w"], DISPLAY["h"])
    SC.note(img, d, 408, 232)
    H.save_png(img, os.path.join(OUT, "scene_06_electrolysis.png"))
    H.save_preview(img, os.path.join(OUT, "scene_06_electrolysis_preview.png"), 2)
    print("scene_06_electrolysis.png OK")


if __name__ == "__main__":
    build()
