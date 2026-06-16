"""
CHEMISCHER ESCAPE ROOM — Pixel-Art Helper Library
All drawing primitives used by scene scripts.
"""

from PIL import Image, ImageDraw, ImageFilter
import math, random
from palette import ALL_COLORS, VOID, SHADOW, TEXT_WHITE, PURE_WHITE

# ─── Canvas constants ──────────────────────────────────────────────────────────
NATIVE_W = 256
NATIVE_H = 224
TILE     = 16          # standard tile size in px

# ─── Colour utilities ──────────────────────────────────────────────────────────

def _dist(a, b):
    return sum((x-y)**2 for x,y in zip(a,b))

def snap_to_palette(r, g, b, palette=None):
    """Return the closest palette colour to (r,g,b)."""
    pal = palette or ALL_COLORS
    return min(pal, key=lambda c: _dist(c, (r,g,b)))

def make_palette_image():
    """Return a 1×N palette image for use with Image.quantize()."""
    p = Image.new("P", (1,1))
    flat = []
    for c in ALL_COLORS:
        flat.extend(c)
    flat.extend([0]*(768-len(flat)))
    p.putpalette(flat)
    return p

# ─── Canvas helpers ────────────────────────────────────────────────────────────

def new_canvas(w=NATIVE_W, h=NATIVE_H, bg=None):
    from palette import WALL_MID
    img = Image.new("RGB", (w, h), bg or WALL_MID)
    return img, ImageDraw.Draw(img)

# ─── Tile drawing ──────────────────────────────────────────────────────────────

def draw_tile(img: Image.Image, tx: int, ty: int,
              fill, shadow=None, highlight=None,
              tile=TILE, grout_color=None):
    """Draw a single wall/floor tile at tile-coordinates (tx,ty)."""
    from palette import TILE_GROUT
    draw = ImageDraw.Draw(img)
    x0, y0 = tx*tile, ty*tile
    x1, y1 = x0+tile-1, y0+tile-1
    # Fill
    draw.rectangle([x0,y0, x1,y1], fill=fill)
    # Grout line (right and bottom edge)
    gc = grout_color or TILE_GROUT
    draw.line([x1,y0, x1,y1], fill=gc)
    draw.line([x0,y1, x1,y1], fill=gc)
    # Optional bevel
    if highlight:
        draw.line([x0,y0, x1,y0], fill=highlight)
        draw.line([x0,y0, x0,y1], fill=highlight)
    if shadow:
        draw.line([x1,y0+1, x1,y1], fill=shadow)
        draw.line([x0+1,y1, x1,y1], fill=shadow)

def draw_wall_tiles(img, x0, y0, x1, y1,
                    color_dark, color_mid, color_light, grout):
    """Fill a rectangle with wall tiles, alternating light/dark subtly."""
    from palette import TILE_GROUT
    draw = ImageDraw.Draw(img)
    for ty in range(y0, y1, TILE):
        for tx in range(x0, x1, TILE):
            row = (ty // TILE) % 2
            col = (tx // TILE) % 2
            fill = color_dark if (row+col) % 2 == 0 else color_mid
            draw.rectangle([tx, ty, tx+TILE-1, ty+TILE-1], fill=fill)
            draw.line([tx+TILE-1, ty, tx+TILE-1, ty+TILE-1], fill=grout)
            draw.line([tx, ty+TILE-1, tx+TILE-1, ty+TILE-1], fill=grout)

# ─── Dithering ─────────────────────────────────────────────────────────────────

def dither_gradient(img, x0, y0, x1, y1,
                    color_a, color_b, axis='y', pattern='bayer'):
    """
    Fill a rectangle with a dithered gradient from color_a to color_b.
    axis='y': top→bottom, 'x': left→right.
    pattern: 'bayer' (ordered 4×4) or 'floyd' (error-diffusion, slower).
    """
    draw = ImageDraw.Draw(img)
    w = x1 - x0 + 1
    h = y1 - y0 + 1
    # Bayer 4×4 threshold matrix (0-15)
    BAYER = [
        [ 0,  8,  2, 10],
        [12,  4, 14,  6],
        [ 3, 11,  1,  9],
        [15,  7, 13,  5],
    ]
    if pattern == 'bayer':
        for py in range(h):
            for px in range(w):
                t = py/max(h-1,1) if axis == 'y' else px/max(w-1,1)
                # continuous blend
                r = int(color_a[0]*(1-t) + color_b[0]*t)
                g = int(color_a[1]*(1-t) + color_b[1]*t)
                b = int(color_a[2]*(1-t) + color_b[2]*t)
                # Bayer quantise to nearest palette colour among the two
                threshold = BAYER[py % 4][px % 4] / 15.0
                pick = color_b if t > threshold else color_a
                img.putpixel((x0+px, y0+py), pick)

def dither_radial(img, cx, cy, r_inner, r_outer,
                  color_center, color_edge):
    """Dithered radial gradient (e.g. for a glow or lamp cone)."""
    BAYER = [
        [ 0,  8,  2, 10],
        [12,  4, 14,  6],
        [ 3, 11,  1,  9],
        [15,  7, 13,  5],
    ]
    for dy in range(-r_outer, r_outer+1):
        for dx in range(-r_outer, r_outer+1):
            dist = math.sqrt(dx*dx + dy*dy)
            if dist > r_outer:
                continue
            px, py = cx+dx, cy+dy
            if px < 0 or py < 0 or px >= img.width or py >= img.height:
                continue
            t = max(0, (dist - r_inner) / max(r_outer - r_inner, 1))
            t = min(1, t)
            threshold = BAYER[py % 4][px % 4] / 15.0
            pick = color_edge if t > threshold else color_center
            img.putpixel((px, py), pick)

# ─── Glass / Liquid helpers ────────────────────────────────────────────────────

def draw_glass_rect(img, x0, y0, x1, y1,
                    body, highlight, shadow, shine_x=None):
    """Draw a glass container rectangle (beaker wall, vial, etc.)."""
    draw = ImageDraw.Draw(img)
    # body fill
    draw.rectangle([x0+1, y0+1, x1-1, y1-1], fill=body)
    # left edge (shine)
    draw.line([x0, y0, x0, y1], fill=highlight)
    if shine_x:
        draw.line([shine_x, y0, shine_x, y1], fill=highlight)
    # right & bottom shadow
    draw.line([x1, y0, x1, y1], fill=shadow)
    draw.line([x0, y1, x1, y1], fill=shadow)
    # top edge
    draw.line([x0, y0, x1, y0], fill=highlight)

def draw_liquid(img, x0, y0, x1, y1, color, surface_highlight):
    """Draw liquid inside a glass container (flat top with highlight line)."""
    draw = ImageDraw.Draw(img)
    draw.rectangle([x0+1, y0+1, x1-1, y1-1], fill=color)
    draw.line([x0+1, y0+1, x1-1, y0+1], fill=surface_highlight)

# ─── Outline helper ────────────────────────────────────────────────────────────

def selective_outline(img, regions, outline_color=None):
    """
    Draw selective outlines around a list of (x0,y0,x1,y1) rectangles.
    Uses VOID as default — only outlines bottom and right sides to avoid
    over-bordering packed UI elements.
    """
    oc = outline_color or VOID
    draw = ImageDraw.Draw(img)
    for (x0, y0, x1, y1) in regions:
        draw.rectangle([x0, y0, x1, y1], outline=oc)

def pixel_outline(img, x, y, w, h, color=None):
    """1-px outline around a sprite bounding box."""
    draw = ImageDraw.Draw(img)
    draw.rectangle([x-1, y-1, x+w, y+h], outline=color or VOID)

# ─── Glow / CRT helpers ───────────────────────────────────────────────────────

def draw_glow(img, cx, cy, radius, glow_color, intensity=2):
    """Simple pixelated glow: draws concentric circles with dithering."""
    for r in range(radius, 0, -1):
        t = r / radius
        # only draw every other ring at half intensity
        if r % 2 == 0:
            draw = ImageDraw.Draw(img)
            draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=glow_color)

def draw_scanlines(img, alpha=80):
    """
    Overlay CRT scanlines on the whole image.
    Every even row gets a dark band drawn over it (RGBA blend).
    Works in-place on an RGB image via pixel manipulation.
    """
    w, h = img.size
    pixels = img.load()
    for y in range(0, h, 2):
        for x in range(w):
            r, g, b = pixels[x, y]
            pixels[x, y] = (
                max(0, r - alpha),
                max(0, g - alpha),
                max(0, b - alpha),
            )

def apply_vignette(img, strength=60):
    """Darken corners for CRT vignette feel."""
    w, h = img.size
    cx, cy = w/2, h/2
    pixels = img.load()
    for y in range(h):
        for x in range(w):
            dx = (x - cx) / cx
            dy = (y - cy) / cy
            dist = math.sqrt(dx*dx + dy*dy)
            dark = int(min(1.0, dist**2) * strength)
            r, g, b = pixels[x, y]
            pixels[x, y] = (max(0,r-dark), max(0,g-dark), max(0,b-dark))

# ─── Text / Bitmap font ────────────────────────────────────────────────────────

# Minimal 5×7 bitmap font for uppercase + digits + basic punctuation.
# Each character is a list of 7 rows of 5 bits (1=ink, 0=blank).
_FONT5 = {
    'A':['01110','10001','10001','11111','10001','10001','10001'],
    'B':['11110','10001','10001','11110','10001','10001','11110'],
    'C':['01111','10000','10000','10000','10000','10000','01111'],
    'D':['11110','10001','10001','10001','10001','10001','11110'],
    'E':['11111','10000','10000','11110','10000','10000','11111'],
    'F':['11111','10000','10000','11110','10000','10000','10000'],
    'G':['01111','10000','10000','10111','10001','10001','01111'],
    'H':['10001','10001','10001','11111','10001','10001','10001'],
    'I':['01110','00100','00100','00100','00100','00100','01110'],
    'J':['00111','00010','00010','00010','10010','10010','01100'],
    'K':['10001','10010','10100','11000','10100','10010','10001'],
    'L':['10000','10000','10000','10000','10000','10000','11111'],
    'M':['10001','11011','10101','10101','10001','10001','10001'],
    'N':['10001','11001','10101','10011','10001','10001','10001'],
    'O':['01110','10001','10001','10001','10001','10001','01110'],
    'P':['11110','10001','10001','11110','10000','10000','10000'],
    'Q':['01110','10001','10001','10001','10101','10010','01101'],
    'R':['11110','10001','10001','11110','10100','10010','10001'],
    'S':['01111','10000','10000','01110','00001','00001','11110'],
    'T':['11111','00100','00100','00100','00100','00100','00100'],
    'U':['10001','10001','10001','10001','10001','10001','01110'],
    'V':['10001','10001','10001','10001','10001','01010','00100'],
    'W':['10001','10001','10001','10101','10101','10101','01010'],
    'X':['10001','10001','01010','00100','01010','10001','10001'],
    'Y':['10001','10001','01010','00100','00100','00100','00100'],
    'Z':['11111','00001','00010','00100','01000','10000','11111'],
    '0':['01110','10001','10011','10101','11001','10001','01110'],
    '1':['00100','01100','00100','00100','00100','00100','01110'],
    '2':['01110','10001','00001','00010','00100','01000','11111'],
    '3':['11111','00001','00010','00110','00001','10001','01110'],
    '4':['00010','00110','01010','10010','11111','00010','00010'],
    '5':['11111','10000','11110','00001','00001','10001','01110'],
    '6':['00110','01000','10000','11110','10001','10001','01110'],
    '7':['11111','00001','00010','00100','01000','01000','01000'],
    '8':['01110','10001','10001','01110','10001','10001','01110'],
    '9':['01110','10001','10001','01111','00001','00010','01100'],
    '.':['00000','00000','00000','00000','00000','01100','01100'],
    ':':['00000','01100','01100','00000','01100','01100','00000'],
    '!':['00100','00100','00100','00100','00100','00000','00100'],
    '?':['01110','10001','00001','00010','00100','00000','00100'],
    ' ':['00000','00000','00000','00000','00000','00000','00000'],
    '-':['00000','00000','00000','11111','00000','00000','00000'],
    '/':['00001','00010','00100','01000','10000','00000','00000'],
    ',':['00000','00000','00000','00000','01100','01100','10000'],
    '▼':['00000','11111','01110','00100','00000','00000','00000'],
    '_':['00000','00000','00000','00000','00000','00000','11111'],
    "'":['00100','00100','00000','00000','00000','00000','00000'],
    '"':['01010','01010','00000','00000','00000','00000','00000'],
}

def draw_text(img, text, x, y, color=None, scale=1):
    """
    Render uppercase pixel text using the 5×7 bitmap font.
    scale: integer pixel size per font pixel (1=native, 2=doubled…)
    """
    col = color or TEXT_WHITE
    draw = ImageDraw.Draw(img)
    cx = x
    for ch in text.upper():
        rows = _FONT5.get(ch, _FONT5[' '])
        for ry, row in enumerate(rows):
            for rx, bit in enumerate(row):
                if bit == '1':
                    px = cx + rx * scale
                    py = y + ry * scale
                    draw.rectangle([px, py, px+scale-1, py+scale-1], fill=col)
        cx += (5 + 1) * scale   # char width + 1px gap

def text_width(text, scale=1):
    return len(text) * 6 * scale

# ─── Export ────────────────────────────────────────────────────────────────────

def export(img, path, preview_scale=4, scanlines=False, vignette=False):
    """
    Save native-res PNG and a ×preview_scale preview.
    nearest-neighbor upscale — no blurring.
    """
    import os
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)
    w, h = img.size
    preview = img.resize((w*preview_scale, h*preview_scale), Image.NEAREST)
    if scanlines:
        draw_scanlines(preview)
    if vignette:
        apply_vignette(preview)
    preview_path = path.replace('.png', f'_x{preview_scale}.png')
    preview.save(preview_path)
    print(f"Saved {path}  ({w}×{h})")
    print(f"Saved {preview_path}  ({w*preview_scale}×{h*preview_scale})")
    return path, preview_path
