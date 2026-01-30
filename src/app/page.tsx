"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Titlebar from "@/components/Titlebar";
import RecordButton from "@/components/RecordButton";
import ModeSelector from "@/components/ModeSelector";
import TranscriptPanel from "@/components/TranscriptPanel";
import EnrichedOutput from "@/components/EnrichedOutput";
import SettingsPanel from "@/components/SettingsPanel";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useGlobalHotkey } from "@/hooks/useGlobalHotkey";
import {
  type EnrichmentMode,
  enrichText,
} from "@/lib/enrichment";
import {
  transcribeWithWhisper,
  transcribeWithWebSpeech,
} from "@/lib/transcription";
import {
  type AppSettings,
  loadSettings,
  saveSettings,
  hasApiKey,
} from "@/lib/settings";

type AppState = "idle" | "recording" | "transcribing" | "enriching" | "done";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<EnrichmentMode>(
    settings.defaultMode as EnrichmentMode
  );
  const [customPrompt, setCustomPrompt] = useState("");
  const [transcript, setTranscript] = useState("");
  const [enrichedOutput, setEnrichedOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);

  const webSpeechRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  const recorder = useAudioRecorder();

  // Persist settings
  const handleSaveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  // Transcription after recording stops
  const handleTranscribe = useCallback(
    async (audioBlob: Blob) => {
      setIsTranscribing(true);
      setAppState("transcribing");
      setError(null);

      try {
        if (
          settings.transcriptionMethod === "whisper" &&
          hasApiKey(settings)
        ) {
          const result = await transcribeWithWhisper(
            audioBlob,
            settings.openaiApiKey
          );
          setTranscript(result.text);
        } else {
          // For non-Whisper, transcript was already captured via Web Speech API
          // Just mark transcription as done
          setIsTranscribing(false);
          setAppState(transcript ? "done" : "idle");
          return;
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Transcription failed."
        );
      } finally {
        setIsTranscribing(false);
      }
    },
    [settings, transcript]
  );

  // Auto-transcribe when audio blob is ready (for Whisper mode)
  useEffect(() => {
    if (recorder.audioBlob && settings.transcriptionMethod === "whisper") {
      handleTranscribe(recorder.audioBlob);
    }
  }, [recorder.audioBlob, settings.transcriptionMethod, handleTranscribe]);

  // Start recording
  const handleStartRecording = useCallback(async () => {
    setError(null);
    setTranscript("");
    setEnrichedOutput("");
    recorder.reset();

    // If using Web Speech API, start it alongside audio recording
    if (settings.transcriptionMethod === "webspeech") {
      webSpeechRef.current = transcribeWithWebSpeech(
        (result) => {
          setTranscript(result.text);
        },
        (errMsg) => {
          setError(errMsg);
        }
      );
      webSpeechRef.current.start();
    }

    await recorder.startRecording();
    setAppState("recording");
  }, [recorder, settings.transcriptionMethod]);

  // Stop recording
  const handleStopRecording = useCallback(() => {
    recorder.stopRecording();

    // Stop Web Speech if active
    if (webSpeechRef.current) {
      webSpeechRef.current.stop();
      webSpeechRef.current = null;
    }

    if (settings.transcriptionMethod === "webspeech") {
      // Transcript was already being captured in real-time
      setAppState(transcript ? "done" : "idle");
    }
    // For Whisper, the useEffect above handles transcription
  }, [recorder, settings.transcriptionMethod, transcript]);

  // Toggle recording via hotkey
  const toggleRecording = useCallback(() => {
    if (recorder.isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  }, [recorder.isRecording, handleStartRecording, handleStopRecording]);

  // Register global hotkey
  useGlobalHotkey(settings.hotkey, toggleRecording);

  // Enrich transcript
  const handleEnrich = useCallback(async () => {
    if (!transcript.trim()) {
      setError("No transcript to process. Please record something first.");
      return;
    }

    if (!hasApiKey(settings)) {
      setError(
        "OpenAI API key is required for enrichment. Please add it in Settings."
      );
      return;
    }

    setIsEnriching(true);
    setAppState("enriching");
    setError(null);
    setEnrichedOutput("");

    try {
      const result = await enrichText(
        transcript,
        selectedMode,
        settings.openaiApiKey,
        customPrompt
      );
      setEnrichedOutput(result);
      setAppState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enrichment failed.");
      setAppState("done");
    } finally {
      setIsEnriching(false);
    }
  }, [transcript, settings, selectedMode, customPrompt]);

  // Copy to clipboard
  const handleCopyOutput = useCallback(async () => {
    try {
      if ("__TAURI__" in window) {
        const { writeText } = await import(
          "@tauri-apps/plugin-clipboard-manager"
        );
        await writeText(enrichedOutput);
      } else {
        await navigator.clipboard.writeText(enrichedOutput);
      }
    } catch {
      // Fallback
      await navigator.clipboard.writeText(enrichedOutput);
    }
  }, [enrichedOutput]);

  // Reset everything
  const handleReset = useCallback(() => {
    recorder.reset();
    setTranscript("");
    setEnrichedOutput("");
    setError(null);
    setAppState("idle");
  }, [recorder]);

  return (
    <div className="flex flex-col h-screen">
      <Titlebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[var(--foreground)]">
                Voice Intelligence
              </h1>
              <p className="text-sm text-[var(--muted)] mt-0.5">
                Record, transcribe, and enrich with AI
              </p>
            </div>
            <div className="flex items-center gap-2">
              {appState !== "idle" && appState !== "recording" && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--card)] text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4v6h6" />
                    <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                  </svg>
                  New
                </button>
              )}
              <button
                onClick={() => setSettingsOpen(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--card)] border border-[var(--border)] transition-colors"
                title="Settings"
              >
                <svg className="w-4 h-4 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </button>
            </div>
          </div>

          {/* API Key Warning */}
          {!hasApiKey(settings) && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 fade-in">
              <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <p className="text-sm text-amber-200">
                  No OpenAI API key configured.
                </p>
                <p className="text-xs text-amber-200/70 mt-0.5">
                  Transcription uses Web Speech API (browser-built-in). For Whisper transcription and AI enrichment,{" "}
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="underline hover:text-amber-100"
                  >
                    add your API key in Settings
                  </button>
                  .
                </p>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 fade-in">
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {recorder.error && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 fade-in">
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p className="text-sm text-red-300">{recorder.error}</p>
            </div>
          )}

          {/* Recording section */}
          <div className="flex flex-col items-center py-6">
            <RecordButton
              isRecording={recorder.isRecording}
              isPaused={recorder.isPaused}
              audioLevel={recorder.audioLevel}
              duration={recorder.duration}
              onStart={handleStartRecording}
              onStop={handleStopRecording}
              onPause={recorder.togglePause}
              disabled={isTranscribing || isEnriching}
            />
          </div>

          {/* Mode selection */}
          <ModeSelector
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
            customPrompt={customPrompt}
            onCustomPromptChange={setCustomPrompt}
          />

          {/* Transcript */}
          <TranscriptPanel
            transcript={transcript}
            isTranscribing={isTranscribing}
            onEdit={setTranscript}
          />

          {/* Enrich button */}
          {transcript && !recorder.isRecording && (
            <div className="flex justify-center fade-in">
              <button
                onClick={handleEnrich}
                disabled={isEnriching || !transcript.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {isEnriching ? "Processing..." : "Enrich with AI"}
              </button>
            </div>
          )}

          {/* Enriched output */}
          <EnrichedOutput
            content={enrichedOutput}
            isProcessing={isEnriching}
            onCopy={handleCopyOutput}
          />

          {/* Bottom spacing */}
          <div className="h-4" />
        </div>
      </main>

      {/* Settings panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
