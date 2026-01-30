"use client";

import { type AppSettings } from "@/lib/settings";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  const updateField = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    onSave({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md mx-4 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl fade-in">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--card)] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* API Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={settings.openaiApiKey}
              onChange={(e) => updateField("openaiApiKey", e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <p className="text-xs text-[var(--muted)]">
              Required for Whisper transcription and LLM enrichment.
              Without a key, only Web Speech API transcription is available.
            </p>
          </div>

          {/* Transcription Method */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Transcription Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateField("transcriptionMethod", "webspeech")}
                className={`p-3 rounded-lg border text-left text-sm transition-all ${
                  settings.transcriptionMethod === "webspeech"
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)]"
                }`}
              >
                <div className="font-medium">Web Speech API</div>
                <div className="text-xs text-[var(--muted)] mt-0.5">Free, browser-based</div>
              </button>
              <button
                onClick={() => updateField("transcriptionMethod", "whisper")}
                className={`p-3 rounded-lg border text-left text-sm transition-all ${
                  settings.transcriptionMethod === "whisper"
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)]"
                }`}
              >
                <div className="font-medium">OpenAI Whisper</div>
                <div className="text-xs text-[var(--muted)] mt-0.5">Higher quality, API key required</div>
              </button>
            </div>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Speech Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => updateField("language", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            >
              <option value="de-DE">Deutsch</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="fr-FR">Francais</option>
              <option value="es-ES">Espanol</option>
              <option value="it-IT">Italiano</option>
              <option value="pt-BR">Portugues</option>
              <option value="ja-JP">Japanese</option>
              <option value="zh-CN">Chinese</option>
            </select>
          </div>

          {/* Hotkey */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Global Hotkey
            </label>
            <input
              type="text"
              value={settings.hotkey}
              onChange={(e) => updateField("hotkey", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono"
            />
            <p className="text-xs text-[var(--muted)]">
              Tauri shortcut format (e.g., CmdOrCtrl+Shift+V). Applied on restart.
            </p>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
