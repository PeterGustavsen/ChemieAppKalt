"""
Prof. Dr. Molar — Character Sprite v2
White-skinned old chemist, pince-nez glasses (clip-on nose, no ear stems).
Two frames: IDLE and SPEAKING (mouth open).
Native size: 32×48 px per frame.
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from PIL import Image, ImageDraw
from palette import (
    VOID, SHADOW, DARK_BLUE,
    METAL_DARK, METAL_MID, METAL_LIGHT,
    BRASS_DARK, BRASS_MID, BRASS_LIGHT,
    GLASS_DARK, GLASS_MID,
    ACID_MID, GLASS_MID as GLASS_STAIN,
    TEXT_WHITE, TEXT_DIM, PURE_WHITE,
    WOOD_DARK, WOOD_MID,
)

SW, SH = 32, 48

# ── Colour aliases ──────────────────────────────────────────────────────────────
SKIN        = TEXT_WHITE      # (#e0e4d8) pale/white skin — main face
SKIN_SHADOW = TEXT_DIM        # (#889888) cheek/chin shadow
SKIN_HI     = PURE_WHITE      # (#ffffff) forehead glint
HAIR        = METAL_LIGHT     # (#888c98) wild grey hair
HAIR_DARK   = METAL_MID       # (#585c68) hair depth
COAT        = TEXT_WHITE      # (#e0e4d8) lab coat body — same as skin, coat lines differ
COAT_CREASE = TEXT_DIM        # (#889888) coat shadow / creases
COAT_DEEP   = METAL_MID       # (#585c68) deep fold shadow
PINCE_NEZ   = BRASS_MID       # (#a87c28) gold-toned wire frame
LENS_TINT   = GLASS_DARK      # (#144458) subtle tinted lens
PUPIL       = SHADOW          # (#141828)
PANT        = DARK_BLUE       # (#1c243c) trousers
SHOE        = SHADOW          # (#141828)
LIP_SHADOW  = METAL_DARK      # (#383840) mouth line / lips


def draw_molar(speaking=False):
    img = Image.new("RGB", (SW, SH), (0, 255, 0))   # green = chroma key
    d   = ImageDraw.Draw(img)

    # ── SHOES ──────────────────────────────────────────────────────────────────
    d.rectangle([8,  45, 14, 47], fill=SHOE)
    d.rectangle([17, 45, 23, 47], fill=SHOE)
    d.line([8, 45, 14, 45], fill=METAL_MID)    # toe cap glint

    # ── TROUSERS ───────────────────────────────────────────────────────────────
    d.rectangle([11, 38, 14, 45], fill=PANT)
    d.rectangle([17, 38, 20, 45], fill=PANT)
    d.line([11, 38, 20, 38], fill=COAT_DEEP)   # belt shadow
    d.line([15, 38, 15, 44], fill=SHADOW)      # trouser crease

    # ── COAT BODY ──────────────────────────────────────────────────────────────
    # Main torso — slightly narrowed at top (hunched shoulders)
    d.rectangle([9,  21, 22, 38], fill=COAT)
    # Left edge shadow (coat depth)
    d.line([9, 21, 9, 38],  fill=COAT_CREASE)
    # Right edge shadow
    d.line([22, 21, 22, 38], fill=COAT_CREASE)
    # Bottom hem darker
    d.line([9, 37, 22, 37], fill=COAT_CREASE)
    d.line([9, 38, 22, 38], fill=COAT_CREASE)

    # V-neck / lapels
    d.polygon([(13, 21), (15, 27), (12, 27)], fill=COAT_CREASE)
    d.polygon([(18, 21), (16, 27), (19, 27)], fill=COAT_CREASE)

    # Breast pocket
    d.rectangle([10, 24, 13, 28], fill=COAT_CREASE)
    d.line([10, 24, 13, 24], fill=COAT)

    # Chemical stain (personality detail)
    d.point([(16, 29), (17, 29), (16, 30)], fill=ACID_MID)
    d.point([(17, 30)], fill=GLASS_DARK)

    # ── ARMS ───────────────────────────────────────────────────────────────────
    # Left arm (drooping slightly)
    d.rectangle([5, 22, 8, 36], fill=COAT)
    d.line([5, 22, 5, 36], fill=COAT_CREASE)
    # Left hand
    d.rectangle([4, 34, 8, 38], fill=SKIN)
    d.line([4, 34, 8, 34], fill=SKIN_HI)
    d.point([(4, 37), (8, 37)], fill=SKIN_SHADOW)  # knuckle hints

    # Right arm
    d.rectangle([23, 22, 26, 34], fill=COAT)
    d.line([26, 22, 26, 34], fill=COAT_CREASE)
    # Right hand
    d.rectangle([23, 32, 27, 36], fill=SKIN)
    d.line([23, 32, 27, 32], fill=SKIN_HI)

    # ── NECK ───────────────────────────────────────────────────────────────────
    d.rectangle([13, 17, 18, 21], fill=SKIN)
    d.line([13, 17, 18, 17], fill=SKIN_HI)
    d.line([13, 17, 13, 21], fill=SKIN_SHADOW)  # neck shadow left

    # ── HEAD ───────────────────────────────────────────────────────────────────
    # Head: slightly wide, old man jowly shape
    d.ellipse([7, 5, 24, 20], fill=SKIN)

    # Forehead highlight (catching neon strip light)
    d.ellipse([10, 6, 18, 11], fill=SKIN_HI)
    d.point([(13, 6), (14, 6)], fill=PURE_WHITE)  # bright glint

    # Cheek / chin shadow (right side = shadow side)
    d.ellipse([17, 14, 24, 21], fill=SKIN_SHADOW)
    # Jaw/chin
    d.ellipse([11, 17, 21, 22], fill=SKIN_SHADOW)
    d.ellipse([12, 17, 20, 21], fill=SKIN)

    # ── WILD GREY HAIR ─────────────────────────────────────────────────────────
    # Hair sits above and around the head, chaotic tufts
    # Draw hair LAST (over head ellipse edges) so it looks natural

    # Back/crown mass
    d.ellipse([6, 2, 25, 10], fill=HAIR)
    # Wild tufts pointing up
    d.ellipse([7,  0, 13,  7], fill=HAIR)     # left peak
    d.ellipse([18, 0, 25,  7], fill=HAIR)     # right peak
    d.ellipse([11, -1, 17, 6], fill=HAIR)     # centre peak
    # Stray strands (individual pixels)
    for px, py in [(8,0),(7,1),(6,2),(24,1),(25,2),(13,-1),(12,0),(19,0),(20,-1)]:
        if 0 <= px < SW and 0 <= py < SH:
            d.point([(px, py)], fill=HAIR)
    # Hair depth / shadow within hair mass
    d.ellipse([9, 3, 22, 9], fill=HAIR_DARK)
    d.ellipse([10, 4, 21, 8], fill=HAIR)      # lighter centre back on top
    # Side tufts (sideburns area)
    d.rectangle([5, 9, 8, 16], fill=HAIR)
    d.rectangle([23, 9, 26, 16], fill=HAIR)
    d.line([5, 9, 5, 16], fill=HAIR_DARK)

    # ── EYEBROWS (bushy, unkempt) ──────────────────────────────────────────────
    # Left brow — thick, slightly furrowed
    d.line([9, 10, 14, 10], fill=HAIR_DARK)
    d.line([9, 11, 13, 11], fill=SHADOW)
    d.point([(9, 10)], fill=SHADOW)   # inner frown
    # Right brow
    d.line([17, 10, 22, 10], fill=HAIR_DARK)
    d.line([18, 11, 22, 11], fill=SHADOW)
    d.point([(22, 10)], fill=SHADOW)

    # ── NOSE ───────────────────────────────────────────────────────────────────
    # Bulbous old-man nose, centre of face
    d.ellipse([13, 13, 18, 17], fill=SKIN_SHADOW)  # nose body
    d.ellipse([13, 13, 17, 16], fill=SKIN)          # lit side
    d.point([(14, 16), (17, 16)], fill=SHADOW)      # nostrils

    # ── PINCE-NEZ (clips ONTO nose, no ear stems) ──────────────────────────────
    # The lenses rest on the nose bridge, no arms going to ears.
    # Left lens: oval, sitting on left side of nose
    d.ellipse([9,  12, 14, 16], fill=LENS_TINT)    # left lens tint
    d.ellipse([9,  12, 14, 16], outline=PINCE_NEZ)  # gold frame
    # Right lens: oval, sitting on right side of nose
    d.ellipse([16, 12, 21, 16], fill=LENS_TINT)    # right lens tint
    d.ellipse([16, 12, 21, 16], outline=PINCE_NEZ)  # gold frame
    # Bridge clip — tiny piece sitting ON the nose (no ear stems!)
    d.line([14, 13, 16, 13], fill=PINCE_NEZ)        # bridge across nose
    d.point([(15, 14)], fill=PINCE_NEZ)             # centre clip
    # Lens highlight (light catches glass)
    d.point([(10, 13)], fill=SKIN_HI)
    d.point([(17, 13)], fill=SKIN_HI)

    # ── EYES (behind lenses) ───────────────────────────────────────────────────
    d.point([(11, 14)], fill=GLASS_MID)     # iris left
    d.point([(18, 14)], fill=GLASS_MID)     # iris right
    d.point([(11, 14)], fill=PUPIL)         # pupil (overwrite centre)
    d.point([(18, 14)], fill=PUPIL)

    # ── MOUTH ──────────────────────────────────────────────────────────────────
    if speaking:
        # Open mouth — excited/explaining
        d.ellipse([12, 17, 19, 21], fill=SHADOW)           # mouth cavity
        d.line([12, 18, 19, 18], fill=VOID)                # upper lip line
        # Teeth row (top)
        for tx in range(13, 19):
            d.point([(tx, 18)], fill=PURE_WHITE)
        d.point([(12, 18), (19, 18)], fill=SKIN_SHADOW)    # corners
    else:
        # Closed — slight knowing smirk (left side raised)
        d.line([12, 18, 19, 18], fill=LIP_SHADOW)
        d.point([(12, 19)], fill=SKIN_SHADOW)   # left corner down
        d.point([(19, 17)], fill=SKIN_HI)        # right corner up (smirk)

    # ── SELECTIVE OUTLINE ──────────────────────────────────────────────────────
    # Head outline (bottom + sides only — top edge is hair)
    d.arc([7, 5, 24, 20], start=30, end=150, fill=VOID)   # bottom arc
    d.line([7, 10, 7, 17], fill=VOID)    # left side
    d.line([24, 10, 24, 17], fill=VOID)  # right side
    # Body outline
    d.line([5, 22, 5, 36], fill=VOID)   # left
    d.line([26, 22, 26, 34], fill=VOID) # right
    d.line([9, 38, 22, 38], fill=VOID)  # coat bottom

    return img


def make_sprite_sheet():
    os.makedirs("../../assets/scenes", exist_ok=True)
    idle  = draw_molar(speaking=False)
    speak = draw_molar(speaking=True)

    idle.save("../../assets/scenes/molar_idle.png")
    speak.save("../../assets/scenes/molar_speak.png")

    # Side-by-side sheet ×4
    sheet = Image.new("RGB", (SW*2, SH), (0, 255, 0))
    sheet.paste(idle,  (0,  0))
    sheet.paste(speak, (SW, 0))
    sheet_x4 = sheet.resize((SW*8, SH*4), Image.NEAREST)
    sheet_x4.save("../../assets/scenes/molar_sheet_x4.png")

    # Preview on grey BG
    preview = sheet_x4.copy()
    px = preview.load()
    for y in range(preview.height):
        for x in range(preview.width):
            if px[x, y] == (0, 255, 0):
                px[x, y] = (160, 168, 160)
    preview.save("../../assets/scenes/molar_preview_x4.png")
    print("Saved molar_idle, molar_speak, sheet_x4, preview_x4")


if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    make_sprite_sheet()
