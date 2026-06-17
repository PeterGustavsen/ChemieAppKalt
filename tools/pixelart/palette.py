"""
============================================================
 CHEMISCHER ESCAPE ROOM  —  Master-Palette
============================================================
Eine feste, von ALLEN Asset-Skripten importierte Palette.
Stimmung: dichtes Chemielabor — Teal/Petrol-Waende, Holz/Messing,
Glas-Cyan, Chemikalien-Akzente. Ramps (3-4 Stufen) sorgen fuer
konsistentes Licht (Lichtquelle pro Szene oben-links).

Aufloesung der Spiele-Assets: 640x360 ("high-res pixel art").
Max. ~48 Farben. Siehe STYLE.md fuer Regeln.

Benutzung:
    from palette import PAL, RAMP
    color = PAL["wall_3"]          # (r,g,b)
    ramp  = RAMP["wall"]           # [dark -> light]
"""

# ---- Outlines / Tiefe -------------------------------------------------
INK      = (13, 15, 23)      # fast-schwarze, selektive Outline
INK_SOFT = (26, 30, 44)      # weiche Outline / tiefer Schatten

# ---- Wand (Petrol/Teal), Lichtquelle oben-links -----------------------
WALL = [(18, 47, 54), (32, 80, 90), (54, 116, 126)]

# ---- Boden (kuehles Grau-Blau) ----------------------------------------
FLOOR = [(31, 35, 46), (45, 52, 67), (66, 76, 95)]
GROUT = (22, 26, 35)

# ---- Holz (Laborbank, Tueren) -----------------------------------------
WOOD = [(58, 38, 22), (96, 62, 34), (146, 96, 54)]

# ---- Messing / Gold (Apparate, Beschlaege) ----------------------------
BRASS = [(107, 79, 29), (164, 121, 38), (224, 180, 76)]

# ---- Stahl / Metall ---------------------------------------------------
STEEL = [(45, 55, 72), (84, 96, 116), (140, 153, 172)]

# ---- Glas (Cyan, halbtransparent wirkend) -----------------------------
GLASS = [(31, 111, 122), (58, 163, 176), (111, 211, 221), (184, 240, 245)]
GLASS_HI = (234, 252, 255)

# ---- Chemikalien / Fluessigkeiten -------------------------------------
ACID  = [(46, 140, 74), (111, 224, 138)]   # Saeure / Indikator gruen
BASE  = [(47, 111, 208), (91, 155, 240)]   # Base / Lauge blau
PINK  = [(176, 58, 134), (227, 111, 176)]  # Phenolphthalein pink
PURPLE= [(126, 72, 168)]                    # Universalindikator
ORANGE= [(176, 84, 30), (240, 145, 58)]    # Methylorange / Flamme-Glut

# ---- CRT-Terminal (Phosphor) ------------------------------------------
CRT   = [(16, 48, 24), (47, 143, 58), (111, 232, 122)]  # gruenes Phosphor
CRT_AMBER = (240, 178, 58)

# ---- Licht / Lampen ---------------------------------------------------
GLOW  = [(247, 224, 138), (255, 244, 194)]

# ---- Prof. Dr. Molar --------------------------------------------------
SKIN  = [(201, 138, 94), (230, 180, 138)]
COAT  = [(176, 188, 204), (236, 242, 250)]  # Laborkittel (Schatten, Licht)
HAIR  = [(138, 147, 164), (181, 189, 201)]                   # wirres Grau
GLASSES = (26, 31, 43)

# ---- UI / Status ------------------------------------------------------
RED   = [(173, 53, 53), (240, 107, 107)]   # Alarm / Fehler
GREEN_OK = (111, 232, 122)                 # geloest / korrekt
WHITE = (244, 248, 255)
SHADOW = (0, 0, 0)                          # nur mit Alpha (nicht in PAL gezaehlt)

# ======================================================================
#  Zugriffstabellen
# ======================================================================
RAMP = {
    "wall": WALL, "floor": FLOOR, "wood": WOOD, "brass": BRASS,
    "steel": STEEL, "glass": GLASS, "acid": ACID, "base": BASE,
    "pink": PINK, "purple": PURPLE, "orange": ORANGE, "crt": CRT,
    "glow": GLOW, "skin": SKIN, "coat": COAT, "hair": HAIR, "red": RED,
}

PAL = {"ink": INK, "ink_soft": INK_SOFT, "grout": GROUT, "glass_hi": GLASS_HI,
       "crt_amber": CRT_AMBER, "glasses": GLASSES, "green_ok": GREEN_OK,
       "white": WHITE}
for _name, _ramp in RAMP.items():
    for _i, _c in enumerate(_ramp):
        PAL[f"{_name}_{_i}"] = _c


def all_colors():
    """Eindeutige Farben der Palette (zur Validierung der ~48-Grenze)."""
    seen = []
    for c in PAL.values():
        if c not in seen:
            seen.append(c)
    return seen


if __name__ == "__main__":
    cols = all_colors()
    print(f"Palette: {len(cols)} eindeutige Farben (Ziel <= ~48)")
    assert len(cols) <= 50, "Palette zu gross!"
    print("OK")
