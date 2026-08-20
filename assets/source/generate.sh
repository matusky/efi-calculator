#!/usr/bin/env bash
# Regenerate the EFI app/web icon and splash PNGs from the HTML sources in this directory.
#
#   assets/icon-only.png            1024x1024   app icon (@capacitor/assets source)
#   assets/splash.png               2732x2732   light launch screen
#   assets/splash-dark.png          2732x2732   dark launch screen
#   www/icons/icon-192.png          192x192     PWA manifest
#   www/icons/icon-512.png          512x512     PWA manifest
#   www/icons/icon-512-maskable.png 512x512     PWA manifest, safe-zone padded
#   www/icons/apple-touch-icon.png  180x180     iOS home screen (Safari)
#
# Requires: Google Chrome (headless rasterizer, so Georgia renders identically to the site)
#           and ImageMagick (`magick`) for the downscales.
# After running, re-run:  npx capacitor-assets generate --ios
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SRC/../.." && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

shot() { # shot <src.html> <css-size> <out.png>
  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=2 --window-size="$2,$2" \
    --screenshot="$3" "file://$SRC/$1" >/dev/null 2>&1
}

mkdir -p "$ROOT/assets" "$ROOT/www/icons"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

shot icon.html          512  "$ROOT/assets/icon-only.png"      # 1024x1024
shot splash.html       1366  "$ROOT/assets/splash.png"         # 2732x2732
shot splash-dark.html  1366  "$ROOT/assets/splash-dark.png"    # 2732x2732
shot icon-maskable.html 512  "$TMP/maskable.png"               # 1024x1024

magick "$ROOT/assets/icon-only.png" -resize 512x512 "$ROOT/www/icons/icon-512.png"
magick "$ROOT/assets/icon-only.png" -resize 192x192 "$ROOT/www/icons/icon-192.png"
magick "$ROOT/assets/icon-only.png" -resize 180x180 "$ROOT/www/icons/apple-touch-icon.png"
magick "$TMP/maskable.png"          -resize 512x512 "$ROOT/www/icons/icon-512-maskable.png"

# App Store rejects icons with an alpha channel; keep every output opaque RGB.
for f in "$ROOT/assets/icon-only.png" "$ROOT/assets/splash.png" "$ROOT/assets/splash-dark.png" \
         "$ROOT/www/icons/"*.png; do
  magick "$f" -background '#1e2a35' -alpha remove -alpha off \
    -type TrueColor -define png:color-type=2 "$f"
done

echo "Regenerated. Now run: npx capacitor-assets generate --ios"
