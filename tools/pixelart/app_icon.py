"""
App-Store-Assets — App-Icon, Splash & Android-Adaptive-Icon.

Im selben Pixel-Art-Stil wie das Spiel (Palette + Prof. Dr. Molar). Gezeichnet
in NIEDRIGER nativer Aufloesung und per nearest-neighbor hochskaliert, damit die
harten Pixelkanten erhalten bleiben.

Erzeugt:
  assets/icon.png          1024x1024, OPAK (kein Alpha), keine runden Ecken
  assets/splash.png        1024x1024, transparenter Rand (splash.backgroundColor
                           fuellt den Rest), Molar-Motiv mittig
  assets/adaptive-icon.png 1024x1024 Foreground, transparent, Motiv in der
                           Android-Safe-Zone (innere ~66 %) zentriert

Hintergrundfarben werden in app.json gesetzt:
  splash.backgroundColor            = #0d0f17
  android.adaptiveIcon.backgroundColor = #1a2332
"""
import os
from PIL import Image
from palette import (WALL, FLOOR, GROUT, STEEL, GLOW, GLASS, GLASS_HI, ACID,
                     INK, INK_SOFT)
import pixel_helpers as H
from sprite_molar_idle import draw_molar, FW, FH

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets")
SPLASH_BG = (13, 15, 23, 255)   # #0d0f17 — identisch zu splash.backgroundColor


# ----------------------------------------------------------------------
def lab_backdrop(w, h, floor_ratio=0.72):
    """Kompakter Labor-Hintergrund (Wand/Boden/Deckenlampe), Licht oben-links."""
    img, d = H.new_canvas(w, h, (0, 0, 0, 255))
    floor_y = int(h * floor_ratio)
    H.vgradient(img, 0, 0, w, floor_y, WALL[1], WALL[0])
    tile = max(8, w // 8)
    for x in range(0, w, tile):
        H.vline(d, x, 0, floor_y, WALL[0])
    for y in range(0, floor_y, tile):
        H.hline(d, 0, y, w, WALL[0])
    H.rect(d, 0, floor_y - 3, w, 3, WALL[2])
    H.rect(d, 0, floor_y - 3, w, 1, GLOW[0])
    H.tile_floor(img, 0, floor_y, w, h - floor_y, FLOOR, tile=tile, grout=GROUT)
    # Deckenlampe + Lichtkegel
    H.rect(d, w // 2 - tile // 2, 0, tile, 3, STEEL[0])
    H.rect(d, w // 2 - tile // 3, 3, 2 * tile // 3, 2, GLOW[1])
    H.blend_poly(img, [(w // 2 - tile // 3, 5), (w // 2 + tile // 3, 5),
                       (w // 2 + tile, floor_y), (w // 2 - tile, floor_y)],
                 GLOW[1], 28)
    return img, d, floor_y


def little_flask(img, d, cx, base_y):
    """Kleiner Erlenmeyerkolben als Chemie-Akzent (acid-gruen)."""
    H.soft_shadow(img, cx, base_y + 1, 9, 2, 70)
    # Hals
    H.rect(d, cx - 2, base_y - 16, 4, 6, GLASS[1])
    H.rect(d, cx - 3, base_y - 17, 6, 2, GLASS[2])
    # Konischer Koerper
    for i, y in enumerate(range(base_y - 11, base_y)):
        half = 2 + i
        H.rect(d, cx - half, y, half * 2, 1, GLASS[0])
    # Fuellung
    for i, y in enumerate(range(base_y - 5, base_y - 1)):
        half = 6 + i
        H.rect(d, cx - half + 1, y, (half - 1) * 2, 1, ACID[1])
    H.rect(d, cx - 6, base_y - 5, 12, 1, ACID[0])
    # Glanzkante
    H.vline(d, cx - 3, base_y - 9, 6, GLASS_HI)
    img.putpixel((cx - 3, base_y - 14), (*GLASS_HI, 200))


def paste_molar(img, frame, cx, base_y):
    """Molar-Sprite (RGBA) mittig auf base_y stellen."""
    fx = cx - frame.width // 2
    fy = base_y - frame.height
    img.alpha_composite(frame, (fx, fy))


def upscale_save(img, path, target=1024, opaque=False):
    factor = target // img.width
    big = img.resize((img.width * factor, img.height * factor), Image.NEAREST)
    if opaque:
        bg = Image.new("RGB", big.size, SPLASH_BG[:3])
        bg.paste(big, (0, 0), big)
        bg.save(path)
    else:
        big.save(path)
    return big


# ----------------------------------------------------------------------
def build_icon():
    """128 -> 1024, OPAK. Molar (deutend) vor Laborkulisse + Kolben."""
    w = 128
    img, d, floor_y = lab_backdrop(w, w, floor_ratio=0.80)
    little_flask(img, d, w - 22, floor_y + 4)
    molar = draw_molar(breath=0, arm=1.0)          # deutende Geste = ikonisch
    paste_molar(img, molar, cx=w // 2 - 4, base_y=floor_y + 6)
    # dezente Vignette fuer Fokus
    H.blend_rect(img, 0, 0, w, w, INK, 0)
    upscale_save(img, os.path.join(OUT, "icon.png"), 1024, opaque=True)
    print("icon.png          1024x1024  opak (kein Alpha)")


def build_splash():
    """128 -> 1024, transparenter Rand. Atmosphaerisches Molar-Motiv."""
    w = 128
    img, d, floor_y = lab_backdrop(w, w, floor_ratio=0.78)
    # Notlicht-Schimmer (rot) — passt zur Alarm-Stimmung des Spiels
    H.blend_poly(img, [(0, 0), (w, 0), (w, w), (0, w)], (232, 32, 16), 10)
    little_flask(img, d, w - 24, floor_y + 4)
    little_flask(img, d, 22, floor_y + 4)
    molar = draw_molar(breath=1, arm=0.0)
    paste_molar(img, molar, cx=w // 2, base_y=floor_y + 6)
    # weiche Ecken-Abdunklung statt harter Kante (bg #0d0f17 fuellt aussen)
    for i in range(6):
        a = 200 - i * 30
        H.blend_rect(img, 0, 0, w, 1 + i, INK, max(0, a // 6))
    img = H.selective_outline(img, INK) if False else img
    upscale_save(img, os.path.join(OUT, "splash.png"), 1024, opaque=False)
    print("splash.png        1024x1024  transparenter Rand")


def build_adaptive():
    """128 -> 1024 Foreground, transparent. Motiv in der Safe-Zone (~66 %)."""
    w = 128
    img = Image.new("RGBA", (w, w), (0, 0, 0, 0))
    # Safe-Zone: Inhalt in der inneren ~66 % -> Molar etwas kleiner, zentriert
    molar = draw_molar(breath=0, arm=1.0)
    scale = 0.66
    sm = molar.resize((int(FW * scale), int(FH * scale)), Image.NEAREST)
    fx = w // 2 - sm.width // 2
    fy = w // 2 - sm.height // 2
    img.alpha_composite(sm, (fx, fy))
    upscale_save(img, os.path.join(OUT, "adaptive-icon.png"), 1024, opaque=False)
    print("adaptive-icon.png 1024x1024  Foreground, Safe-Zone")


def build():
    os.makedirs(OUT, exist_ok=True)
    build_icon()
    build_splash()
    build_adaptive()


if __name__ == "__main__":
    build()
