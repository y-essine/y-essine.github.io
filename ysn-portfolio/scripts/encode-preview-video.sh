#!/usr/bin/env bash
# Builds every file a project preview video needs, from one source recording.
#
#   scripts/encode-preview-video.sh <source-video> <name>
#   e.g. scripts/encode-preview-video.sh ~/Videos/fomo-demo.mov fomo_preview
#
# Writes into public/:
#   <name>.mp4         1080p H.264  (desktop fallback, Safari)
#   <name>.webm        1080p VP9    (desktop)
#   <name>-720.mp4     720p H.264   (phones, Safari)
#   <name>-720.webm    720p VP9     (phones)
#   <name>-poster.jpg  first-second frame, shown before playback
#
# Then set "previewVideo": "/<name>.mp4" on the project in data/portfolio.json
# (both fr and en); components/preview-video.tsx picks the right file per device.
# Audio is dropped: previews always play muted.
set -euo pipefail

if [ $# -ne 2 ]; then
  sed -n '2,15p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
fi

src="$1"
name="$2"
out="$(cd "$(dirname "$0")/.." && pwd)/public/$name"
[ -f "$src" ] || { echo "no such file: $src" >&2; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg is required" >&2; exit 1; }

# Keep 1080p for desktop; never upscale a smaller source.
fit1080="scale='min(1920,iw)':-2"
fit720="scale='min(1280,iw)':-2"
h264=(-an -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -profile:v high -movflags +faststart)
vp9=(-an -c:v libvpx-vp9 -crf 34 -b:v 0 -deadline good -cpu-used 2 -row-mt 1)

run() { echo "→ $(basename "$1")"; shift; ffmpeg -v error -y "$@"; }

run "$out.mp4"        -i "$src" -vf "$fit1080" "${h264[@]}" "$out.mp4"
run "$out-720.mp4"    -i "$src" -vf "$fit720"  "${h264[@]}" "$out-720.mp4"
run "$out.webm"       -i "$src" -vf "$fit1080" "${vp9[@]}"  "$out.webm"
run "$out-720.webm"   -i "$src" -vf "$fit720"  "${vp9[@]}"  "$out-720.webm"
run "$out-poster.jpg" -ss 1 -i "$src" -frames:v 1 -vf "$fit720" -q:v 4 "$out-poster.jpg"

ls -lh "$out".mp4 "$out".webm "$out"-720.* "$out"-poster.jpg | awk '{print $5, $NF}'
