"""
Prof. Dr. Molar — v4
Fully hand-placed face. Frizzy thin-strand hair. White pince-nez.
Sprite: 32×56 px (taller to give head more room).
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from PIL import Image, ImageDraw
from palette import (
    VOID, SHADOW, DARK_BLUE,
    METAL_DARK, METAL_MID, METAL_LIGHT,
    GLASS_DARK, GLASS_MID, GLASS_LIGHT,
    ACID_MID, TEXT_WHITE, TEXT_DIM, PURE_WHITE,
    FLOOR_DARK, FLOOR_MID,
)

SW, SH = 32, 56
BG     = (0, 255, 0)

SKIN      = TEXT_WHITE        # pale/white skin main
SKIN_SH   = TEXT_DIM          # cheek/jaw shadow
SKIN_HI   = PURE_WHITE        # lit forehead
HAIR_A    = METAL_LIGHT       # grey hair, lighter strand
HAIR_B    = METAL_MID         # grey hair, darker strand
COAT      = TEXT_WHITE
COAT_SH   = TEXT_DIM
COAT_DEEP = METAL_MID
PANT      = DARK_BLUE
LENS      = GLASS_DARK        # tinted lens interior
EYE       = GLASS_MID         # iris
PUPIL     = VOID
BROW      = SHADOW
FRAME     = PURE_WHITE        # pince-nez frame colour
FRAME_OUT = VOID              # frame outline (so white reads on white skin)
LIP       = METAL_DARK        # mouth line


def px(d, pts, col):
    for (x, y) in pts:
        if 0 <= x < SW and 0 <= y < SH:
            d.point([(x, y)], fill=col)


def draw_molar(speaking=False):
    img = Image.new("RGB", (SW, SH), BG)
    d   = ImageDraw.Draw(img)

    # ══════════════════════════════════════════════
    # HEAD  (x 6–25, y 4–26)   20px wide × 23px tall
    # ══════════════════════════════════════════════

    # ── Base head fill (ellipse-ish, then overdrawn) ──────────────────────────
    # Row by row so we can control exact shape:
    # y4  : ...##############...
    # y5  : ..################..
    # y6  : .##################.
    # y7-17: #################### (full width)
    # y18 : .##################.
    # y19 : ..################..
    # y20 : ...##############...
    # y21 : ....############....
    # y22 : .....##########.....
    # y23 : ......########......
    # y24 : .......######.......
    # y25 : ........####........
    # y26 : .........##.........  (chin point)

    rows = {
         4: (9,  22),
         5: (8,  23),
         6: (7,  24),
         7: (7,  24),  8: (7, 24),  9: (7, 24), 10: (7, 24),
        11: (7,  24), 12: (7, 24), 13: (7, 24), 14: (7, 24),
        15: (7,  24), 16: (7, 24), 17: (7, 24),
        18: (8,  23),
        19: (9,  22),
        20: (10, 21),
        21: (11, 20),
        22: (12, 19),
        23: (13, 18),
        24: (14, 17),
        25: (14, 17),
        26: (15, 16),  # chin tip
    }
    for y, (x0, x1) in rows.items():
        for x in range(x0, x1+1):
            img.putpixel((x, y), SKIN)

    # ── Forehead shading ──────────────────────────────────────────────────────
    # Top forehead — bright (strip light above)
    px(d, [(x, 5) for x in range(9,22)], SKIN_HI)
    px(d, [(x, 6) for x in range(10,21)], SKIN_HI)
    px(d, [(x, 7) for x in range(11,20)], SKIN_HI)
    px(d, [(13,5),(14,5),(15,5),(13,6),(14,6),(15,6)], PURE_WHITE)  # hotspot

    # Right-side face shadow (away from light)
    for y in range(7, 27):
        r = rows.get(y)
        if r:
            px(d, [(r[1], y), (r[1]-1, y)], SKIN_SH)

    # Cheekbone catch-light
    px(d, [(9,17),(9,18),(10,18)], SKIN_HI)

    # ── FRIZZY HAIR — individual thin strands ─────────────────────────────────
    # Each strand is 1 px wide; scattered, some overlapping the head outline.
    # Strategy: define strand paths as small lists of (x,y) then draw them.

    strands = [
        # Left side frizz (messy outward)
        [(5,8),(4,7),(4,6),(3,6)],
        [(6,7),(5,6),(4,5)],
        [(6,6),(5,5),(5,4)],
        [(7,5),(6,4),(5,3),(5,2)],
        [(7,4),(6,3),(7,2)],
        [(8,5),(7,4),(6,3)],
        [(8,4),(8,3),(7,2),(8,2)],
        # Top frizz (upward chaos)
        [(9,4),(8,3),(8,2),(9,1)],
        [(10,4),(10,3),(9,2),(9,1)],
        [(11,4),(11,3),(10,2),(11,1),(10,0)],
        [(12,4),(12,3),(11,2),(12,1)],
        [(13,3),(13,2),(14,1),(13,0)],
        [(14,3),(14,2),(15,1),(15,0)],
        [(15,3),(15,2),(14,1)],
        [(16,4),(16,3),(17,2),(16,1)],
        [(17,4),(17,3),(18,2),(17,1),(18,0)],
        [(18,4),(18,3),(19,2),(18,1)],
        [(19,4),(19,3),(19,2),(20,1)],
        [(20,4),(20,3),(20,2),(21,2)],
        # Right side frizz
        [(22,5),(23,4),(24,3)],
        [(23,6),(24,5),(25,4),(25,3)],
        [(24,6),(25,5),(26,5),(26,4)],
        [(24,7),(25,7),(26,6),(27,6)],
        [(23,8),(24,8),(25,7)],
        [(22,9),(23,9),(24,8)],
        # Side hair down the temples
        [(6,9),(5,10),(5,11),(6,12)],
        [(6,10),(5,11),(5,12),(6,13)],
        [(5,13),(5,14),(6,14)],
        [(25,9),(26,10),(26,11),(25,12)],
        [(26,12),(26,13),(25,13)],
        [(26,14),(25,14),(25,15)],
    ]

    # Alternate strand colors for thin, varied look
    for i, strand in enumerate(strands):
        col = HAIR_A if i % 3 != 2 else HAIR_B
        px(d, strand, col)
        # Occasional single PURE_WHITE pixel = silver highlight
        if i % 5 == 0 and strand:
            mid = strand[len(strand)//2]
            px(d, [mid], PURE_WHITE)

    # ── EYEBROWS — thick, dishevelled ─────────────────────────────────────────
    # Left brow (x 8–13, y 9–10), inner end slightly lower (furrowed)
    px(d, [(8,10),(9,10),(10,10),(11,10),(12,10),(13,10)], BROW)
    px(d, [(8,11),(9,11),(10,11)], BROW)          # lower inner thickening
    px(d, [(13,9),(12,9)], HAIR_B)                # outer brow lighter tip
    # Stray brow hairs
    px(d, [(7,10),(7,11)], HAIR_B)
    px(d, [(14,9)], HAIR_B)

    # Right brow (x 18–24, y 9–10)
    px(d, [(18,10),(19,10),(20,10),(21,10),(22,10),(23,10)], BROW)
    px(d, [(21,11),(22,11),(23,11)], BROW)
    px(d, [(17,10),(17,9)], HAIR_B)               # stray outer
    px(d, [(24,9),(25,9)], HAIR_B)

    # ── EYE SOCKETS — subtle recess ───────────────────────────────────────────
    px(d, [(9,11),(10,11),(11,11),(12,11),(13,11)], SKIN_SH)     # left recess
    px(d, [(18,11),(19,11),(20,11),(21,11),(22,11)], SKIN_SH)    # right recess

    # ── PINCE-NEZ (white oval frames, dark outline, no ear stems) ─────────────
    #
    # Left lens: x 8–13, y 11–15  (6×5px oval)
    # Outer outline (VOID — makes white frame visible on skin)
    # Frame ring (PURE_WHITE)
    # Lens interior (GLASS_DARK)
    # No arms going to the sides of the head.

    # Left lens outline
    px(d, [(9,11),(10,11),(11,11),(12,11),            # top
           (8,12),(8,13),(8,14),                       # left
           (13,12),(13,13),(13,14),                    # right
           (9,15),(10,15),(11,15),(12,15)],            # bottom
       FRAME_OUT)
    # Left lens frame (white ring inside outline)
    px(d, [(9,11),(10,11),(11,11),(12,11),
           (8,12),(13,12),(8,13),(13,13),(8,14),(13,14),
           (9,15),(10,15),(11,15),(12,15)],
       FRAME)
    # Left lens interior
    px(d, [(9,12),(10,12),(11,12),(12,12),
           (9,13),(10,13),(11,13),(12,13),
           (9,14),(10,14),(11,14),(12,14)],
       LENS)
    # Left lens glint
    px(d, [(9,12)], PURE_WHITE)

    # Right lens: x 17–22, y 11–15
    px(d, [(18,11),(19,11),(20,11),(21,11),
           (17,12),(17,13),(17,14),
           (22,12),(22,13),(22,14),
           (18,15),(19,15),(20,15),(21,15)],
       FRAME_OUT)
    px(d, [(18,11),(19,11),(20,11),(21,11),
           (17,12),(22,12),(17,13),(22,13),(17,14),(22,14),
           (18,15),(19,15),(20,15),(21,15)],
       FRAME)
    px(d, [(18,12),(19,12),(20,12),(21,12),
           (18,13),(19,13),(20,13),(21,13),
           (18,14),(19,14),(20,14),(21,14)],
       LENS)
    px(d, [(18,12)], PURE_WHITE)

    # Nose bridge clip (white bar over nose, NO ear stems)
    px(d, [(14,12),(14,13),(15,13),(16,13),(16,12)], FRAME)
    px(d, [(14,11),(15,11),(16,11)], FRAME_OUT)   # top outline of bridge clip

    # ── EYES behind lenses ────────────────────────────────────────────────────
    px(d, [(10,13),(11,13)], EYE)
    px(d, [(19,13),(20,13)], EYE)
    px(d, [(10,13)], PUPIL)
    px(d, [(19,13)], PUPIL)
    # Eye whites
    px(d, [(11,12),(12,12)], PURE_WHITE)
    px(d, [(20,12),(21,12)], PURE_WHITE)

    # ── NOSE ──────────────────────────────────────────────────────────────────
    # Nose bridge (subtle shadow going down from between glasses)
    px(d, [(15,15),(15,16),(14,17),(15,17),(16,17)], SKIN_SH)
    # Nose tip
    px(d, [(13,18),(14,18),(15,18),(16,18),(17,18)], SKIN_SH)
    px(d, [(14,17),(15,17),(16,17)], SKIN_SH)
    # Lit top of nose tip
    px(d, [(14,16),(15,16)], SKIN_HI)
    # Nostrils — two clear dark ovals
    px(d, [(12,18),(13,18),(12,19)], VOID)   # left nostril
    px(d, [(17,18),(18,18),(18,19)], VOID)   # right nostril
    # Under-nose shadow
    px(d, [(13,19),(14,19),(15,19),(16,19),(17,19)], SKIN_SH)

    # ── MOUSTACHE (wispy — matching hair style) ────────────────────────────────
    px(d, [(11,19),(12,19)], HAIR_B)
    px(d, [(10,20),(11,20),(12,20)], HAIR_B)
    px(d, [(18,19),(19,19)], HAIR_B)
    px(d, [(18,20),(19,20),(20,20)], HAIR_B)
    # Thin stray hairs
    px(d, [(10,19)], HAIR_A)
    px(d, [(20,19)], HAIR_A)

    # ── MOUTH ─────────────────────────────────────────────────────────────────
    if speaking:
        # Open — excited O
        px(d, [(12,21),(13,21),(14,21),(15,21),(16,21),(17,21),(18,21)], LIP)
        px(d, [(11,22),(19,22)], LIP)
        px(d, [(12,22),(13,22),(14,22),(15,22),(16,22),(17,22),(18,22)], GLASS_DARK)
        # Teeth top row
        px(d, [(12,21),(13,21),(14,21),(15,21),(16,21),(17,21),(18,21)], PURE_WHITE)
        # Mouth corners
        px(d, [(11,21),(19,21)], SKIN_SH)
        # Bottom lip line
        px(d, [(12,23),(13,23),(14,23),(15,23),(16,23),(17,23),(18,23)], LIP)
        # Chin below mouth
        px(d, [(13,24),(14,24),(15,24),(16,24),(17,24)], SKIN)
    else:
        # Closed — wry off-centre smirk
        px(d, [(11,21),(12,21),(13,21),(14,21),(15,21),
               (16,21),(17,21),(18,21),(19,21)], LIP)
        # Smirk: left corner down
        px(d, [(11,22),(12,22)], SKIN_SH)
        # Right corner raised + slight upturn
        px(d, [(18,20),(19,20)], SKIN_HI)
        # Lower lip plump hint
        px(d, [(13,22),(14,22),(15,22),(16,22),(17,22)], SKIN_SH)

    # ── WRINKLES / AGE LINES ──────────────────────────────────────────────────
    # Crow's feet (right eye — shadow side)
    px(d, [(23,13),(24,12),(25,12)], SKIN_SH)
    px(d, [(23,15),(24,15),(25,16)], SKIN_SH)
    # Nasolabial fold (cheek-to-mouth lines)
    px(d, [(10,19),(10,20),(11,21)], SKIN_SH)
    px(d, [(20,19),(20,20),(19,21)], SKIN_SH)
    # Forehead line (faint)
    px(d, [(10,8),(11,8),(12,8),(13,8)], SKIN_SH)

    # ── HEAD OUTLINE ──────────────────────────────────────────────────────────
    for y, (x0, x1) in rows.items():
        px(d, [(x0-1, y), (x1+1, y)], VOID)   # sides
    # Bottom (chin)
    px(d, [(14,27),(15,27),(16,27)], VOID)

    # ══════════════════════════════════════════════
    # NECK (x 13–18, y 27–31)
    # ══════════════════════════════════════════════
    d.rectangle([13, 27, 18, 31], fill=SKIN)
    px(d, [(13,27),(13,28),(13,29),(13,30)], SKIN_SH)
    px(d, [(14,27),(15,27),(16,27),(17,27)], SKIN_HI)

    # ══════════════════════════════════════════════
    # COAT BODY (x 8–23, y 31–47)
    # ══════════════════════════════════════════════
    d.rectangle([8, 31, 23, 47], fill=COAT)
    # Lapels
    for i, xi in enumerate(range(13, 8, -1)):
        d.line([xi, 31+i, xi, 33+i], fill=COAT_SH)
    for i, xi in enumerate(range(18, 23)):
        d.line([xi, 31+i, xi, 33+i], fill=COAT_SH)
    # Side creases
    d.line([8, 31, 8, 47], fill=COAT_SH)
    d.line([23, 31, 23, 47], fill=COAT_SH)
    d.line([8, 47, 23, 47], fill=COAT_DEEP)
    # Breast pocket
    d.rectangle([9, 35, 12, 40], fill=COAT_SH)
    d.line([9, 35, 12, 35], fill=COAT)
    # Stain
    px(d, [(17,39),(18,39),(17,40)], ACID_MID)
    px(d, [(18,40)], GLASS_DARK)

    # ── ARMS ──────────────────────────────────────────────────────────────────
    d.rectangle([3, 32, 7, 46], fill=COAT)
    d.line([3, 32, 3, 46], fill=COAT_SH)
    # Left hand
    d.rectangle([2, 44, 7, 49], fill=SKIN)
    px(d, [(2,44),(3,44),(4,44)], SKIN_HI)

    d.rectangle([24, 32, 28, 44], fill=COAT)
    d.line([28, 32, 28, 44], fill=COAT_SH)
    # Right hand
    d.rectangle([24, 42, 29, 47], fill=SKIN)
    px(d, [(24,42),(25,42),(26,42)], SKIN_HI)

    # ── TROUSERS ──────────────────────────────────────────────────────────────
    d.rectangle([9,  48, 14, 54], fill=PANT)
    d.rectangle([17, 48, 22, 54], fill=PANT)
    px(d, [(15,48),(15,49),(15,50),(15,51),(15,52)], SHADOW)  # crease

    # ── SHOES ─────────────────────────────────────────────────────────────────
    d.rectangle([7,  54, 15, 55], fill=VOID)
    d.rectangle([16, 54, 24, 55], fill=VOID)
    px(d, [(7,54),(8,54),(9,54)], METAL_MID)

    # ── BODY OUTLINE ──────────────────────────────────────────────────────────
    d.line([3, 32, 3, 46], fill=VOID)
    d.line([28, 32, 28, 44], fill=VOID)
    d.line([8, 47, 23, 47], fill=VOID)

    return img


def make_sprite_sheet():
    os.makedirs("../../assets/scenes", exist_ok=True)
    idle  = draw_molar(speaking=False)
    speak = draw_molar(speaking=True)

    idle.save("../../assets/scenes/molar_idle.png")
    speak.save("../../assets/scenes/molar_speak.png")

    # ×4 sheet side by side
    sheet   = Image.new("RGB", (SW*2, SH), BG)
    sheet.paste(idle,  (0,  0))
    sheet.paste(speak, (SW, 0))
    sheet_x4 = sheet.resize((SW*8, SH*4), Image.NEAREST)
    sheet_x4.save("../../assets/scenes/molar_sheet_x4.png")

    # Preview on dark teal BG (so white is clearly visible)
    preview = sheet_x4.copy()
    px_data = preview.load()
    for y in range(preview.height):
        for x in range(preview.width):
            if px_data[x, y] == (0, 255, 0):
                px_data[x, y] = (44, 84, 98)   # WALL_MID-ish
    preview.save("../../assets/scenes/molar_preview_x4.png")
    print("Done — molar v4 sprites generated.")


if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    make_sprite_sheet()
