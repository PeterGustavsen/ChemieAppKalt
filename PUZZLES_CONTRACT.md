# PUZZLES[2..7] — Vertrag (Ruben liefert, Konstantins Szenen lesen)

Die neue Aufgabenstellung (TASK REWRITE) hat **andere Chemie** als die aktuelle
`PUZZLES` in `src/config/game.js`. Ruben passt `PUZZLES[2..7]`, `ROOMS[].code`,
`ROOMS[].accent` und das Szenen→Komponenten-Mapping in `App.js` an. Konstantins
Szenen **lesen** nur die unten gelisteten Felder (+ `intro`, `hint` wie gehabt).

Bis dahin haben die Szenen **lokale Fallback-Daten** (gleiche Werte), laufen also
offline — sobald `PUZZLES[n]` die Felder liefert, überschreiben diese den Fallback.

> Außerdem (Hub, Handoff #1): `ROOMS[].rect` auf die neuen 6 Schrank-Rects setzen
> (siehe `tools/pixelart/scene_01_hotspots.json`) und `TERMINAL` → console-Rect
> `{x:258,y:262,w:124,h:70}`. Das alte Fenster/Rollladen aus der Intro-Cinematic
> hat in der neuen Hub-Komposition kein Ziel mehr — Molar-Walkout/Flicker/Alarm
> bleiben, Shutter ggf. entfernen.

| Szene (Akzent) | Code | PUZZLES[n] Felder, die die Szene liest |
|---|---|---|
| **2 Galvanische Zelle** (#6fd3dd) | `1100` | `metals: [{sym, e}]` (E° in V), `targetMv: 1100` |
| **3 Opferanode** (#e36fb0) | tbd | `metals: [{sym, protects: bool}]`, `best: 'Mg'` |
| **4 Rosten** (#e0b44c) | tbd | `anode: {species, e}`, `cathode: {species, e}` |
| **5 Bromonium** (#9660c8) | tbd | `plates: [{digit, order}]` (3 Stück, `order` 0..2) |
| **6 Bromwasser** (#6fe08a) | tbd | `tubes: [{name, unsaturated: bool, digit, order}]` |
| **7 Isomerie E/Z** (#f0b23a) | tbd | `molecules: [{answer:'E'|'Z', digit, geometry}]` (Handoff #2) |

## Gemeinsam (alle Szenen)
- `intro: string[]` — In-World-Klemmbrett-Notiz (kein Vollbild mehr).
- `hint: string[]` — Hinweis-Button.
- Der **Code** entsteht aus den `digit`/Werten in Lösungs-Reihenfolge; finale
  Eingabe am Terminal (`ROOMS[].code`).

## Handoff #2 — Szene 7 Geometrie
Jede der 3 Moleküldarstellungen muss zu Rubens `answer` (E/Z) passen. Die drei
Strukturen (Substituenten + CIP-Priorität) stimmen Ruben & Konstantin gemeinsam ab;
die Skia-Zeichnung in `Scene7Isomerie.js` rendert exakt diese Geometrie.
