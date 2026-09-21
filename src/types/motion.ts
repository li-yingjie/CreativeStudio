export type ParsedSpriteFrame = {
  id: string;
  index: number;
  delay: number; // ms
  width: number;
  height: number;
  dataUrl: string;
};

export type GridPreset = {
  cols: number;
  rows: number;
};

export type GridBackground = "transparent" | "white" | "black";

export type ExportFormat = "png" | "gif";

export type FrameCrop = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type ChromaKey = {
  enabled: boolean;
  color: string;     // hex like "#fcfbfe"
  tolerance: number; // 0-100, percentage
  edgeOnly: boolean;
};

export const EXPORT_SCALES = [0.5, 1, 2] as const;
export type ExportScale = (typeof EXPORT_SCALES)[number];

export type AppMedia = {
  name: string;
  type: "gif" | "video" | "sheet";
  width: number;
  height: number;
  frames: ParsedSpriteFrame[];
  detectedGrid?: GridPreset;
};

export type ToastItem = {
  id: string;
  message: string;
  type: "error" | "success" | "info";
};
