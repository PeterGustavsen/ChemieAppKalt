"""
Prof. Dr. Molar — v5
Thin oval head, thick neck, sharp high-contrast face, prominent nose.
32×56 px. Chroma key BG = (0,255,0).
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from PIL import Image, ImageDraw
from palette import (
    VOID, SHADOW, DARK_BLUE,
    METAL_MID, METAL_LIGHT,
    GLASS_DARK, GLASS_MID,
    ACID_MID,
    TEXT_WHITE, TEXT_DIM, PURE_WHITE,
)

SW, SH  = 32, 56
BG      = (0, 255, 0)

SKIN    = TEXT_WHITE    # main skin
SKIN_SH = TEXT_DIM      # shadow on face (cheeks, jaw, eye sockets)
SKIN_HI = PURE_WHITE    # brightest lit area
HAIR_A  = METAL_LIGHT   # grey hair light strand
HAIR_B  = METAL_MID     # grey hair dark strand
COAT    = TEXT_WHITE
COAT_SH = TEXT_DIM
COAT_DK = METAL_MID
PANT    = DARK_BLUE
LENS    = GLASS_DARK
EYE_C   = GLASS_MID
PUPIL   = VOID
BROW    = SHADOW
FRAME   = PURE_WHITE    # pince-nez frame
F_OUT   = VOID          # frame outline


def px(d, pts, col):
    for (x, y) in pts:
        if 0 <= x < SW and 0 <= y < SH:
            d.point([(x, y)], fill=col)


def draw_molar(speaking=False):
    img = Image.new("RGB", (SW, SH), BG)
    d   = ImageDraw.Draw(img)

    # ══════════════════════════════════════════════════════
    # HEAD  — narrow oval, x 10–21 (12 px wide), y 5–27
    # Light source: upper-left
    # ══════════════════════════════════════════════════════

    # Head rows (x_left, x_right inclusive)
    head = {
         5: (12, 20),
         6: (11, 21),
         7: (10, 21),
         8: (10, 21),
         9: (10, 21),
        10: (10, 21),
        11: (10, 21),
        12: (10, 21),
        13: (10, 21),
        14: (10, 21),
        15: (10, 21),
        16: (10, 21),
        17: (10, 21),
        18: (11, 21),
        19: (11, 20),
        20: (12, 20),
        21: (12, 19),
        22: (13, 19),
        23: (13, 18),
        24: (14, 18),
        25: (14, 17),
        26: (15, 17),  # chin narrows
    }
    for y, (x0, x1) in head.items():
        for x in range(x0, x1 + 1):
            img.putpixel((x, y), SKIN)

    # ── FOREHEAD HIGHLIGHT (top-left lit) ─────────────────────────────────────
    px(d, [(x, y) for y in range(6, 10) for x in range(11, 18)], SKIN_HI)
    px(d, [(13,6),(14,6),(13,7),(14,7)], PURE_WHITE)   # hotspot glint

    # ── RIGHT-SIDE FACE SHADOW (away from light) ──────────────────────────────
    for y, (x0, x1) in head.items():
        px(d, [(x1, y), (x1-1, y)], SKIN_SH)

    # Jaw shadow bottom
    for y in range(20, 27):
        r = head.get(y)
        if r:
            px(d, [(x, y) for x in range(r[0], r[0]+3)], SKIN_SH)

    # ── HEAD OUTLINE ──────────────────────────────────────────────────────────
    for y, (x0, x1) in head.items():
        px(d, [(x0-1, y), (x1+1, y)], VOID)
    # Top arc
    px(d, [(13,4),(14,4),(15,4),(16,4),(17,4),(18,4),(19,4)], VOID)
    # Bottom chin
    px(d, [(15,27),(16,27)], VOID)

    # ══════════════════════════════════════════════════════
    # FRIZZY HAIR — thin individual pixel strands
    # ══════════════════════════════════════════════════════
    strands = [
        # Top centre — upward chaos
        [(15,4),(15,3),(14,2),(15,1)],
        [(16,4),(16,3),(17,2),(16,1),(17,0)],
        [(14,4),(13,3),(13,2),(12,1)],
        [(17,4),(18,3),(18,2),(19,1)],
        [(13,5),(12,4),(11,3),(11,2)],
        [(18,5),(19,4),(20,3),(21,2)],
        [(14,3),(13,2),(14,1),(13,0)],
        [(16,3),(17,2),(17,1),(18,0)],
        [(15,2),(14,1),(15,0)],
        [(16,2),(17,1),(16,0)],
        # Left side fringe
        [(10,7),(9,6),(8,5),(7,5)],
        [(10,9),(9,8),(8,7),(7,6)],
        [(10,11),(9,10),(8,9),(7,8)],
        [(10,13),(9,12),(8,11),(7,10)],
        [(10,15),(9,14),(8,13)],
        [(9,16),(8,15),(7,14)],
        [(9,7),(8,6),(7,5)],
        [(9,11),(8,10),(7,9)],
        # Right side fringe
        [(22,7),(23,6),(24,5)],
        [(22,9),(23,8),(24,7),(25,6)],
        [(22,11),(23,10),(24,9),(25,8)],
        [(22,13),(23,12),(24,11)],
        [(22,15),(23,14),(24,13)],
        [(23,7),(24,6),(25,5)],
        [(23,11),(24,10),(25,9)],
    ]
    for i, strand in enumerate(strands):
        col = HAIR_A if i % 3 != 2 else HAIR_B
        px(d, strand, col)
        if i % 4 == 0 and strand:
            px(d, [strand[0]], PURE_WHITE)   # silver glint at tip

    # ── EYEBROWS — dark, bushy, furrowed ──────────────────────────────────────
    # Left brow x 10–15, y 9–10
    px(d, [(10,10),(11,10),(12,10),(13,10),(14,10),(15,10)], BROW)
    px(d, [(10,11),(11,11),(12,11)], BROW)      # inner thickening
    px(d, [(10,9)], HAIR_B)                     # stray tip
    # Right brow x 16–21, y 9–10
    px(d, [(16,10),(17,10),(18,10),(19,10),(20,10),(21,10)], BROW)
    px(d, [(19,11),(20,11),(21,11)], BROW)
    px(d, [(21,9)], HAIR_B)

    # ── EYE SOCKETS (subtle recess above glasses) ─────────────────────────────
    px(d, [(10,11),(11,11),(12,11),(13,11),(14,11)], SKIN_SH)
    px(d, [(17,11),(18,11),(19,11),(20,11),(21,11)], SKIN_SH)

    # ── PINCE-NEZ  x 10–15 and x 16–21, y 12–15 ──────────────────────────────
    # Left lens (5×4)
    px(d, [(11,12),(12,12),(13,12),(14,12),       # top
           (10,13),(15,13),(10,14),(15,14),        # sides
           (11,15),(12,15),(13,15),(14,15)],       # bottom
       F_OUT)
    px(d, [(11,12),(12,12),(13,12),(14,12),
           (10,13),(15,13),(10,14),(15,14),
           (11,15),(12,15),(13,15),(14,15)],
       FRAME)
    px(d, [(11,13),(12,13),(13,13),(14,13),
           (11,14),(12,14),(13,14),(14,14)], LENS)
    px(d, [(11,13)], SKIN_HI)   # glint

    # Right lens (5×4)
    px(d, [(17,12),(18,12),(19,12),(20,12),
           (16,13),(21,13),(16,14),(21,14),
           (17,15),(18,15),(19,15),(20,15)],
       F_OUT)
    px(d, [(17,12),(18,12),(19,12),(20,12),
           (16,13),(21,13),(16,14),(21,14),
           (17,15),(18,15),(19,15),(20,15)],
       FRAME)
    px(d, [(17,13),(18,13),(19,13),(20,13),
           (17,14),(18,14),(19,14),(20,14)], LENS)
    px(d, [(17,13)], SKIN_HI)

    # Bridge clip over nose (NO ear stems)
    px(d, [(15,13),(16,13)], FRAME)
    px(d, [(15,12),(16,12)], F_OUT)

    # ── EYES behind lenses ────────────────────────────────────────────────────
    px(d, [(12,13),(12,14)], EYE_C)
    px(d, [(19,13),(19,14)], EYE_C)
    px(d, [(12,14)], PUPIL)
    px(d, [(19,14)], PUPIL)

    # ══════════════════════════════════════════════════════
    # NOSE — large, prominent, old-man bulbous
    # Bridge runs y 15–17; tip widens y 18–20
    # ══════════════════════════════════════════════════════

    # Bridge shadow (centre vertical line)
    px(d, [(15,15),(15,16),(15,17)], SKIN_SH)

    # Bridge left lit side
    px(d, [(14,15),(14,16)], SKIN_HI)

    # Nose tip — wider oval, clearly visible
    #   lit left half, shadowed right half
    px(d, [(13,18),(14,18),(15,18),(16,18),(17,18)], SKIN_SH)   # tip shadow
    px(d, [(13,17),(14,17),(15,17),(16,17),(17,17)], SKIN_SH)   # upper tip
    px(d, [(13,17),(13,18),(14,17)], SKIN)                       # lit left of tip
    px(d, [(14,18),(13,18)], SKIN)

    # Nostril wings — very clear, one pixel each, darker
    px(d, [(12,18),(12,19),(13,19)], VOID)    # left nostril
    px(d, [(18,18),(18,19),(17,19)], VOID)    # right nostril

    # Under-nose shadow
    px(d, [(13,20),(14,20),(15,20),(16,20),(17,20)], SKIN_SH)

    # ── MOUSTACHE (wispy, matches frizzy hair) ────────────────────────────────
    px(d, [(11,20),(12,20)], HAIR_B)
    px(d, [(11,21),(12,21),(13,21)], HAIR_A)
    px(d, [(18,20),(19,20)], HAIR_B)
    px(d, [(17,21),(18,21),(19,21)], HAIR_A)
    px(d, [(10,21)], HAIR_B)   # stray strand

    # ── MOUTH ─────────────────────────────────────────────────────────────────
    if speaking:
        px(d, [(12,22),(13,22),(14,22),(15,22),(16,22),(17,22),(18,22)], VOID)
        px(d, [(11,23),(19,23)], VOID)
        px(d, [(12,23),(13,23),(14,23),(15,23),(16,23),(17,23),(18,23)], GLASS_DARK)
        px(d, [(12,22),(13,22),(14,22),(15,22),(16,22),(17,22),(18,22)], SKIN_HI)  # teeth
        px(d, [(11,22),(19,22)], SKIN_SH)
        px(d, [(12,24),(13,24),(14,24),(15,24),(16,24),(17,24),(18,24)], VOID)
    else:
        # Wry smirk — left corner down, right raised
        px(d, [(11,22),(12,22),(13,22),(14,22),(15,22),
               (16,22),(17,22),(18,22),(19,22)], BROW)
        px(d, [(11,23),(12,23)], SKIN_SH)
        px(d, [(18,21),(19,21)], SKIN_HI)
        px(d, [(13,23),(14,23),(15,23),(16,23),(17,23)], SKIN_SH)  # lower lip

    # ── AGE LINES ────────────────────────────────────────────────────────────
    px(d, [(21,13),(22,12)], SKIN_SH)   # crow's feet right
    px(d, [(21,15),(22,15)], SKIN_SH)
    px(d, [(10,18),(10,19),(11,20)], SKIN_SH)   # nasolabial fold left
    px(d, [(20,18),(20,19),(19,20)], SKIN_SH)   # nasolabial fold right
    px(d, [(12,8),(13,8),(14,8)], SKIN_SH)       # forehead line

    # ══════════════════════════════════════════════════════
    # NECK — thick (x 11–20, y 27–32)
    # ══════════════════════════════════════════════════════
    d.rectangle([11, 27, 20, 32], fill=SKIN)
    px(d, [(x, 27) for x in range(12, 20)], SKIN_HI)
    px(d, [(11, y) for y in range(27, 33)], SKIN_SH)   # left shadow
    px(d, [(10, 27),(10, 28),(10,29)], VOID)             # neck outline L
    px(d, [(21, 27),(21, 28),(21,29)], VOID)             # neck outline R

    # ══════════════════════════════════════════════════════
    # COAT (x 7–24, y 32–47)
    # ══════════════════════════════════════════════════════
    d.rectangle([7, 32, 24, 47], fill=COAT)
    d.line([7,  32, 7,  47], fill=COAT_SH)
    d.line([24, 32, 24, 47], fill=COAT_SH)
    d.line([7,  47, 24, 47], fill=COAT_DK)
    # Lapels
    for i in range(6):
        px(d, [(13-i, 32+i)], COAT_SH)
        px(d, [(18+i, 32+i)], COAT_SH)
    # Pocket
    d.rectangle([8, 36, 11, 41], fill=COAT_SH)
    d.line([8, 36, 11, 36], fill=COAT)
    # Stain
    px(d, [(17,40),(18,40),(17,41)], ACID_MID)
    px(d, [(18,41)], GLASS_DARK)

    # Arms
    d.rectangle([2, 33, 6, 45], fill=COAT)
    d.line([2, 33, 2, 45], fill=COAT_SH)
    d.rectangle([2, 43, 6, 48], fill=SKIN)
    px(d, [(2,43),(3,43),(4,43)], SKIN_HI)

    d.rectangle([25, 33, 29, 44], fill=COAT)
    d.line([29, 33, 29, 44], fill=COAT_SH)
    d.rectangle([25, 42, 30, 47], fill=SKIN)
    px(d, [(25,42),(26,42)], SKIN_HI)

    # ── TROUSERS ──────────────────────────────────────────────────────────────
    d.rectangle([8,  48, 13, 54], fill=PANT)
    d.rectangle([16, 48, 21, 54], fill=PANT)
    px(d, [(14,48),(15,48),(14,49),(15,49)], COAT_DK)  # gap/belt
    px(d, [(14,50),(14,51),(14,52),(14,53)], SHADOW)    # crease

    # ── SHOES ─────────────────────────────────────────────────────────────────
    d.rectangle([6,  54, 14, 55], fill=VOID)
    d.rectangle([16, 54, 22, 55], fill=VOID)
    px(d, [(6,54),(7,54),(8,54)], METAL_MID)

    # ── BODY OUTLINE ──────────────────────────────────────────────────────────
    d.line([2,  33, 2,  45], fill=VOID)
    d.line([29, 33, 29, 44], fill=VOID)
    d.line([7,  47, 24, 47], fill=VOID)

    return img


def make_sprite_sheet():
    os.makedirs("../../assets/scenes", exist_ok=True)
    idle  = draw_molar(speaking=False)
    speak = draw_molar(speaking=True)
    idle.save("../../assets/scenes/molar_idle.png")
    speak.save("../../assets/scenes/molar_speak.png")

    sheet = Image.new("RGB", (SW*2, SH), BG)
    sheet.paste(idle,  (0,  0))
    sheet.paste(speak, (SW, 0))
    sheet_x4 = sheet.resize((SW*8, SH*4), Image.NEAREST)
    sheet_x4.save("../../assets/scenes/molar_sheet_x4.png")

    preview = sheet_x4.copy()
    pxd = preview.load()
    for y in range(preview.height):
        for x in range(preview.width):
            if pxd[x, y] == (0, 255, 0):
                pxd[x, y] = (44, 84, 98)
    preview.save("../../assets/scenes/molar_preview_x4.png")
    print("Done — Molar v5")


if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    make_sprite_sheet()
