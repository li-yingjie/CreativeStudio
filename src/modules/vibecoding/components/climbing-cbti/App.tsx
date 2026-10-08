import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type SyntheticEvent,
} from "react";
import "./App.css";
const bgWallSrc = "/assets/climbing-cbti/bg-wall.png";
const coverBackgroundSrc = "/assets/climbing-cbti/home.png";
import {
  QUESTION_SCENE_HEIGHT,
  QUESTION_SCENE_WIDTH,
  questionScenes,
} from "./content/questionScenes";
import { questions } from "./content/questions";
import { results } from "./content/results";
import { trackEvent } from "./lib/analytics";
import { createFallbackCardDataUrl } from "./lib/cardFallback";
import { applyAnswer, calculateResultCode, initialScores } from "./lib/scoring";
import type {
  AnswerRecord,
  AppStep,
  HotspotRect,
  OptionKey,
  QuestionOption,
  ResultCode,
  Scores,
} from "./types";

const PAGE_FADE_MS = 500;
const RESULT_LOADING_VIDEO_SRC = "/assets/climbing-cbti/videos/generating.mp4";
const DEBUG_FORCE_RESULT: ResultCode | false = false;
const SUPPORTED_ENV_PATTERN = /(aweme|douyin|iesdouyin|bytedancewebview|ttwebview)/i;
const DEBUG_HOTSPOT_COLORS: Record<OptionKey, string> = {
  A: "#ff5c68",
  B: "#ffcb24",
  C: "#2390ff",
};
const DIMENSION_DEBUG_CONFIG = [
  { dimension: "FE", leftKey: "F", rightKey: "E" },
  { dimension: "PM", leftKey: "P", rightKey: "M" },
  { dimension: "SL", leftKey: "S", rightKey: "L" },
] as const;

const UI_ASSETS_TO_PRELOAD = Array.from(
  new Set([
    coverBackgroundSrc,
    bgWallSrc,
    "/assets/climbing-cbti/douyin-logo.png",
    "/assets/climbing-cbti/loading.webp",
    ...questions.map(
      (question) =>
        questionScenes[question.id]?.imageSrc ??
        `/assets/climbing-cbti/questions/Q${question.id}.jpg`,
    ),
    ...Object.values(results).flatMap((result) => [result.previewSrc, result.downloadSrc]),
  ]),
);

type AppState = {
  step: AppStep;
  currentIndex: number;
  answers: AnswerRecord[];
  scores: Scores;
  resultCode?: ResultCode;
  quizStartedAt?: number;
  completedElapsedMs?: number;
};

type ScreenKind = AppStep | "preload";

type ScreenSnapshot = {
  key: string;
  kind: ScreenKind;
  appState: AppState;
};

type TransitionPhase = "idle" | "out" | "in";

function createInitialState(): AppState {
  return {
    step: "cover",
    currentIndex: 0,
    answers: [],
    scores: initialScores(),
  };
}

function createScreenSnapshot(appState: AppState, assetsReady: boolean): ScreenSnapshot {
  if (!assetsReady) {
    return { key: "preload", kind: "preload", appState };
  }

  if (appState.step === "quiz") {
    return { key: `quiz-${appState.currentIndex}`, kind: "quiz", appState };
  }

  if (appState.step === "loading") {
    return {
      key: `loading-${appState.resultCode ?? "pending"}`,
      kind: "loading",
      appState,
    };
  }

  if (appState.step === "result") {
    return {
      key: `result-${appState.resultCode ?? "pending"}`,
      kind: "result",
      appState,
    };
  }

  return { key: appState.step, kind: appState.step, appState };
}

function getRuntimeFlags() {
  const params = new URLSearchParams(window.location.search);
  const debugParam = params.get("debug");
  const debugHotspotsParam = params.get("debugHotspots");
  let storageFlag: string | null = null;

  try {
    storageFlag =
      window.localStorage.getItem("cbti:debugHotspots") ??
      window.localStorage.getItem("cbti.debug.hotspots");
  } catch {
    storageFlag = null;
  }

  const hasDebugHotspotsParam = debugHotspotsParam === "1" || debugHotspotsParam === "true";
  const hasDebugStorageFlag = storageFlag === "1" || storageFlag === "true";
  const debugMode =
    debugParam === "1" ||
    debugParam === "true" ||
    debugParam === "hotspots" ||
    debugParam === "report" ||
    hasDebugHotspotsParam ||
    hasDebugStorageFlag;

  return {
    forceEnvGate: params.get("forceEnvGate") === "1",
    bypassEnvGate: import.meta.env.DEV || params.get("bypassEnvGate") === "1",
    debugMode,
    debugHotspots:
      hasDebugHotspotsParam ||
      debugParam === "1" ||
      debugParam === "true" ||
      debugParam === "hotspots" ||
      hasDebugStorageFlag,
  };
}

function isDouyinEnvironment() {
  return SUPPORTED_ENV_PATTERN.test(window.navigator.userAgent);
}

function getHotspotStyle(rect: HotspotRect): CSSProperties {
  return {
    left: `${(rect.x / QUESTION_SCENE_WIDTH) * 100}%`,
    top: `${(rect.y / QUESTION_SCENE_HEIGHT) * 100}%`,
    width: `${(rect.width / QUESTION_SCENE_WIDTH) * 100}%`,
    height: `${(rect.height / QUESTION_SCENE_HEIGHT) * 100}%`,
  };
}

function triggerDownload(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
}

async function downloadImageSource(src: string, filename: string) {
  if (src.startsWith("data:")) {
    triggerDownload(src, filename);
    return true;
  }

  const response = await fetch(src);

  if (!response.ok) {
    return false;
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    triggerDownload(objectUrl, filename);
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  return true;
}

function logDebugQuestion(question: (typeof questions)[number]) {
  console.groupCollapsed(`[CBTI Debug] Q${question.id} ${question.prompt}`);
  console.table(
    question.options.map((option) => ({
      option: option.key,
      text: option.text,
      scores: option.scores.join(", "),
    })),
  );
  console.groupEnd();
}

function logDebugAnswer(
  question: (typeof questions)[number],
  option: QuestionOption,
  nextScores: Scores,
) {
  console.groupCollapsed(`[CBTI Debug] Q${question.id} 选择 ${option.key}`);
  console.info("question", question.prompt);
  console.info("selected", {
    key: option.key,
    text: option.text,
    scores: option.scores,
  });
  console.info("scoresAfterAnswer", nextScores);
  console.groupEnd();
}

function logDebugResult(resultCode: ResultCode, resultName: string, scores: Scores) {
  console.groupCollapsed(`[CBTI Debug] Final Result ${resultCode} ${resultName}`);
  console.table(
    DIMENSION_DEBUG_CONFIG.map(({ dimension, leftKey, rightKey }) => ({
      dimension,
      leftKey,
      leftScore: scores[leftKey],
      rightKey,
      rightScore: scores[rightKey],
      winner: scores[leftKey] >= scores[rightKey] ? leftKey : rightKey,
    })),
  );
  console.info("hiddenScores", {
    anxiety: scores.anxiety,
    doubao: scores.doubao,
  });
  console.info("rawScores", scores);
  console.groupEnd();
}

export interface ClimbingSeed {
  step?: AppStep | "gate" | "preload";
  question?: number;
  resultCode?: ResultCode;
}

function App({ embedded = false, state: seed }: { embedded?: boolean; state?: ClimbingSeed }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<AppState>(() => ({
    ...createInitialState(),
    step: seed?.step === "gate" || seed?.step === "preload" ? "cover" : seed?.step ?? "cover",
    currentIndex: Math.max(0, Math.min(questions.length - 1, (seed?.question ?? 1) - 1)),
    resultCode: seed?.resultCode,
  }));
  const [assetsReady, setAssetsReady] = useState(embedded);
  const [assetProgress, setAssetProgress] = useState(0);
  const [actionMessage, setActionMessage] = useState("");
  const [resultImageAvailable, setResultImageAvailable] = useState(true);
  const runtimeFlags = useMemo(() => getRuntimeFlags(), []);
  const isSupportedEnvironment = seed?.step === "gate" ? false : embedded ? true : runtimeFlags.forceEnvGate
    ? false
    : runtimeFlags.bypassEnvGate || isDouyinEnvironment();
  const totalQuestions = questions.length;
  const currentQuestion = questions[state.currentIndex];
  const resultCode: ResultCode | undefined = DEBUG_FORCE_RESULT || state.resultCode;
  const result = resultCode ? results[resultCode] : undefined;
  const fallbackCardSrc = useMemo(
    () => (result ? createFallbackCardDataUrl(result) : ""),
    [result],
  );
  const resultDisplaySrc = resultImageAvailable ? result?.previewSrc ?? "" : fallbackCardSrc;
  const lastDebugQuestionIdRef = useRef<number | null>(null);
  const lastDebugResultRef = useRef<string | null>(null);
  const targetScreen = useMemo(
    () => createScreenSnapshot(state, assetsReady && seed?.step !== "preload"),
    [assetsReady, seed?.step, state],
  );
  const [displayScreen, setDisplayScreen] = useState<ScreenSnapshot>(() => targetScreen);
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>("idle");
  const transitionTimeoutsRef = useRef<number[]>([]);
  const displayScreenKeyRef = useRef(displayScreen.key);
  const displayState = displayScreen.appState;
  const displayQuestion = questions[displayState.currentIndex];
  const displayScene = displayQuestion ? questionScenes[displayQuestion.id] : undefined;
  const displayResultCode: ResultCode | undefined = DEBUG_FORCE_RESULT || displayState.resultCode;
  const displayResult = displayResultCode ? results[displayResultCode] : undefined;
  const displayFallbackCardSrc = useMemo(
    () => (displayResult ? createFallbackCardDataUrl(displayResult) : ""),
    [displayResult],
  );
  const displayResultSrc = resultImageAvailable
    ? displayResult?.previewSrc ?? ""
    : displayFallbackCardSrc;

  useEffect(() => {
    displayScreenKeyRef.current = displayScreen.key;
  }, [displayScreen.key]);

  useEffect(() => {
    if (displayScreenKeyRef.current === targetScreen.key) {
      return;
    }

    transitionTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    transitionTimeoutsRef.current = [];
    setTransitionPhase("out");

    const fadeOutTimeoutId = window.setTimeout(() => {
      setDisplayScreen(targetScreen);
      displayScreenKeyRef.current = targetScreen.key;
      setTransitionPhase("in");

      const fadeInTimeoutId = window.setTimeout(() => {
        setTransitionPhase("idle");
        transitionTimeoutsRef.current = [];
      }, PAGE_FADE_MS);

      transitionTimeoutsRef.current = [fadeInTimeoutId];
    }, PAGE_FADE_MS);

    transitionTimeoutsRef.current = [fadeOutTimeoutId];

    return () => {
      transitionTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      transitionTimeoutsRef.current = [];
    };
  }, [targetScreen]);

  const transitionClassName = [
    "transition-frame",
    transitionPhase === "out" ? "is-fading-out" : "",
    transitionPhase === "in" ? "is-fading-in" : "",
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    if (!isSupportedEnvironment) {
      return;
    }

    let cancelled = false;
    let loadedCount = 0;

    UI_ASSETS_TO_PRELOAD.forEach((assetSrc) => {
      const image = new Image();

      const updateProgress = () => {
        loadedCount += 1;

        if (cancelled) {
          return;
        }

        const nextProgress = Math.round((loadedCount / UI_ASSETS_TO_PRELOAD.length) * 100);
        setAssetProgress(nextProgress);

        if (loadedCount >= UI_ASSETS_TO_PRELOAD.length) {
          setAssetsReady(true);
        }
      };

      image.onload = updateProgress;
      image.onerror = updateProgress;
      image.src = assetSrc;
    });

    return () => {
      cancelled = true;
    };
  }, [isSupportedEnvironment]);

  useEffect(() => {
    if (!runtimeFlags.debugMode || state.step !== "quiz" || !currentQuestion) {
      return;
    }

    if (lastDebugQuestionIdRef.current === currentQuestion.id) {
      return;
    }

    logDebugQuestion(currentQuestion);
    lastDebugQuestionIdRef.current = currentQuestion.id;
  }, [runtimeFlags.debugMode, state.step, currentQuestion]);

  useEffect(() => {
    if (!runtimeFlags.debugMode || state.step !== "result" || !result) {
      return;
    }

    const resultLogKey = `${result.code}:${state.answers.length}:${state.completedElapsedMs ?? "na"}`;

    if (lastDebugResultRef.current === resultLogKey) {
      return;
    }

    logDebugResult(result.code, result.name, state.scores);
    lastDebugResultRef.current = resultLogKey;
  }, [
    runtimeFlags.debugMode,
    state.step,
    state.answers.length,
    state.completedElapsedMs,
    state.scores,
    result,
  ]);

  useLayoutEffect(() => {
    if (!embedded) window.scrollTo(0, 0);
  }, [embedded, state.step, state.currentIndex]);

  function startQuiz() {
    lastDebugQuestionIdRef.current = null;
    lastDebugResultRef.current = null;

    if (runtimeFlags.debugMode) {
      console.info("[CBTI Debug] Quiz session started");
    }

    setState({
      step: "quiz",
      currentIndex: 0,
      answers: [],
      scores: initialScores(),
      resultCode: undefined,
      quizStartedAt: Date.now(),
      completedElapsedMs: undefined,
    });
    setActionMessage("");
    setResultImageAvailable(true);
    trackEvent("quiz_start");
  }

  function handleAnswer(option: QuestionOption, answeredAt: number) {
    if (!currentQuestion) {
      return;
    }

    const nextAnswers = [
      ...state.answers,
      {
        questionId: currentQuestion.id,
        optionKey: option.key,
        scores: option.scores,
      },
    ];
    const nextScores = applyAnswer(state.scores, option, currentQuestion.id);
    const nextIndex = state.currentIndex + 1;
    const elapsedMs = state.quizStartedAt ? answeredAt - state.quizStartedAt : undefined;

    if (runtimeFlags.debugMode) {
      logDebugAnswer(currentQuestion, option, nextScores);
    }

    trackEvent("quiz_answer", {
      questionId: currentQuestion.id,
      optionKey: option.key,
      scores: option.scores,
      currentIndex: state.currentIndex,
      elapsedMs,
    });

    if (nextIndex >= totalQuestions) {
      const nextResultCode =
        DEBUG_FORCE_RESULT ||
        calculateResultCode(nextScores, {
          completedElapsedMs: elapsedMs,
        });

      trackEvent("quiz_complete", {
        resultCode: nextResultCode,
        scores: nextScores,
        questionCount: totalQuestions,
        completedElapsedMs: elapsedMs,
      });

      setState({
        step: "loading",
        currentIndex: nextIndex,
        answers: nextAnswers,
        scores: nextScores,
        resultCode: nextResultCode,
        quizStartedAt: state.quizStartedAt,
        completedElapsedMs: elapsedMs,
      });
      return;
    }

    setState((current) => ({
      ...current,
      currentIndex: nextIndex,
      answers: nextAnswers,
      scores: nextScores,
    }));
  }

  async function handleSaveImage() {
    if (!result) {
      return;
    }

    const filename = `${result.code}.jpg`;
    const displayedSrc = rootRef.current?.querySelector<HTMLImageElement>(".scene-stage--result img")?.src;
    const sources = Array.from(
      new Set(
        [displayedSrc, resultDisplaySrc, result.downloadSrc, fallbackCardSrc].filter(
          (src): src is string => Boolean(src),
        ),
      ),
    );

    for (const src of sources) {
      try {
        const didDownload = await downloadImageSource(src, filename);

        if (didDownload) {
          setActionMessage("结果图已拉起保存。若未直接入相册，可长按图片补存。");
          trackEvent("result_save", { resultCode: result.code, source: src });
          return;
        }
      } catch {
        // Try the next candidate source.
      }
    }

    setActionMessage("当前结果图资源还没准备好，暂时无法保存。");
  }

  function handlePlaceholderAction(message: string) {
    setActionMessage(message);
  }

  function finishResultLoading() {
    if (seed?.step === "loading") {
      return;
    }

    setState((current) => {
      const resolvedResultCode = DEBUG_FORCE_RESULT || current.resultCode;

      if (current.step !== "loading" || !resolvedResultCode) {
        return current;
      }

      trackEvent("result_view", { resultCode: resolvedResultCode });
      return { ...current, resultCode: resolvedResultCode, step: "result" };
    });
  }

  function handleResultLoadingVideoReady(event: SyntheticEvent<HTMLVideoElement>) {
    event.currentTarget.play().catch(() => {
      // Muted inline autoplay should work in target WebViews; onError/onEnded guard the flow.
    });
  }

  if (!isSupportedEnvironment) {
    return (
      <div ref={rootRef} className={`cbti-root${embedded ? " cbti-embedded" : ""}`}>
      <main className="app-shell">
        <section className="phone-stage gate-stage">
          <section className="env-gate-panel">
            <img
              className="gate-douyin-logo"
              src="/assets/climbing-cbti/douyin-logo.png"
              alt="抖音"
              draggable="false"
            />
            <p className="gate-copy">
              <span>请使用抖音APP扫码</span>
              <span>打开这个页面哦</span>
            </p>
          </section>
        </section>
      </main>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`cbti-root${embedded ? " cbti-embedded" : ""}`}>
      <main className={`app-shell app-shell--${displayScreen.kind}`}>
        <section className={`phone-stage phone-stage--${displayScreen.kind}`}>
          <div className={transitionClassName}>
            {displayScreen.kind === "preload" && (
              <section className="utility-stage">
                <section className="preload-panel loading-panel--figma">
                  <img
                    className="loading-figure"
                    src="/assets/climbing-cbti/loading.webp"
                    alt=""
                    aria-hidden="true"
                    loading="eager"
                    draggable="false"
                  />
                  <div className="loading-progress-track" aria-hidden="true">
                    <div
                      className="loading-progress-fill"
                      style={
                        { "--loading-progress": `${Math.max(assetProgress, 6)}%` } as CSSProperties
                      }
                    />
                  </div>
                  <p className="loading-copy">
                    <span>放下包</span>
                    <span>放下完攀执念</span>
                    <span>遵从本心做出选择</span>
                  </p>
                </section>
              </section>
            )}

            {displayScreen.kind === "cover" && (
              <section className="cover-panel">
                <img
                  className="cover-background"
                  src={coverBackgroundSrc}
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                />
                <button type="button" className="cover-start-button" onClick={startQuiz}>
                  开始测试
                </button>
              </section>
            )}

            {displayScreen.kind === "quiz" && displayQuestion && displayScene && (
              <section className="scene-page">
                <div className={`question-${displayQuestion.id} scene-stage scene-stage--question`}>
                  <img
                    className="scene-image"
                    src={displayScene.imageSrc}
                    alt={displayQuestion.prompt}
                    loading="eager"
                    draggable="false"
                  />

                  {displayQuestion.options.map((option) => (
                    <button
                      key={`${displayQuestion.id}-${option.key}`}
                      type="button"
                      className={`hotspot-button${runtimeFlags.debugHotspots ? " is-debug" : ""}`}
                      style={
                        {
                          ...getHotspotStyle(displayScene.hotspots[option.key]),
                          "--hotspot-color": DEBUG_HOTSPOT_COLORS[option.key],
                        } as CSSProperties
                      }
                      aria-label={`${option.key}：${option.text}`}
                      onClick={() => handleAnswer(option, Date.now())}
                    >
                      {runtimeFlags.debugHotspots && (
                        <span className="hotspot-debug-label">{option.key}</span>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {displayScreen.kind === "loading" && (
              <section className="result-loading-page">
                <video
                  key={displayScreen.key}
                  className="result-loading-video"
                  src={RESULT_LOADING_VIDEO_SRC}
                  aria-label="物种识别视频"
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  onCanPlay={handleResultLoadingVideoReady}
                  onEnded={finishResultLoading}
                  onError={finishResultLoading}
                />
              </section>
            )}

            {displayScreen.kind === "result" && displayResult && (
              <section className="scene-page scene-page--result">
                <div
                  className={`result-${displayResult.code.replace("+", "-plus")} scene-stage scene-stage--result`}
                >
                  {displayResultSrc ? (
                    <img
                      className="scene-image"
                      src={displayResultSrc}
                      alt={`${displayResult.name} 结果图`}
                      loading="eager"
                      onError={() => setResultImageAvailable(false)}
                      draggable="false"
                    />
                  ) : (
                    <div className="result-fallback-card">
                      <span className="fallback-code">{displayResult.code}</span>
                      <strong>{displayResult.name}</strong>
                      <p>结果图占位图，请替换为成品 PNG / WEBP。</p>
                    </div>
                  )}
                </div>

                <div className="result-action-cluster">
                  <button
                    type="button"
                    className="result-action-button result-action-button--publish"
                    onClick={() => handlePlaceholderAction("抖音发布流程预留中。")}
                  >
                    一键发布
                  </button>
                  <button
                    type="button"
                    className="result-action-button result-action-button--save"
                    onClick={handleSaveImage}
                  >
                    保存结果
                  </button>
                  <button
                    type="button"
                    className="result-action-button result-action-button--share"
                    onClick={() => handlePlaceholderAction("抖音分享流程预留中。")}
                  >
                    分享岩友
                  </button>
                </div>

                {actionMessage && <p className="result-status-message">{actionMessage}</p>}
              </section>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
