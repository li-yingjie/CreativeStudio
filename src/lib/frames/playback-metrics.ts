// ─────────────────────────────────────────────────────────────────────────────
//  Playback metrics — TypeScript port of bench/lib/playback.py
//
//  Computes objective playback quality measures for a frame sequence:
//   - judder (step_cv)
//   - spike severity (step_max_over_median)
//   - loop seam (first/last dhash distance)
//   - motion magnitude (step_mean / total_path)
//
//  Used by the in-browser GIF compare tool.
// ─────────────────────────────────────────────────────────────────────────────

import type { ParsedSpriteFrame } from "@/types/motion";

// ── dhash ────────────────────────────────────────────────────────────────────
// Same scheme as src/lib/frames/loop-trim.ts — 8x8 difference hash on a
// 9x8 grayscale buffer. Returns a 64-bit hash split as two unsigned 32-bit
// halves so we can use bitwise ops without BigInt.

const HASH_GRID = 8;
type DHash = readonly [number, number];

function dhashFromImage(img: HTMLImageElement | HTMLCanvasElement): DHash {
  const W = HASH_GRID + 1;
  const H = HASH_GRID;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [0, 0];
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(img, 0, 0, W, H);
  const data = ctx.getImageData(0, 0, W, H).data;

  let hi = 0;
  let lo = 0;
  let bit = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < HASH_GRID; x++) {
      const i0 = (y * W + x) * 4;
      const i1 = (y * W + x + 1) * 4;
      const g0 = data[i0] * 0.299 + data[i0 + 1] * 0.587 + data[i0 + 2] * 0.114;
      const g1 = data[i1] * 0.299 + data[i1 + 1] * 0.587 + data[i1 + 2] * 0.114;
      const v = g1 > g0 ? 1 : 0;
      if (bit < 32) lo = (lo << 1) | v;
      else hi = (hi << 1) | v;
      bit++;
    }
  }
  return [hi >>> 0, lo >>> 0];
}

function popcount32(x: number): number {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0f0f0f0f;
  return ((x * 0x01010101) >>> 24) & 0xff;
}

function hamming(a: DHash, b: DHash): number {
  return popcount32(a[0] ^ b[0]) + popcount32(a[1] ^ b[1]);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("圖像載入失敗"));
    img.src = src;
  });
}

// ── Public API ───────────────────────────────────────────────────────────────

export type PlaybackMetrics = {
  nFrames: number;
  totalMs: number;
  effectiveFps: number;
  delayMeanMs: number;
  delayMinMs: number;
  delayMaxMs: number;
  stepMean: number;
  stepCv: number;
  stepMaxOverMedian: number;
  loopSeam: number;
  totalPath: number;
};

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export async function computePlaybackMetrics(
  frames: ParsedSpriteFrame[],
): Promise<PlaybackMetrics> {
  const n = frames.length;
  const delays = frames.map((f) => f.delay);
  const totalMs = delays.reduce((s, d) => s + d, 0);
  const effectiveFps = totalMs > 0 ? (n / (totalMs / 1000)) : 0;
  const delayMean = delays.length ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;

  const empty: PlaybackMetrics = {
    nFrames: n,
    totalMs,
    effectiveFps,
    delayMeanMs: delayMean,
    delayMinMs: delays.length ? Math.min(...delays) : 0,
    delayMaxMs: delays.length ? Math.max(...delays) : 0,
    stepMean: 0,
    stepCv: 0,
    stepMaxOverMedian: 0,
    loopSeam: 0,
    totalPath: 0,
  };
  if (n < 2) return empty;

  // Hash every frame.
  const hashes: DHash[] = [];
  for (const f of frames) {
    const img = await loadImage(f.dataUrl);
    hashes.push(dhashFromImage(img));
  }

  // Pairwise step distances.
  const steps: number[] = [];
  for (let i = 0; i < hashes.length - 1; i++) {
    steps.push(hamming(hashes[i], hashes[i + 1]));
  }
  const sum = steps.reduce((a, b) => a + b, 0);
  const mean = sum / steps.length;
  const variance = steps.reduce((a, x) => a + (x - mean) ** 2, 0) / steps.length;
  const std = Math.sqrt(variance);
  const cv = mean > 0 ? std / mean : 0;
  const med = median(steps);
  const max = Math.max(...steps);
  const seam = hamming(hashes[hashes.length - 1], hashes[0]);

  return {
    ...empty,
    stepMean: mean,
    stepCv: cv,
    stepMaxOverMedian: med > 0 ? max / med : 0,
    loopSeam: seam,
    totalPath: sum,
  };
}
