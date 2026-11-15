#!/usr/bin/env bash
# Renders the contact sheet to out/preview.png (headless, no window opens).
# Usage: ./shot.sh [query-string] [output.png]   e.g. ./shot.sh "only=mail&big=320" out/mail.png
set -euo pipefail
cd "$(dirname "$0")"
node --no-warnings export.mjs
q="${1:-}"; out="${2:-out/preview.png}"
browser="$(command -v chromium || command -v google-chrome-stable)"
"$browser" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --user-data-dir="$(mktemp -d)" --allow-file-access-from-files \
  --window-size="${WIN:-1500,2300}" --virtual-time-budget=2000 \
  --screenshot="$PWD/$out" "file://$PWD/preview.html?$q" >/dev/null 2>&1
echo "wrote $PWD/$out"
