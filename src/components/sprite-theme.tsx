/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */

import { useCallback, useEffect, useState } from "react";

export type SpriteTheme = "dark" | "light";

const THEME_STORAGE_KEY = "sprite-maker-theme";
let sessionTheme: SpriteTheme | null = null;

export function useSpriteTheme(defaultTheme: SpriteTheme = "dark") {
  const [theme, setTheme] = useState<SpriteTheme>(() => sessionTheme ?? defaultTheme);

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "dark" || savedTheme === "light") {
        sessionTheme = savedTheme;
        setTheme(savedTheme);
      }
    } catch {
      // Storage can be unavailable in restricted embeds; session state still works.
    }
  }, []);

  useEffect(() => {
    sessionTheme = theme;
    document.documentElement.dataset.spriteTheme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const selectTheme = useCallback((nextTheme: SpriteTheme) => {
    sessionTheme = nextTheme;
    setTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Keep the in-memory selection when storage is unavailable.
    }
  }, []);

  return [theme, selectTheme] as const;
}

export function SpriteThemeSwitcher({
  theme,
  onChange,
  compact = false,
}: {
  theme: SpriteTheme;
  onChange: (theme: SpriteTheme) => void;
  compact?: boolean;
}) {
  return (
    <section
      className={compact
        ? "flex h-9 shrink-0 items-center rounded-[12px] border border-[var(--line)] bg-[var(--panel)] px-1.5"
        : "generator-theme-switcher flex items-center justify-between rounded-[12px] border border-[var(--line)] bg-[var(--panel)] px-2.5"}
    >
      {!compact && <span className="text-[10px] font-medium text-[var(--muted)]">界面主题</span>}
      <div role="group" aria-label="界面主题" className="flex rounded-[9px] bg-[var(--control-bg)] p-0.5">
        {(["light", "dark"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={theme === item}
            aria-label={item === "light" ? "切换为浅色模式" : "切换为深色模式"}
            onClick={() => onChange(item)}
            className={`flex h-6 items-center gap-1 rounded-[7px] px-2 text-[10px] outline-none transition focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${theme === item ? "bg-[var(--theme-active)] text-[var(--ink)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--hover-ink)]"}`}
          >
            {item === "light" ? (
              <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3 fill-none stroke-current" strokeWidth="1.4" strokeLinecap="round">
                <circle cx="8" cy="8" r="2.6" /><path d="M8 1.5v1.4M8 13.1v1.4M1.5 8h1.4M13.1 8h1.4M3.4 3.4l1 1M11.6 11.6l1 1M12.6 3.4l-1 1M4.4 11.6l-1 1" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3 fill-none stroke-current" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13.5 10.2A5.6 5.6 0 0 1 5.8 2.5 5.7 5.7 0 1 0 13.5 10.2Z" />
              </svg>
            )}
            {item === "light" ? "浅色" : "深色"}
          </button>
        ))}
      </div>
    </section>
  );
}
