"""
Gemeinsame Bausteine fuer die Raetselkammern (Szene 2-5):
einheitlicher Laborraum (Wand/Boden/Lampe), Tisch, Hinweis-Zettel, Display.
Haelt den Stil ueber alle Szenen konsistent.
"""
from palette import (WALL, FLOOR, GROUT, WOOD, STEEL, GLOW, CRT, BRASS,
                     INK, INK_SOFT, WHITE)
import pixel_helpers as H

W, Hh = H.SCENE_W, H.SCENE_H


def room_backdrop(img, d, floor_y=250, accent=None, lamp=True):
    # Wand mit Fliesenraster
    H.vgradient(img, 0, 0, W, floor_y, WALL[1], WALL[0])
    for x in range(0, W, 32):
        H.vline(d, x, 0, floor_y, WALL[0])
    for y in range(0, floor_y, 32):
        H.hline(d, 0, y, W, WALL[0])
    H.rect(d, 0, floor_y - 6, W, 6, WALL[2])
    H.rect(d, 0, floor_y - 6, W, 2, (accent or GLOW[0]))
    # Boden
    H.tile_floor(img, 0, floor_y, W, Hh - floor_y, FLOOR, tile=32, grout=GROUT)
    if lamp:
        H.rect(d, W // 2 - 36, 0, 72, 8, STEEL[0])
        H.rect(d, W // 2 - 28, 8, 56, 6, GLOW[1])
        H.blend_poly(img, [(W // 2 - 28, 14), (W // 2 + 28, 14),
                           (W // 2 + 70, 130), (W // 2 - 70, 130)], GLOW[1], 22)


def table(img, d, x, y, w, h):
    H.soft_shadow(img, x + w // 2, y + h, w // 2 + 10, 6, 70)
    H.rect(d, x, y, w, h, WOOD[1])
    H.rect(d, x, y, w, 4, WOOD[2])
    H.rect(d, x, y + h - 4, w, 4, WOOD[0])
    # Tischbeine
    H.rect(d, x + 4, y + h, 8, 18, WOOD[0])
    H.rect(d, x + w - 12, y + h, 8, 18, WOOD[0])


def note(img, d, x, y):
    """Kleiner Hinweis-Zettel (Hotspot 'Hinweis')."""
    H.rect(d, x, y, 30, 24, WHITE)
    H.outline(d, x, y, 30, 24, INK_SOFT)
    for ly in range(y + 4, y + 22, 4):
        H.hline(d, x + 4, ly, 22, STEEL[0])
    H.rect(d, x + 6, y - 3, 18, 5, BRASS[2])  # Klebestreifen


def display(img, d, x, y, w, h, label_dark=True):
    """Digitales Anzeige-Feld (App schreibt Wert hinein)."""
    H.rect(d, x - 3, y - 3, w + 6, h + 6, STEEL[0])
    H.outline(d, x - 3, y - 3, w + 6, h + 6, INK)
    H.rect(d, x, y, w, h, (2, 18, 10) if label_dark else CRT[0])
    H.outline(d, x, y, w, h, CRT[1])
    # leichte Scanlines
    for ly in range(y, y + h, 2):
        H.hline(d, x, ly, w, (2, 14, 8))
