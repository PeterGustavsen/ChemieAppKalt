#!/usr/bin/env python3
"""
Procedural SFX generator for the Chemie Escape Room.

Synthesizes short, characterful retro/lab sound effects with numpy and writes
16-bit WAV files. A sibling step (build_sfx.sh) converts them to small .m4a
for the app bundle. No external samples needed — everything is generated.

Run:  python3 tools/sfx/gen_sfx.py  ->  writes WAVs to tools/sfx/_wav/
"""
import os
import wave
import struct
import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "_wav")
os.makedirs(OUT, exist_ok=True)


def t(dur):
    return np.linspace(0, dur, int(SR * dur), endpoint=False)


def adsr(n, a=0.005, d=0.05, s=0.6, r=0.1):
    """Simple amplitude envelope of length n samples."""
    env = np.ones(n)
    ai, di, ri = int(a * SR), int(d * SR), int(r * SR)
    ai, di, ri = min(ai, n), min(di, n), min(ri, n)
    if ai:
        env[:ai] = np.linspace(0, 1, ai)
    if di:
        env[ai:ai + di] = np.linspace(1, s, di)
    env[ai + di:n - ri] = s
    if ri:
        env[n - ri:] = np.linspace(env[n - ri - 1] if n - ri - 1 >= 0 else s, 0, ri)
    return env


def expdecay(n, k=8.0):
    return np.exp(-k * np.linspace(0, 1, n))


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1.0
    return x / m * peak


def write_wav(name, sig):
    sig = norm(sig)
    data = (sig * 32767).astype(np.int16)
    path = os.path.join(OUT, name + ".wav")
    with wave.open(path, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", s) for s in data))
    print("wrote", path, f"({len(data)/SR:.2f}s)")


# ── drip — water/acid drop: quick downward pitch blip + short tail ──────────
def drip():
    x = t(0.28)
    f = 1400 * np.exp(-9 * x) + 320
    body = np.sin(2 * np.pi * f * x) * expdecay(len(x), 11)
    plink = np.sin(2 * np.pi * 2600 * x) * expdecay(len(x), 40) * 0.4
    return body + plink


# ── glass-clink — UI tap / glass ping: two metallic partials, fast decay ────
def glass_clink():
    x = t(0.16)
    s = (np.sin(2 * np.pi * 2200 * x) * 0.7 +
         np.sin(2 * np.pi * 3300 * x) * 0.5 +
         np.sin(2 * np.pi * 5200 * x) * 0.25)
    return s * expdecay(len(x), 28)


# ── locker-clunk — heavy door/locker thud: low body + noise transient ───────
def locker_clunk():
    x = t(0.22)
    thud = np.sin(2 * np.pi * (120 * np.exp(-6 * x) + 60) * x) * expdecay(len(x), 9)
    click = (np.random.RandomState(1).randn(len(x))) * expdecay(len(x), 60) * 0.5
    # crude lowpass on the click
    click = np.convolve(click, np.ones(8) / 8, mode="same")
    return thud + click


# ── alarm-klaxon — two-tone emergency horn, ~1.1s, loopable ─────────────────
def alarm_klaxon():
    dur = 1.1
    x = t(dur)
    # alternate between two tones every 0.28s
    tone = np.where((np.floor(x / 0.28) % 2) == 0, 480.0, 360.0)
    saw = 2 * (x * tone - np.floor(0.5 + x * tone))  # naive saw
    sig = saw * 0.5 + np.sin(2 * np.pi * tone * x) * 0.5
    # gentle tremolo + global fade in/out for clean loop
    trem = 0.85 + 0.15 * np.sin(2 * np.pi * 6 * x)
    edge = np.ones(len(x))
    e = int(0.02 * SR)
    edge[:e] = np.linspace(0, 1, e)
    edge[-e:] = np.linspace(1, 0, e)
    return sig * trem * edge


# ── radio-beep — comms static burst + confirm beep ──────────────────────────
def radio_beep():
    x = t(0.42)
    rng = np.random.RandomState(7)
    static = rng.randn(len(x)) * expdecay(len(x), 6) * 0.35
    static = np.convolve(static, np.ones(3) / 3, mode="same")
    beep_t = t(0.12)
    beep = np.sin(2 * np.pi * 1750 * beep_t) * adsr(len(beep_t), 0.004, 0.0, 1.0, 0.03)
    sig = static.copy()
    start = int(0.24 * SR)
    sig[start:start + len(beep)] += beep * 0.9
    return sig


# ── success-chime — rising 3-note arpeggio (A–C#–E-ish) ─────────────────────
def success_chime():
    notes = [523.25, 659.25, 783.99, 1046.5]  # C5 E5 G5 C6
    dur = 0.5
    out = np.zeros(int(SR * dur))
    step = int(0.09 * SR)
    for i, fr in enumerate(notes):
        seg = t(dur - i * 0.09)
        tone = (np.sin(2 * np.pi * fr * seg) +
                0.3 * np.sin(2 * np.pi * 2 * fr * seg)) * expdecay(len(seg), 4.5)
        out[i * step:i * step + len(tone)] += tone
    return out


# ── error-buzz — low square buzz with amplitude wobble ──────────────────────
def error_buzz():
    x = t(0.30)
    sq = np.sign(np.sin(2 * np.pi * 150 * x))
    am = 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 28 * x))
    return sq * am * adsr(len(x), 0.004, 0.02, 0.8, 0.06)


# ── lab-hum — steady ambient drone, ~2.4s seamless loop (optional) ──────────
def lab_hum():
    dur = 2.4
    x = t(dur)
    hum = (np.sin(2 * np.pi * 60 * x) * 0.5 +
           np.sin(2 * np.pi * 120 * x) * 0.22 +
           np.sin(2 * np.pi * 180 * x) * 0.10)
    rng = np.random.RandomState(3)
    air = np.convolve(rng.randn(len(x)), np.ones(64) / 64, mode="same") * 0.06
    sig = hum + air
    e = int(0.05 * SR)
    sig[:e] *= np.linspace(0, 1, e)
    sig[-e:] *= np.linspace(1, 0, e)
    return sig * 0.6


if __name__ == "__main__":
    write_wav("drip", drip())
    write_wav("glass-clink", glass_clink())
    write_wav("locker-clunk", locker_clunk())
    write_wav("alarm-klaxon", alarm_klaxon())
    write_wav("radio-beep", radio_beep())
    write_wav("success-chime", success_chime())
    write_wav("error-buzz", error_buzz())
    write_wav("lab-hum", lab_hum())
    print("done")
