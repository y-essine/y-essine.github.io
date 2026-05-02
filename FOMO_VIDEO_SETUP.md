# fomo_preview.mp4 - Implementation Summary

## ✅ What's Been Done

### 1. **Added Video Field to JSON**

- File: [ysn-portfolio/data/portfolio.json](ysn-portfolio/data/portfolio.json)
- Added `"previewVideo": "/fomo_preview.mp4"` to the fomo-app project

### 2. **Updated Project Detail Component**

- File: [ysn-portfolio/components/project-detail.tsx](ysn-portfolio/components/project-detail.tsx)
- Added video display with:
  - ✅ Rounded corners (`rounded-2xl`)
  - ✅ Border styling (`border border-zinc-800`)
  - ✅ Elegant background (`bg-zinc-950/50`)
  - ✅ Shadow effect
  - ✅ Full responsive width
  - ✅ Native video controls
  - ✅ Poster image support

Video appears after the project header, before the overview section.

### 3. **Created Optimization Resources**

#### 📖 **VIDEO_OPTIMIZATION_GUIDE.md**

Comprehensive guide with:

- 3 optimization strategies ranked by impact
- FFmpeg commands for each format
- Multi-format strategy (WebM + MP4 fallback)
- Comparison table of compression results
- Quick installation guide

#### 🔧 **encode_video.sh** (Bash)

Automates encoding process:

```bash
chmod +x encode_video.sh
./encode_video.sh fomo_preview.mp4
```

#### 🔧 **encode-video.mjs** (Node.js)

Alternative Node-based encoder:

```bash
npm install fluent-ffmpeg
node encode-video.mjs fomo_preview.mp4
```

---

## 🚀 Quick Start: Making Video Faster

### **Option 1: Recommended (WebM + MP4 Fallback)**

```bash
# Step 1: Encode WebM (5MB estimated)
ffmpeg -i fomo_preview.mp4 -c:v libvpx-vp9 -b:v 500k -c:a libopus -b:a 128k fomo_preview.webm

# Step 2: Place in /public/
cp fomo_preview.webm ysn-portfolio/public/

# Step 3: Update component to use both formats
# (see below)
```

### **Option 2: Quick (MP4 only, lower bitrate)**

```bash
ffmpeg -i fomo_preview.mp4 -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k fomo_preview.mp4
cp fomo_preview.mp4 ysn-portfolio/public/
```

---

## 📝 To Use Both WebM + MP4 Fallback

Update the video component in [project-detail.tsx](ysn-portfolio/components/project-detail.tsx#L132):

Replace:

```jsx
<source src={project.previewVideo} type="video/mp4" />
```

With:

```jsx
<source src="/fomo_preview.webm" type="video/webm" />
<source src={project.previewVideo} type="video/mp4" />
```

This way:

- 🎯 Modern browsers get fast WebM (~5MB)
- ⏳ Old browsers fall back to MP4 (~8-15MB)

---

## 📊 Current Setup

| Aspect              | Status         |
| ------------------- | -------------- |
| Video in JSON       | ✅ Done        |
| Component rendering | ✅ Done        |
| Rounded corners     | ✅ Done        |
| Styling/Shadow      | ✅ Done        |
| Controls enabled    | ✅ Done        |
| Video optimization  | 📌 Ready to do |

---

## 🎥 How to View It

The video will automatically display on the fomo-app project detail page:

```
http://localhost:3000/en/projects/fomo-app
http://localhost:3000/fr/projects/fomo-app
```

---

## 💾 File Locations

| File                                          | Purpose                              |
| --------------------------------------------- | ------------------------------------ |
| `fomo_preview.mp4`                            | Current source video (40MB)          |
| `fomo_preview.webm`                           | Optimized for modern browsers (~5MB) |
| `ysn-portfolio/components/project-detail.tsx` | Component displaying video           |
| `ysn-portfolio/data/portfolio.json`           | Project metadata                     |
| `encode_video.sh`                             | Bash encoding automation             |
| `encode-video.mjs`                            | Node.js encoding automation          |
| `VIDEO_OPTIMIZATION_GUIDE.md`                 | Detailed optimization guide          |

---

## ⚡ Performance Expected

### Before Optimization

- File size: **40 MB**
- Load time (4G): **~8 seconds**
- Mobile: ⚠️ Slow, poor experience

### After Optimization (WebM)

- File size: **~5 MB**
- Load time (4G): **~1 second**
- Mobile: ✅ Fast, smooth playback

### Savings

- **87.5% smaller**
- **8x faster** load
- **Reduced bandwidth** usage

---

## 🔗 Next Steps

1. **Choose encoding strategy** → See VIDEO_OPTIMIZATION_GUIDE.md
2. **Encode video** → Use encode_video.sh or FFmpeg command
3. **Place WebM in public/** → `ysn-portfolio/public/fomo_preview.webm`
4. **Update component** → Use multi-source approach
5. **Test** → Open project page, verify video plays smoothly
6. **Deploy** → Push to GitHub

---

## ❓ Questions?

- **Want to skip optimization?** Just keep using the 40MB MP4 (works fine, slower)
- **Don't have FFmpeg?** See VIDEO_OPTIMIZATION_GUIDE.md for installation
- **Need HLS streaming?** For very long videos (10+ mins), see Advanced section in guide
- **Want CDN?** Upload to Cloudinary/Bunny CDN for auto-optimization

---

Generated with ✨ video optimization recommendations
