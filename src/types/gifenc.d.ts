declare module "gifenc" {
  export type RGBData = Uint8Array | Uint8ClampedArray;

  export interface GIFEncoderInstance {
    writeFrame(
      index: Uint8Array | Uint8ClampedArray,
      width: number,
      height: number,
      opts?: {
        palette?: RGBData;
        delay?: number;
        repeat?: number;
        transparent?: boolean;
        transparentIndex?: number;
        colorDepth?: number;
        first?: boolean;
        restart?: boolean;
      },
    ): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    reset(): void;
  }

  export function GIFEncoder(opts?: { initialCapacity?: number; auto?: boolean }): GIFEncoderInstance;

  export function quantize(
    data: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    opts?: { format?: string; oneBitAlpha?: boolean },
  ): RGBData;

  export function applyPalette(
    data: Uint8Array | Uint8ClampedArray,
    palette: RGBData,
    format?: string,
  ): Uint8Array;

  export function nearestColorIndex(
    palette: RGBData,
    r: number,
    g: number,
    b: number,
    a?: number,
  ): number;
}
