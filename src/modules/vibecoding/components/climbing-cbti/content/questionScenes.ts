import type { QuestionSceneConfig } from "../types";

const DEFAULT_HOTSPOTS = {
  A: { x: 330, y: 430, width: 690, height: 470 },
  B: { x: 475, y: 945, width: 545, height: 390 },
  C: { x: 210, y: 1310, width: 565, height: 415 },
} as const;

function createQuestionScene(): QuestionSceneConfig {
  return {
    imageSrc: "/assets/climbing-cbti/question.png",
    hotspots: {
      A: { ...DEFAULT_HOTSPOTS.A },
      B: { ...DEFAULT_HOTSPOTS.B },
      C: { ...DEFAULT_HOTSPOTS.C },
    },
  };
}

export const QUESTION_SCENE_WIDTH = 1200;
export const QUESTION_SCENE_HEIGHT = 1800;

// 原包十五张题面相同；每题仍保留独立热点配置。
export const questionScenes: Record<number, QuestionSceneConfig> = Object.fromEntries(
  Array.from({ length: 15 }, (_, index) => [index + 1, createQuestionScene()]),
);
