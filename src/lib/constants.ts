import type { GridPreset, ParsedSpriteFrame } from "@/types/motion";

export const GRID_PRESETS: GridPreset[] = [
  { cols: 2, rows: 2 },   // 4
  { cols: 3, rows: 3 },   // 9
  { cols: 4, rows: 4 },   // 16
  { cols: 4, rows: 3 },   // 12
  { cols: 3, rows: 4 },   // 12
  { cols: 6, rows: 4 },   // 24
  { cols: 6, rows: 6 },   // 36 — smooth
  { cols: 9, rows: 4 },   // 36 — smooth, widescreen
];

export const DEFAULT_GRID: GridPreset = { cols: 3, rows: 3 };

export const CELL_SPACINGS = [0, 2, 4, 8] as const;
export type CellSpacing = (typeof CELL_SPACINGS)[number];

// Upper bound on frames captured from a video source. Raised from 72 → 144 so
// larger grids (up to 36 cells) have comfortable motion-aware headroom.
export const MAX_VIDEO_FRAMES = 144;

/**
 * Suggest the most visually balanced grid given the media's frame count and
 * aspect ratio. Aims to show one representative frame per ~2–3 source frames,
 * biased toward grid shapes that match the video's own aspect ratio.
 */
export function suggestOptimalGrid(
  frames: ParsedSpriteFrame[],
  width: number,
  height: number,
): GridPreset {
  const count = frames.length;
  const ar = width / Math.max(height, 1);

  // How many cells do we want? Show enough to tell the whole motion story
  // without making each cell too small to read.
  const targetCells =
    count <= 4  ? 4  :
    count <= 9  ? 9  :
    count <= 16 ? 12 :
    count <= 32 ? 16 :
    count <= 48 ? 24 :
                  36;

  let best = DEFAULT_GRID;
  let bestScore = Infinity;

  for (const p of GRID_PRESETS) {
    const cells = p.cols * p.rows;
    const gridAR = p.cols / p.rows;
    // Penalise distance from target cell count + aspect-ratio mismatch
    const score = Math.abs(cells - targetCells) + Math.abs(gridAR - ar) * 3;
    if (score < bestScore) {
      bestScore = score;
      best = p;
    }
  }

  return best;
}
