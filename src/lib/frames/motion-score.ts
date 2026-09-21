import type { ParsedSpriteFrame } from "@/types/motion";

/**
 * Compute per-frame "motion score" = mean absolute pixel difference vs the
 * previous frame, measured on a downscaled proxy so it's cheap on any size.
 *
 * Returns an array where scores[0] = 0 and scores[i] >= 0 for i >= 1.
 * Also returns cumulative[] such that cumulative[i] = sum(scores[0..i]).
 */
export type MotionScoreResult = {
  scores: number[];        // per-frame diff-to-prev
  cumulative: number[];    // prefix sum, cumulative[0] = 0
  total: number;           // cumulative[last]
};

const PROXY_SIZE = 64; // downscale longest side to this for cheap diffs

export async function computeMotionScores(
  frames: ParsedSpriteFrame[],
  onProgress?: (cur: number, total: number) => void,
): Promise<MotionScoreResult> {
  const n = frames.length;
  if (n === 0) return { scores: [], cumulative: [], total: 0 };

  const scores = new Array<number>(n).fill(0);

  // Allocate proxy canvas sized to first frame's aspect.
  const firstW = frames[0].width;
  const firstH = frames[0].height;
  const scale = PROXY_SIZE / Math.max(firstW, firstH);
  const pw = Math.max(1, Math.round(firstW * scale));
  const ph = Math.max(1, Math.round(firstH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = pw;
  canvas.height = ph;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("無法初始化運動分析畫布。");

  let prev: Uint8ClampedArray | null = null;

  for (let i = 0; i < n; i++) {
    const img = await loadImage(frames[i].dataUrl);
    ctx.clearRect(0, 0, pw, ph);
    ctx.drawImage(img, 0, 0, pw, ph);
    const cur = ctx.getImageData(0, 0, pw, ph).data;

    if (prev) {
      let sum = 0;
      // Only compare RGB (skip A) to stay robust to alpha-matte changes.
      for (let p = 0; p < cur.length; p += 4) {
        sum += Math.abs(cur[p]     - prev[p]);
        sum += Math.abs(cur[p + 1] - prev[p + 1]);
        sum += Math.abs(cur[p + 2] - prev[p + 2]);
      }
      scores[i] = sum / (pw * ph * 3); // mean per-channel abs diff
    }

    // copy cur into a new buffer so prev survives next iteration
    prev = new Uint8ClampedArray(cur);
    onProgress?.(i + 1, n);

    if ((i & 7) === 7) await new Promise((r) => setTimeout(r, 0));
  }

  const cumulative = new Array<number>(n);
  let acc = 0;
  for (let i = 0; i < n; i++) {
    acc += scores[i];
    cumulative[i] = acc;
  }

  return { scores, cumulative, total: acc };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("運動分析幀載入失敗。"));
    img.src = src;
  });
}
