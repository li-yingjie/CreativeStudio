/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import './sprite-maker-ii.css'
import type { SpriteTheme } from "@/components/sprite-theme";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { ToastContainer } from "@/components/toast";
import {
  CELL_SPACINGS,
  DEFAULT_GRID,
  GRID_PRESETS,
  suggestOptimalGrid,
  type CellSpacing,
} from "@/lib/constants";
import { encodeFramesAsGif } from "@/lib/gif/encode-gif";
import {
  exportGridAsPng,
  renderGridToCanvas,
} from "@/lib/canvas/render-grid";
import { processFrames } from "@/lib/canvas/process-frame";
import { autoPickColorFromDataUrl } from "@/lib/canvas/chroma-key";
import { parseMediaFile } from "@/lib/media/parse-media";
import { computeMotionScores, type MotionScoreResult } from "@/lib/frames/motion-score";
import {
  buildFpsTimeline,
  ensureImage,
  pickMotionAwareKeyframes,
  renderBlend,
  resampleFramesToFps,
  type BlendRecipe,
} from "@/lib/frames/resample";
import {
  EXPORT_SCALES,
  type AppMedia,
  type ChromaKey,
  type ExportScale,
  type FrameCrop,
  type GridBackground,
  type GridPreset,
  type ParsedSpriteFrame,
  type ToastItem,
} from "@/types/motion";

// ─── helpers ─────────────────────────────────────────────────────────────────

function gridLabel(p: GridPreset) { return `${p.cols}×${p.rows}`; }

function totalDurationMs(frames: ParsedSpriteFrame[]) {
  let sum = 0;
  for (const f of frames) sum += f.delay;
  return Math.max(1, sum);
}
function gridEqual(a: GridPreset, b: GridPreset) {
  return a.cols === b.cols && a.rows === b.rows;
}

const DEFAULT_CROP: FrameCrop = { top: 0, bottom: 0, left: 0, right: 0 };
const DEFAULT_CHROMA: ChromaKey = {
  enabled: false,
  color: "#ffffff",
  tolerance: 7,
  edgeOnly: false,
};

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function MotionStandardizerApp({
  initialFile = null,
  initialTheme = "light",
  onBack,
  onOpenTasks,
  onImportAsset,
}: {
  initialFile?: File | null;
  initialTheme?: SpriteTheme;
  onBack?: () => void;
  onOpenTasks?: () => void;
  onImportAsset?: () => void;
}) {
  const [media, setMedia]           = useState<AppMedia | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isParsing, startTransition] = useTransition();
  const [parseProgress, setParseProgress] = useState(0);

  const [grid, setGrid]             = useState<GridPreset>(DEFAULT_GRID);
  const [autoGrid, setAutoGrid]     = useState<GridPreset>(DEFAULT_GRID);
  const [spacing, setSpacing]       = useState<CellSpacing>(0);
  const [background, setBackground] = useState<GridBackground>("transparent");

  // New params
  const [crop, setCrop]             = useState<FrameCrop>(DEFAULT_CROP);
  const [chromaKey, setChromaKey]   = useState<ChromaKey>(DEFAULT_CHROMA);
  const [fps, setFps]               = useState<number>(12);
  const [exportScale, setExportScale] = useState<ExportScale>(1);
  const [forceDispose, setForceDispose] = useState<boolean>(false);
  const [disabledIndices, setDisabledIndices] = useState<Set<number>>(new Set());

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState<"static" | "motion">("static");

  // Processed frames (crop + chroma key applied). Recomputed when source frames or opts change.
  const [processedFrames, setProcessedFrames] = useState<ParsedSpriteFrame[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);

  // Motion scores — used for motion-aware keyframe selection. Computed async
  // after processing completes; falls back to uniform if unavailable.
  const [motionScores, setMotionScores] = useState<MotionScoreResult | null>(null);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const addToast = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((p) => [...p, { id, message, type }]);
  }, []);
  const removeToast = useCallback((id: string) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  // ── Frame pipeline ───────────────────────────────────────────────────────
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Effective frames = processed (crop+chroma) + disable-filtered.
  const baseFrames = processedFrames ?? media?.frames ?? [];
  const effectiveFrames = useMemo(
    () => baseFrames.filter((f) => !disabledIndices.has(f.index)),
    [baseFrames, disabledIndices],
  );

  const totalCells = grid.cols * grid.rows;

  // Grid selection:
  //  - If we have >= totalCells effective frames → motion-aware keyframe pick.
  //  - If we have fewer → synthesize in-between frames via temporal resample
  //    so each cell is a distinct blended pose (no duplicate-frame feel).
  const [synthesizedGridFrames, setSynthesizedGridFrames] = useState<ParsedSpriteFrame[] | null>(null);
  const selectedFrames = useMemo(() => {
    if (effectiveFrames.length === 0 || totalCells === 0) return [];
    if (effectiveFrames.length >= totalCells) {
      return pickMotionAwareKeyframes(effectiveFrames, motionScores, totalCells);
    }
    // Not enough source frames — use synthesized ones if ready, else graceful fallback.
    if (synthesizedGridFrames && synthesizedGridFrames.length >= totalCells) {
      return pickMotionAwareKeyframes(synthesizedGridFrames, null, totalCells);
    }
    // Graceful fallback: evenly pick with possible repeats, so UI isn't empty.
    return Array.from({ length: totalCells }, (_, i) => {
      const progress = totalCells === 1 ? 0 : i / (totalCells - 1);
      return effectiveFrames[Math.round(progress * (effectiveFrames.length - 1))];
    });
  }, [effectiveFrames, totalCells, motionScores, synthesizedGridFrames]);

  // Re-process when source / crop / chroma changes.
  useEffect(() => {
    if (!media) return;
    let cancelled = false;
    setIsProcessing(true);
    setProcessProgress(0);
    setMotionScores(null);
    processFrames(media.frames, { crop, chromaKey }, (cur, total) => {
      if (!cancelled) setProcessProgress(total > 0 ? cur / total : 0);
    })
      .then((frames) => { if (!cancelled) setProcessedFrames(frames); })
      .catch((err) => { if (!cancelled) addToast(err instanceof Error ? err.message : "幀處理失敗。", "error"); })
      .finally(() => { if (!cancelled) setIsProcessing(false); });
    return () => { cancelled = true; };
  }, [media, crop, chromaKey, addToast]);

  // Compute motion scores whenever the effective frame set changes.
  // This drives motion-aware keyframe selection for the grid.
  useEffect(() => {
    if (effectiveFrames.length < 2) { setMotionScores(null); return; }
    let cancelled = false;
    computeMotionScores(effectiveFrames)
      .then((res) => { if (!cancelled) setMotionScores(res); })
      .catch(() => { if (!cancelled) setMotionScores(null); });
    return () => { cancelled = true; };
  }, [effectiveFrames]);

  // When the grid needs more cells than we have source frames, synthesize
  // intermediate frames by temporal resampling so every cell is a distinct pose.
  useEffect(() => {
    if (effectiveFrames.length === 0 || totalCells <= effectiveFrames.length) {
      setSynthesizedGridFrames(null);
      return;
    }
    let cancelled = false;
    setSynthesizedGridFrames(null);
    // Target roughly 2x the cells count so keyframe selection still has choice.
    const targetFps = Math.max(
      12,
      Math.ceil((totalCells * 2 * 1000) / totalDurationMs(effectiveFrames)),
    );
    resampleFramesToFps(effectiveFrames, targetFps)
      .then((frames) => { if (!cancelled) setSynthesizedGridFrames(frames); })
      .catch(() => { if (!cancelled) setSynthesizedGridFrames(null); });
    return () => { cancelled = true; };
  }, [effectiveFrames, totalCells]);

  // Re-render preview canvas when anything visible changes.
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !media || selectedFrames.length === 0) return;
    let cancelled = false;

    renderGridToCanvas({
      frames: selectedFrames,
      cols: grid.cols,
      rows: grid.rows,
      spacing,
      background,
    }).then((src) => {
      if (cancelled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = src.width;
      canvas.height = src.height;
      ctx.drawImage(src, 0, 0);
    });

    return () => { cancelled = true; };
  }, [media, selectedFrames, grid, spacing, background]);

  // ── File upload ───────────────────────────────────────────────────────────
  const loadFile = useCallback((file: File, force: boolean) => {
    setParseProgress(0);
    setProcessedFrames(null);
    setDisabledIndices(new Set());
    startTransition(async () => {
      try {
        const result = await parseMediaFile(file, {
          forceDispose: force,
          onProgress: (cur, total) => setParseProgress(total > 0 ? cur / total : 0),
        });
        const suggested =
          result.detectedGrid ??
          suggestOptimalGrid(result.frames, result.width, result.height);
        setMedia(result);
        setAutoGrid(suggested);
        setGrid(suggested);
        setParseProgress(1);
        addToast(
          `解析完成 · ${result.frames.length} 幀 · ${result.width}×${result.height}`,
          "success",
        );
      } catch (err) {
        addToast(err instanceof Error ? err.message : "解析失敗，請重試。", "error");
        setParseProgress(0);
      }
    });
  }, [addToast]);

  const handleFile = useCallback((file: File | null) => {
    if (!file) return;
    setOriginalFile(file);
    setPreviewMode("static");
    setCrop(DEFAULT_CROP);
    setChromaKey(DEFAULT_CHROMA);
    loadFile(file, forceDispose);
  }, [forceDispose, loadFile]);

  const initialFileLoadedRef = useRef(false);
  useEffect(() => {
    if (!initialFile || initialFileLoadedRef.current) return;
    initialFileLoadedRef.current = true;
    handleFile(initialFile);
  }, [initialFile, handleFile]);

  // Re-parse when forceDispose changes (only meaningful for GIFs).
  function handleForceDisposeChange(next: boolean) {
    setForceDispose(next);
    if (originalFile && media?.type === "gif") loadFile(originalFile, next);
  }

  // ── Frame disable ────────────────────────────────────────────────────────
  function toggleFrameDisabled(frameIndex: number) {
    setDisabledIndices((prev) => {
      const next = new Set(prev);
      if (next.has(frameIndex)) next.delete(frameIndex);
      else next.add(frameIndex);
      return next;
    });
  }
  const enabledCount = (media?.frames.length ?? 0) - disabledIndices.size;

  // ── Auto-pick chroma color from first frame ──────────────────────────────
  async function handleAutoPickColor() {
    if (!media?.frames[0]) return;
    try {
      const color = await autoPickColorFromDataUrl(media.frames[0].dataUrl);
      setChromaKey((p) => ({ ...p, color, enabled: true }));
      addToast(`已吸取背景色 ${color}`, "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "吸色失敗。", "error");
    }
  }

  // ── Exports ───────────────────────────────────────────────────────────────
  async function handleExportPng() {
    if (!media || isExporting) return;
    setIsExporting(true);
    try {
      const base = media.name.replace(/\.[^.]+$/, "");
      await exportGridAsPng(
        {
          frames: selectedFrames,
          cols: grid.cols,
          rows: grid.rows,
          spacing,
          background,
          scale: exportScale,
        },
        `${base}_${grid.cols}x${grid.rows}@${exportScale}x.png`,
      );
      addToast("PNG 宮格圖已導出！", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "導出失敗。", "error");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleExportGif() {
    if (!media || isExporting) return;
    setIsExporting(true);
    setExportProgress(0);
    try {
      const blob = await encodeFramesAsGif(
        effectiveFrames,
        { fps, scale: exportScale },
        (cur, total) => setExportProgress(total > 0 ? cur / total : 0),
      );
      const base = media.name.replace(/\.[^.]+$/, "");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${base}_${fps}fps@${exportScale}x.gif`;
      a.click();
      URL.revokeObjectURL(url);
      addToast(`動畫 GIF 已導出 · ${effectiveFrames.length} 幀 · ${fps} fps`, "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "GIF 導出失敗。", "error");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }

  const cellW = baseFrames[0]?.width  ?? media?.width  ?? 0;
  const cellH = baseFrames[0]?.height ?? media?.height ?? 0;
  const outW  = Math.round((grid.cols * cellW + Math.max(0, grid.cols - 1) * spacing) * exportScale);
  const outH  = Math.round((grid.rows * cellH + Math.max(0, grid.rows - 1) * spacing) * exportScale);

  return (
    <div data-theme={initialTheme} className="sprite-theme-root standardizer-root flex h-full min-h-0 flex-col bg-[var(--bg)] text-[var(--ink)]">
      {/* ── Top bar ── */}
      <header className="standardizer-header flex h-12 shrink-0 items-center justify-between gap-3 border-b border-[var(--line)] px-4">
        <div className="standardizer-header-nav flex min-w-0 items-center gap-3">
          <button type="button" onClick={onBack} className="text-[11px] text-[var(--muted)] transition hover:text-[var(--ink)]">← 首页</button>
          <span className="shrink-0 font-display text-sm tracking-[0.14em] text-[var(--accent)]">SPRITE CUTTER</span>
          <button
            type="button"
            onClick={onBack}
            className="standardizer-tool-link shrink-0 rounded-full border border-[var(--accent)] bg-[var(--accent-dim)] px-3 py-0.5 text-[11px] text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-black"
          >
            AI 动作生成 ✦
          </button>
        </div>
        <div className="standardizer-status flex shrink-0 items-center gap-2">
          <button type="button" onClick={onOpenTasks} className="rounded-full border border-[var(--line)] px-2.5 py-0.5 text-[11px] text-[var(--muted)] transition hover:text-[var(--ink)]">任务 List</button>
          {isParsing && (
            <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
              <span className="h-3 w-3 rounded-full border border-[var(--accent)] border-t-transparent animate-spin" />
              解析中…
            </span>
          )}
          {isProcessing && !isParsing && (
            <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
              <span className="h-3 w-3 rounded-full border border-[var(--accent)] border-t-transparent animate-spin" />
              幀處理 {Math.round(processProgress * 100)}%
            </span>
          )}
          {media && !isParsing && (
            <span className="rounded-full border border-[var(--line)] px-2.5 py-0.5 text-[11px] text-[var(--muted)]">
              {enabledCount}/{media.frames.length} 幀 · {cellW}×{cellH}
            </span>
          )}
        </div>
      </header>

      {/* ── Body ── */}
      <div className={`standardizer-shell flex-1 ${media ? "has-media" : "is-empty"}`}>
        {/* ── Output preview ── */}
        <main className="standardizer-preview bg-[var(--bg)]">
          <div className="standardizer-preview-heading flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">Output preview</p>
              <p className="mt-1 text-sm font-medium text-[var(--ink)]">宫格输出预览</p>
            </div>
            {media && (
              <p className="text-right text-[11px] text-[var(--muted)]">
                {previewMode === "static" ? "点击格子可禁用对应帧" : `按当前预设播放 ${selectedFrames.length} 帧`}
              </p>
            )}
          </div>
          <div className="standardizer-preview-stage">
          {!media ? (
            <EmptyState />
          ) : (
            <GridPreviewCanvas
              canvasRef={previewCanvasRef}
              background={background}
              cols={grid.cols}
              rows={grid.rows}
              outW={outW}
              outH={outH}
              frameCount={selectedFrames.length}
              selectedFrames={selectedFrames}
              disabledIndices={disabledIndices}
              onToggleFrame={toggleFrameDisabled}
              fps={fps}
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
            />
          )}
          </div>
        </main>

        {/* ── Single settings rail ── */}
        <aside className="standardizer-settings flex min-w-0 flex-col gap-3 border-l border-[var(--line)] bg-[var(--sidebar)] p-4">
          <UploadZone isParsing={isParsing} parseProgress={parseProgress} media={media} onFile={handleFile} />

          {media && (
            <>
              <AnimatedPreviewCard allFrames={baseFrames} displayFrames={effectiveFrames} background={background} fps={fps} />

              <GridConfigCard
                grid={grid}
                autoGrid={autoGrid}
                spacing={spacing}
                background={background}
                enabledCount={enabledCount}
                totalCount={media.frames.length}
                onGridChange={setGrid}
                onSpacingChange={setSpacing}
                onBackgroundChange={setBackground}
              />

            <CropCard crop={crop} onChange={setCrop} />

            <ExportCard
              fps={fps}
              exportScale={exportScale}
              background={background}
              chromaKey={chromaKey}
              forceDispose={forceDispose}
              isGif={media.type === "gif"}
              isExporting={isExporting}
              exportProgress={exportProgress}
              outW={outW}
              outH={outH}
              gridFrameCount={totalCells}
              gifFrameCount={effectiveFrames.length}
              onFpsChange={setFps}
              onScaleChange={setExportScale}
              onBackgroundChange={setBackground}
              onChromaChange={setChromaKey}
              onForceDisposeChange={handleForceDisposeChange}
              onAutoPickColor={handleAutoPickColor}
              onExportPng={handleExportPng}
              onExportGif={handleExportGif}
              onImportAsset={onImportAsset}
            />
            </>
          )}
        </aside>
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({
  isParsing,
  parseProgress,
  media,
  onFile,
}: {
  isParsing: boolean;
  parseProgress: number;
  media: AppMedia | null;
  onFile: (f: File | null) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const stop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };

  if (isParsing) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[18px] border border-[var(--line)] bg-[var(--panel)] px-4 py-6">
        <div className="h-7 w-7 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        <p className="text-sm text-[var(--muted)]">解析中 {Math.round(parseProgress * 100)}%</p>
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
          <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-200" style={{ width: `${parseProgress * 100}%` }} />
        </div>
      </div>
    );
  }

  if (media) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        onDragOver={(e) => { stop(e); setDragOver(true); }}
        onDragEnter={(e) => { stop(e); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { stop(e); setDragOver(false); onFile(e.dataTransfer.files[0] ?? null); }}
        className={`flex cursor-pointer items-center gap-3 rounded-[14px] border px-3 py-2.5 transition-all ${
          dragOver
            ? "border-[var(--accent)] bg-[var(--accent-dim)]"
            : "border-[var(--line)] bg-[var(--panel)] hover:border-[var(--line-strong)]"
        }`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[var(--line)] bg-white/[0.03]">
          <UploadIcon className="h-4 w-4 text-[var(--accent)]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-[var(--ink)]" title={media.name}>{media.name}</p>
          <p className="mt-0.5 text-[10px] text-[var(--muted)]">GIF / 视频 · 点击或拖入以更换</p>
        </div>
        <span className="shrink-0 text-[11px] text-[var(--accent)]">更换</span>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".gif,image/gif,.png,image/png,.jpg,image/jpeg,.jpeg,image/jpeg,.webp,image/webp,.mp4,video/mp4,.mov,video/quicktime,.webm,video/webm,.m4v,video/x-m4v"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      onDragOver={(e) => { stop(e); setDragOver(true); }}
      onDragEnter={(e) => { stop(e); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { stop(e); setDragOver(false); onFile(e.dataTransfer.files[0] ?? null); }}
      className={`flex cursor-pointer flex-col items-center gap-2.5 rounded-[18px] border-2 border-dashed px-4 py-5 text-center transition-all duration-200 ${
        dragOver
          ? "border-[var(--accent)] bg-[var(--accent-dim)] scale-[1.01]"
          : "border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)]"
      }`}
    >
      <UploadIcon className={`h-6 w-6 transition-colors ${dragOver ? "text-[var(--accent)]" : "text-[var(--muted)]"}`} />
      <div>
        <p className="text-sm font-medium text-[var(--ink)]">{dragOver ? "鬆開上傳" : "拖放或點擊上傳"}</p>
        <p className="mt-0.5 text-[11px] text-[var(--muted)]">GIF · MP4 · MOV · WebM · PNG</p>
        <p className="text-[10px] text-[var(--muted)]">支持上传已排好的宫格图，自动识别并裁切</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".gif,image/gif,.png,image/png,.jpg,image/jpeg,.jpeg,image/jpeg,.webp,image/webp,.mp4,video/mp4,.mov,video/quicktime,.webm,video/webm,.m4v,video/x-m4v"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

// ─── Animated Preview Card ────────────────────────────────────────────────────

function AnimatedPreviewCard({
  allFrames,
  displayFrames,
  background,
  fps,
}: {
  allFrames: ParsedSpriteFrame[];
  displayFrames: ParsedSpriteFrame[];
  background: GridBackground;
  fps: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgMapRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const rafRef    = useRef<number | null>(null);
  const [displayIdx, setDisplayIdx] = useState(0);
  const [loaded, setLoaded]         = useState(false);

  // Rebuild a target timeline whenever the source frames or fps change.
  const timeline = useMemo<BlendRecipe[]>(
    () => (displayFrames.length > 0 ? buildFpsTimeline(displayFrames, fps) : []),
    [displayFrames, fps],
  );
  const timelineDurationMs = useMemo(
    () => timeline.reduce((s, r) => s + r.delayMs, 0),
    [timeline],
  );

  // Preload the distinct source images the timeline needs.
  useEffect(() => {
    if (allFrames.length === 0) return;
    setLoaded(false);
    imgMapRef.current = new Map();
    let resolved = 0;
    let cancelled = false;

    allFrames.forEach((f) => {
      ensureImage(f, imgMapRef.current)
        .then(() => {
          if (cancelled) return;
          resolved++;
          if (resolved === allFrames.length) setLoaded(true);
        })
        .catch(() => { /* ignore, loaded stays false */ });
    });

    return () => { cancelled = true; imgMapRef.current = new Map(); };
  }, [allFrames]);

  useEffect(() => { setDisplayIdx(0); }, [timeline]);

  // RAF-driven playback using a monotonic clock + modulo into target duration.
  useEffect(() => {
    if (!loaded || timeline.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = displayFrames[0]?.width  ?? 0;
    const h = displayFrames[0]?.height ?? 0;
    if (w === 0 || h === 0) return;
    canvas.width  = w;
    canvas.height = h;

    const start = performance.now();
    const totalMs = Math.max(1, timelineDurationMs);
    const stepMs = timeline[0].delayMs;

    function frame(now: number) {
      // Guard against edge cases (empty timeline, NaN fps, etc.) — keep the
      // RAF loop alive instead of crashing on a stale render.
      if (timeline.length === 0 || stepMs <= 0 || !Number.isFinite(stepMs)) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }
      const elapsed = (now - start) % totalMs;
      const rawIdx = Math.floor(elapsed / stepMs);
      const idx = Math.max(0, Math.min(timeline.length - 1, Number.isFinite(rawIdx) ? rawIdx : 0));
      const recipe = timeline[idx];
      if (recipe && ctx) {
        const imgA = imgMapRef.current.get(recipe.a.id);
        const imgB = imgMapRef.current.get(recipe.b.id);
        if (imgA && imgB) {
          renderBlend(ctx, imgA, imgB, recipe.alpha, 0, 0, w, h, background);
        }
      }
      setDisplayIdx(idx);
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); };
  }, [loaded, timeline, timelineDurationMs, background, displayFrames]);

  const sourceMs = displayFrames.reduce((s, f) => s + f.delay, 0);
  const fpsLabel = fps.toFixed(1);

  return (
    <details className="group rounded-[16px] border border-[var(--line)] bg-[var(--panel)] animate-slide-up">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-[10px] text-[var(--accent)] transition-transform group-open:rotate-90">▶</span>
          <Label text="源动画预览" />
        </div>
        <span className="text-[11px] text-[var(--muted)]">
          {displayFrames.length} 帧 · {fpsLabel} fps
        </span>
      </summary>

      <div className="border-t border-[var(--line)] px-3.5 pb-3.5 pt-3">
        <div className="overflow-hidden rounded-[12px] border border-white/[0.06] checkerboard">
          <canvas
            ref={canvasRef}
            className="mx-auto max-h-56 max-w-full"
            style={{ width: "auto", height: "auto", display: "block", imageRendering: "pixelated" }}
          />
        </div>

        <div className="mt-2.5 h-0.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full bg-[var(--ok)] transition-none"
            style={{ width: `${timeline.length ? ((displayIdx + 1) / timeline.length) * 100 : 0}%` }}
          />
        </div>

        <div className="mt-2 flex items-center gap-2 text-[11px] text-[var(--muted)]">
          <span>{displayFrames[0]?.width ?? 0}×{displayFrames[0]?.height ?? 0}</span>
          <Dot />
          <span>{displayFrames.length} 源 / {timeline.length} 补</span>
          <Dot />
          <span>{(sourceMs / 1000).toFixed(1)}s</span>
        </div>
      </div>
    </details>
  );
}

// ─── Grid Config Card ─────────────────────────────────────────────────────────

function GridConfigCard({
  grid,
  autoGrid,
  spacing,
  background,
  enabledCount,
  totalCount,
  onGridChange,
  onSpacingChange,
  onBackgroundChange,
}: {
  grid: GridPreset;
  autoGrid: GridPreset;
  spacing: CellSpacing;
  background: GridBackground;
  enabledCount: number;
  totalCount: number;
  onGridChange: (g: GridPreset) => void;
  onSpacingChange: (s: CellSpacing) => void;
  onBackgroundChange: (b: GridBackground) => void;
}) {
  return (
    <div className="rounded-[18px] border border-[var(--line)] bg-[var(--panel)] p-3.5 animate-slide-up">
      <Label text="宮格設置" />

      {/* Custom rows × cols inputs */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <NumberField
          label="行數"
          value={grid.rows}
          min={1}
          max={20}
          onChange={(rows) => onGridChange({ ...grid, rows })}
        />
        <NumberField
          label="列數"
          value={grid.cols}
          min={1}
          max={20}
          onChange={(cols) => onGridChange({ ...grid, cols })}
        />
      </div>

      {/* Effective frame counter */}
      <div className="mt-2.5 flex items-center gap-2 rounded-[10px] border border-[var(--line)] bg-white/[0.02] px-2.5 py-2">
        <GridIconSm className="h-3.5 w-3.5 text-[var(--accent)]" />
        <p className="text-[11px] text-[var(--ink)]">
          有效幀數: <span className="font-medium tabular-nums">{enabledCount} / {totalCount}</span>
        </p>
      </div>
      <p className="mt-1 text-[10px] leading-tight text-[var(--muted)]">
        在右側預覽中點擊紅色方塊網格，可移除不需要的幀（如空白或錯誤幀）。
      </p>

      {/* Grid presets */}
      <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">預設</p>
      <div className="mt-1.5 grid grid-cols-4 gap-1.5">
        {GRID_PRESETS.map((p) => {
          const active = gridEqual(p, grid);
          const isAuto = gridEqual(p, autoGrid);
          const cells = p.cols * p.rows;
          const isSmooth = cells >= 36;
          return (
            <button
              key={gridLabel(p)}
              type="button"
              onClick={() => onGridChange(p)}
              className={`relative flex flex-col items-center gap-1.5 rounded-[12px] border px-1 py-2.5 transition-all duration-150 ${
                active
                  ? "border-[var(--accent)] bg-[var(--accent-dim)] shadow-[0_0_10px_var(--accent-glow)]"
                  : "border-[var(--line)] bg-white/[0.02] hover:border-[var(--line-strong)]"
              }`}
            >
              {isAuto ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-[var(--ok)] px-1 py-px text-[8px] font-bold uppercase leading-none text-black">
                  推薦
                </span>
              ) : isSmooth ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-[var(--accent)] px-1 py-px text-[8px] font-bold uppercase leading-none text-black">
                  順滑
                </span>
              ) : null}
              <MiniGrid cols={p.cols} rows={p.rows} active={active} />
              <span className={`text-[11px] font-medium tabular-nums ${active ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>
                {gridLabel(p)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Spacing */}
      <p className="mt-3.5 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">間距</p>
      <div className="mt-1.5 flex gap-1.5">
        {CELL_SPACINGS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSpacingChange(s)}
            className={`flex-1 rounded-[9px] border py-1.5 text-[11px] transition-all ${
              spacing === s
                ? "border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--ink)]"
                : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)]"
            }`}
          >
            {s}px
          </button>
        ))}
      </div>

      {/* Background */}
      <p className="mt-3.5 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">背景</p>
      <div className="mt-1.5 flex gap-1.5">
        {(["transparent", "white", "black"] as GridBackground[]).map((bg) => {
          const labels = { transparent: "透明", white: "白色", black: "黑色" };
          return (
            <button
              key={bg}
              type="button"
              onClick={() => onBackgroundChange(bg)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-[9px] border py-1.5 text-[11px] transition-all ${
                background === bg
                  ? "border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--ink)]"
                  : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)]"
              }`}
            >
              <BgSwatch bg={bg} />
              {labels[bg]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Crop Card ────────────────────────────────────────────────────────────────

function CropCard({
  crop,
  onChange,
}: {
  crop: FrameCrop;
  onChange: (c: FrameCrop) => void;
}) {
  return (
    <details className="group rounded-[16px] border border-[var(--line)] bg-[var(--panel)] animate-slide-up">
      <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-3 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--accent)] transition-transform group-open:rotate-90">▶</span>
          <ScissorsIcon className="h-3.5 w-3.5 text-[var(--accent)]" />
          <Label text="单帧裁剪 (PX)" />
        </div>
        <span className="text-[10px] text-[var(--muted)]">上 {crop.top} · 下 {crop.bottom} · 左 {crop.left} · 右 {crop.right}</span>
      </summary>
      <div className="standardizer-crop-grid grid grid-cols-2 gap-2 border-t border-[var(--line)] px-3.5 pb-3.5 pt-3">
        <NumberField label="上" value={crop.top}    min={0} max={9999} onChange={(top) => onChange({ ...crop, top })} />
        <NumberField label="下" value={crop.bottom} min={0} max={9999} onChange={(bottom) => onChange({ ...crop, bottom })} />
        <NumberField label="左" value={crop.left}   min={0} max={9999} onChange={(left) => onChange({ ...crop, left })} />
        <NumberField label="右" value={crop.right}  min={0} max={9999} onChange={(right) => onChange({ ...crop, right })} />
      </div>
    </details>
  );
}

// ─── Export Card ──────────────────────────────────────────────────────────────

function ExportCard({
  fps,
  exportScale,
  background,
  chromaKey,
  forceDispose,
  isGif,
  isExporting,
  exportProgress,
  outW,
  outH,
  gridFrameCount,
  gifFrameCount,
  onFpsChange,
  onScaleChange,
  onBackgroundChange,
  onChromaChange,
  onForceDisposeChange,
  onAutoPickColor,
  onExportPng,
  onExportGif,
  onImportAsset,
}: {
  fps: number;
  exportScale: ExportScale;
  background: GridBackground;
  chromaKey: ChromaKey;
  forceDispose: boolean;
  isGif: boolean;
  isExporting: boolean;
  exportProgress: number;
  outW: number;
  outH: number;
  gridFrameCount: number;
  gifFrameCount: number;
  onFpsChange: (n: number) => void;
  onScaleChange: (s: ExportScale) => void;
  onBackgroundChange: (b: GridBackground) => void;
  onChromaChange: (c: ChromaKey) => void;
  onForceDisposeChange: (b: boolean) => void;
  onAutoPickColor: () => void;
  onExportPng: () => void;
  onExportGif: () => void;
  onImportAsset?: () => void;
}) {
  const transparentExport = background === "transparent";

  return (
    <div className="rounded-[18px] border border-[var(--line)] bg-[var(--panel)] p-3.5 animate-slide-up">
      <Label text="導出" />

      {/* FPS + scale */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <NumberField
          label="幀率 (FPS)"
          value={fps}
          min={1}
          max={60}
          onChange={onFpsChange}
        />
        <SelectField
          label="導出縮放比例"
          value={String(exportScale)}
          options={EXPORT_SCALES.map((s) => ({
            value: String(s),
            label: s === 1 ? "1x (原始大小)" : `${s}x`,
          }))}
          onChange={(v) => onScaleChange(Number(v) as ExportScale)}
        />
      </div>

      {/* Transparent export toggle */}
      <CheckboxRow
        checked={transparentExport}
        onChange={(v) => onBackgroundChange(v ? "transparent" : "white")}
        label="導出透明背景"
        sub="保持原圖透明通道 (PNG) 或移除背景"
        icon={<GhostIcon className="h-3.5 w-3.5" />}
      />

      {/* Chroma key */}
      <div className="mt-2 rounded-[12px] border border-[var(--line)] bg-white/[0.02] p-2.5">
        <CheckboxRow
          inline
          checked={chromaKey.enabled}
          onChange={(v) => onChromaChange({ ...chromaKey, enabled: v })}
          label="背景移除 (摳像)"
          icon={<EraserIcon className="h-3.5 w-3.5" />}
          right={
            <button
              type="button"
              onClick={onAutoPickColor}
              className="flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline"
            >
              <PipetteIcon className="h-3 w-3" /> 自動吸取
            </button>
          }
        />

        {chromaKey.enabled && (
          <div className="mt-2.5 space-y-2">
            {/* Target color */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[var(--muted)]">目標顏色</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] tabular-nums text-[var(--ink)]">{chromaKey.color}</span>
                <input
                  type="color"
                  value={chromaKey.color}
                  onChange={(e) => onChromaChange({ ...chromaKey, color: e.target.value })}
                  className="h-5 w-5 cursor-pointer rounded border border-[var(--line)] bg-transparent"
                />
              </div>
            </div>

            {/* Tolerance slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                <span>容差 (相似度)</span>
                <span className="tabular-nums text-[var(--ink)]">{chromaKey.tolerance}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={chromaKey.tolerance}
                onChange={(e) => onChromaChange({ ...chromaKey, tolerance: Number(e.target.value) })}
                className="mt-1 w-full accent-[var(--accent)]"
              />
            </div>

            {/* Edge-only */}
            <CheckboxRow
              inline
              checked={chromaKey.edgeOnly}
              onChange={(v) => onChromaChange({ ...chromaKey, edgeOnly: v })}
              label="僅移除邊緣 (保護主體內部)"
              icon={<ShieldIcon className="h-3 w-3" />}
              dense
            />
          </div>
        )}
      </div>

      {/* Per-frame dispose (GIF source only) */}
      {isGif && (
        <CheckboxRow
          checked={forceDispose}
          onChange={onForceDisposeChange}
          label="每幀清除背景 (防重影)"
          sub="勾選可解決透明背景的噪點/重影問題 (Dispose 2)"
          icon={<EraserIcon className="h-3.5 w-3.5" />}
        />
      )}

      {/* Progress bar */}
      {isExporting && exportProgress > 0 && (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[11px] text-[var(--muted)]">
            <span>GIF 編碼中…</span>
            <span>{Math.round(exportProgress * 100)}%</span>
          </div>
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
            <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${exportProgress * 100}%` }} />
          </div>
        </div>
      )}

      <div className="mt-3 space-y-2">
        <ExportButton
          label="宮格圖 PNG"
          sub={`${outW} × ${outH}px · ${gridFrameCount} 幀`}
          color="accent"
          disabled={isExporting}
          icon={<DownloadIcon className="h-3.5 w-3.5" />}
          onClick={onExportPng}
        />
        <ExportButton
          label="動畫 GIF"
          sub={`${gifFrameCount} 幀 · ${fps} fps · ${exportScale}x`}
          color="ok"
          disabled={isExporting}
          loading={isExporting && exportProgress > 0}
          icon={<GifIcon className="h-3.5 w-3.5" />}
          onClick={onExportGif}
        />
        <button
          type="button"
          onClick={onImportAsset}
          className="flex w-full items-center justify-center rounded-[12px] bg-[var(--ink)] px-3.5 py-3 text-sm font-medium text-[var(--bg)] transition hover:opacity-90"
        >
          导入游戏资产库
        </button>
      </div>
    </div>
  );
}

function ExportButton({
  label, sub, color, disabled, loading, icon, onClick,
}: {
  label: string; sub: string;
  color: "accent" | "ok";
  disabled: boolean;
  loading?: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const c = color === "accent"
    ? "hover:border-[var(--accent)] hover:bg-[var(--accent-dim)]"
    : "hover:border-[var(--ok)]     hover:bg-[var(--ok-dim)]";
  const ic = color === "accent" ? "text-[var(--accent)]" : "text-[var(--ok)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-[12px] border border-[var(--line)] bg-white/[0.025] px-3.5 py-3 text-left transition-all ${c} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <span className={ic}>{loading ? <Spinner /> : icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-none text-[var(--ink)]">{label}</p>
        <p className="mt-1 truncate text-[11px] text-[var(--muted)]">{sub}</p>
      </div>
    </button>
  );
}

// ─── Grid Preview ─────────────────────────────────────────────────────────────

function InlineMotionPreview({
  frames,
  fps,
  background,
  onFrameChange,
}: {
  frames: ParsedSpriteFrame[];
  fps: number;
  background: GridBackground;
  onFrameChange: (index: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageMapRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const rafRef = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    onFrameChange(0);
    imageMapRef.current = new Map();
    const uniqueFrames = [...new Map(frames.map((frame) => [frame.id, frame])).values()];
    Promise.all(uniqueFrames.map((frame) => ensureImage(frame, imageMapRef.current)))
      .then(() => { if (!cancelled) setLoaded(true); })
      .catch(() => { if (!cancelled) setLoaded(false); });
    return () => {
      cancelled = true;
      imageMapRef.current = new Map();
    };
  }, [frames, onFrameChange]);

  useEffect(() => {
    if (!loaded || frames.length === 0) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const width = frames[0]?.width ?? 0;
    const height = frames[0]?.height ?? 0;
    if (width <= 0 || height <= 0) return;
    canvas.width = width;
    canvas.height = height;

    const frameDuration = 1000 / Math.max(1, fps);
    const startedAt = performance.now();
    let lastIndex = -1;

    function draw(now: number) {
      const index = Math.floor((now - startedAt) / frameDuration) % frames.length;
      if (index !== lastIndex) {
        const frame = frames[index];
        const image = imageMapRef.current.get(frame.id);
        if (image) {
          renderBlend(context!, image, image, 0, 0, 0, width, height, background);
          lastIndex = index;
          onFrameChange(index);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [background, fps, frames, loaded, onFrameChange]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-label={`动态预览，共 ${frames.length} 帧`}
        className="block h-full w-full object-contain"
        style={{ imageRendering: "pixelated" }}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-xs text-[var(--muted)]">
          正在准备动态预览…
        </div>
      )}
    </>
  );
}

function GridPreviewCanvas({
  canvasRef,
  background,
  cols,
  rows,
  outW,
  outH,
  frameCount,
  selectedFrames,
  disabledIndices,
  onToggleFrame,
  fps,
  previewMode,
  onPreviewModeChange,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  background: GridBackground;
  cols: number;
  rows: number;
  outW: number;
  outH: number;
  frameCount: number;
  selectedFrames: ParsedSpriteFrame[];
  disabledIndices: Set<number>;
  onToggleFrame: (frameIndex: number) => void;
  fps: number;
  previewMode: "static" | "motion";
  onPreviewModeChange: (mode: "static" | "motion") => void;
}) {
  const [motionFrameIndex, setMotionFrameIndex] = useState(0);
  const handleMotionFrameChange = useCallback((index: number) => setMotionFrameIndex(index), []);
  const visibleMotionIndex = selectedFrames.length > 0 ? motionFrameIndex % selectedFrames.length : 0;
  const motionFrame = selectedFrames[visibleMotionIndex] ?? selectedFrames[0];
  const staticRatio = outW > 0 && outH > 0 ? outW / outH : 1;
  const motionRatio = motionFrame && motionFrame.height > 0 ? motionFrame.width / motionFrame.height : 1;
  const previewRatio = previewMode === "motion" ? motionRatio : staticRatio;

  return (
    <div className="standardizer-grid-preview flex h-full w-full flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="standardizer-grid-frame-slot">
        <div
          className={`standardizer-grid-frame relative overflow-hidden rounded-[14px] border border-[var(--line-strong)] ${background === "transparent" ? "checkerboard" : ""}`}
          style={{
            backgroundColor:
              background === "white" ? "#fff" : background === "black" ? "#000" : undefined,
            aspectRatio: String(previewRatio),
            "--preview-ratio": previewRatio,
          } as React.CSSProperties & Record<"--preview-ratio", number>}
        >
          <canvas
            ref={canvasRef}
            className={previewMode === "static" ? "block h-full w-full" : "hidden"}
          />
          {previewMode === "static" ? (
            <div
              className="absolute inset-0 grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              }}
            >
              {selectedFrames.map((f, i) => {
                const disabled = disabledIndices.has(f.index);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onToggleFrame(f.index)}
                    title={disabled ? "點擊恢復此幀" : "點擊禁用此幀"}
                    className={`group relative cursor-pointer transition-all ${
                      disabled
                        ? "bg-[rgba(224,85,85,0.55)] hover:bg-[rgba(224,85,85,0.7)]"
                        : "hover:bg-[rgba(244,111,36,0.18)]"
                    }`}
                  >
                    {disabled && (
                      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white/90">×</span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <InlineMotionPreview
              frames={selectedFrames}
              fps={fps}
              background={background}
              onFrameChange={handleMotionFrameChange}
            />
          )}
        </div>
      </div>
      <div className="standardizer-grid-footer flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5 text-[11px] text-[var(--muted)]">
          {previewMode === "static" ? (
            <>
              <span>{cols} × {rows}</span>
              <Dot />
              <span>{frameCount} 帧</span>
              <Dot />
              <span className="truncate">{outW} × {outH} px</span>
            </>
          ) : (
            <>
              <span className="tabular-nums">{selectedFrames.length > 0 ? visibleMotionIndex + 1 : 0} / {selectedFrames.length}</span>
              <Dot />
              <span>{selectedFrames.length} 帧</span>
              <Dot />
              <span>{fps} fps</span>
            </>
          )}
        </div>
        <div className="flex shrink-0 rounded-full border border-[var(--line)] bg-black/20 p-0.5" role="group" aria-label="预览模式">
          {(["static", "motion"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={previewMode === mode}
              onClick={() => onPreviewModeChange(mode)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                previewMode === mode
                  ? "bg-[var(--accent)] text-black"
                  : "text-[var(--muted)] hover:text-white"
              }`}
            >
              {mode === "static" ? "静态预览" : "动态预览"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 opacity-25">
      <GridIcon className="h-14 w-14" />
      <p className="text-sm text-[var(--muted)]">上傳素材後顯示宮格預覽</p>
    </div>
  );
}

// ─── Mini grid thumbnail ──────────────────────────────────────────────────────

function MiniGrid({ cols, rows, active }: { cols: number; rows: number; active: boolean }) {
  // Render faithful cols × rows. Scale cell size so the longest side always
  // fits within ~28px, shrinking gap to 1px past 5 cells per side.
  const longest = Math.max(cols, rows);
  const maxPx   = 28;
  const gap     = longest > 5 ? 1 : 2;
  const cellSize = Math.max(1, Math.floor((maxPx - (longest - 1) * gap) / longest));
  return (
    <div
      className="grid"
      style={{
        gap: `${gap}px`,
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      }}
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div
          key={i}
          className={`rounded-[1px] ${active ? "bg-[var(--accent)]" : "bg-current"} opacity-60`}
          style={{ width: cellSize, height: cellSize }}
        />
      ))}
    </div>
  );
}

// ─── Form fields ──────────────────────────────────────────────────────────────

function NumberField({
  label, value, min, max, onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
}) {
  const clamp = (n: number) => {
    if (Number.isNaN(n)) return min ?? 0;
    if (min !== undefined && n < min) return min;
    if (max !== undefined && n > max) return max;
    return n;
  };
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(clamp(parseInt(e.target.value, 10)))}
        className="mt-1 block w-full rounded-[9px] border border-[var(--line)] bg-white/[0.03] px-2.5 py-1.5 text-[13px] tabular-nums text-[var(--ink)] outline-none transition-colors focus:border-[var(--accent)]"
      />
    </label>
  );
}

function SelectField({
  label, value, options, onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full appearance-none rounded-[9px] border border-[var(--line)] bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-[var(--ink)] outline-none transition-colors focus:border-[var(--accent)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[var(--sidebar)]">{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function CheckboxRow({
  checked, onChange, label, sub, icon, right, dense, inline,
}: {
  checked: boolean;
  onChange: (b: boolean) => void;
  label: string;
  sub?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  dense?: boolean;
  inline?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-2 ${inline ? "" : "mt-2 rounded-[12px] border border-[var(--line)] bg-white/[0.02] px-2.5 py-2"}`}>
      <label className="flex flex-1 cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-[var(--accent)]"
        />
        {icon && <span className="text-[var(--accent)]">{icon}</span>}
        <span className="flex-1">
          <span className={`block ${dense ? "text-[11px]" : "text-[12px]"} text-[var(--ink)]`}>{label}</span>
          {sub && <span className="mt-0.5 block text-[10px] leading-tight text-[var(--muted)]">{sub}</span>}
        </span>
      </label>
      {right}
    </div>
  );
}

// ─── Tiny shared UI ───────────────────────────────────────────────────────────

function Label({ text }: { text: string }) {
  return <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">{text}</p>;
}

function Dot() {
  return <span className="h-0.5 w-0.5 rounded-full bg-[var(--line-strong)]" />;
}

function BgSwatch({ bg }: { bg: GridBackground }) {
  if (bg === "transparent") return <span className="h-3 w-3 shrink-0 rounded-[2px] checkerboard border border-white/10" />;
  if (bg === "white")       return <span className="h-3 w-3 shrink-0 rounded-[2px] bg-white border border-white/20" />;
  return                           <span className="h-3 w-3 shrink-0 rounded-[2px] bg-black border border-white/10" />;
}

function Spinner() {
  return <span className="block h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 12l-4-4m0 0l-4 4m4-4v9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4v12M8 12l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16" strokeLinecap="round" />
    </svg>
  );
}

function GifIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M9.5 10H7.5a1 1 0 00-1 1v2a1 1 0 001 1H9v-1.5H7.5M12.5 10v4M15.5 10v1.5h1.5M15.5 13.5h1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function GridIconSm({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ScissorsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GhostIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 11a7 7 0 0114 0v9l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L7 20l-2-1.5V11z" strokeLinejoin="round" />
      <circle cx="9" cy="11" r="0.8" fill="currentColor" />
      <circle cx="15" cy="11" r="0.8" fill="currentColor" />
    </svg>
  );
}

function EraserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M16 3l5 5-9 9H7l-4-4 9-9 4-1z" strokeLinejoin="round" />
      <path d="M9 7l8 8M5 21h14" strokeLinecap="round" />
    </svg>
  );
}

function PipetteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 4l6 6-9 9H5v-6l9-9z" strokeLinejoin="round" />
      <path d="M13 5l6 6" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" strokeLinejoin="round" />
    </svg>
  );
}
