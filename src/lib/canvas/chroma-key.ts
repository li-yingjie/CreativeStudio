// Color-distance chroma key with optional edge-only flood fill.

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2) || "0", 16);
  const g = parseInt(m.slice(2, 4) || "0", 16);
  const b = parseInt(m.slice(4, 6) || "0", 16);
  return { r: Number.isFinite(r) ? r : 0, g: Number.isFinite(g) ? g : 0, b: Number.isFinite(b) ? b : 0 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

// Maximum RGB euclidean distance is sqrt(3 * 255^2) ≈ 441.673
const MAX_DIST = Math.sqrt(3 * 255 * 255);

/**
 * Apply chroma key in-place to the given context.
 * @param tolerancePercent 0-100, percentage of MAX_DIST treated as "matches bg"
 * @param edgeOnly if true, only remove pixels reachable from canvas edges via bg-colored pixels
 */
export function applyChromaKey(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  targetHex: string,
  tolerancePercent: number,
  edgeOnly: boolean,
) {
  if (width <= 0 || height <= 0) return;
  const target = hexToRgb(targetHex);
  const threshold = (tolerancePercent / 100) * MAX_DIST;
  const t2 = threshold * threshold;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const len = width * height;

  // Build "is bg color" mask
  const isBg = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    const idx = i * 4;
    const dr = data[idx]     - target.r;
    const dg = data[idx + 1] - target.g;
    const db = data[idx + 2] - target.b;
    if (dr * dr + dg * dg + db * db <= t2) {
      isBg[i] = 1;
    }
  }

  if (edgeOnly) {
    // BFS from all edge pixels that are bg-color, mark "reachable"
    const visited = new Uint8Array(len);
    // Pre-allocate queue large enough for worst case (every pixel)
    const queue = new Int32Array(len);
    let head = 0;
    let tail = 0;

    // Seed: top + bottom rows
    for (let x = 0; x < width; x++) {
      const top = x;
      const bot = (height - 1) * width + x;
      if (isBg[top]) { visited[top] = 1; queue[tail++] = top; }
      if (isBg[bot] && !visited[bot]) { visited[bot] = 1; queue[tail++] = bot; }
    }
    // Seed: left + right cols (skip corners already added)
    for (let y = 1; y < height - 1; y++) {
      const left = y * width;
      const right = left + width - 1;
      if (isBg[left] && !visited[left]) { visited[left] = 1; queue[tail++] = left; }
      if (isBg[right] && !visited[right]) { visited[right] = 1; queue[tail++] = right; }
    }

    while (head < tail) {
      const i = queue[head++];
      const x = i % width;
      const y = (i - x) / width;
      // 4-neighborhood
      if (x > 0)          { const ni = i - 1;     if (isBg[ni] && !visited[ni]) { visited[ni] = 1; queue[tail++] = ni; } }
      if (x < width - 1)  { const ni = i + 1;     if (isBg[ni] && !visited[ni]) { visited[ni] = 1; queue[tail++] = ni; } }
      if (y > 0)          { const ni = i - width; if (isBg[ni] && !visited[ni]) { visited[ni] = 1; queue[tail++] = ni; } }
      if (y < height - 1) { const ni = i + width; if (isBg[ni] && !visited[ni]) { visited[ni] = 1; queue[tail++] = ni; } }
    }

    for (let i = 0; i < len; i++) {
      if (visited[i]) data[i * 4 + 3] = 0;
    }
  } else {
    // Strict: any pixel matching bg is removed
    for (let i = 0; i < len; i++) {
      if (isBg[i]) data[i * 4 + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/** Sample dominant color from the four corners (auto-pick). */
export function sampleCornerColorFromImageData(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): string {
  const inset = 2;
  const points: Array<[number, number]> = [
    [inset, inset],
    [width - 1 - inset, inset],
    [inset, height - 1 - inset],
    [width - 1 - inset, height - 1 - inset],
  ];
  let r = 0, g = 0, b = 0;
  for (const [x, y] of points) {
    const idx = (y * width + x) * 4;
    r += data[idx];
    g += data[idx + 1];
    b += data[idx + 2];
  }
  return rgbToHex(r / points.length, g / points.length, b / points.length);
}

/** Convenience: load a dataUrl, sample its corners. */
export async function autoPickColorFromDataUrl(dataUrl: string): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new window.Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("無法加載圖片以吸取顏色。"));
    i.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("無法初始化吸色畫布。");
  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return sampleCornerColorFromImageData(imgData.data, canvas.width, canvas.height);
}
