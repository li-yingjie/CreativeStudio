import type { ResultMeta } from "../types";

export function createFallbackCardDataUrl(result: ResultMeta) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1400;
  const context = canvas.getContext("2d");

  if (!context) {
    return "";
  }

  context.fillStyle = "#f7f2e8";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(24, 22, 18, 0.18)";
  context.lineWidth = 6;
  context.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  context.fillStyle = "#111111";
  context.font = "700 46px sans-serif";
  context.fillText("岩馆爬行动物图鉴", 72, 120);

  context.font = "700 164px sans-serif";
  context.fillText(result.code, 72, 360);

  context.font = "700 84px sans-serif";
  context.fillText(result.name, 72, 520);

  context.font = "500 34px sans-serif";
  context.fillStyle = "rgba(17, 17, 17, 0.8)";
  context.fillText("结果卡占位图。", 72, 1040);
  context.fillText("请替换为成品 PNG / WEBP。", 72, 1092);

  context.font = "600 32px sans-serif";
  context.fillText("BANANA CLIMBING", 72, 1300);

  return canvas.toDataURL("image/png");
}
