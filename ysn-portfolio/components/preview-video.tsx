"use client";

import { useEffect, useRef } from "react";

type PreviewVideoProps = {
  /** Path of the 1080p H.264 file, e.g. "/fomo_preview.mp4". Siblings are
   *  expected next to it: "-720.mp4", ".webm", "-720.webm", "-poster.jpg". */
  src: string;
  title: string;
};

const MOBILE_QUERY = "(max-width: 767px)";

export default function PreviewVideo({ src, title }: PreviewVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const base = src.replace(/\.mp4$/, "");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // iOS only plays inline (instead of fullscreen) when the video is muted
    // and playsinline; React can drop `muted` on hydration, so set it here.
    video.muted = true;
    video.setAttribute("muted", "");

    // With reduced motion, don't autoplay: show the poster and let a tap
    // play/pause it (no native controls).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const toggle = () =>
        video.paused ? video.play().catch(() => {}) : video.pause();
      video.addEventListener("click", toggle);
      return () => video.removeEventListener("click", toggle);
    }

    // Only decode while the video is on screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      width={1920}
      height={1080}
      className="w-full"
      poster={`${base}-poster.jpg`}
      aria-label={title}
      muted
      loop
      playsInline
      disablePictureInPicture
      disableRemotePlayback
      controls={false}
      preload="metadata"
    >
      <source media={MOBILE_QUERY} src={`${base}-720.webm`} type="video/webm" />
      <source media={MOBILE_QUERY} src={`${base}-720.mp4`} type="video/mp4" />
      <source src={`${base}.webm`} type="video/webm" />
      <source src={src} type="video/mp4" />
    </video>
  );
}
