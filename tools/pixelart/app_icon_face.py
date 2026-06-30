"""
App-Icon-Variante: Prof. Dr. Molars GESICHT gross im Vordergrund.

Zoomt per nearest-neighbor in den Kopf des Idle-Sprites (harte Pixelkanten
bleiben erhalten) und stellt ihn vor die Laborkulisse mit weichem Lichthof.
Erzeugt assets/icon.png (1024x1024, OPAK — kein Alpha, keine runden Ecken;
iOS rundet selbst). Splash & Adaptive-Icon bleiben von app_icon.py erzeugt.
"""
import os
from PIL import Image, ImageDraw
from palette import GLOW, INK
import pixel_helpers as H
from sprite_molar_idle import draw_molar
from app_icon import lab_backdrop, upscale_save, OUT


def build_icon_face():
    w = 128
    img, d, floor_y = lab_backdrop(w, w, floor_ratio=0.96)

    # Weicher Lichthof hinter dem Kopf — stellt das Gesicht frei.
    glow = Image.new("RGBA", (w, w), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([w // 2 - 48, 8, w // 2 + 48, 112], fill=(*GLOW[1], 48))
    img.alpha_composite(glow)

    # Molar zeichnen, Kopf + Halsansatz herausschneiden, gross hineinzoomen.
    molar = draw_molar(breath=0, arm=0.0, mouth=2)
    head = molar.crop((20, 9, 53, 47))            # 33x38: Haar bis Kragenansatz
    SCALE = 3
    big = head.resize((head.width * SCALE, head.height * SCALE), Image.NEAREST)
    hx = w // 2 - big.width // 2
    hy = w // 2 - big.height // 2 - 6             # leicht nach oben (Portrait)
    img.alpha_composite(big, (hx, hy))

    # Dezente Ecken-Abdunklung als Vignette (Fokus auf das Gesicht).
    for i in range(10):
        a = max(0, 90 - i * 12)
        H.blend_rect(img, 0, i, w, 1, INK, a // 8)
        H.blend_rect(img, 0, w - 1 - i, w, 1, INK, a // 8)

    upscale_save(img, os.path.join(OUT, "icon.png"), 1024, opaque=True)
    print("icon.png (Gesicht) 1024x1024  opak (kein Alpha)")


if __name__ == "__main__":
    build_icon_face()
