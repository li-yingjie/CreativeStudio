import { decompressFrames, parseGIF } from "gifuct-js";

import type { ParsedSpriteFrame } from "@/types/motion";

const DEFAULT_DELAY_MS = 100;

export type ParseGifOptions = {
  /** When true, clear the canvas after every frame (forces Dispose 2 behavior).
   *  Use this to fix ghosting when the source GIF used incremental disposal. */
  forceDispose?: boolean;
};

export async function parseGifFile(
  file: File,
  opts: ParseGifOptions = {},
): Promise<ParsedSpriteFrame[]> {
  const buffer = await file.arrayBuffer();
  const gif = parseGIF(buffer);
  const frames = decompressFrames(gif, true);
  const width = gif.lsd.width;
  const height = gif.lsd.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    throw new Error("無法初始化 GIF 解析畫布。");
  }

  ctx.clearRect(0, 0, width, height);

  return frames.map((frame, index) => {
    let snapshot: ImageData | null = null;

    if (frame.disposalType === 3) {
      snapshot = ctx.getImageData(0, 0, width, height);
    }

    const imageData = new ImageData(
      new Uint8ClampedArray(frame.patch),
      frame.dims.width,
      frame.dims.height,
    );
    ctx.putImageData(imageData, frame.dims.left, frame.dims.top);

    // gifuct-js already converts to milliseconds internally
    // (see node_modules/gifuct-js/lib/index.js: `frame.gce.delay * 10 // convert to ms`).
    // Use as-is — multiplying again would inflate every delay 10×.
    const delayMs = frame.delay > 0 ? frame.delay : DEFAULT_DELAY_MS;

    const parsedFrame: ParsedSpriteFrame = {
      id: `frame-${index + 1}`,
      index,
      delay: delayMs,
      width,
      height,
      dataUrl: canvas.toDataURL("image/png"),
    };

    if (opts.forceDispose) {
      // Always clear after capturing — every frame becomes independent.
      ctx.clearRect(0, 0, width, height);
    } else if (frame.disposalType === 2) {
      ctx.clearRect(frame.dims.left, frame.dims.top, frame.dims.width, frame.dims.height);
    } else if (frame.disposalType === 3 && snapshot) {
      ctx.putImageData(snapshot, 0, 0);
    }

    return parsedFrame;
  });
}
