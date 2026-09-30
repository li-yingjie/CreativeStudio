import type { ResultCode, ResultMeta } from "../types";

// 原包的十张结果图字节一致，保留独立结果配置，共用同一份素材。
const card = {
  previewSrc: "/assets/climbing-cbti/result.png",
  downloadSrc: "/assets/climbing-cbti/result.png",
};

export const results: Record<ResultCode, ResultMeta> = {
  FPS: {
    code: "FPS",
    name: "落地成团",
    latinName: "功能导向的力量型社交选手",
    tags: ["功能硬核", "肉身物理", "显眼包"],
    ...card,
  },
  FMS: {
    code: "FMS",
    name: "挂壁岩羊",
    latinName: "功能导向的策略型社交选手",
    tags: ["功能硬核", "脑回路", "显眼包"],
    ...card,
  },
  FPL: {
    code: "FPL",
    name: "暴力大猿猴",
    latinName: "功能导向的力量型独狼",
    tags: ["功能硬核", "肉身物理", "寂静独行侠"],
    ...card,
  },
  FML: {
    code: "FML",
    name: "磕学家",
    latinName: "功能导向的策略型独狼",
    tags: ["功能硬核", "脑回路", "寂静独行侠"],
    ...card,
  },
  EPS: {
    code: "EPS",
    name: "岩唱家",
    latinName: "体验导向的力量型社交选手",
    tags: ["体验氛围", "肉身物理", "显眼包"],
    ...card,
  },
  EMS: {
    code: "EMS",
    name: "哇系搭子",
    latinName: "情绪价值供给",
    tags: ["体验氛围", "脑回路", "显眼包"],
    ...card,
  },
  EPL: {
    code: "EPL",
    name: "壁加索",
    latinName: "体验导向的力量型独狼",
    tags: ["体验氛围", "肉身物理", "寂静独行侠"],
    ...card,
  },
  EML: {
    code: "EML",
    name: "石上达人",
    latinName: "体验导向的策略型独狼",
    tags: ["体验氛围", "脑回路", "寂静独行侠"],
    ...card,
  },
  "FPL+": {
    code: "FPL+",
    name: "窜天猴",
    latinName: "表面独狼，内心急躁",
    tags: ["隐藏款", "焦虑分", "功能肉身独行"],
    ...card,
  },
  "EMS+": {
    code: "EMS+",
    name: "活体豆包",
    latinName: "嘴攀型岩友",
    tags: ["隐藏款", "豆包隐藏", "体验脑回路显眼"],
    ...card,
  },
};
