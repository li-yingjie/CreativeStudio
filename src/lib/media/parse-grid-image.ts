import { GRID_PRESETS } from "@/lib/constants";
import type { GridPreset, ParsedSpriteFrame } from "@/types/motion";

type ParsedGridImage = {
  width: number;
  height: number;
  frames: ParsedSpriteFrame[];
  detectedGrid: GridPreset;
};

type Bounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export async function parseGridImageFile(file: File, forcedGrid?: GridPreset): Promise<ParsedGridImage> {
  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) throw new Error("無法初始化宮格圖解析畫布。");

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Use full image bounds for slicing — edge trimming causes misaligned cuts
  const bounds: Bounds = {
    left: 0,
    top: 0,
    right: canvas.width - 1,
    bottom: canvas.height - 1,
  };

  const bg = sampleCornerBackground(imageData);
  const detectedGrid = forcedGrid ?? chooseBestGrid(imageData, bounds, bg);
  const frames = sliceGridFrames(imageData, bounds, detectedGrid);

  if (frames.length === 0) {
    throw new Error("未能從宮格圖中裁出任何有效幀。");
  }

  return {
    width: frames[0].width,
    height: frames[0].height,
    frames,
    detectedGrid,
  };
}

function sampleCornerBackground(imageData: ImageData) {
  const { width, height, data } = imageData;
  const points = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width * 0.02), Math.floor(height * 0.02)],
    [width - 1 - Math.floor(width * 0.02), Math.floor(height * 0.02)],
    [Math.floor(width * 0.02), height - 1 - Math.floor(height * 0.02)],
    [width - 1 - Math.floor(width * 0.02), height - 1 - Math.floor(height * 0.02)],
  ];

  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;

  for (const [x, y] of points) {
    const idx = (y * width + x) * 4;
    r += data[idx];
    g += data[idx + 1];
    b += data[idx + 2];
    a += data[idx + 3];
  }

  const count = points.length;
  return { r: r / count, g: g / count, b: b / count, a: a / count };
}


function chooseBestGrid(
  imageData: ImageData,
  bounds: Bounds,
  bg: ReturnType<typeof sampleCornerBackground>,
): GridPreset {
  let best = GRID_PRESETS[0];
  let bestScore = Number.POSITIVE_INFINITY;

  for (const preset of GRID_PRESETS) {
    const score = scoreGridCandidate(imageData, bounds, bg, preset);
    if (score < bestScore) {
      best = preset;
      bestScore = score;
    }
  }

  return best;
}

function scoreGridCandidate(
  imageData: ImageData,
  bounds: Bounds,
  bg: ReturnType<typeof sampleCornerBackground>,
  preset: GridPreset,
) {
  const { width, data } = imageData;
  const contentWidth = bounds.right - bounds.left + 1;
  const contentHeight = bounds.bottom - bounds.top + 1;
  const cellWidth = contentWidth / preset.cols;
  const cellHeight = contentHeight / preset.rows;
  const stripe = Math.max(1, Math.round(Math.min(cellWidth, cellHeight) * 0.06));

  let boundaryDensity = 0;
  let boundarySamples = 0;

  for (let c = 1; c < preset.cols; c++) {
    const center = bounds.left + c * cellWidth;
    const start = Math.max(bounds.left, Math.round(center - stripe / 2));
    const end = Math.min(bounds.right, Math.round(center + stripe / 2));
    for (let x = start; x <= end; x++) {
      for (let y = bounds.top; y <= bounds.bottom; y++) {
        if (isForeground(data, width, x, y, bg)) boundaryDensity += 1;
        boundarySamples += 1;
      }
    }
  }

  for (let r = 1; r < preset.rows; r++) {
    const center = bounds.top + r * cellHeight;
    const start = Math.max(bounds.top, Math.round(center - stripe / 2));
    const end = Math.min(bounds.bottom, Math.round(center + stripe / 2));
    for (let y = start; y <= end; y++) {
      for (let x = bounds.left; x <= bounds.right; x++) {
        if (isForeground(data, width, x, y, bg)) boundaryDensity += 1;
        boundarySamples += 1;
      }
    }
  }

  const densityPenalty = boundarySamples > 0 ? boundaryDensity / boundarySamples : 1;
  const shapePenalty = Math.abs(contentWidth / Math.max(contentHeight, 1) - preset.cols / preset.rows) * 0.1;
  const cellPenalty = 1 / Math.max(cellWidth * cellHeight, 1);

  return densityPenalty + shapePenalty + cellPenalty * 1000;
}

function sliceGridFrames(imageData: ImageData, bounds: Bounds, preset: GridPreset): ParsedSpriteFrame[] {
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = imageData.width;
  sourceCanvas.height = imageData.height;
  const sourceCtx = sourceCanvas.getContext("2d");

  if (!sourceCtx) throw new Error("無法初始化宮格裁切畫布。");

  sourceCtx.putImageData(imageData, 0, 0);

  const contentWidth = bounds.right - bounds.left + 1;
  const contentHeight = bounds.bottom - bounds.top + 1;
  const frames: ParsedSpriteFrame[] = [];

  for (let row = 0; row < preset.rows; row++) {
    const y1 = Math.round(bounds.top + (row * contentHeight) / preset.rows);
    const y2 = Math.round(bounds.top + ((row + 1) * contentHeight) / preset.rows);
    for (let col = 0; col < preset.cols; col++) {
      const x1 = Math.round(bounds.left + (col * contentWidth) / preset.cols);
      const x2 = Math.round(bounds.left + ((col + 1) * contentWidth) / preset.cols);
      const width = Math.max(1, x2 - x1);
      const height = Math.max(1, y2 - y1);

      const cellCanvas = document.createElement("canvas");
      cellCanvas.width = width;
      cellCanvas.height = height;
      const cellCtx = cellCanvas.getContext("2d");

      if (!cellCtx) continue;

      cellCtx.drawImage(sourceCanvas, x1, y1, width, height, 0, 0, width, height);

      frames.push({
        id: `sheet-${row * preset.cols + col + 1}`,
        index: row * preset.cols + col,
        delay: 100,
        width,
        height,
        dataUrl: cellCanvas.toDataURL("image/png"),
      });
    }
  }

  return frames;
}

function isForeground(
  data: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
  bg: ReturnType<typeof sampleCornerBackground>,
) {
  const idx = (y * width + x) * 4;
  const a = data[idx + 3];
  if (a < 24) return false;

  const dr = data[idx] - bg.r;
  const dg = data[idx + 1] - bg.g;
  const db = data[idx + 2] - bg.b;
  const da = a - bg.a;
  const diff = Math.sqrt(dr * dr + dg * dg + db * db + da * da);

  return diff > 26;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("宮格圖載入失敗。"));
    };
    img.src = url;
  });
}
