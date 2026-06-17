"""
Szene 2 — Saeure/Base & Titration. 640x360, Licht oben-links.
Stativ + Buerette (NaOH) ueber Erlenmeyerkolben (HCl + Phenolphthalein),
rechts ein digitales Volumen-Display. Die Fluessigkeit im Kolben + der
Tropfen werden in der App dynamisch gezeichnet (Farbumschlag).
"""
import os
from palette import (STEEL, GLASS, GLASS_HI, BASE, WOOD, BRASS, PINK, WHITE,
                     INK, INK_SOFT, CRT)
import pixel_helpers as H
import scene_common as SC

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "scenes")

# Layout-Kontrakt (deckungsgleich mit src/scenes/Scene2Titration.js)
BUR = dict(x=196, y=36, w=18, h=156)         # Buerettenrohr
STOPCOCK_Y = 176
FLASK = dict(neck_l=197, neck_r=213, base_l=177, base_r=233, top=206, bot=248)
DISPLAY = dict(x=440, y=70, w=160, h=64)


def draw_stand(img, d):
    # Fuss + Stange
    H.soft_shadow(img, 300, 248, 60, 6, 70)
    H.rect(d, 256, 240, 96, 10, STEEL[0])
    H.rect(d, 256, 240, 96, 3, STEEL[2])
    H.rect(d, 298, 44, 7, 198, STEEL[1])
    H.rect(d, 298, 44, 3, 198, STEEL[2])
    # Klemmen zur Buerette
    for cy in (70, 150):
        H.rect(d, 214, cy, 86, 6, STEEL[0])
        H.rect(d, 214, cy, 86, 2, STEEL[2])
        H.rect(d, 210, cy - 2, 10, 10, BRASS[1])  # Klemmkopf


def draw_burette(img, d):
    x, y, w, h = BUR["x"], BUR["y"], BUR["w"], BUR["h"]
    # Glasrohr
    H.rect(d, x, y, w, h, GLASS[0])
    H.dither_rect(img, x + 1, y + 1, w - 2, h - 2, GLASS[1], GLASS[0], 0.30)
    H.vline(d, x + 3, y + 2, h - 4, GLASS_HI)
    # NaOH-Fuellung (oberer Teil)
    H.rect(d, x + 2, y + 8, w - 4, 96, BASE[1])
    H.rect(d, x + 2, y + 8, w - 4, 3, BASE[0])      # Meniskus
    # Skalenstriche rechts
    for i, ty in enumerate(range(y + 12, y + h - 16, 9)):
        ln = 7 if i % 2 == 0 else 4
        H.hline(d, x + w - ln, ty, ln, INK_SOFT)
    H.outline(d, x, y, w, h, INK_SOFT)
    # Hahn (Stopcock)
    sy = STOPCOCK_Y
    H.rect(d, x - 6, sy, w + 12, 12, STEEL[1])
    H.outline(d, x - 6, sy, w + 12, 12, INK)
    H.rect(d, x + w + 4, sy + 2, 10, 4, BRASS[2])   # Griff
    H.rect(d, x + w // 2 - 1, sy + 12, 3, 8, GLASS[0])  # Auslauf
    d.polygon([(x + w // 2 - 3, sy + 20), (x + w // 2 + 4, sy + 20),
               (x + w // 2, sy + 26)], fill=GLASS[1])     # Spitze


def draw_flask(img, d):
    f = FLASK
    body = [(f["neck_l"], f["top"]), (f["neck_r"], f["top"]),
            (f["base_r"], f["bot"]), (f["base_l"], f["bot"])]
    # Glaskoerper (leer; App malt Fluessigkeit)
    d.polygon(body, fill=GLASS[0])
    d.polygon(body, outline=INK)
    # Hals
    H.rect(d, f["neck_l"], f["top"] - 12, f["neck_r"] - f["neck_l"], 13, GLASS[0])
    H.outline(d, f["neck_l"], f["top"] - 12, f["neck_r"] - f["neck_l"], 13, INK_SOFT)
    H.rect(d, f["neck_l"] - 2, f["top"] - 14, f["neck_r"] - f["neck_l"] + 4, 3, GLASS[1])
    # Glanz
    d.line([(f["neck_l"] + 3, f["top"] + 2), (f["base_l"] + 8, f["bot"] - 4)], fill=(*GLASS_HI, 120))


def draw_chart(img, d):
    # Phenolphthalein-Mini-Tafel oben links
    x, y = 26, 28
    H.rect(d, x - 3, y - 3, 150, 70, WOOD[0])
    H.rect(d, x, y, 144, 64, STEEL[0])
    H.hline(d, x + 6, y + 8, 90, CRT[2])
    # zwei Swatches
    H.rect(d, x + 10, y + 18, 56, 34, STEEL[1]); H.outline(d, x + 10, y + 18, 56, 34, INK_SOFT)
    H.rect(d, x + 78, y + 18, 56, 34, PINK[1]); H.outline(d, x + 78, y + 18, 56, 34, INK_SOFT)


def build():
    os.makedirs(OUT, exist_ok=True)
    img, d = H.new_canvas(SC.W, SC.Hh, (0, 0, 0, 255))
    SC.room_backdrop(img, d, floor_y=250, accent=PINK[1])
    draw_chart(img, d)
    SC.table(img, d, 150, 250, 360, 16)
    draw_stand(img, d)
    draw_burette(img, d)
    draw_flask(img, d)
    SC.display(img, d, DISPLAY["x"], DISPLAY["y"], DISPLAY["w"], DISPLAY["h"])
    SC.note(img, d, 360, 232)
    H.save_png(img, os.path.join(OUT, "scene_02_titration.png"))
    H.save_preview(img, os.path.join(OUT, "scene_02_titration_preview.png"), 2)
    print("scene_02_titration.png OK")


if __name__ == "__main__":
    build()
