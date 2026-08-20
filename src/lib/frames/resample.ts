import type { GridBackground, ParsedSpriteFrame } from "@/types/motion";
import type { MotionScoreResult } from "./motion-score";

// ─────────────────────────────────────────────────────────────────────────────
//  Motion-aware keyframe selection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pick `count` frames from `frames` that maximize visual coverage, using
 * cumulative motion as the parameterization instead of time.
 *
 * Algorithm: divide total motion into `count` equal buckets; for each bucket
 * pick the frame whose cumulative-motion value is closest to the bucket center.
 * This makes static frames collapse and fast-motion frames over-represented.
 *
 * Falls back to uniform-index sampling if motion is ~0 (static clip).
 */
export function pickMotionAwareKeyframes(
  frames: ParsedSpriteFrame[],
  motion: MotionScoreResult | null,
  count: number,
): ParsedSpriteFrame[] {
  if (frames.length === 0 || count === 0) return [];
  if (count >= frames.length) {
    // Caller should have used temporal resample instead; just return as-is.
    return frames.slice(0, count);
  }

  // Fallback: uniform when no motion data or a static clip.
  const hasMotion = motion && motion.total > 1e-6 && motion.cumulative.length === frames.length;
  if (!hasMotion) {
    return Array.from({ length: count }, (_, i) => {
      const progress = count === 1 ? 0 : i / (count - 1);
      return frames[Math.round(progress * (frames.length - 1))];
    });
  }

  const { cumulative, total } = motion;
  const picked: ParsedSpriteFrame[] = [];
  const usedIdx = new Set<number>();

  for (let k = 0; k < count; k++) {
    // Bucket center in cumulative-motion space.
    const target = ((k + 0.5) / count) * total;

    // Binary search for nearest cumulative[i] to target.
    let lo = 0;
    let hi = cumulative.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    let idx = lo;
    if (idx > 0 && Math.abs(cumulative[idx - 1] - target) < Math.abs(cumulative[idx] - target)) {
      idx = idx - 1;
    }

    // If already picked, try nearest unused neighbor to preserve variety.
    if (usedIdx.has(idx)) {
      let step = 1;
      while (step < frames.length) {
        if (idx + step < frames.length && !usedIdx.has(idx + step)) { idx = idx + step; break; }
        if (idx - step >= 0 && !usedIdx.has(idx - step)) { idx = idx - step; break; }
        step++;
      }
    }
    usedIdx.add(idx);
    picked.push(frames[idx]);
  }

  // Preserve temporal order.
  picked.sort((a, b) => a.index - b.index);
  return picked;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Temporal resampling with alpha-blend interpolation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A "synthesized" frame description: blend frame `a` with frame `b` at mix `alpha`.
 * alpha=0 → pure A, alpha=1 → pure B.
 */
export type BlendRecipe = {
  a: ParsedSpriteFrame;
  b: ParsedSpriteFrame;
  alpha: number;        // 0..1
  delayMs: number;      // how long this synthesized frame should show
};

/**
 * How to fill in-between frames when the target fps differs from the source's
 * native rate.
 *
 *  - "snap"  (default): each output frame is a *crisp source frame* (the one
 *            whose timestamp is closest). May produce repeated frames when
 *            target fps > source fps — but never produces ghost / double-
 *            exposure artifacts. This is what users actually want from a
 *            "video → GIF" pipeline: keyframes preserved, no blur.
 *  - "blend": linearly alpha-blend the two straddling source frames. Smoother
 *            metrics but visually = ghost frames. Kept as opt-in for cases
 *            where the source is itself a high-fps clean render.
 */
export type ResampleMode = "snap" | "blend";

/**
 * Build a uniformly-spaced timeline of frame recipes covering the same total
 * duration as the source, at `targetFps`. Each recipe describes how to produce
 * one output frame.
 *
 * Duration preservation means "playing at targetFps" yields the same clip
 * length — no speed-up/slow-down, just resampled temporal sampling.
 */
export function buildFpsTimeline(
  frames: ParsedSpriteFrame[],
  targetFps: number,
  mode: ResampleMode = "snap",
): BlendRecipe[] {
  if (frames.length === 0 || targetFps <= 0) return [];
  if (frames.length === 1) {
    return [{ a: frames[0], b: frames[0], alpha: 0, delayMs: 1000 / targetFps }];
  }

  // Build source start-timestamps.
  const starts = new Array<number>(frames.length);
  starts[0] = 0;
  for (let i = 1; i < frames.length; i++) starts[i] = starts[i - 1] + frames[i - 1].delay;
  const totalMs = starts[frames.length - 1] + frames[frames.length - 1].delay;

  const stepMs = 1000 / targetFps;
  const outCount = Math.max(1, Math.round(totalMs / stepMs));

  const out: BlendRecipe[] = [];
  for (let k = 0; k < outCount; k++) {
    const t = (k / outCount) * totalMs;

    // Find i such that starts[i] <= t < starts[i+1] (or last frame).
    // Linear scan is fine for typical frame counts.
    let i = 0;
    while (i < frames.length - 1 && starts[i + 1] <= t) i++;

    const a = frames[i];
    const b = i + 1 < frames.length ? frames[i + 1] : frames[i];
    const span = (i + 1 < frames.length ? starts[i + 1] : starts[i] + a.delay) - starts[i];
    const rawAlpha = span > 0 ? Math.max(0, Math.min(1, (t - starts[i]) / span)) : 0;

    // Snap mode: pick the nearer source frame, no blending → no ghost frames.
    const alpha = mode === "snap" ? (rawAlpha < 0.5 ? 0 : 1) : rawAlpha;

    out.push({ a, b, alpha, delayMs: stepMs });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Blended rendering
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Render a blend recipe onto a canvas context. Assumes both source frames have
 * the same dimensions (they do, since they come from the same source).
 *
 * Uses source-over with globalAlpha on the top layer, which matches exact
 * linear interpolation (src*α + dst*(1-α)) when the destination is already A.
 * For transparent regions, this still produces visually correct alpha blending.
 */
export function renderBlend(
  ctx: CanvasRenderingContext2D,
  imgA: CanvasImageSource,
  imgB: CanvasImageSource,
  alpha: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  background: GridBackground,
) {
  // Fill background first — so blended alpha channels composite onto it.
  ctx.save();
  ctx.globalAlpha = 1;
  if (background === "white") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(dx, dy, dw, dh);
  } else if (background === "black") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(dx, dy, dw, dh);
  } else {
    ctx.clearRect(dx, dy, dw, dh);
  }

  if (alpha <= 0.001) {
    ctx.drawImage(imgA, dx, dy, dw, dh);
  } else if (alpha >= 0.999) {
    ctx.drawImage(imgB, dx, dy, dw, dh);
  } else {
    ctx.globalAlpha = 1;
    ctx.drawImage(imgA, dx, dy, dw, dh);
    ctx.globalAlpha = alpha;
    ctx.drawImage(imgB, dx, dy, dw, dh);
  }
  ctx.restore();
}

/**
 * Materialize a BlendRecipe into a concrete ParsedSpriteFrame (dataUrl-backed).
 * Used by encoders that consume ParsedSpriteFrame[] directly.
 */
export async function materializeBlend(
  recipe: BlendRecipe,
  index: number,
  imageCache: Map<string, HTMLImageElement>,
): Promise<ParsedSpriteFrame> {
  const imgA = await ensureImage(recipe.a, imageCache);
  const imgB = await ensureImage(recipe.b, imageCache);
  const w = recipe.a.width;
  const h = recipe.a.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("無法初始化補幀畫布。");

  renderBlend(ctx, imgA, imgB, recipe.alpha, 0, 0, w, h, "transparent");

  return {
    id: `blend-${index}`,
    index,
    delay: recipe.delayMs,
    width: w,
    height: h,
    dataUrl: canvas.toDataURL("image/png"),
  };
}

export function ensureImage(
  frame: ParsedSpriteFrame,
  cache: Map<string, HTMLImageElement>,
): Promise<HTMLImageElement> {
  const hit = cache.get(frame.id);
  if (hit) return Promise.resolve(hit);
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => { cache.set(frame.id, img); resolve(img); };
    img.onerror = () => reject(new Error("幀圖像載入失敗。"));
    img.src = frame.dataUrl;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Convenience: resample a frame list to a given fps, materializing all frames.
// ─────────────────────────────────────────────────────────────────────────────

export async function resampleFramesToFps(
  frames: ParsedSpriteFrame[],
  targetFps: number,
  onProgress?: (cur: number, total: number) => void,
  mode: ResampleMode = "snap",
): Promise<ParsedSpriteFrame[]> {
  const timeline = buildFpsTimeline(frames, targetFps, mode);
  const cache = new Map<string, HTMLImageElement>();
  const out: ParsedSpriteFrame[] = [];
  for (let i = 0; i < timeline.length; i++) {
    out.push(await materializeBlend(timeline[i], i, cache));
    onProgress?.(i + 1, timeline.length);
    if ((i & 7) === 7) await new Promise((r) => setTimeout(r, 0));
  }
  return out;
}
