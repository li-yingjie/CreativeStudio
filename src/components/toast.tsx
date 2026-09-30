"use client";

import { useCallback, useEffect, useState } from "react";

import type { ToastItem } from "@/types/motion";

export { type ToastItem };

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col items-end gap-2">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 280);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    const ms = toast.type === "error" ? 5000 : 3200;
    const timer = setTimeout(dismiss, ms);
    return () => clearTimeout(timer);
  }, [dismiss, toast.type]);

  const colorMap: Record<ToastItem["type"], string> = {
    error:   "border-[rgba(224,85,85,0.35)]   bg-[rgba(20,6,6,0.93)]   text-[#ffd8d8]",
    success: "border-[rgba(45,184,119,0.35)]  bg-[rgba(4,18,11,0.93)]  text-[#cdfce8]",
    info:    "border-[rgba(255,255,255,0.12)]  bg-[rgba(14,14,15,0.93)] text-[var(--ink)]",
  };

  const iconMap: Record<ToastItem["type"], string> = {
    error:   "var(--error)",
    success: "var(--ok)",
    info:    "var(--muted)",
  };

  const labelMap: Record<ToastItem["type"], string> = {
    error: "!",
    success: "OK",
    info: "i",
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-[18px] border px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-[280ms] ${colorMap[toast.type]} ${exiting ? "translate-x-3 opacity-0" : "animate-slide-in-right"}`}
      style={{ maxWidth: 360, minWidth: 260 }}
    >
      <span
        className="mt-px shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
        style={{ color: iconMap[toast.type], border: `1px solid ${iconMap[toast.type]}40` }}
      >
        {labelMap[toast.type]}
      </span>
      <p className="flex-1 text-sm leading-5">{toast.message}</p>
      <button
        type="button"
        onClick={dismiss}
        className="ml-1 mt-px shrink-0 text-xs opacity-30 transition-opacity hover:opacity-70"
      >
        x
      </button>
    </div>
  );
}
