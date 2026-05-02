#!/bin/bash

# Video Encoding Script - fomo_preview.mp4
# Usage: ./encode_video.sh

INPUT="${1:-fomo_preview.mp4}"
OUTPUT_MP4="fomo_preview_opt.mp4"
OUTPUT_WEBM="fomo_preview.webm"

echo "🎬 Starting video optimization..."
echo "📁 Input: $INPUT"
echo ""

# Check if input file exists
if [ ! -f "$INPUT" ]; then
    echo "❌ Error: $INPUT not found!"
    exit 1
fi

# Get video info
echo "📊 Video Information:"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,bit_rate -of default=noprint_wrappers=1:nokey=1:noprint_wrappers=1 "$INPUT"
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$INPUT"
echo ""

# MP4 Optimization (H.264, CRF 28)
echo "⏳ Encoding H.264 MP4 (CRF 28)..."
ffmpeg -i "$INPUT" \
    -c:v libx264 \
    -crf 28 \
    -preset medium \
    -c:a aac \
    -b:a 128k \
    -v quiet \
    -stats \
    "$OUTPUT_MP4"

if [ -f "$OUTPUT_MP4" ]; then
    SIZE_MP4=$(du -h "$OUTPUT_MP4" | cut -f1)
    echo "✅ MP4 Optimized: $OUTPUT_MP4 ($SIZE_MP4)"
else
    echo "❌ MP4 encoding failed"
    exit 1
fi

echo ""

# WebM Optimization (VP9, 500kbps)
echo "⏳ Encoding WebM VP9 (500kbps)..."
ffmpeg -i "$INPUT" \
    -c:v libvpx-vp9 \
    -b:v 500k \
    -tile-columns 6 \
    -frame-parallel 1 \
    -auto-alt-ref 1 \
    -lag-in-frames 25 \
    -c:a libopus \
    -b:a 128k \
    -v quiet \
    -stats \
    "$OUTPUT_WEBM"

if [ -f "$OUTPUT_WEBM" ]; then
    SIZE_WEBM=$(du -h "$OUTPUT_WEBM" | cut -f1)
    echo "✅ WebM Encoded: $OUTPUT_WEBM ($SIZE_WEBM)"
else
    echo "❌ WebM encoding failed"
    exit 1
fi

echo ""
echo "🎉 Complete! Files ready:"
echo "   - Original: $(du -h "$INPUT" | cut -f1)"
echo "   - MP4:      $SIZE_MP4"
echo "   - WebM:     $SIZE_WEBM"
echo ""
echo "📝 To use, update your component with:"
echo "   <source src=\"/fomo_preview.webm\" type=\"video/webm\" />"
echo "   <source src=\"/$OUTPUT_MP4\" type=\"video/mp4\" />"
