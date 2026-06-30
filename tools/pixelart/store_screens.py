"""
App-Store-Screenshots im iPad-Format (12,9" iPad Pro, Querformat 2732x2048).

Das Spiel rendert eine feste 640x360-Buehne, auf dem iPad auf volle Breite
skaliert -> Letterbox-Balken oben/unten (#0d0f17). Genau das wird hier aus der
Szenen-Pixelgrafik nachgebaut, plus Titel-Caption in den Balken.

HINWEIS: Diese Bilder zeigen die Szenen-Hintergruende ohne die interaktiven
UI-Overlays (Chips/Knoepfe/Dialoge). Fuer die finale Einreichung echte
Screenshots aus der laufenden App (TestFlight/Simulator) bevorzugen.
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
SCENES = os.path.join(ROOT, "assets", "scenes")
OUT = os.path.join(ROOT, "store-assets", "ios", "ipad-12.9")
BG = (13, 15, 23)
CANVAS = (2732, 2048)          # 12,9" iPad Pro, Querformat
GREEN = (111, 232, 122)
GREY = (170, 182, 198)

SHOTS = [
    ("scene_01_lab_hub.png", "PROF. DR. MOLARS LABOR",
     "Sechs verschluesselte Kammern. 30 Minuten. Entkommen."),
    ("scene_02_galvanic.png", "GALVANISCHE ZELLE",
     "Baue die Zelle aus der Spannungsreihe — triff die EMK."),
    ("scene_03_opferanode.png", "OPFERANODE",
     "Welches Metall opfert sich und schuetzt das Eisen?"),
    ("scene_05_bromonium.png", "BROMONIUM-MECHANISMUS",
     "Ordne die Schritte der elektrophilen Addition."),
    ("scene_07_isomerie.png", "E / Z - ISOMERIE",
     "Bestimme nach den CIP-Regeln: E oder Z."),
]


def font(sz, bold=True):
    cands = [r"C:\Windows\Fonts\consolab.ttf", r"C:\Windows\Fonts\consola.ttf"]
    for p in (cands if bold else cands[::-1]):
        if os.path.exists(p):
            return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


def build():
    os.makedirs(OUT, exist_ok=True)
    cw, ch = CANVAS
    sw, sh = cw, round(cw * 360 / 640)        # 2732 x 1536
    y0 = (ch - sh) // 2                         # 256px Balken oben/unten
    tf, sf = font(112), font(60, bold=False)
    for i, (fn, title, sub) in enumerate(SHOTS, 1):
        canvas = Image.new("RGB", CANVAS, BG)
        scene = Image.open(os.path.join(SCENES, fn)).convert("RGB")
        canvas.paste(scene.resize((sw, sh), Image.NEAREST), (0, y0))
        d = ImageDraw.Draw(canvas)
        d.text((cw // 2, y0 // 2), title, font=tf, fill=GREEN, anchor="mm")
        d.text((cw // 2, ch - y0 // 2), sub, font=sf, fill=GREY, anchor="mm")
        canvas.save(os.path.join(OUT, f"ipad_{i:02d}.png"))
        print(f"ipad_{i:02d}.png  {title}")


if __name__ == "__main__":
    build()
