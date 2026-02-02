import type { TranscriptionProvider } from "./settings";

export interface TranscriptionResult {
  text: string;
  language?: string;
  confidence?: number;
}

/**
 * Transcribe audio using OpenAI Whisper API.
 */
export async function transcribeWithWhisper(
  audioBlob: Blob,
  apiKey: string
): Promise<TranscriptionResult> {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  formData.append("model", "whisper-1");
  formData.append("response_format", "verbose_json");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Whisper API-Fehler (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  return {
    text: data.text,
    language: data.language,
  };
}

/**
 * Transcribe audio using Groq's Whisper API (faster, OpenAI-compatible endpoint).
 */
export async function transcribeWithGroqWhisper(
  audioBlob: Blob,
  apiKey: string
): Promise<TranscriptionResult> {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  formData.append("model", "whisper-large-v3-turbo");
  formData.append("response_format", "verbose_json");

  const response = await fetch(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Groq Whisper API-Fehler (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  return {
    text: data.text,
    language: data.language,
  };
}

/**
 * Dispatch to the correct API-based transcription provider.
 */
export async function transcribeAudio(
  audioBlob: Blob,
  provider: TranscriptionProvider,
  apiKey: string
): Promise<TranscriptionResult> {
  switch (provider) {
    case "openai-whisper":
      return transcribeWithWhisper(audioBlob, apiKey);
    case "groq-whisper":
      return transcribeWithGroqWhisper(audioBlob, apiKey);
    default:
      throw new Error(`Unbekannter Transkriptions-Anbieter: ${provider}`);
  }
}

/**
 * Transcribe audio using the browser's Web Speech API (free, no API key needed).
 * Falls back to this when no API key is configured.
 */
export function transcribeWithWebSpeech(
  onResult: (result: TranscriptionResult) => void,
  onError: (error: string) => void,
  speechLanguage: string = "de-DE"
): { start: () => void; stop: () => void } {
  const SpeechRecognition =
    (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError("Web Speech API wird von diesem Browser nicht unterstützt.");
    return { start: () => {}, stop: () => {} };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognition = new (SpeechRecognition as any)();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = speechLanguage;

  let fullTranscript = "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        fullTranscript += event.results[i][0].transcript + " ";
        onResult({
          text: fullTranscript.trim(),
          confidence: event.results[i][0].confidence,
        });
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (event: any) => {
    onError(`Spracherkennungsfehler: ${event.error}`);
  };

  return {
    start: () => {
      fullTranscript = "";
      recognition.start();
    },
    stop: () => {
      recognition.stop();
    },
  };
}
