#!/usr/bin/env bash
# Generate procedural SFX and convert them to small AAC (.m4a) for the bundle.
# Requires: python3 (+numpy), afconvert (macOS built-in).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
OUT="$ROOT/assets/sfx"

python3 "$HERE/gen_sfx.py"

mkdir -p "$OUT"
for wav in "$HERE/_wav"/*.wav; do
  base="$(basename "${wav%.wav}")"
  # AAC, 96 kbps, mono — tiny files that expo-av plays on iOS/Android.
  afconvert -f m4af -d aac -b 96000 "$wav" "$OUT/$base.m4a"
  echo "-> $OUT/$base.m4a"
done
echo "SFX build complete."
