export interface AppSettings {
  openaiApiKey: string;
  transcriptionMethod: "whisper" | "webspeech";
  defaultMode: string;
  hotkey: string;
  language: string;
}

const STORAGE_KEY = "voice-intelligence-settings";

const DEFAULT_SETTINGS: AppSettings = {
  openaiApiKey: "",
  transcriptionMethod: "webspeech",
  defaultMode: "smart-notes",
  hotkey: "CmdOrCtrl+Shift+V",
  language: "de-DE",
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function hasApiKey(settings: AppSettings): boolean {
  return settings.openaiApiKey.trim().length > 0;
}
