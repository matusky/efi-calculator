#!/bin/bash
#
# Normalize an App Store Connect .p8 key into PEM, whichever way it was pasted.
#
#   normalize-asc-key.sh <output-path>     # reads $ASC_KEY_P8
#
# Apple hands you a PEM file and every CI guide gives different advice about how
# to get it into a secret, so the same key arrives in several shapes. All of them
# are recoverable, and none of them is worth a failed build and a re-paste:
#
#   1. Raw PEM, line breaks intact              — what the docs here ask for
#   2. Base64 of the whole PEM file             — what many CI guides recommend
#   3. Just the base64 body, markers stripped   — an easy thing to do by hand
#   4. PEM flattened onto one line              — a paste through something lossy
#
# Anything that still is not a private key after all that is a genuine mistake,
# and the caller reports it with the shape it actually found.

set -euo pipefail

OUT="${1:?usage: normalize-asc-key.sh <output-path>}"
RAW="${ASC_KEY_P8:-}"

die() { echo "::error::$1"; exit 1; }

[ -n "$RAW" ] || die "ASC_KEY_P8 is empty."

is_key() { openssl pkey -in "$1" -noout >/dev/null 2>&1; }

tmp=$(mktemp)
trap 'rm -f "$tmp" "$tmp.b64" "$tmp.wrapped"' EXIT

printf '%s\n' "$RAW" > "$tmp"

# 1. Already PEM.
if grep -q -- '-----BEGIN' "$tmp" && is_key "$tmp"; then
  cp "$tmp" "$OUT"; echo "ASC_KEY_P8: PEM"; exit 0
fi

# 4. PEM with the line breaks lost. Rebuild them: markers on their own lines,
#    body wrapped at 64 characters, which is what PEM expects.
if grep -q -- '-----BEGIN' "$tmp"; then
  sed -e 's/-----BEGIN \([A-Z ]*\)-----/-----BEGIN \1-----\n/' \
      -e 's/-----END \([A-Z ]*\)-----/\n-----END \1-----/' "$tmp" \
    | awk '/-----/ {print; next} {gsub(/[[:space:]]/,""); if (length) print}' \
    | awk '/-----/ {print; next} {while (length($0) > 64) {print substr($0,1,64); $0 = substr($0,65)} if (length) print}' > "$tmp.wrapped"
  if is_key "$tmp.wrapped"; then
    cp "$tmp.wrapped" "$OUT"; echo "ASC_KEY_P8: PEM (line breaks rebuilt)"; exit 0
  fi
fi

# 2. Base64 of the whole file.
if tr -d '[:space:]' < "$tmp" | base64 -d > "$tmp.b64" 2>/dev/null; then
  if grep -q -- '-----BEGIN' "$tmp.b64" && is_key "$tmp.b64"; then
    cp "$tmp.b64" "$OUT"; echo "ASC_KEY_P8: base64-encoded PEM (decoded)"; exit 0
  fi
fi

# 3. Bare base64 body with the markers stripped — wrap it back up.
{
  echo "-----BEGIN PRIVATE KEY-----"
  tr -d '[:space:]' < "$tmp" | fold -w 64
  echo
  echo "-----END PRIVATE KEY-----"
} > "$tmp.wrapped"
if is_key "$tmp.wrapped"; then
  cp "$tmp.wrapped" "$OUT"; echo "ASC_KEY_P8: bare base64 body (markers restored)"; exit 0
fi

# Out of recoverable shapes — say what it looks like, without printing it.
bytes=$(wc -c < "$tmp" | tr -d ' ')
lines=$(wc -l < "$tmp" | tr -d ' ')
die "ASC_KEY_P8 is not a usable App Store Connect key. It is ${bytes} bytes over ${lines} line(s), with no BEGIN marker and it does not decode to one. Open the AuthKey_XXXXXXXXXX.p8 Apple gave you in a text editor, select ALL of it — both -----BEGIN/END PRIVATE KEY----- lines included — and paste that. If the file is lost, revoke the key in App Store Connect and generate a new one; it costs nothing."
