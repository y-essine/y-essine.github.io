#!/usr/bin/env node

/**
 * Video Encoding Script for fomo_preview.mp4
 * 
 * Install dependencies first:
 * npm install fluent-ffmpeg
 * 
 * Usage:
 * node encode-video.mjs <input-file>
 * node encode-video.mjs
 */

import ffmpeg from "fluent-ffmpeg";
import { existsSync, statSync } from "fs";
import path from "path";

const input = process.argv[2] || "fomo_preview.mp4";
const outputMP4 = "fomo_preview_opt.mp4";
const outputWebM = "fomo_preview.webm";

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

async function encodeVideo() {
  if (!existsSync(input)) {
    console.error(`❌ Error: ${input} not found!`);
    process.exit(1);
  }

  const inputSize = statSync(input).size;
  console.log("🎬 Starting video optimization...");
  console.log(`📁 Input: ${input} (${formatBytes(inputSize)})`);
  console.log("");

  // MP4 Optimization
  console.log("⏳ Encoding H.264 MP4 (CRF 28)...");

  await new Promise((resolve, reject) => {
    ffmpeg(input)
      .videoCodec("libx264")
      .videoFilter("scale=-1:-1")
      .outputOptions(["-crf", "28", "-preset", "medium"])
      .audioCodec("aac")
      .audioBitrate("128k")
      .on("progress", (progress) => {
        process.stdout.write(
          `\rEncoding MP4: ${Math.round(progress.percent)}% done`
        );
      })
      .on("end", () => {
        console.log("");
        const size = statSync(outputMP4).size;
        console.log(`✅ MP4 Optimized: ${outputMP4} (${formatBytes(size)})`);
        console.log("");
        resolve();
      })
      .on("error", (err) => {
        console.error(`\n❌ MP4 encoding failed: ${err.message}`);
        reject(err);
      })
      .save(outputMP4);
  });

  // WebM Optimization
  console.log("⏳ Encoding WebM VP9 (500kbps)...");

  await new Promise((resolve, reject) => {
    ffmpeg(input)
      .videoCodec("libvpx-vp9")
      .videoFilter("scale=-1:-1")
      .outputOptions([
        "-b:v",
        "500k",
        "-tile-columns",
        "6",
        "-frame-parallel",
        "1",
        "-auto-alt-ref",
        "1",
        "-lag-in-frames",
        "25",
      ])
      .audioCodec("libopus")
      .audioBitrate("128k")
      .on("progress", (progress) => {
        process.stdout.write(
          `\rEncoding WebM: ${Math.round(progress.percent)}% done`
        );
      })
      .on("end", () => {
        console.log("");
        const size = statSync(outputWebM).size;
        console.log(`✅ WebM Encoded: ${outputWebM} (${formatBytes(size)})`);
        console.log("");
        resolve();
      })
      .on("error", (err) => {
        console.error(`\n❌ WebM encoding failed: ${err.message}`);
        reject(err);
      })
      .save(outputWebM);
  });

  // Summary
  console.log("🎉 Complete! Files ready:");
  console.log(`   - Original: ${formatBytes(inputSize)}`);
  console.log(
    `   - MP4:      ${formatBytes(statSync(outputMP4).size)}`
  );
  console.log(
    `   - WebM:     ${formatBytes(statSync(outputWebM).size)}`
  );
  console.log("");
  console.log("📝 To use, update your component with:");
  console.log('   <source src="/fomo_preview.webm" type="video/webm" />');
  console.log('   <source src="/' + outputMP4 + '" type="video/mp4" />');
}

encodeVideo().catch((err) => {
  console.error("❌ Encoding failed:", err);
  process.exit(1);
});
