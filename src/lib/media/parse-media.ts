import { parseGifFile } from "@/lib/gif/parse-gif";
import { parseGridImageFile } from "@/lib/media/parse-grid-image";
import { parseVideoFile } from "@/lib/video/parse-video";
import type { AppMedia, ParsedSpriteFrame } from "@/types/motion";

export type ParseMediaOptions = {
  maxFrames?: number;
  onProgress?: (current: number, total: number) => void;
  /** GIF only: force every frame to be independent (Dispose 2). Fixes ghosting. */
  forceDispose?: boolean;
};

export async function parseMediaFile(
  file: File,
  opts: ParseMediaOptions = {},
): Promise<AppMedia> {
  let frames: ParsedSpriteFrame[];
  let type: "gif" | "video" | "sheet";
  let detectedGrid: AppMedia["detectedGrid"];

  if (isGif(file)) {
    type = "gif";
    frames = await parseGifFile(file, { forceDispose: opts.forceDispose });
  } else if (isImage(file)) {
    type = "sheet";
    const parsed = await parseGridImageFile(file);
    frames = parsed.frames;
    detectedGrid = parsed.detectedGrid;
  } else if (isVideo(file)) {
    type = "video";
    frames = await parseVideoFile(file, opts);
  } else {
    throw new Error("不支持此格式。請上傳 GIF、MP4、MOV、WebM 或宮格圖片。");
  }

  if (frames.length === 0) throw new Error("未能解析出任何幀，文件可能損壞。");

  return {
    name: file.name,
    type,
    width: frames[0].width,
    height: frames[0].height,
    frames,
    detectedGrid,
  };
}

function isGif(f: File) {
  return f.type === "image/gif" || f.name.toLowerCase().endsWith(".gif");
}

function isVideo(f: File) {
  return f.type.startsWith("video/") || /\.(mp4|mov|webm|m4v)$/i.test(f.name);
}

function isImage(f: File) {
  return f.type.startsWith("image/") || /\.(png|jpg|jpeg|webp)$/i.test(f.name);
}
