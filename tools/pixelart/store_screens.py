"""
App-Store-Screenshots (Querformat) fuer iPad und iPhone.

Das Spiel rendert eine feste 640x360-Buehne, skaliert per "contain"
(scale = min(w/640, h/360)) und zentriert — genau wie in der App. Daraus ergibt
sich Letterbox (iPad: Balken oben/unten) bzw. Pillarbox (iPhone-Querformat:
Balken links/rechts), Fuellfarbe #0d0f17. Titel/Untertitel liegen in
halbtransparenten Baendern oben/unten.

Groessen (App Store Connect, Querformat):
  iPad 12,9" Pro : 2732 x 2048
  iPhone 6,9"    : 2868 x 1320

HINWEIS: Szenen-Hintergruende ohne interaktive UI-Overlays. Fuer die finale
Einreichung echte Screenshots aus der laufenden App bevorzugen.
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
SCENES = os.path.join(ROOT, "assets", "scenes")
OUT = os.path.join(ROOT, "store-assets", "ios")
BG = (13, 15, 23)
GREEN = (111, 232, 122)
GREY = (185, 196, 210)

DEVICES = [
    ("ipad-12.9", (2732, 2048)),
    ("iphone-6.9", (2868, 1320)),
]

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


def render(canvas_size, fn, title, sub, out):
    cw, ch = canvas_size
    scale = min(cw / 640, ch / 360)
    sw, sh = round(640 * scale), round(360 * scale)
    x0, y0 = (cw - sw) // 2, (ch - sh) // 2

    canvas = Image.new("RGB", (cw, ch), BG)
    scene = Image.open(os.path.join(SCENES, fn)).convert("RGB").resize((sw, sh), Image.NEAREST)
    canvas.paste(scene, (x0, y0))

    band = max(y0, int(ch * 0.11))            # Caption-Band-Hoehe
    ov = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)
    od.rectangle([0, 0, cw, band], fill=(13, 15, 23, 205))
    od.rectangle([0, ch - band, cw, ch], fill=(13, 15, 23, 205))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), ov).convert("RGB")

    d = ImageDraw.Draw(canvas)
    tf, sf = font(int(band * 0.40)), font(int(band * 0.26), bold=False)
    d.text((cw // 2, band // 2), title, font=tf, fill=GREEN, anchor="mm")
    d.text((cw // 2, ch - band // 2), sub, font=sf, fill=GREY, anchor="mm")
    canvas.save(out)


def build():
    for dname, size in DEVICES:
        d = os.path.join(OUT, dname)
        os.makedirs(d, exist_ok=True)
        for i, (fn, title, sub) in enumerate(SHOTS, 1):
            render(size, fn, title, sub, os.path.join(d, f"{dname}_{i:02d}.png"))
        print(f"{dname}: {len(SHOTS)} screenshots @ {size[0]}x{size[1]}")


if __name__ == "__main__":
    build()
