"""
Prof. Dr. Molar — Character Sprite
Two frames: IDLE and SPEAKING (mouth open).
Output: assets/scenes/molar_idle.png + molar_speak.png + molar_sheet_x4.png
Native size: 32×48 px per frame (fits on SNES 256×224 scene).
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from PIL import Image, ImageDraw
from palette import (
    VOID, SHADOW, DARK_BLUE,
    WALL_LIGHT, WALL_BRIGHT,
    WOOD_MID,
    METAL_DARK, METAL_MID, METAL_LIGHT,
    BRASS_DARK, BRASS_MID, BRASS_LIGHT,
    GLASS_DARK, GLASS_MID, GLASS_LIGHT, GLASS_SHINE,
    ACID_MID,
    TEXT_WHITE, TEXT_DIM, PURE_WHITE,
    FLOOR_MID, FLOOR_LIGHT, FLOOR_DARK,
    WOOD_DARK, WOOD_LIGHT,
    WALL_MID, WALL_DARK
)
from pixel_helpers import export

# Sprite dimensions
SW, SH = 32, 48

# ── Skin tones (approximated from palette via nearest) ─────────────────────────
SKIN_DARK   = WOOD_DARK       # (#3a2616) — eye socket, chin shadow
SKIN_MID    = BRASS_MID       # (#a87c28) — main face
SKIN_LIGHT  = BRASS_LIGHT     # (#d4a848) — forehead highlight
HAIR        = METAL_LIGHT     # (#888c98) — grey hair
HAIR_DARK   = METAL_MID       # (#585c68) — hair shadow
COAT        = TEXT_WHITE      # (#e0e4d8) — lab coat
COAT_SHADOW = TEXT_DIM        # (#889888) — coat in shadow
COAT_DARK   = METAL_MID       # (#585c68) — deep coat shadow / creases
GLASS_FRAME = METAL_DARK      # (#383840) — glasses frame
EYE_COLOR   = GLASS_MID       # (#2880a0) — eyes (behind glass)
PANT        = DARK_BLUE       # (#1c243c) — trousers

def draw_molar_frame(speaking=False):
    img = Image.new("RGB", (SW, SH), (0, 255, 0))  # green = transparent key
    d   = ImageDraw.Draw(img)
    BG  = (0, 255, 0)

    # ── BODY / COAT ─────────────────────────────────────────────────────────
    # Torso (slightly hunched — coat body narrower at top)
    # Coat main body
    d.rectangle([10, 22, 21, 42], fill=COAT)
    # Coat shadow sides
    d.line([10, 22, 10, 42], fill=COAT_SHADOW)
    d.line([21, 22, 21, 42], fill=COAT_SHADOW)
    # Coat lapels (V-neck area)
    d.polygon([(13,22),(15,28),(13,28)], fill=COAT_SHADOW)
    d.polygon([(18,22),(16,28),(18,28)], fill=COAT_SHADOW)
    # Coat bottom darker band
    d.rectangle([10, 39, 21, 42], fill=COAT_SHADOW)
    # Stain on coat (chemical blotch — ACID_MID pixel cluster)
    d.point([(16,30),(17,30),(16,31)], fill=ACID_MID)
    d.point([(17,31)], fill=GLASS_MID)

    # Pocket (left breast)
    d.rectangle([11,26,13,29], fill=COAT_SHADOW)
    d.line([11,26,13,26], fill=COAT)

    # Arms (slightly bent — hunched posture)
    # Left arm
    d.rectangle([6, 23, 9, 38], fill=COAT)
    d.line([6, 23, 6, 38], fill=COAT_SHADOW)
    # Left hand
    d.rectangle([5, 36, 9, 40], fill=SKIN_MID)
    d.line([5,36,9,36], fill=SKIN_LIGHT)

    # Right arm (holding slightly forward)
    d.rectangle([22, 23, 25, 36], fill=COAT)
    d.line([25, 23, 25, 36], fill=COAT_SHADOW)
    # Right hand
    d.rectangle([22, 34, 26, 38], fill=SKIN_MID)
    d.line([22,34,26,34], fill=SKIN_LIGHT)

    # Trousers
    d.rectangle([10, 42, 15, 47], fill=PANT)
    d.rectangle([16, 42, 21, 47], fill=PANT)
    d.line([10,42,21,42], fill=COAT_DARK)
    d.line([15,42,16,47], fill=SHADOW)   # crease

    # Shoes
    d.rectangle([8, 46, 15, 47], fill=SHADOW)
    d.rectangle([16, 46, 23, 47], fill=SHADOW)

    # ── NECK ────────────────────────────────────────────────────────────────
    d.rectangle([13, 18, 18, 22], fill=SKIN_MID)

    # ── HEAD ─────────────────────────────────────────────────────────────────
    # Head shape (slightly egg-shaped, old man)
    d.ellipse([8, 6, 23, 21], fill=SKIN_MID)
    # Forehead highlight
    d.ellipse([11, 7, 19, 13], fill=SKIN_LIGHT)
    # Chin shadow
    d.ellipse([11, 17, 20, 22], fill=SKIN_DARK)

    # ── HAIR ─────────────────────────────────────────────────────────────────
    # Top — wild tufts
    d.ellipse([7, 4, 24, 12], fill=HAIR)
    d.ellipse([5, 6, 12, 13], fill=HAIR)       # left tuft
    d.ellipse([19, 5, 26, 12], fill=HAIR)      # right tuft
    d.ellipse([8, 3, 14, 9],  fill=HAIR)       # top-left peak
    d.ellipse([17, 3, 24, 9], fill=HAIR)       # top-right peak
    d.line([10, 5, 8, 3], fill=HAIR)           # stray strand L
    d.line([21, 5, 24, 3], fill=HAIR)          # stray strand R
    # Shadow in hair
    d.line([9, 9, 13, 8], fill=HAIR_DARK)
    d.line([18, 8, 22, 9], fill=HAIR_DARK)
    # Side hair
    d.line([7, 12, 7, 17], fill=HAIR)
    d.line([24, 12, 24, 17], fill=HAIR)
    d.line([6, 13, 6, 17], fill=HAIR_DARK)

    # ── FACE ─────────────────────────────────────────────────────────────────
    # Glasses frame (round wire-rims)
    d.ellipse([9,  12, 15, 17], outline=GLASS_FRAME)
    d.ellipse([16, 12, 22, 17], outline=GLASS_FRAME)
    d.line([15, 14, 16, 14], fill=GLASS_FRAME)   # nose bridge
    d.line([9,  13, 7,  12], fill=GLASS_FRAME)   # left arm
    d.line([22, 13, 24, 12], fill=GLASS_FRAME)   # right arm

    # Lens tint (subtle)
    d.ellipse([10, 13, 14, 16], fill=GLASS_DARK)
    d.ellipse([17, 13, 21, 16], fill=GLASS_DARK)
    # Eyes behind glass
    d.point([(12, 15), (19, 15)], fill=EYE_COLOR)
    # Pupils
    d.point([(12, 15), (19, 15)], fill=SHADOW)
    # Eyebrow (bushy, expressive)
    d.line([9, 11, 15, 11], fill=SHADOW)
    d.line([16, 11, 22, 11], fill=SHADOW)
    d.point([(9, 12), (22, 12)], fill=SHADOW)    # furrowed inner

    # Nose (blobby, prominent)
    d.ellipse([13, 16, 18, 19], fill=SKIN_DARK)
    d.point([(14, 18), (17, 18)], fill=SHADOW)   # nostrils

    # ── MOUTH ───────────────────────────────────────────────────────────────
    if speaking:
        # Mouth open — oval shape
        d.ellipse([12, 19, 19, 22], fill=SHADOW)
        d.line([12, 20, 19, 20], fill=VOID)      # teeth / tongue line
        d.point([(13,20),(14,20),(15,20),(16,20),(17,20),(18,20)], fill=TEXT_WHITE)  # teeth
    else:
        # Mouth closed — slight smile
        d.line([12, 20, 19, 20], fill=SHADOW)
        d.point([(12, 21), (19, 21)], fill=SHADOW)  # corners
        d.line([13, 21, 14, 21], fill=SKIN_DARK)     # slight smirk left

    # Moustache / stubble hint
    d.line([11, 19, 12, 19], fill=HAIR_DARK)
    d.line([19, 19, 20, 19], fill=HAIR_DARK)

    # Selective outline — head
    d.ellipse([8, 6, 23, 21], outline=VOID)
    # Body outline (selective — bottom + right)
    d.line([10, 22, 10, 42], fill=VOID)   # left
    d.line([21, 22, 21, 42], fill=VOID)   # right
    d.line([10, 42, 21, 42], fill=VOID)   # bottom

    return img


def make_sprite_sheet():
    idle  = draw_molar_frame(speaking=False)
    speak = draw_molar_frame(speaking=True)

    # Save individual frames
    idle.save("../../assets/scenes/molar_idle.png")
    speak.save("../../assets/scenes/molar_speak.png")

    # Side-by-side sheet at ×4
    sheet = Image.new("RGB", (SW*2, SH), (0,255,0))
    sheet.paste(idle,  (0,   0))
    sheet.paste(speak, (SW,  0))

    sheet_x4 = sheet.resize((SW*2*4, SH*4), Image.NEAREST)
    sheet_x4.save("../../assets/scenes/molar_sheet_x4.png")

    # Also save white-BG preview (replace green key)
    def on_white(img):
        px = img.load()
        for y in range(img.height):
            for x in range(img.width):
                if px[x,y] == (0,255,0):
                    px[x,y] = (180,180,180)  # grey BG for preview
        return img

    preview = on_white(sheet_x4.copy())
    preview.save("../../assets/scenes/molar_preview_x4.png")
    print("Saved molar sprites (idle + speaking) + sheet_x4 + preview_x4")


if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    make_sprite_sheet()
