"use client";

import { useEffect, useRef } from "react";

/**
 * Register a global hotkey via Tauri's global-shortcut plugin.
 * Falls back to a keyboard event listener in browsers.
 */
export function useGlobalHotkey(
  shortcut: string,
  callback: () => void,
  enabled: boolean = true
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    let cleanup: (() => void) | undefined;

    const setupTauriShortcut = async () => {
      try {
        if (!("__TAURI__" in window)) {
          throw new Error("Not in Tauri");
        }
        const { register, unregister } = await import(
          "@tauri-apps/plugin-global-shortcut"
        );

        await register(shortcut, (event) => {
          if (event.state === "Pressed") {
            callbackRef.current();
          }
        });

        cleanup = () => {
          unregister(shortcut).catch(() => {});
        };
      } catch {
        // Fallback: keyboard shortcut listener for browser dev
        const handleKeydown = (e: KeyboardEvent) => {
          // Parse shortcut like "CmdOrCtrl+Shift+V"
          const parts = shortcut.toLowerCase().split("+");
          const key = parts[parts.length - 1];
          const needsCtrl =
            parts.includes("cmdorctrl") ||
            parts.includes("ctrl") ||
            parts.includes("control");
          const needsShift = parts.includes("shift");
          const needsAlt = parts.includes("alt");

          if (
            e.key.toLowerCase() === key &&
            (needsCtrl ? e.ctrlKey || e.metaKey : true) &&
            (needsShift ? e.shiftKey : true) &&
            (needsAlt ? e.altKey : true)
          ) {
            e.preventDefault();
            callbackRef.current();
          }
        };

        window.addEventListener("keydown", handleKeydown);
        cleanup = () => window.removeEventListener("keydown", handleKeydown);
      }
    };

    setupTauriShortcut();

    return () => {
      cleanup?.();
    };
  }, [shortcut, enabled]);
}
