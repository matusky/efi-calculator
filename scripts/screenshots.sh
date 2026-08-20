#!/bin/bash
#
# Regenerate the App Store screenshot sets from the real app.
#
#   ./scripts/screenshots.sh
#
# Builds the app for the simulator, then for each shot installs a COPY of the
# bundle whose web assets carry a small injected script — it ticks the boxes a
# human would tick and scrolls to the section being photographed. The shipping
# build is never modified; only the throwaway copy that goes on the simulator.
#
# Output lands in assets/screenshots/, at the exact pixel sizes App Store
# Connect accepts for the iPhone 6.9" and iPad 13" display classes.
#
# Requires Xcode and the two simulators named below.

set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$PWD"
OUT="$ROOT/assets/screenshots"
BUNDLE_ID="com.plynth.efi"

PHONE_NAME="iPhone 17 Pro Max"   # 6.9" class -> 1320 x 2868
IPAD_NAME="iPad Pro 13-inch (M5)" # 13"  class -> 2064 x 2752

udid_for() {
  xcrun simctl list devices available -j \
    | python3 -c "import json,sys;d=json.load(sys.stdin)['devices'];print(next(x['udid'] for v in d.values() for x in v if x['name']==sys.argv[1]))" "$1"
}

echo "==> Building"
npx cap sync ios >/dev/null
xcodebuild build \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Debug \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath ios/App/build \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY="" >/dev/null
APP="$ROOT/ios/App/build/Build/Products/Debug-iphonesimulator/App.app"

# shoot <udid> <css-selector-or-empty> <output-path>
shoot() {
  local sim="$1" sel="$2" out="$3"
  local work; work=$(mktemp -d)
  cp -R "$APP" "$work/App.app"

  python3 - "$work/App.app/public/index.html" "$sel" <<'PY'
import sys
path, sel = sys.argv[1], sys.argv[2]
html = open(path).read()
# A worked Stage III case that scores EFI 7/10 — realistic, and it exercises
# every section rather than leaving the worksheet empty.
script = """
<script>
window.addEventListener('load', function () {
  var pick = function (n, v) {
    var el = document.querySelector('input[name="' + n + '"][value="' + v + '"]');
    if (el) { el.checked = true; }
  };
  pick('peri_sup', 2); pick('peri_deep', 2);
  pick('rov_sup', 1); pick('rov_deep', 16);
  pick('cds', 4);
  pick('adh_rov_dense', 8); pick('adh_rt_filmy', 1);
  pick('lf_l_tube', 4); pick('lf_l_fim', 4); pick('lf_l_ov', 4);
  pick('lf_r_tube', 2); pick('lf_r_fim', 2); pick('lf_r_ov', 1);
  pick('hist_age', 2); pick('hist_inf', 2); pick('hist_preg', 0);
  calculate();
  var sel = SELECTOR;
  if (sel) {
    var target = document.querySelector(sel);
    if (target) { target.scrollIntoView({block: 'start'}); window.scrollBy(0, -12); }
  }
});
</script>
"""
script = script.replace('SELECTOR', repr(sel) if sel else 'null')
open(path, 'w').write(html.replace('</body>', script + '</body>'))
PY

  xcrun simctl terminate "$sim" "$BUNDLE_ID" >/dev/null 2>&1 || true
  xcrun simctl uninstall "$sim" "$BUNDLE_ID" >/dev/null 2>&1 || true
  xcrun simctl install "$sim" "$work/App.app"
  xcrun simctl launch "$sim" "$BUNDLE_ID" >/dev/null
  sleep 4
  xcrun simctl io "$sim" screenshot "$out" >/dev/null 2>&1
  rm -rf "$work"
  echo "    $(basename "$out")  $(sips -g pixelWidth -g pixelHeight "$out" | awk '/pixel/{printf "%s ", $2}')"
}

mkdir -p "$OUT/iphone-6.9" "$OUT/ipad-13"

PHONE=$(udid_for "$PHONE_NAME")
IPAD=$(udid_for "$IPAD_NAME")
for sim in "$PHONE" "$IPAD"; do
  xcrun simctl boot "$sim" 2>/dev/null || true
  xcrun simctl bootstatus "$sim" -b >/dev/null
done

echo "==> iPhone 6.9\""
shoot "$PHONE" ""                    "$OUT/iphone-6.9/01-rasrm.png"
shoot "$PHONE" ".col-right .section" "$OUT/iphone-6.9/02-lf.png"
shoot "$PHONE" ".scorecard"          "$OUT/iphone-6.9/03-scorecard.png"

echo "==> iPad 13\""
shoot "$IPAD" ""           "$OUT/ipad-13/01-overview.png"
shoot "$IPAD" ".scorecard" "$OUT/ipad-13/02-scorecard.png"

echo "==> Done — $OUT"
