"""
============================================================
 Pixel-Art Helfer  —  gemeinsame Zeichen-Primitive
============================================================
Alles arbeitet auf RGBA-Bildern in NATIVER Aufloesung (640x360 fuer
Szenen). Kein Anti-Aliasing, harte Kanten. Skalierung passiert in der
App per nearest-neighbor; hier wird nur 1:1 gezeichnet.

Konventionen:
  - Lichtquelle pro Szene oben-links -> Highlights oben/links,
    Schatten unten/rechts.
  - Dithering (Bayer 4x4) fuer Verlaeufe, Glas, Licht.
  - Selektive dunkle Outlines (INK) statt flaechig.
"""
from PIL import Image, ImageDraw

SCENE_W, SCENE_H = 640, 360

# 4x4 Bayer-Matrix (0..15) fuer ordered dithering
BAYER4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
]


def new_canvas(w=SCENE_W, h=SCENE_H, bg=(0, 0, 0, 0)):
    img = Image.new("RGBA", (w, h), bg)
    return img, ImageDraw.Draw(img)


def rect(d, x, y, w, h, color):
    if w <= 0 or h <= 0:
        return
    d.rectangle([x, y, x + w - 1, y + h - 1], fill=_c(color))


def outline(d, x, y, w, h, color, t=1):
    """Hohle Box (Outline)."""
    for i in range(t):
        d.rectangle([x + i, y + i, x + w - 1 - i, y + h - 1 - i], outline=_c(color))


def hline(d, x, y, w, color):
    d.line([x, y, x + w - 1, y], fill=_c(color))


def vline(d, x, y, h, color):
    d.line([x, y, x, y + h - 1], fill=_c(color))


def dither_rect(img, x, y, w, h, c_lo, c_hi, ratio=0.5):
    """Bayer-Dither zwischen zwei Farben. ratio=Anteil c_hi (0..1)."""
    px = img.load()
    thr = int(ratio * 16)
    c_lo, c_hi = _c(c_lo), _c(c_hi)
    for yy in range(y, min(y + h, img.height)):
        for xx in range(x, min(x + w, img.width)):
            b = BAYER4[yy & 3][xx & 3]
            px[xx, yy] = c_hi if b < thr else c_lo


def vgradient(img, x, y, w, h, top, bottom, dither=True):
    """Vertikaler Verlauf top->bottom, optional gedithert an den Stufen."""
    px = img.load()
    top, bottom = _c(top), _c(bottom)
    for yy in range(h):
        t = yy / max(1, h - 1)
        base = _lerp(top, bottom, t)
        for xx in range(x, min(x + w, img.width)):
            gy = y + yy
            if gy >= img.height:
                break
            if dither:
                b = BAYER4[gy & 3][xx & 3] / 16.0
                # leichtes Auf-/Ab-Dithern fuer weiche Baender
                t2 = min(1.0, max(0.0, t + (b - 0.5) * (1.0 / max(1, h)) * 6))
                px[xx, gy] = _lerp(top, bottom, t2)
            else:
                px[xx, gy] = base


def tile_floor(img, x, y, w, h, ramp, tile=32, grout=None):
    """Bodenfliesen mit Fugen; vordere Reihen heller (Licht oben-links)."""
    d = ImageDraw.Draw(img)
    rows = (h + tile - 1) // tile
    for r in range(rows):
        ty = y + r * tile
        # weiter hinten = dunkler
        shade = ramp[max(0, min(len(ramp) - 1, 2 - r % 2))]
        rect(d, x, ty, w, min(tile, y + h - ty), shade)
    if grout is not None:
        for r in range(rows + 1):
            hline(d, x, y + r * tile, w, grout)
        for cx in range(x, x + w + 1, tile):
            vline(d, cx, y, h, grout)


def selective_outline(img, color=(13, 15, 23), alpha_thresh=40):
    """Dunkle 1px-Outline um undurchsichtige Bereiche (aussen)."""
    src = img.load()
    out = img.copy()
    o = out.load()
    W, H = img.size
    col = (color[0], color[1], color[2], 255)
    for yy in range(H):
        for xx in range(W):
            if src[xx, yy][3] >= alpha_thresh:
                continue
            # leerer Pixel: angrenzend an Fuellung? -> Outline
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = xx + dx, yy + dy
                if 0 <= nx < W and 0 <= ny < H and src[nx, ny][3] >= alpha_thresh:
                    o[xx, yy] = col
                    break
    return out


def soft_shadow(img, cx, cy, rx, ry, alpha=90):
    """Elliptischer Bodenschatten — korrekt alpha-kompositiert (nicht ersetzt)."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    dd = ImageDraw.Draw(layer)
    for i in range(3):
        a = int(alpha * (1 - i / 3))
        dd.ellipse([cx - rx + i * 2, cy - ry + i, cx + rx - i * 2, cy + ry - i],
                   fill=(0, 0, 0, a))
    img.alpha_composite(layer)


def blend_poly(img, points, color, alpha):
    """Halbtransparentes Polygon korrekt ueber das Bild kompositieren."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).polygon(points, fill=(color[0], color[1], color[2], alpha))
    img.alpha_composite(layer)


def blend_rect(img, x, y, w, h, color, alpha):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).rectangle([x, y, x + w - 1, y + h - 1],
                                    fill=(color[0], color[1], color[2], alpha))
    img.alpha_composite(layer)


# ---- Sprite-Sheets ----------------------------------------------------
def assemble_sheet(frames, path, pad=0):
    """Horizontales Sprite-Sheet aus gleich-grossen Frames."""
    fw, fh = frames[0].size
    sheet = Image.new("RGBA", (fw * len(frames) + pad * (len(frames) - 1), fh),
                      (0, 0, 0, 0))
    for i, f in enumerate(frames):
        sheet.paste(f, (i * (fw + pad), 0))
    sheet.save(path)
    return sheet


def save_png(img, path):
    img.save(path)
    return img


def save_preview(img, path, factor=3):
    """Nearest-neighbor Upscale zur Sichtkontrolle (nicht fuers Spiel)."""
    big = img.resize((img.width * factor, img.height * factor), Image.NEAREST)
    big.save(path)
    return big


# ---- intern -----------------------------------------------------------
def _c(c):
    if len(c) == 3:
        return (c[0], c[1], c[2], 255)
    return c


def _lerp(a, b, t):
    return (
        int(a[0] + (b[0] - a[0]) * t),
        int(a[1] + (b[1] - a[1]) * t),
        int(a[2] + (b[2] - a[2]) * t),
        int((a[3] if len(a) > 3 else 255) + ((b[3] if len(b) > 3 else 255) - (a[3] if len(a) > 3 else 255)) * t),
    )
