import type { QuestionSceneConfig } from "../types";

const DEFAULT_HOTSPOTS = {
  A: { x: 330, y: 430, width: 690, height: 470 },
  B: { x: 475, y: 945, width: 545, height: 390 },
  C: { x: 210, y: 1310, width: 565, height: 415 },
} as const;

function createQuestionScene(
  index: number,
  hotspots: QuestionSceneConfig["hotspots"] = DEFAULT_HOTSPOTS,
): QuestionSceneConfig {
  return {
    imageSrc: `/assets/climbing-cbti/questions/Q${index}.jpg`,
    hotspots: {
      A: { ...hotspots.A },
      B: { ...hotspots.B },
      C: { ...hotspots.C },
    },
  };
}

export const QUESTION_SCENE_WIDTH = 1200;
export const QUESTION_SCENE_HEIGHT = 1800;

export const questionScenes: Record<number, QuestionSceneConfig> = {
  1: createQuestionScene(1, {
    A: { x: 310, y: 350, width: 680, height: 440 },
    B: { x: 545, y: 760, width: 460, height: 560 },
    C: { x: 420, y: 1300, width: 620, height: 500 },
  }),
  2: createQuestionScene(2, {
    A: { x: 300, y: 360, width: 700, height: 395 },
    B: { x: 205, y: 720, width: 735, height: 360 },
    C: { x: 280, y: 1060, width: 720, height: 400 },
  }),
  3: createQuestionScene(3, {
    A: { x: 300, y: 400, width: 700, height: 320 },
    B: { x: 190, y: 710, width: 780, height: 320 },
    C: { x: 610, y: 1060, width: 400, height: 690 },
  }),
  4: createQuestionScene(4, {
    A: { x: 220, y: 400, width: 760, height: 300 },
    B: { x: 175, y: 780, width: 810, height: 350 },
    C: { x: 180, y: 1090, width: 450, height: 610 },
  }),
  5: createQuestionScene(5, {
    A: { x: 300, y: 400, width: 680, height: 330 },
    B: { x: 210, y: 730, width: 720, height: 380 },
    C: { x: 510, y: 1090, width: 480, height: 600 },
  }),
  6: createQuestionScene(6, {
    A: { x: 320, y: 440, width: 690, height: 420 },
    B: { x: 470, y: 950, width: 540, height: 350 },
    C: { x: 200, y: 1300, width: 570, height: 420 },
  }),
  7: createQuestionScene(7, {
    A: { x: 310, y: 420, width: 690, height: 420 },
    B: { x: 200, y: 820, width: 470, height: 540 },
    C: { x: 190, y: 1310, width: 580, height: 460 },
  }),
  8: createQuestionScene(8, {
    A: { x: 350, y: 405, width: 660, height: 400 },
    B: { x: 170, y: 780, width: 460, height: 400 },
    C: { x: 665, y: 820, width: 340, height: 520 },
  }),
  9: createQuestionScene(9, {
    A: { x: 230, y: 450, width: 760, height: 420 },
    B: { x: 380, y: 890, width: 560, height: 280 },
    C: { x: 490, y: 1250, width: 460, height: 500 },
  }),
  10: createQuestionScene(10, {
    A: { x: 180, y: 490, width: 600, height: 500 },
    B: { x: 260, y: 995, width: 640, height: 340 },
    C: { x: 320, y: 1330, width: 670, height: 440 },
  }),
  11: createQuestionScene(11, {
    A: { x: 300, y: 400, width: 700, height: 430 },
    B: { x: 560, y: 860, width: 360, height: 430 },
    C: { x: 500, y: 1315, width: 560, height: 505 },
  }),
  12: createQuestionScene(12, {
    A: { x: 310, y: 350, width: 680, height: 440 },
    B: { x: 545, y: 840, width: 460, height: 460 },
    C: { x: 620, y: 1300, width: 360, height: 420 },
  }),
  13: createQuestionScene(13, {
    A: { x: 430, y: 350, width: 480, height: 400 },
    B: { x: 530, y: 790, width: 460, height: 380 },
    C: { x: 530, y: 1210, width: 460, height: 380 },
  }),
  14: createQuestionScene(14, {
    A: { x: 430, y: 440, width: 540, height: 420 },
    B: { x: 525, y: 860, width: 430, height: 400 },
    C: { x: 420, y: 1300, width: 520, height: 480 },
  }),
  15: createQuestionScene(15, {
    A: { x: 420, y: 350, width: 560, height: 440 },
    B: { x: 645, y: 780, width: 320, height: 560 },
    C: { x: 520, y: 1380, width: 480, height: 400 },
  }),
};
