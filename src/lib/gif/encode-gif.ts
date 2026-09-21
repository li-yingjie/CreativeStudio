import { GIFEncoder, applyPalette, quantize } from "gifenc";

import { buildFpsTimeline, ensureImage, renderBlend } from "@/lib/frames/resample";
import { applyLoopTrim } from "@/lib/frames/loop-trim";
import type { ParsedSpriteFrame } from "@/types/motion";

export type EncodeGifOptions = {
  fps?: number;     // when set, the output is resampled to this fps with alpha-blend补幀
  scale?: number;   // multiplier on output dimensions, default 1
  loopTrim?: boolean; // trim tail to best return-to-frame-0 point for seamless looping (default: true)
};

export async function encodeFramesAsGif(
  frames: ParsedSpriteFrame[],
  opts: EncodeGifOptions = {},
  onProgress?: (current: number, total: number) => void,
): Promise<Blob> {
  if (frames.length === 0) throw new Error("沒有可編碼的幀。");

  const scale = opts.scale ?? 1;
  const baseW = frames[0].width;
  const baseH = frames[0].height;
  const width  = Math.max(1, Math.round(baseW * scale));
  const height = Math.max(1, Math.round(baseH * scale));

  const canvas = document.createElement("canvas");
  canvas.width  = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("無法初始化畫布。");
  ctx.imageSmoothingEnabled = scale !== Math.round(scale) || scale > 1;
  ctx.imageSmoothingQuality = "high";

  const gif = GIFEncoder();

  // Loop trim: drop the tail back to the frame that best returns to frame[0].
  // Cuts the visible "jump" at every loop wrap. Validated to also improve
  // judder & spike metrics on a 195-GIF benchmark — a no-cost win.
  const loopTrim = opts.loopTrim ?? true;
  const sourceFrames = loopTrim ? await applyLoopTrim(frames) : frames;

  // Build the frame timeline.
  // - If fps is set: resample to a uniform timeline with alpha-blend interpolation.
  // - Otherwise: honour each source frame's delay as-is.
  const useFps = opts.fps && opts.fps > 0;
  const timeline = useFps
    ? buildFpsTimeline(sourceFrames, opts.fps!)
    : sourceFrames.map((f) => ({ a: f, b: f, alpha: 0, delayMs: f.delay }));

  const imgCache = new Map<string, HTMLImageElement>();

  for (let i = 0; i < timeline.length; i++) {
    onProgress?.(i, timeline.length);
    const recipe = timeline[i];
    const imgA = await ensureImage(recipe.a, imgCache);
    const imgB = recipe.b === recipe.a ? imgA : await ensureImage(recipe.b, imgCache);

    renderBlend(ctx, imgA, imgB, recipe.alpha, 0, 0, width, height, "transparent");

    const imageData = ctx.getImageData(0, 0, width, height);
    const palette = quantize(imageData.data, 256);
    const indexed = applyPalette(imageData.data, palette);

    gif.writeFrame(indexed, width, height, {
      palette,
      // gifenc expects delay in MILLISECONDS (it converts to centiseconds
      // internally via Math.round(delay/10)). Enforce browser minimum of 20ms.
      delay: Math.max(20, Math.round(recipe.delayMs)),
      repeat: i === 0 ? 0 : undefined,
    });
  }

  onProgress?.(timeline.length, timeline.length);
  gif.finish();

  const bytes = gif.bytesView();
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new Blob([buffer], { type: "image/gif" });
}
