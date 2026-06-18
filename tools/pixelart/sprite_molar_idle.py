"""
Prof. Dr. Molar — animiertes Idle-Sprite (Sprite-Sheet, horizontal).
Frames gleich breit (72x112). Idle-Loop: Atmen (Oberkoerper hebt/senkt),
Blinzeln, gelegentliche Geste (Arm hebt sich, deutender Zeigefinger).
Zusaetzlich ein kleines Speak-Sheet (Mund auf/zu) fuer Dialoge.

Licht oben-links. Exportiert nach assets/sprites/.
"""
import os
from PIL import ImageDraw
from palette import (SKIN, COAT, HAIR, GLASSES, INK, INK_SOFT, STEEL, WHITE,
                     BRASS)
import pixel_helpers as H

FW, FH = 72, 112
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "sprites")


def _ell(d, box, fill=None, outline=None):
    d.ellipse(box, fill=fill, outline=outline)


def draw_molar(breath=0, blink=False, arm=0.0, mouth_open=False, crossed=False):
    """arm: 0=unten ... 1=erhoben (Geste). breath: 0..2 px Hub.
    crossed=True: verschraenkte Arme vor der Brust (statt haengender Arme)."""
    img, d = H.new_canvas(FW, FH)
    cx = 36
    yb = breath            # Oberkoerper-Versatz nach unten bei tiefem Atem
    base = FH - 2

    # ---- Bodenschatten ----
    H.soft_shadow(img, cx, base, 22, 5, alpha=80)

    # ---- Schuhe / Hose-Saum ----
    H.rect(d, cx - 13, base - 8, 11, 7, INK_SOFT)
    H.rect(d, cx + 2, base - 8, 11, 7, INK_SOFT)
    H.rect(d, cx - 13, base - 3, 11, 3, INK)
    H.rect(d, cx + 2, base - 3, 11, 3, INK)

    # ---- Laborkittel (A-Linie, laenger) ----
    top = 46 + yb
    bot = base - 6
    # Silhouette: leicht trapezfoermig
    for y in range(top, bot):
        t = (y - top) / (bot - top)
        half = int(16 + t * 8)              # unten breiter
        H.rect(d, cx - half, y, half * 2, 1, COAT[1])
    # Schatten rechts (Licht links) — gedithert
    H.dither_rect(img, cx + 2, top + 4, 22, bot - top - 6, COAT[1], COAT[0], 0.55)
    # Kittel-Naht + Knopfleiste
    H.vline(d, cx, top + 2, bot - top - 2, COAT[0])
    for ky in range(top + 8, bot - 4, 10):
        H.rect(d, cx - 1, ky, 2, 2, STEEL[2])
    # Revers / Kragen
    d.polygon([(cx - 10, top), (cx, top + 10), (cx, top), ], fill=COAT[1])
    d.polygon([(cx + 10, top), (cx, top + 10), (cx, top), ], fill=COAT[0])
    # Brusttasche + Stift
    H.outline(d, cx + 6, top + 12, 9, 8, COAT[0])
    H.rect(d, cx + 9, top + 9, 2, 6, BRASS[2])   # Stift

    # ---- Arme ----
    if crossed:
        # Verschraenkte Arme: Unterarm-Block quer vor der Brust. Kanten-,
        # Naht- und Schattenlinie trennen die zwei Arme vom Kittel.
        chest = top + 13
        H.rect(d, cx - 19, top + 6, 5, 9, COAT[0])       # Oberarm-Stumpf links
        H.rect(d, cx + 14, top + 6, 5, 9, COAT[0])       # Oberarm-Stumpf rechts
        H.rect(d, cx - 17, chest, 34, 11, COAT[1])       # Unterarm-Block
        H.hline(d, cx - 17, chest, 34, COAT[0])          # obere Kante
        H.hline(d, cx - 17, chest + 5, 34, COAT[0])      # Naht zwischen den Armen
        H.hline(d, cx - 17, chest + 11, 34, INK_SOFT)    # Schatten unter den Armen
        H.dither_rect(img, cx, chest + 6, 16, 4, COAT[1], COAT[0], 0.5)  # unterer Arm dunkler
        H.rect(d, cx - 18, chest + 5, 6, 6, SKIN[1])     # Hand unter rechtem Ellbogen
        H.outline(d, cx - 18, chest + 5, 6, 6, SKIN[0])
        H.rect(d, cx + 11, chest - 1, 6, 6, SKIN[1])     # Hand auf linkem Ellbogen
        H.outline(d, cx + 11, chest - 1, 6, 6, SKIN[0])
    else:
        # linker Arm (viewer rechts) immer unten am Koerper
        H.rect(d, cx + 14, top + 6, 6, 30, COAT[1])
        H.rect(d, cx + 14, top + 6, 2, 30, COAT[0])  # Schatten innen
        H.rect(d, cx + 15, top + 34, 6, 5, SKIN[1])  # Hand
        # rechter Arm (viewer links): hebt sich bei Geste
        ax = cx - 20
        if arm <= 0.05:
            H.rect(d, ax, top + 6, 6, 30, COAT[1])
            H.rect(d, ax, top + 6, 2, 30, COAT[1])
            H.rect(d, ax + 1, top + 34, 6, 5, SKIN[1])
        else:
            # gebeugter Arm: Oberarm runter, Unterarm hoch zur Brust/Kopf
            elbow_y = top + 6 + int(20 * (1 - arm * 0.4))
            H.rect(d, ax, top + 6, 6, elbow_y - (top + 6), COAT[1])
            fx = ax + 2
            fy_top = top + 4 - int(arm * 10)
            H.rect(d, fx, fy_top, 6, elbow_y - fy_top, COAT[0])
            # Hand + deutender Zeigefinger
            H.rect(d, fx, fy_top - 4, 6, 5, SKIN[1])
            H.rect(d, fx + 2, fy_top - 8, 2, 5, SKIN[0])  # Finger

    # ---- Hals ----
    H.rect(d, cx - 4, 40 + yb, 8, 7, SKIN[0])

    # ---- Kopf ----
    hy = 16 + yb
    _ell(d, [cx - 12, hy, cx + 12, hy + 26], fill=SKIN[1])
    # Wangen-/Kinnschatten rechts
    H.dither_rect(img, cx + 3, hy + 6, 9, 18, SKIN[1], SKIN[0], 0.5)
    # Ohren
    H.rect(d, cx - 13, hy + 11, 3, 6, SKIN[0])
    H.rect(d, cx + 10, hy + 11, 3, 6, SKIN[0])

    # ---- Haar (wirr, grau) ----
    for (ox, oy, w, h) in [(-12, -2, 10, 9), (-6, -5, 12, 8), (3, -4, 11, 9),
                           (9, 0, 7, 8), (-14, 4, 5, 8), (10, 4, 5, 8)]:
        _ell(d, [cx + ox, hy + oy, cx + ox + w, hy + oy + h], fill=HAIR[1])
    for (ox, oy, w, h) in [(-9, -3, 7, 6), (1, -3, 8, 6), (7, 1, 5, 6)]:
        _ell(d, [cx + ox, hy + oy, cx + ox + w, hy + oy + h], fill=HAIR[0])

    # ---- Augenbrauen ----
    H.rect(d, cx - 8, hy + 9, 6, 2, HAIR[0])
    H.rect(d, cx + 3, hy + 9, 6, 2, HAIR[0])

    # ---- Augen / Brille ----
    ey = hy + 13
    if blink:
        H.hline(d, cx - 8, ey + 1, 6, INK_SOFT)
        H.hline(d, cx + 3, ey + 1, 6, INK_SOFT)
    else:
        H.rect(d, cx - 7, ey, 4, 3, WHITE)
        H.rect(d, cx + 4, ey, 4, 3, WHITE)
        H.rect(d, cx - 6, ey, 2, 3, INK)     # Pupille
        H.rect(d, cx + 5, ey, 2, 3, INK)
    # Brille (Drahtgestell, rund)
    _ell(d, [cx - 9, ey - 2, cx - 2, ey + 5], outline=GLASSES)
    _ell(d, [cx + 2, ey - 2, cx + 9, ey + 5], outline=GLASSES)
    H.hline(d, cx - 2, ey + 1, 4, GLASSES)    # Bruecke
    # Glas-Glanz
    img.putpixel((cx - 7, ey - 1), (*WHITE, 160))
    img.putpixel((cx + 4, ey - 1), (*WHITE, 160))

    # ---- Nase + Mund ----
    H.rect(d, cx - 1, ey + 4, 2, 4, SKIN[0])
    if mouth_open:
        H.rect(d, cx - 3, ey + 10, 6, 3, INK_SOFT)
        H.rect(d, cx - 2, ey + 11, 4, 1, (120, 60, 70))
    else:
        H.hline(d, cx - 3, ey + 11, 6, INK_SOFT)

    return H.selective_outline(img, INK)


def build():
    os.makedirs(OUT, exist_ok=True)
    # Idle-Loop: viel ruhiges Atmen/Blinzeln, laengere Phase verschraenkte
    # Arme, deutende Geste nur einmal pro Runde (war vorher 2 von 8 Frames).
    idle_specs = [
        dict(breath=0), dict(breath=1), dict(breath=2), dict(breath=2),
        dict(breath=1), dict(breath=0), dict(breath=0, blink=True), dict(breath=0),
        dict(breath=1, crossed=True), dict(breath=2, crossed=True),
        dict(breath=2, crossed=True), dict(breath=1, crossed=True),
        dict(breath=0, blink=True, crossed=True), dict(breath=0, crossed=True),
        dict(breath=1, arm=1.0),
    ]
    idle = [draw_molar(**s) for s in idle_specs]
    H.assemble_sheet(idle, os.path.join(OUT, "molar_idle.png"))
    H.save_preview(idle[0], os.path.join(OUT, "molar_idle_preview.png"), 3)
    # Speak-Sheet (2 Frames: zu / auf)
    speak = [draw_molar(breath=0, mouth_open=False),
             draw_molar(breath=0, mouth_open=True)]
    H.assemble_sheet(speak, os.path.join(OUT, "molar_speak.png"))
    print(f"molar_idle.png  : {len(idle)} frames @ {FW}x{FH}")
    print(f"molar_speak.png : {len(speak)} frames @ {FW}x{FH}")


if __name__ == "__main__":
    build()
