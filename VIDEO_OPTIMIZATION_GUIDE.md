# Video Optimization Guide for fomo_preview.mp4

## Current Status

- **File size:** 40MB
- **Location:** `/public/fomo_preview.mp4`
- **Usage:** Project preview on fomo-app detail page

## ⚡ Quick Solutions (Ranked by Impact)

### 1. **Re-encode to WebM with VP9 (Best Compression)**

```bash
ffmpeg -i fomo_preview.mp4 -c:v libvpx-vp9 -b:v 500k -c:a libopus -b:a 128k fomo_preview.webm
```

- **Expected result:** 2-8MB (80-95% reduction)
- **Browser support:** Modern browsers (98%+)
- **Pros:** Superior compression, smaller file size
- **Cons:** Encoding takes longer (~30-60 sec per min of video)

### 2. **Re-encode H.264 with lower bitrate**

```bash
ffmpeg -i fomo_preview.mp4 -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k fomo_preview_optimized.mp4
```

- **Expected result:** 5-15MB (60-87% reduction)
- **Browser support:** Universal (100%)
- **Pros:** Faster encoding, universally supported
- **Cons:** Larger than WebM

### 3. **Multi-format strategy (BEST for compatibility)**

```bash
# Original MP4 with lower bitrate
ffmpeg -i fomo_preview.mp4 -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k fomo_preview.mp4

# WebM for modern browsers
ffmpeg -i fomo_preview.mp4 -c:v libvpx-vp9 -b:v 400k -c:a libopus -b:a 96k fomo_preview.webm
```

Update HTML to serve best format:

```jsx
<video width={1920} height={1080} controls className="w-full">
  <source src="/fomo_preview.webm" type="video/webm" />
  <source src="/fomo_preview.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
```

---

## 🎯 Implementation Recommendation

### **Phase 1: Immediate (Recommended)**

1. Create WebM version (~5MB) - use VP9, 500kbps video + 128kbps audio
2. Keep original MP4 as fallback
3. Use multi-source approach (browsers pick WebM first)
4. **Expected result:** 5MB for 90%+ of users, 40MB only as fallback

### **Phase 2: Advanced (Optional - CDN)**

- Upload to **Cloudinary**, **Bunny CDN**, or **Vercel Blob**
- Automatic format conversion & optimization
- Edge caching for instant delivery
- Lazy loading with progressive playback

### **Phase 3: Progressive Loading (Optional)**

Add poster image + lazy load:

```jsx
<video
  width={1920}
  height={1080}
  controls
  poster="/fomo_preview_poster.png"
  loading="lazy"
  className="w-full"
>
  <source src="/fomo_preview.webm" type="video/webm" />
  <source src="/fomo_preview.mp4" type="video/mp4" />
</video>
```

---

## 📊 Compression Results Comparison

| Format       | Bitrate  | Est. Size | Load Time (4G) | Quality       |
| ------------ | -------- | --------- | -------------- | ------------- |
| Original MP4 | ???      | 40 MB     | ~8s            | ✅ Full       |
| H.264 CRF 28 | 2-3 Mbps | ~8 MB     | ~1.6s          | ✅ Good       |
| VP9 500kbps  | 500 kbps | ~5 MB     | ~1s            | ✅ Good       |
| VP9 400kbps  | 400 kbps | ~4 MB     | ~0.8s          | ⚠️ Acceptable |

---

## 🛠️ Installation & Usage

### Install FFmpeg

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
# Or: choco install ffmpeg
```

### Quick Encode Script

```bash
#!/bin/bash
INPUT="fomo_preview.mp4"
OUTPUT_MP4="fomo_preview.mp4"
OUTPUT_WEBM="fomo_preview.webm"

# MP4 optimization
ffmpeg -i $INPUT -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k $OUTPUT_MP4

# WebM optimization
ffmpeg -i $INPUT -c:v libvpx-vp9 -b:v 500k -c:a libopus -b:a 128k $OUTPUT_WEBM

echo "✅ Encoding complete!"
```

---

## 🚀 Next Steps

1. **Check current video duration:** `ffprobe fomo_preview.mp4 | grep Duration`
2. **Test encoding with CRF 28:** Fastest to see impact
3. **Deploy WebM version** to `/public/fomo_preview.webm`
4. **Update component** to use multi-source approach
5. **Monitor:** Check DevTools Network tab to confirm WebM is served

---

## Alternative: Chunked Streaming (Complex but Powerful)

If video is >5 minutes, consider HLS (HTTP Live Streaming):

- Breaks video into 10-second chunks
- User downloads only needed chunks
- Smooth buffering & adaptive quality

**Tools:** FFmpeg, hls.js library
**Use case:** Long demo videos, live streaming

---

## Questions?

Check video info: `ffprobe -show_format -show_streams fomo_preview.mp4`
