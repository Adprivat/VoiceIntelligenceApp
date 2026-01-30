"use client";

import { useEffect, useState } from "react";

export default function Titlebar() {
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    setIsTauri("__TAURI__" in window);
  }, []);

  const handleMinimize = async () => {
    if (!isTauri) return;
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    getCurrentWindow().minimize();
  };

  const handleMaximize = async () => {
    if (!isTauri) return;
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    getCurrentWindow().toggleMaximize();
  };

  const handleClose = async () => {
    if (!isTauri) return;
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    getCurrentWindow().close();
  };

  return (
    <div className="titlebar h-9 flex items-center justify-between px-4 bg-[var(--card)] border-b border-[var(--border)] select-none">
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-[var(--primary)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        <span className="text-xs font-medium text-[var(--muted)]">
          Voice Intelligence
        </span>
      </div>

      {isTauri && (
        <div className="flex items-center gap-1">
          <button
            onClick={handleMinimize}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--border)] transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
              <rect x="2" y="5.5" width="8" height="1" />
            </svg>
          </button>
          <button
            onClick={handleMaximize}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--border)] transition-colors"
          >
            <svg
              className="w-3 h-3"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <rect x="2" y="2" width="8" height="8" />
            </svg>
          </button>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <svg
              className="w-3 h-3"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="2" y1="2" x2="10" y2="10" />
              <line x1="10" y1="2" x2="2" y2="10" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
