import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ENRICHMENT_MODES,
  getModeLabel,
  getModeDescription,
  enrichText,
  type EnrichmentMode,
  type EnrichmentModeConfig,
} from "./enrichment";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("enrichment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ENRICHMENT_MODES", () => {
    it("should have exactly 6 modes", () => {
      expect(ENRICHMENT_MODES).toHaveLength(6);
    });

    it("should have correct mode IDs", () => {
      const ids = ENRICHMENT_MODES.map((m) => m.id);
      expect(ids).toEqual([
        "smart-notes",
        "meeting-summary",
        "email-draft",
        "todo-extract",
        "translate-en",
        "freeform",
      ]);
    });

    it("should have non-empty system prompts for all modes except freeform", () => {
      ENRICHMENT_MODES.forEach((mode) => {
        if (mode.id === "freeform") {
          expect(mode.systemPrompt).toBe("");
        } else {
          expect(mode.systemPrompt.length).toBeGreaterThan(0);
        }
      });
    });

    it("should have icon paths for all modes", () => {
      ENRICHMENT_MODES.forEach((mode) => {
        expect(mode.icon).toBeTruthy();
        expect(typeof mode.icon).toBe("string");
      });
    });

    it("should have label and description keys for all modes", () => {
      ENRICHMENT_MODES.forEach((mode) => {
        expect(mode.labelKey).toBeTruthy();
        expect(mode.descriptionKey).toBeTruthy();
      });
    });
  });

  describe("getModeLabel", () => {
    it("should return German label", () => {
      const smartNotes = ENRICHMENT_MODES.find((m) => m.id === "smart-notes")!;
      expect(getModeLabel(smartNotes, "de")).toBe("Intelligente Notizen");
    });

    it("should return English label", () => {
      const smartNotes = ENRICHMENT_MODES.find((m) => m.id === "smart-notes")!;
      expect(getModeLabel(smartNotes, "en")).toBe("Smart Notes");
    });
  });

  describe("getModeDescription", () => {
    it("should return German description", () => {
      const meetingSummary = ENRICHMENT_MODES.find(
        (m) => m.id === "meeting-summary"
      )!;
      expect(getModeDescription(meetingSummary, "de")).toBe(
        "Zusammenfassung mit Entscheidungen und Aufgaben"
      );
    });

    it("should return English description", () => {
      const meetingSummary = ENRICHMENT_MODES.find(
        (m) => m.id === "meeting-summary"
      )!;
      expect(getModeDescription(meetingSummary, "en")).toBe(
        "Summarize with key decisions and action items"
      );
    });
  });

  describe("enrichText", () => {
    it("should call OpenAI API with correct parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "Enriched text" } }],
          }),
      });

      const result = await enrichText(
        "test transcript",
        "smart-notes",
        "openai",
        "sk-test-key"
      );

      expect(result).toBe("Enriched text");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.openai.com/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer sk-test-key",
            "Content-Type": "application/json",
          }),
        })
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.model).toBe("gpt-4o-mini");
      expect(body.messages[0].role).toBe("system");
      expect(body.messages[1].role).toBe("user");
      expect(body.messages[1].content).toBe("test transcript");
      expect(body.temperature).toBe(0.3);
      expect(body.max_tokens).toBe(2000);
    });

    it("should call Anthropic API with correct parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ text: "Anthropic enriched text" }],
          }),
      });

      const result = await enrichText(
        "test transcript",
        "smart-notes",
        "anthropic",
        "sk-ant-test"
      );

      expect(result).toBe("Anthropic enriched text");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.anthropic.com/v1/messages",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "x-api-key": "sk-ant-test",
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
            "anthropic-dangerous-direct-browser-access": "true",
          }),
        })
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.model).toBe("claude-3-5-sonnet-20241022");
      expect(body.max_tokens).toBe(2000);
    });

    it("should call Google API with correct parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [
              { content: { parts: [{ text: "Google enriched text" }] } },
            ],
          }),
      });

      const result = await enrichText(
        "test transcript",
        "smart-notes",
        "google",
        "ai-test-key"
      );

      expect(result).toBe("Google enriched text");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        ),
        expect.anything()
      );
      expect(mockFetch.mock.calls[0][0]).toContain("key=ai-test-key");
    });

    it("should call Groq API with correct parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "Groq enriched text" } }],
          }),
      });

      const result = await enrichText(
        "test transcript",
        "smart-notes",
        "groq",
        "gsk-test-key"
      );

      expect(result).toBe("Groq enriched text");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.groq.com/openai/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer gsk-test-key",
          }),
        })
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.model).toBe("llama-3.3-70b-versatile");
    });

    it("should use custom prompt for freeform mode", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "Custom result" } }],
          }),
      });

      await enrichText(
        "test transcript",
        "freeform",
        "openai",
        "sk-test",
        "My custom instructions"
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.messages[0].content).toBe("My custom instructions");
    });

    it("should use default prompt for freeform mode when no custom prompt provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "Default result" } }],
          }),
      });

      await enrichText("test transcript", "freeform", "openai", "sk-test");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.messages[0].content).toBe(
        "Improve and structure the following text."
      );
    });

    it("should throw error for unknown mode", async () => {
      await expect(
        enrichText(
          "test",
          "unknown-mode" as EnrichmentMode,
          "openai",
          "sk-test"
        )
      ).rejects.toThrow("Unbekannter Verarbeitungsmodus: unknown-mode");
    });

    it("should throw error for unknown provider", async () => {
      await expect(
        enrichText(
          "test",
          "smart-notes",
          "unknown-provider" as any,
          "sk-test"
        )
      ).rejects.toThrow("Unbekannter LLM-Anbieter: unknown-provider");
    });

    it("should throw error when OpenAI API returns non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve("Unauthorized"),
      });

      await expect(
        enrichText("test", "smart-notes", "openai", "invalid-key")
      ).rejects.toThrow("OpenAI API-Fehler (401): Unauthorized");
    });

    it("should throw error when Anthropic API returns non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: () => Promise.resolve("Forbidden"),
      });

      await expect(
        enrichText("test", "smart-notes", "anthropic", "invalid-key")
      ).rejects.toThrow("Anthropic API-Fehler (403): Forbidden");
    });

    it("should throw error when Google API returns non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Bad Request"),
      });

      await expect(
        enrichText("test", "smart-notes", "google", "invalid-key")
      ).rejects.toThrow("Google AI API-Fehler (400): Bad Request");
    });

    it("should throw error when Groq API returns non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve("Rate limited"),
      });

      await expect(
        enrichText("test", "smart-notes", "groq", "invalid-key")
      ).rejects.toThrow("Groq API-Fehler (429): Rate limited");
    });

    it("should return empty string when OpenAI response has no content", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: {} }] }),
      });

      const result = await enrichText(
        "test",
        "smart-notes",
        "openai",
        "sk-test"
      );
      expect(result).toBe("");
    });

    it("should return empty string when Anthropic response has no content", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: [] }),
      });

      const result = await enrichText(
        "test",
        "smart-notes",
        "anthropic",
        "sk-ant-test"
      );
      expect(result).toBe("");
    });

    it("should return empty string when Google response has no content", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [] }),
      });

      const result = await enrichText(
        "test",
        "smart-notes",
        "google",
        "ai-test"
      );
      expect(result).toBe("");
    });
  });
});
