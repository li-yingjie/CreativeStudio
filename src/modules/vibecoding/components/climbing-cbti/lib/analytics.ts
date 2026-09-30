type EventName =
  | "quiz_start"
  | "quiz_answer"
  | "quiz_complete"
  | "result_view"
  | "result_save"
  | "result_share"
  | "quiz_restart";

type Payload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent(event: EventName, payload: Payload = {}) {
  const entry = {
    event,
    ...payload,
    timestamp: Date.now(),
  };

  window.dataLayer?.push(entry);

  if (import.meta.env.DEV) {
    console.info("[analytics]", entry);
  }
}
