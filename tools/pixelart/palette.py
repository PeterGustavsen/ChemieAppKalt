"""
CHEMISCHER ESCAPE ROOM — Master Palette
32 colours, SNES/32-bit era lab atmosphere.
Import this into every scene script; never use colours outside this list.
"""

# ── Shadows / Near-black ──────────────────────────────────────────────────────
VOID        = (0x08, 0x08, 0x10)   # absolute shadow, outlines
SHADOW      = (0x14, 0x18, 0x28)   # deep shadow fill
DARK_BLUE   = (0x1c, 0x24, 0x3c)   # wall shadow / BG dark

# ── Walls (Petrol / Teal) ────────────────────────────────────────────────────
WALL_DARK   = (0x1e, 0x3e, 0x4e)   # wall in shadow
WALL_MID    = (0x2c, 0x54, 0x62)   # main wall surface
WALL_LIGHT  = (0x3c, 0x6e, 0x7c)   # wall lit area
WALL_BRIGHT = (0x52, 0x8e, 0x9c)   # wall highlight / specular
TILE_GROUT  = (0x18, 0x30, 0x3c)   # grout lines between tiles

# ── Floor / Bench (concrete + dark wood) ─────────────────────────────────────
FLOOR_DARK  = (0x28, 0x24, 0x20)   # floor shadow
FLOOR_MID   = (0x3c, 0x36, 0x2e)   # main floor colour
FLOOR_LIGHT = (0x54, 0x4c, 0x40)   # floor highlight
WOOD_DARK   = (0x3a, 0x26, 0x16)   # bench / shelving dark
WOOD_MID    = (0x58, 0x3c, 0x22)   # bench surface
WOOD_LIGHT  = (0x7a, 0x58, 0x34)   # bench highlight

# ── Metal / Brass ─────────────────────────────────────────────────────────────
METAL_DARK  = (0x38, 0x38, 0x40)   # dark steel (clamps, stands)
METAL_MID   = (0x58, 0x5c, 0x68)   # steel mid
METAL_LIGHT = (0x88, 0x8c, 0x98)   # steel highlight
BRASS_DARK  = (0x6a, 0x50, 0x18)   # brass / aged copper dark
BRASS_MID   = (0xa8, 0x7c, 0x28)   # brass mid
BRASS_LIGHT = (0xd4, 0xa8, 0x48)   # brass / amber light

# ── Glass / Liquid (Cyan family) ─────────────────────────────────────────────
GLASS_DARK  = (0x14, 0x44, 0x58)   # dark glass / liquid shadow
GLASS_MID   = (0x28, 0x80, 0xa0)   # glass body / water
GLASS_LIGHT = (0x60, 0xb8, 0xd0)   # glass highlight / refraction
GLASS_SHINE = (0xb8, 0xe8, 0xf0)   # specular glint

# ── Chemical Accents ──────────────────────────────────────────────────────────
ACID_DARK   = (0x28, 0x60, 0x08)   # acid green shadow
ACID_MID    = (0x50, 0xa0, 0x10)   # acid green / indicator
ACID_BRIGHT = (0x88, 0xd8, 0x28)   # bright acid reaction
MAGENTA     = (0xa0, 0x10, 0x70)   # chemical magenta / titration
AMBER       = (0xd8, 0x94, 0x10)   # warning amber / flame

# ── UI / Text / Glow ──────────────────────────────────────────────────────────
PHOSPHOR    = (0x18, 0xd8, 0x48)   # CRT terminal green glow
TEXT_WHITE  = (0xe0, 0xe4, 0xd8)   # dialogue text
TEXT_DIM    = (0x88, 0x98, 0x88)   # dimmed text / UI secondary
PURE_WHITE  = (0xff, 0xff, 0xff)   # specular highlights only

# ── Ordered list (for palette-enforcement / quantisation) ────────────────────
ALL_COLORS = [
    VOID, SHADOW, DARK_BLUE,
    WALL_DARK, WALL_MID, WALL_LIGHT, WALL_BRIGHT, TILE_GROUT,
    FLOOR_DARK, FLOOR_MID, FLOOR_LIGHT,
    WOOD_DARK, WOOD_MID, WOOD_LIGHT,
    METAL_DARK, METAL_MID, METAL_LIGHT,
    BRASS_DARK, BRASS_MID, BRASS_LIGHT,
    GLASS_DARK, GLASS_MID, GLASS_LIGHT, GLASS_SHINE,
    ACID_DARK, ACID_MID, ACID_BRIGHT,
    MAGENTA, AMBER,
    PHOSPHOR, TEXT_WHITE, TEXT_DIM, PURE_WHITE,
]
# 33 entries — PURE_WHITE is the 33rd and reserved for glints only;
# effective working palette is 32 named colours.
