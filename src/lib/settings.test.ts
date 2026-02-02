import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadSettings,
  saveSettings,
  hasLLMApiKey,
  hasTranscriptionApiKey,
  getTranscriptionApiKey,
  hasAnyApiKey,
  type AppSettings,
} from "./settings";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

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
};

describe("settings", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("loadSettings", () => {
    it("should return default settings when localStorage is empty", () => {
      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it("should load saved settings from localStorage", () => {
      const customSettings: AppSettings = {
        ...DEFAULT_SETTINGS,
        uiLanguage: "en",
        llmProvider: "anthropic",
        apiKeys: {
          openai: "sk-test",
          anthropic: "sk-ant-test",
          google: "",
          groq: "",
        },
      };
      localStorageMock.setItem(
        "voice-intelligence-settings",
        JSON.stringify(customSettings)
      );

      const settings = loadSettings();
      expect(settings.uiLanguage).toBe("en");
      expect(settings.llmProvider).toBe("anthropic");
      expect(settings.apiKeys.openai).toBe("sk-test");
      expect(settings.apiKeys.anthropic).toBe("sk-ant-test");
    });

    it("should migrate old openaiApiKey format to apiKeys", () => {
      const oldFormat = {
        openaiApiKey: "sk-old-key",
        uiLanguage: "de",
      };
      localStorageMock.setItem(
        "voice-intelligence-settings",
        JSON.stringify(oldFormat)
      );

      const settings = loadSettings();
      expect(settings.apiKeys.openai).toBe("sk-old-key");
      expect(settings.apiKeys.anthropic).toBe("");
    });

    it("should migrate old transcriptionMethod 'whisper' to 'openai-whisper'", () => {
      const oldFormat = {
        transcriptionMethod: "whisper",
        apiKeys: { openai: "", anthropic: "", google: "", groq: "" },
      };
      localStorageMock.setItem(
        "voice-intelligence-settings",
        JSON.stringify(oldFormat)
      );

      const settings = loadSettings();
      expect(settings.transcriptionProvider).toBe("openai-whisper");
    });

    it("should migrate old transcriptionMethod non-whisper to 'webspeech'", () => {
      const oldFormat = {
        transcriptionMethod: "browser",
        apiKeys: { openai: "", anthropic: "", google: "", groq: "" },
      };
      localStorageMock.setItem(
        "voice-intelligence-settings",
        JSON.stringify(oldFormat)
      );

      const settings = loadSettings();
      expect(settings.transcriptionProvider).toBe("webspeech");
    });

    it("should migrate old 'language' field to 'speechLanguage'", () => {
      const oldFormat = {
        language: "en-US",
        apiKeys: { openai: "", anthropic: "", google: "", groq: "" },
      };
      localStorageMock.setItem(
        "voice-intelligence-settings",
        JSON.stringify(oldFormat)
      );

      const settings = loadSettings();
      expect(settings.speechLanguage).toBe("en-US");
    });

    it("should merge with defaults for missing fields", () => {
      const partial = {
        uiLanguage: "en",
        apiKeys: { openai: "sk-123" },
      };
      localStorageMock.setItem(
        "voice-intelligence-settings",
        JSON.stringify(partial)
      );

      const settings = loadSettings();
      expect(settings.uiLanguage).toBe("en");
      expect(settings.transcriptionProvider).toBe("webspeech");
      expect(settings.llmProvider).toBe("openai");
      expect(settings.apiKeys.openai).toBe("sk-123");
      expect(settings.apiKeys.anthropic).toBe("");
    });

    it("should handle corrupted JSON gracefully", () => {
      localStorageMock.setItem(
        "voice-intelligence-settings",
        "invalid-json{{"
      );

      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe("saveSettings", () => {
    it("should save settings to localStorage", () => {
      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        uiLanguage: "en",
      };

      saveSettings(settings);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "voice-intelligence-settings",
        JSON.stringify(settings)
      );
    });
  });

  describe("hasLLMApiKey", () => {
    it("should return true when the selected LLM provider has an API key", () => {
      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        llmProvider: "openai",
        apiKeys: { ...DEFAULT_SETTINGS.apiKeys, openai: "sk-test" },
      };
      expect(hasLLMApiKey(settings)).toBe(true);
    });

    it("should return false when the selected LLM provider has no API key", () => {
      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        llmProvider: "openai",
        apiKeys: { ...DEFAULT_SETTINGS.apiKeys, openai: "" },
      };
      expect(hasLLMApiKey(settings)).toBe(false);
    });

    it("should return false when API key is only whitespace", () => {
      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        llmProvider: "anthropic",
        apiKeys: { ...DEFAULT_SETTINGS.apiKeys, anthropic: "   " },
      };
      expect(hasLLMApiKey(settings)).toBe(false);
    });

    it("should check the correct provider key", () => {
      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        llmProvider: "google",
        apiKeys: {
          openai: "sk-openai",
          anthropic: "sk-ant",
          google: "",
          groq: "gsk-groq",
        },
      };
      expect(hasLLMApiKey(settings)).toBe(false);
    });
  });

  describe("hasTranscriptionApiKey", () => {
    it("should return true for webspeech (no key needed)", () => {
      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        transcriptionProvider: "webspeech",
      };
      expect(hasTranscriptionApiKey(settings)).toBe(true);
    });

    it("should return true for openai-whisper with OpenAI key", () => {
      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        transcriptionProvider: "openai-whisper",
        apiKeys: { ...DEFAULT_SETTINGS.apiKeys, openai: "sk-test" },
      };
      expect(hasTranscriptionApiKey(settings)).toBe(true);
    });

    it("should return false for openai-whisper without OpenAI key", () => {
      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        transcriptionProvider: "openai-whisper",
        apiKeys: { ...DEFAULT_SETTINGS.apiKeys, openai: "" },
      };
      expect(hasTranscriptionApiKey(settings)).toBe(false);
    });

    it("should return true for groq-whisper with Groq key", () => {
      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        transcriptionProvider: "groq-whisper",
        apiKeys: { ...DEFAULT_SETTINGS.apiKeys, groq: "gsk-test" },
      };
      expect(hasTranscriptionApiKey(settings)).toBe(true);
    });

    it("should return false for groq-whisper without Groq key", () => {
      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        transcriptionProvider: "groq-whisper",
        apiKeys: { ...DEFAULT_SETTINGS.apiKeys, groq: "" },
      };
      expect(hasTranscriptionApiKey(settings)).toBe(false);
    });
  });

  describe("getTranscriptionApiKey", () => {
    it("should return OpenAI key for openai-whisper", () => {
      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        transcriptionProvider: "openai-whisper",
        apiKeys: { ...DEFAULT_SETTINGS.apiKeys, openai: "sk-my-key" },
      };
      expect(getTranscriptionApiKey(settings)).toBe("sk-my-key");
    });

    it("should return Groq key for groq-whisper", () => {
      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        transcriptionProvider: "groq-whisper",
        apiKeys: { ...DEFAULT_SETTINGS.apiKeys, groq: "gsk-my-key" },
      };
      expect(getTranscriptionApiKey(settings)).toBe("gsk-my-key");
    });

    it("should return empty string for webspeech", () => {
      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        transcriptionProvider: "webspeech",
      };
      expect(getTranscriptionApiKey(settings)).toBe("");
    });
  });

  describe("hasAnyApiKey", () => {
    it("should return false when no API keys are set", () => {
      expect(hasAnyApiKey(DEFAULT_SETTINGS)).toBe(false);
    });

    it("should return true when any API key is set", () => {
      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        apiKeys: { ...DEFAULT_SETTINGS.apiKeys, groq: "gsk-test" },
      };
      expect(hasAnyApiKey(settings)).toBe(true);
    });

    it("should return false when all keys are empty or whitespace", () => {
      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        apiKeys: {
          openai: "",
          anthropic: "  ",
          google: "",
          groq: "   ",
        },
      };
      expect(hasAnyApiKey(settings)).toBe(false);
    });
  });
});
