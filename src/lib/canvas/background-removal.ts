import type { ParsedSpriteFrame } from "@/types/motion";

// Cache: frame.id → transparent dataUrl. Survives across re-renders / toggles.
const cache = new Map<string, string>();

// Lazy-loaded module so the ~80MB ONNX model isn't pulled until needed.
type ImglyModule = typeof import("@imgly/background-removal");
let modulePromise: Promise<ImglyModule> | null = null;

function getModule(): Promise<ImglyModule> {
  if (!modulePromise) {
    modulePromise = import("@imgly/background-removal");
  }
  return modulePromise;
}

function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then((r) => r.blob());
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("讀取去背結果失敗。"));
    reader.readAsDataURL(blob);
  });
}

// Per-frame progress: which frame, how many done, total. modelLoad = preparing model.
export type BgRemovalProgress = (
  current: number,
  total: number,
  phase: "model" | "frame",
  detail?: string,
) => void;

/**
 * Run @imgly/background-removal on every frame, returning a parallel
 * ParsedSpriteFrame[] whose dataUrl is the transparent PNG.
 *
 * - Frames are processed sequentially (model is heavy; parallel = OOM)
 * - Per-frame results are cached by frame.id, so repeat calls are instant
 * - First call downloads the model (~40-80 MB) from CDN; later calls are warm
 */
export async function removeFramesBackground(
  frames: ParsedSpriteFrame[],
  onProgress?: BgRemovalProgress,
): Promise<ParsedSpriteFrame[]> {
  const { removeBackground } = await getModule();
  const total = frames.length;
  const out: ParsedSpriteFrame[] = [];

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    let transparentUrl = cache.get(frame.id);
    if (!transparentUrl) {
      const inputBlob = await dataUrlToBlob(frame.dataUrl);
      const outputBlob = await removeBackground(inputBlob, {
        output: { format: "image/png", quality: 0.9 },
        // imgly progress signature: (key, current, total)
        // key examples: "fetch:...", "compute:inference"
        progress: (key, cur, tot) => {
          if (key.startsWith("fetch")) {
            onProgress?.(cur, tot, "model", key);
          }
        },
      });
      transparentUrl = await blobToDataUrl(outputBlob);
      cache.set(frame.id, transparentUrl);
    }
    out.push({ ...frame, dataUrl: transparentUrl });
    onProgress?.(i + 1, total, "frame");
  }

  return out;
}

/** Drop cached transparent dataUrls — call when a new file is loaded. */
export function clearBgRemovalCache() {
  cache.clear();
}
