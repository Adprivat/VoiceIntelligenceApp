import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  transcribeWithWhisper,
  transcribeWithGroqWhisper,
  transcribeAudio,
  transcribeWithWebSpeech,
} from "./transcription";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("transcription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("transcribeWithWhisper", () => {
    it("should call OpenAI Whisper API with correct parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            text: "Hello world",
            language: "en",
          }),
      });

      const audioBlob = new Blob(["audio data"], { type: "audio/webm" });
      const result = await transcribeWithWhisper(audioBlob, "sk-test-key");

      expect(result).toEqual({
        text: "Hello world",
        language: "en",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.openai.com/v1/audio/transcriptions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer sk-test-key",
          }),
        })
      );

      // Check FormData contents
      const body = mockFetch.mock.calls[0][1].body;
      expect(body).toBeInstanceOf(FormData);
      expect(body.get("model")).toBe("whisper-1");
      expect(body.get("response_format")).toBe("verbose_json");
    });

    it("should throw error when Whisper API returns non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve("Unauthorized"),
      });

      const audioBlob = new Blob(["audio data"], { type: "audio/webm" });

      await expect(
        transcribeWithWhisper(audioBlob, "invalid-key")
      ).rejects.toThrow("Whisper API-Fehler (401): Unauthorized");
    });
  });

  describe("transcribeWithGroqWhisper", () => {
    it("should call Groq Whisper API with correct parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            text: "Hallo Welt",
            language: "de",
          }),
      });

      const audioBlob = new Blob(["audio data"], { type: "audio/webm" });
      const result = await transcribeWithGroqWhisper(audioBlob, "gsk-test-key");

      expect(result).toEqual({
        text: "Hallo Welt",
        language: "de",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer gsk-test-key",
          }),
        })
      );

      const body = mockFetch.mock.calls[0][1].body;
      expect(body).toBeInstanceOf(FormData);
      expect(body.get("model")).toBe("whisper-large-v3-turbo");
      expect(body.get("response_format")).toBe("verbose_json");
    });

    it("should throw error when Groq Whisper API returns non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve("Rate limited"),
      });

      const audioBlob = new Blob(["audio data"], { type: "audio/webm" });

      await expect(
        transcribeWithGroqWhisper(audioBlob, "gsk-key")
      ).rejects.toThrow("Groq Whisper API-Fehler (429): Rate limited");
    });
  });

  describe("transcribeAudio", () => {
    it("should dispatch to Whisper for openai-whisper provider", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ text: "Whisper result", language: "en" }),
      });

      const audioBlob = new Blob(["audio"], { type: "audio/webm" });
      const result = await transcribeAudio(
        audioBlob,
        "openai-whisper",
        "sk-key"
      );

      expect(result.text).toBe("Whisper result");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.openai.com/v1/audio/transcriptions",
        expect.anything()
      );
    });

    it("should dispatch to Groq Whisper for groq-whisper provider", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ text: "Groq result", language: "de" }),
      });

      const audioBlob = new Blob(["audio"], { type: "audio/webm" });
      const result = await transcribeAudio(
        audioBlob,
        "groq-whisper",
        "gsk-key"
      );

      expect(result.text).toBe("Groq result");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        expect.anything()
      );
    });

    it("should throw error for unknown provider", async () => {
      const audioBlob = new Blob(["audio"], { type: "audio/webm" });

      await expect(
        transcribeAudio(audioBlob, "webspeech", "")
      ).rejects.toThrow("Unbekannter Transkriptions-Anbieter: webspeech");
    });
  });

  describe("transcribeWithWebSpeech", () => {
    it("should return start and stop functions when SpeechRecognition is not available", () => {
      const onResult = vi.fn();
      const onError = vi.fn();

      const controls = transcribeWithWebSpeech(onResult, onError, "de-DE");

      expect(controls).toHaveProperty("start");
      expect(controls).toHaveProperty("stop");
      expect(typeof controls.start).toBe("function");
      expect(typeof controls.stop).toBe("function");
    });

    it("should call onError when SpeechRecognition is not available", () => {
      const onResult = vi.fn();
      const onError = vi.fn();

      transcribeWithWebSpeech(onResult, onError, "de-DE");

      expect(onError).toHaveBeenCalledWith(
        "Web Speech API wird von diesem Browser nicht unterstützt."
      );
    });

    it("should set up SpeechRecognition when available", () => {
      const mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: "",
        onresult: null,
        onerror: null,
        start: vi.fn(),
        stop: vi.fn(),
      };

      // Regular function returning an object makes `new` return that object
      (window as any).SpeechRecognition = function () {
        return mockRecognition;
      };

      const onResult = vi.fn();
      const onError = vi.fn();

      const controls = transcribeWithWebSpeech(onResult, onError, "en-US");

      expect(mockRecognition.continuous).toBe(true);
      expect(mockRecognition.interimResults).toBe(false);
      expect(mockRecognition.lang).toBe("en-US");
      expect(onError).not.toHaveBeenCalled();

      // Clean up
      delete (window as any).SpeechRecognition;
    });

    it("should accumulate transcript on results", () => {
      const mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: "",
        onresult: null as any,
        onerror: null as any,
        start: vi.fn(),
        stop: vi.fn(),
      };

      // Regular function returning an object makes `new` return that object
      (window as any).SpeechRecognition = function () {
        return mockRecognition;
      };

      const onResult = vi.fn();
      const onError = vi.fn();

      const controls = transcribeWithWebSpeech(onResult, onError);

      // Simulate starting
      controls.start();
      expect(mockRecognition.start).toHaveBeenCalled();

      // Simulate a result event
      const mockEvent = {
        resultIndex: 0,
        results: [
          {
            isFinal: true,
            0: { transcript: "Hello world", confidence: 0.95 },
            length: 1,
          },
        ],
      };

      mockRecognition.onresult(mockEvent);

      expect(onResult).toHaveBeenCalledWith({
        text: "Hello world",
        confidence: 0.95,
      });

      // Simulate another result
      const mockEvent2 = {
        resultIndex: 1,
        results: [
          {
            isFinal: true,
            0: { transcript: "Hello world", confidence: 0.95 },
            length: 1,
          },
          {
            isFinal: true,
            0: { transcript: " how are you", confidence: 0.9 },
            length: 1,
          },
        ],
      };

      mockRecognition.onresult(mockEvent2);

      expect(onResult).toHaveBeenCalledTimes(2);

      // Clean up
      delete (window as any).SpeechRecognition;
    });

    it("should call onError on recognition error", () => {
      const mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: "",
        onresult: null as any,
        onerror: null as any,
        start: vi.fn(),
        stop: vi.fn(),
      };

      // Regular function returning an object makes `new` return that object
      (window as any).SpeechRecognition = function () {
        return mockRecognition;
      };

      const onResult = vi.fn();
      const onError = vi.fn();

      transcribeWithWebSpeech(onResult, onError);

      // Simulate error event
      mockRecognition.onerror({ error: "not-allowed" });

      expect(onError).toHaveBeenCalledWith(
        "Spracherkennungsfehler: not-allowed"
      );

      // Clean up
      delete (window as any).SpeechRecognition;
    });

    it("should stop recognition when stop is called", () => {
      const mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: "",
        onresult: null as any,
        onerror: null as any,
        start: vi.fn(),
        stop: vi.fn(),
      };

      // Regular function returning an object makes `new` return that object
      (window as any).SpeechRecognition = function () {
        return mockRecognition;
      };

      const controls = transcribeWithWebSpeech(vi.fn(), vi.fn());
      controls.stop();

      expect(mockRecognition.stop).toHaveBeenCalled();

      // Clean up
      delete (window as any).SpeechRecognition;
    });
  });
});
