# SFX — Sound Effects

These `.m4a` files are **procedurally generated** — no external samples. To
regenerate (or tweak), edit `tools/sfx/gen_sfx.py` and run:

```
bash tools/sfx/build_sfx.sh
```

That synthesizes WAVs (numpy) and converts them to small AAC `.m4a`
(`afconvert`, macOS built-in). Each effect is registered in
`src/fx/feedback.js` (the `SFX` map). Native plays these via expo-av; web
uses the WebAudio oscillator fallback in `src/components/SoundManager.js`.

| FX call        | File                | Sound                     |
| -------------- | ------------------- | ------------------------- |
| `FX.drip()`    | `drip.m4a`          | water/acid drip           |
| `FX.click()`   | `glass-clink.m4a`   | glass clink / UI tap      |
| `FX.clunk()`   | `locker-clunk.m4a`  | locker / door clunk       |
| `FX.alarm()`   | `alarm-klaxon.m4a`  | two-tone alarm klaxon     |
| `FX.radio()`   | `radio-beep.m4a`    | radio static + beep       |
| `FX.success()` | `success-chime.m4a` | rising success chime      |
| `FX.error()`   | `error-buzz.m4a`    | low error buzz            |
| (ambient loop) | `lab-hum.m4a`       | lab-hum drone — not yet wired |

To swap in a hand-made/recorded sound instead, just drop a file with the same
name here (keep it short + small) — no code change needed.
