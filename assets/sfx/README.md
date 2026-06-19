# SFX — Sound Effects

Drop short audio files here (`.mp3` or `.wav`, mono, < ~100 KB each), then
register them in `src/fx/feedback.js` (uncomment the matching line in the
`SFX` map). Until a file is registered, that effect is silent on native —
no crash. Web uses the WebAudio oscillator fallback regardless.

| FX call        | File                | Sound                          |
| -------------- | ------------------- | ------------------------------ |
| `FX.drip()`    | `drip.mp3`          | water/acid drip                |
| `FX.click()`   | `glass-clink.mp3`   | glass clink / UI tap           |
| `FX.clunk()`   | `locker-clunk.mp3`  | locker / door clunk            |
| `FX.alarm()`   | `alarm-klaxon.mp3`  | alarm klaxon                   |
| `FX.radio()`   | `radio-beep.mp3`    | radio static + beep            |
| `FX.success()` | `success-chime.mp3` | success chime                  |
| `FX.error()`   | `error-buzz.mp3`    | error buzz                     |
| (optional)     | `lab-hum.mp3`       | ambient lab-hum loop           |

Good free sources: freesound.org (CC0), mixkit.co, kenney.nl/assets (audio).
