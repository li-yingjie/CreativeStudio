export type AxisKey = "F" | "E" | "P" | "M" | "S" | "L";

export type SpecialScoreKey = "anxiety" | "doubao";

export type ScoreKey = AxisKey | SpecialScoreKey;

export type BaseResultCode =
  | "FPS"
  | "FMS"
  | "FPL"
  | "FML"
  | "EPS"
  | "EMS"
  | "EPL"
  | "EML";

export type HiddenResultCode = "FPL+" | "EMS+";

export type ResultCode = BaseResultCode | HiddenResultCode;

export type DimensionKey = "FE" | "PM" | "SL";

export type Scores = Record<ScoreKey, number>;

export type OptionKey = "A" | "B" | "C";

export type QuestionOption = {
  key: OptionKey;
  text: string;
  scores: ScoreKey[];
};

export type Question = {
  id: number;
  dimension: "mixed";
  prompt: string;
  options: QuestionOption[];
};

export type HotspotRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type QuestionSceneConfig = {
  imageSrc: string;
  hotspots: Record<OptionKey, HotspotRect>;
};

export type ResultMeta = {
  code: ResultCode;
  name: string;
  latinName: string;
  tags: [string, string, string];
  previewSrc: string;
  downloadSrc: string;
};

export type AppStep = "cover" | "quiz" | "loading" | "result";

export type AnswerRecord = {
  questionId: number;
  optionKey: OptionKey;
  scores: ScoreKey[];
};
