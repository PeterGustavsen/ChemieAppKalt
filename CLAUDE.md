# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An Expo / React-Native-Web game: a single-player chemistry "escape room" (`chemie-escape-room`).
The player is locked in Prof. Molar's lab, solves 6 electrochemistry/organic-chemistry
stations to extract a 3–4 digit code from each, enters those codes at a Terminal, and must
finish before a 30-minute timer expires. UI text is German. Targets web (GitHub Pages) and
native (iOS/Android via Expo); **landscape-only**.

## Commands

```bash
npm install            # install deps
npm run web            # expo start --web  (primary dev target)
npm start              # expo start (Metro; pick platform interactively)
npm run android        # expo start --android
npm run ios            # expo start --ios
npx expo export --platform web   # produce the web bundle in dist/ (what CI deploys)
```

There is **no test runner, linter, or typecheck** configured — `package.json` has no `test`/`lint`
scripts and the project is plain JS (no TypeScript). Don't invent commands for these.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy-pages.yml`, which runs `expo export`,
restores tracked `dist/canvaskit.{js,wasm}` + `.nojekyll`, rewrites `dist/index.html` from
`tools/web/index.template.html` (the template boots Skia/CanvasKit **before** the JS bundle —
`expo export` wipes `dist/`, hence the restore step), then force-pushes `dist/` to the
`gh-pages` branch which Pages serves. Live updates land ~1–2 min after a push; the Skia
bootstrap in the custom `index.html` is load-bearing — don't replace it with Expo's default.

## Architecture

### Single source of truth: `src/config/game.js`
All puzzle data, layout constants, and narrative live here, not in the scene components:
- `ROOMS` — the 6 stations: `id`, `scene` (component id), `title`, `accent` color, `code`
  (the answer string), and the hub hotspot `rect`. Rooms are solved **in order**; the
  "active" station is always the first unsolved one (`target`).
- `PUZZLES` — keyed by **scene id (2–7)**, holds each puzzle's `intro`/`hint` lines, the
  answer data, and the `code`. A scene's `code` must equal the matching `ROOMS[].code`.
- `SCENE_W=640`, `SCENE_H=360` — the fixed virtual stage; `TIMER_SECONDS`; dialog/radio text
  (`INTRO_DIALOG`, `RADIO_CALLS`, `WIN_DIALOG`, …).
- Pure chemistry helpers (`cellVoltage`, `isProtected`, `dropComma`) used to derive/validate codes.

When changing a puzzle, edit `game.js` first; scene components read `PUZZLES[id]` (with a local
fallback array). Mismatches between a scene's render data and `PUZZLES[id]` cause runtime crashes.

### Scene file names are LEGACY and do not match their content
`App.js` maps `room.scene` → component via `ROOM_COMPONENTS`. The filenames are stale and were
never renamed; trust the header comment / `PUZZLES` id, not the filename:

| scene id | file imported by App.js | actual puzzle |
|----------|-------------------------|---------------|
| 2 | `Scene2Buffer.js`       | Galvanische Zelle |
| 3 | `Scene3Redox.js`        | Opferanode (Ferroxyl) |
| 4 | `Scene4Galvanic.js`     | Rosten von Eisen |
| 5 | `Scene5Ester.js`        | Bromonium-Mechanismus |
| 6 | `Scene6Electrolysis.js` | → re-exports `Scene6Bromwasser.js` |
| 7 | `Scene7Equilibrium.js`  | → re-exports `Scene7Isomerie.js`  |

Some files (`Scene6Electrolysis`, `Scene7Equilibrium`) are one-line re-export shims to the
real implementation; the rest have legacy names with a `NOTE:` header explaining the mismatch.

### App state machine (`App.js`)
Top-level `App` owns all game state and renders one of: `SceneStart` → `Scene1Hub` (`screen`
`'scene1'`) → a puzzle room (`screen` `'room'`) → `SceneWin`/`SceneFail` (`gameState`).
- **Intro flow:** `introDone=false` → Molar dialog → he walks out → power flicker + screen
  shake → `alarmPending` (Terminal shows ALARM 5 s) → `introDone=true` starts the timer.
- **Timer** is wall-clock based (`Date.now()` vs a mutable `startRef`), not tick-counted, and
  shifts `startRef` forward across background/foreground (`AppState`) so backgrounded time
  isn't charged to the player. A single 250 ms interval updates `timeLeft`.
- **Win/Fail:** all 6 solved → `win`; timer hits 0 with any unsolved → `fail` (guarded against
  a race so a last-second solve still wins).
- **Persistence:** snapshots to `AsyncStorage` (`@chemie/save`) and restores mid-game on launch.
  The dependency is `require`d in a try/catch and the app degrades to in-memory if absent.
- **Radio calls:** narrative interruptions in a FIFO queue, fired by progress (`after: N`
  solved) or remaining time (`after: null, at: seconds`); `firedCallsRef` prevents replays.

### Solve → code → Terminal loop
Solving a puzzle in a room does **not** auto-advance. A solved scene calls `onReveal(id)` and
displays its `code`; the player then opens the Terminal in the hub and types it. `onSubmitCode`
checks the input against the current `target.code` only — codes must be entered in room order.

### Rendering model
A fixed 640×360 stage scaled to fit the viewport (`src/engine/layout.js` `useStageLayout`):
`scale = min(w/640, h/360)`, centered, with `toScreen()` mapping stage coords → screen pixels.
Each scene layers:
1. A `@shopify/react-native-skia` `<Canvas>` drawing the background PNG (NEAREST sampling for
   crisp pixel art) + scene-specific Skia art via the `renderScene(L)` callback.
2. RN `<View>`/`<Pressable>` overlays for interactive controls via `renderOverlay(L, {busy})`,
   positioned with `L.toScreen(...)`.

`SceneShell.js` is the shared wrapper for all 6 puzzle rooms: it renders the bg, the
`renderScene`/`renderOverlay` callbacks, the CRT overlay, the pulsing red emergency light,
the in-world "LAB-NOTIZ" clipboard that opens the intro, the hint button, the top bar, and the
solved-state code panel. New puzzle scenes should wrap their content in `SceneShell` and pass
`renderScene`/`renderOverlay`. `Scene1Hub.js` is the hub (it does NOT use `SceneShell`; it has
its own canvas, animated Molar sprite, window/shutter, and the bottom `NavBar`).

### Hub navigation (`src/ui/NavBar.js`)
The hub's bottom bar is the only way to enter stations (the lab-wall decoration is baked into
`assets/scenes/scene_01_lab_hub.png`; there are no clickable wall cabinets). Each station is a
label-free Skia line-icon: grey = locked/not-yet-reachable, blinking accent = the current
`target`, green = solved; plus a Terminal icon. It receives `rooms/solvedIds/target/onPick/onTerminal`
from `Scene1Hub` — keep that prop contract stable when editing.

### Feedback layer (`src/fx/feedback.js`)
All sound/haptics go through `FX.*` (`success`, `error`, `click`, `clunk`, `alarm`, `radio`, …).
Web uses a WebAudio oscillator `SoundManager`; native uses `expo-av` samples (from `assets/sfx/`)
+ `expo-haptics`. Every optional native module is `require`d in try/catch and degrades to silent,
so calling `FX.*` is always safe. Mute state persists to `AsyncStorage`.

## Conventions
- Comments and all in-game strings are German; match that when editing existing files.
- Colors come from each room's `accent`; the palette is dark CRT/terminal (`#0d0f17` bg,
  `#6fe87a` green, monospace fonts). Reuse `room.accent` rather than hardcoding per-station colors.
- `main` is the single working branch.
