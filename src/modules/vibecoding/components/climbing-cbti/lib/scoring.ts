import { questions } from "../content/questions";
import type { AnswerRecord, BaseResultCode, QuestionOption, ResultCode, Scores } from "../types";

export const FAST_ANSWER_THRESHOLD_MS = 40_000;

const hiddenTriggerTargets = {
  anxiety: questions
    .flatMap((question) => question.options)
    .filter((option) => option.scores.includes("anxiety")).length,
  doubao: questions
    .flatMap((question) => question.options)
    .filter((option) => option.scores.includes("doubao")).length,
};

export const initialScores = (): Scores => ({
  F: 0,
  E: 0,
  P: 0,
  M: 0,
  S: 0,
  L: 0,
  anxiety: 0,
  doubao: 0,
});

export function applyAnswer(
  scores: Scores,
  option: Pick<QuestionOption, "scores">,
  questionId: number,
): Scores {
  const question = questions.find((item) => item.id === questionId);

  if (!question) {
    return scores;
  }

  return option.scores.reduce(
    (acc, scoreKey) => ({
      ...acc,
      [scoreKey]: acc[scoreKey] + 1,
    }),
    scores,
  );
}

export function calculateBaseResultCode(scores: Scores): BaseResultCode {
  const first = scores.F >= scores.E ? "F" : "E";
  const second = scores.P >= scores.M ? "P" : "M";
  const third = scores.S >= scores.L ? "S" : "L";

  return `${first}${second}${third}` as BaseResultCode;
}

type ResultContext = {
  completedElapsedMs?: number;
};

export function calculateResultCode(scores: Scores, context: ResultContext = {}): ResultCode {
  const baseCode = calculateBaseResultCode(scores);

  if (baseCode === "FPL") {
    const selectedAllAnxiety = scores.anxiety === hiddenTriggerTargets.anxiety;
    const isFastAnswer =
      typeof context.completedElapsedMs === "number" &&
      context.completedElapsedMs <= FAST_ANSWER_THRESHOLD_MS;

    if (selectedAllAnxiety || isFastAnswer) {
      return "FPL+";
    }
  }

  if (baseCode === "EMS" && scores.doubao === hiddenTriggerTargets.doubao) {
    return "EMS+";
  }

  return baseCode;
}

export function buildScoresFromAnswers(answers: AnswerRecord[]): Scores {
  return answers.reduce(
    (acc, answer) => applyAnswer(acc, { scores: answer.scores }, answer.questionId),
    initialScores(),
  );
}
