import { MAX_VIDEO_FRAMES } from "@/lib/constants";
import type { ParsedSpriteFrame } from "@/types/motion";

const TARGET_FPS = 10;

export type VideoParseOptions = {
  maxFrames?: number;
  onProgress?: (current: number, total: number) => void;
};

export async function parseVideoFile(
  file: File,
  opts: VideoParseOptions = {},
): Promise<ParsedSpriteFrame[]> {
  const { maxFrames = MAX_VIDEO_FRAMES, onProgress } = opts;
  const objectUrl = URL.createObjectURL(file);

  try {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = objectUrl;

    // loadedmetadata: dimensions + duration available (readyState >= 1)
    await waitForEvent(video, "loadedmetadata");

    // loadeddata: first frame decoded and ready for drawImage (readyState >= 2)
    // Without this wait, seekVideo(t=0) returns immediately (currentTime already 0)
    // and drawImage draws a blank frame because the decoder hasn't run yet.
    if (video.readyState < 2) {
      await waitForEvent(video, "loadeddata");
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    const duration = isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
    const totalFrames = Math.min(maxFrames, Math.max(12, Math.round(duration * TARGET_FPS)));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("無法初始化視頻拆幀畫布。");

    const capturePoints = Array.from({ length: totalFrames }, (_, i) => {
      const progress = totalFrames === 1 ? 0 : i / (totalFrames - 1);
      return Math.min(duration - 0.001, progress * duration);
    });

    const frames: ParsedSpriteFrame[] = [];

    for (const [index, time] of capturePoints.entries()) {
      onProgress?.(index, totalFrames);
      await seekVideo(video, time);
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(video, 0, 0, width, height);

      frames.push({
        id: `frame-${index + 1}`,
        index,
        delay: Math.round(1000 / TARGET_FPS),
        width,
        height,
        dataUrl: canvas.toDataURL("image/png"),
      });
    }

    onProgress?.(totalFrames, totalFrames);

    video.pause();
    video.removeAttribute("src");
    video.load();

    return frames;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function waitForEvent(target: HTMLMediaElement, event: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ok  = () => { clean(); resolve(); };
    const err = () => { clean(); reject(new Error("視頻加載失敗，請確認格式受瀏覽器支持。")); };
    const clean = () => {
      target.removeEventListener(event, ok);
      target.removeEventListener("error", err);
    };
    target.addEventListener(event, ok, { once: true });
    target.addEventListener("error", err, { once: true });
  });
}

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    // Always perform an explicit seek — never early-return based on currentTime.
    // Relying on currentTime == time can skip the decoder flush and produce a stale/blank frame.
    const onSeeked = () => { clean(); resolve(); };
    const onError  = () => { clean(); reject(new Error("視頻跳幀失敗。")); };
    const clean = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
    video.currentTime = time;
  });
}
