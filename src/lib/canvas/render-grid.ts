import type { GridBackground, ParsedSpriteFrame } from "@/types/motion";

export type RenderGridOptions = {
  frames: ParsedSpriteFrame[];
  cols: number;
  rows: number;
  spacing: number;
  background: GridBackground;
  scale?: number; // multiplier on output dimensions, default 1
};

export async function renderGridToCanvas(opts: RenderGridOptions): Promise<HTMLCanvasElement> {
  const { frames, cols, rows, spacing, background } = opts;
  const scale = opts.scale ?? 1;
  const count = cols * rows;
  const selected = getEvenlyDistributed(frames, count);

  if (selected.length === 0) throw new Error("沒有可渲染的幀。");

  const cellWidth  = selected[0].width;
  const cellHeight = selected[0].height;

  const baseW = cols * cellWidth  + Math.max(0, cols - 1) * spacing;
  const baseH = rows * cellHeight + Math.max(0, rows - 1) * spacing;

  const canvas = document.createElement("canvas");
  canvas.width  = Math.max(1, Math.round(baseW * scale));
  canvas.height = Math.max(1, Math.round(baseH * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("無法初始化導出畫布。");

  // For pixel art crispness on integer scales; bilinear for fractional.
  ctx.imageSmoothingEnabled = scale !== Math.round(scale) || scale > 1;
  ctx.imageSmoothingQuality = "high";

  if (background === "white") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (background === "black") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  const images = await Promise.all(selected.map(loadImage));

  for (const [i, img] of images.entries()) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    ctx.drawImage(
      img,
      col * (cellWidth + spacing) * scale,
      row * (cellHeight + spacing) * scale,
      cellWidth  * scale,
      cellHeight * scale,
    );
  }

  return canvas;
}

export async function exportGridAsPng(opts: RenderGridOptions, filename: string): Promise<void> {
  const canvas = await renderGridToCanvas(opts);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
  if (!blob) throw new Error("PNG 生成失敗。");
  downloadBlob(blob, filename);
}

export function getEvenlyDistributed<T>(items: T[], count: number): T[] {
  if (items.length === 0 || count === 0) return [];
  if (items.length <= count) {
    return Array.from({ length: count }, (_, i) => items[i % items.length]);
  }
  return Array.from({ length: count }, (_, i) => {
    const progress = count === 1 ? 0 : i / (count - 1);
    return items[Math.round(progress * (items.length - 1))];
  });
}

function loadImage(frame: ParsedSpriteFrame): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("幀圖像載入失敗。"));
    img.src = frame.dataUrl;
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
