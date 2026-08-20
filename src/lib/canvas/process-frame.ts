import type { ChromaKey, FrameCrop, ParsedSpriteFrame } from "@/types/motion";
import { applyChromaKey } from "./chroma-key";

export type ProcessFrameOptions = {
  crop: FrameCrop;
  chromaKey: ChromaKey;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("幀圖像載入失敗。"));
    img.src = src;
  });
}

/** Returns true if the options would produce a different output than the input. */
export function isProcessingActive(opts: ProcessFrameOptions): boolean {
  const { crop, chromaKey } = opts;
  return (
    crop.top > 0 || crop.bottom > 0 || crop.left > 0 || crop.right > 0 || chromaKey.enabled
  );
}

/**
 * Apply (1) cropping, (2) chroma-key background removal to a single frame.
 * Returns a new ParsedSpriteFrame with updated dataUrl and dimensions.
 */
export async function processFrame(
  frame: ParsedSpriteFrame,
  opts: ProcessFrameOptions,
): Promise<ParsedSpriteFrame> {
  const { crop, chromaKey } = opts;

  if (!isProcessingActive(opts)) return frame;

  const img = await loadImage(frame.dataUrl);
  const cropL = Math.max(0, Math.min(frame.width  - 1, crop.left));
  const cropR = Math.max(0, Math.min(frame.width  - 1 - cropL, crop.right));
  const cropT = Math.max(0, Math.min(frame.height - 1, crop.top));
  const cropB = Math.max(0, Math.min(frame.height - 1 - cropT, crop.bottom));
  const w = Math.max(1, frame.width  - cropL - cropR);
  const h = Math.max(1, frame.height - cropT - cropB);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: chromaKey.enabled });
  if (!ctx) throw new Error("無法初始化處理畫布。");

  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, cropL, cropT, w, h, 0, 0, w, h);

  if (chromaKey.enabled) {
    applyChromaKey(ctx, w, h, chromaKey.color, chromaKey.tolerance, chromaKey.edgeOnly);
  }

  return {
    ...frame,
    width: w,
    height: h,
    dataUrl: canvas.toDataURL("image/png"),
  };
}

/**
 * Process all frames sequentially (cheap pixel ops, no model load).
 * Yields to event loop every few frames so UI stays responsive.
 */
export async function processFrames(
  frames: ParsedSpriteFrame[],
  opts: ProcessFrameOptions,
  onProgress?: (current: number, total: number) => void,
): Promise<ParsedSpriteFrame[]> {
  if (!isProcessingActive(opts)) {
    onProgress?.(frames.length, frames.length);
    return frames;
  }

  const out: ParsedSpriteFrame[] = [];
  for (let i = 0; i < frames.length; i++) {
    out.push(await processFrame(frames[i], opts));
    onProgress?.(i + 1, frames.length);
    if ((i & 7) === 7) await new Promise((r) => setTimeout(r, 0));
  }
  return out;
}
