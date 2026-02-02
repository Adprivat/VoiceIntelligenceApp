import type { UILanguage } from "./i18n";

export type TranscriptionProvider = "webspeech" | "openai-whisper" | "groq-whisper";
export type LLMProvider = "openai" | "anthropic" | "google" | "groq";

export interface AppSettings {
  uiLanguage: UILanguage;
  transcriptionProvider: TranscriptionProvider;
  llmProvider: LLMProvider;
  apiKeys: {
    openai: string;
    anthropic: string;
    google: string;
    groq: string;
  };
  defaultMode: string;
  hotkey: string;
  speechLanguage: string;
  selectedMicrophone: string;
}

const STORAGE_KEY = "voice-intelligence-settings";

const DEFAULT_SETTINGS: AppSettings = {
  uiLanguage: "de",
  transcriptionProvider: "webspeech",
  llmProvider: "openai",
  apiKeys: {
    openai: "",
    anthropic: "",
    google: "",
    groq: "",
  },
  defaultMode: "smart-notes",
  hotkey: "CmdOrCtrl+Shift+V",
  speechLanguage: "de-DE",
  selectedMicrophone: "",
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old settings format
      if (parsed.openaiApiKey && !parsed.apiKeys) {
        parsed.apiKeys = {
          openai: parsed.openaiApiKey || "",
          anthropic: "",
          google: "",
          groq: "",
        };
        delete parsed.openaiApiKey;
      }
      if (parsed.transcriptionMethod && !parsed.transcriptionProvider) {
        parsed.transcriptionProvider =
          parsed.transcriptionMethod === "whisper"
            ? "openai-whisper"
            : "webspeech";
        delete parsed.transcriptionMethod;
      }
      if (parsed.language && !parsed.speechLanguage) {
        parsed.speechLanguage = parsed.language;
        delete parsed.language;
      }
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        apiKeys: { ...DEFAULT_SETTINGS.apiKeys, ...(parsed.apiKeys || {}) },
      };
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

/** Check if the currently selected LLM provider has an API key configured. */
export function hasLLMApiKey(settings: AppSettings): boolean {
  return settings.apiKeys[settings.llmProvider].trim().length > 0;
}

/** Check if the currently selected transcription provider has the required API key. */
export function hasTranscriptionApiKey(settings: AppSettings): boolean {
  if (settings.transcriptionProvider === "webspeech") return true;
  if (settings.transcriptionProvider === "openai-whisper") {
    return settings.apiKeys.openai.trim().length > 0;
  }
  if (settings.transcriptionProvider === "groq-whisper") {
    return settings.apiKeys.groq.trim().length > 0;
  }
  return false;
}

/** Get the API key required for the selected transcription provider. */
export function getTranscriptionApiKey(settings: AppSettings): string {
  if (settings.transcriptionProvider === "openai-whisper") {
    return settings.apiKeys.openai;
  }
  if (settings.transcriptionProvider === "groq-whisper") {
    return settings.apiKeys.groq;
  }
  return "";
}

/** Returns true if any API key is configured at all. */
export function hasAnyApiKey(settings: AppSettings): boolean {
  return Object.values(settings.apiKeys).some((k) => k.trim().length > 0);
}
