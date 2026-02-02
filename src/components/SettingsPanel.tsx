"use client";

import {
  type AppSettings,
  type TranscriptionProvider,
  type LLMProvider,
} from "@/lib/settings";
import { t, type UILanguage } from "@/lib/i18n";

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

  const lang = settings.uiLanguage;

  const updateField = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    onSave({ ...settings, [key]: value });
  };

  const updateApiKey = (provider: keyof AppSettings["apiKeys"], value: string) => {
    onSave({
      ...settings,
      apiKeys: { ...settings.apiKeys, [provider]: value },
    });
  };

  // Determine which API key fields to show based on selected providers
  const needsOpenAI =
    settings.transcriptionProvider === "openai-whisper" ||
    settings.llmProvider === "openai";
  const needsAnthropic = settings.llmProvider === "anthropic";
  const needsGoogle = settings.llmProvider === "google";
  const needsGroq =
    settings.transcriptionProvider === "groq-whisper" ||
    settings.llmProvider === "groq";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 max-h-[85vh] bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl fade-in flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] shrink-0">
          <h2 className="text-lg font-semibold">{t("settings.title", lang)}</h2>
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

        <div className="p-4 space-y-5 overflow-y-auto flex-1">

          {/* === UI Language === */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">
              {t("settings.uiLanguage.label", lang)}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateField("uiLanguage", "de" as UILanguage)}
                className={`p-3 rounded-lg border text-left text-sm transition-all ${
                  settings.uiLanguage === "de"
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)]"
                }`}
              >
                <div className="font-medium">Deutsch</div>
                <div className="text-xs text-[var(--muted)] mt-0.5">Standardsprache</div>
              </button>
              <button
                onClick={() => updateField("uiLanguage", "en" as UILanguage)}
                className={`p-3 rounded-lg border text-left text-sm transition-all ${
                  settings.uiLanguage === "en"
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)]"
                }`}
              >
                <div className="font-medium">English</div>
                <div className="text-xs text-[var(--muted)] mt-0.5">Switch to English</div>
              </button>
            </div>
          </div>

          {/* === Transcription Provider === */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">
              {t("settings.transcriptionProvider.label", lang)}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "webspeech", nameKey: "settings.transcriptionProvider.webspeech.name", descKey: "settings.transcriptionProvider.webspeech.description" },
                  { id: "openai-whisper", nameKey: "settings.transcriptionProvider.openai-whisper.name", descKey: "settings.transcriptionProvider.openai-whisper.description" },
                  { id: "groq-whisper", nameKey: "settings.transcriptionProvider.groq-whisper.name", descKey: "settings.transcriptionProvider.groq-whisper.description" },
                ] as const
              ).map((tp) => (
                <button
                  key={tp.id}
                  onClick={() => updateField("transcriptionProvider", tp.id as TranscriptionProvider)}
                  className={`p-3 rounded-lg border text-left text-sm transition-all ${
                    settings.transcriptionProvider === tp.id
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)]"
                  }`}
                >
                  <div className="font-medium text-xs">{t(tp.nameKey, lang)}</div>
                  <div className="text-[10px] text-[var(--muted)] mt-0.5 leading-tight">
                    {t(tp.descKey, lang)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* === LLM Provider === */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">
              {t("settings.llmProvider.label", lang)}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "openai", nameKey: "settings.llmProvider.openai.name", descKey: "settings.llmProvider.openai.description" },
                  { id: "anthropic", nameKey: "settings.llmProvider.anthropic.name", descKey: "settings.llmProvider.anthropic.description" },
                  { id: "google", nameKey: "settings.llmProvider.google.name", descKey: "settings.llmProvider.google.description" },
                  { id: "groq", nameKey: "settings.llmProvider.groq.name", descKey: "settings.llmProvider.groq.description" },
                ] as const
              ).map((lp) => (
                <button
                  key={lp.id}
                  onClick={() => updateField("llmProvider", lp.id as LLMProvider)}
                  className={`p-3 rounded-lg border text-left text-sm transition-all ${
                    settings.llmProvider === lp.id
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)]"
                  }`}
                >
                  <div className="font-medium">{t(lp.nameKey, lang)}</div>
                  <div className="text-xs text-[var(--muted)] mt-0.5">
                    {t(lp.descKey, lang)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* === API Keys (only show relevant ones) === */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--foreground)]">
              {t("settings.apiKeys.heading", lang)}
            </label>
            <p className="text-xs text-[var(--muted)]">
              {t("settings.apiKeys.description", lang)}
            </p>

            {needsOpenAI && (
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted)]">
                  {t("settings.apiKeys.openai.label", lang)}
                </label>
                <input
                  type="password"
                  value={settings.apiKeys.openai}
                  onChange={(e) => updateApiKey("openai", e.target.value)}
                  placeholder={t("settings.apiKeys.openai.placeholder", lang)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            )}

            {needsAnthropic && (
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted)]">
                  {t("settings.apiKeys.anthropic.label", lang)}
                </label>
                <input
                  type="password"
                  value={settings.apiKeys.anthropic}
                  onChange={(e) => updateApiKey("anthropic", e.target.value)}
                  placeholder={t("settings.apiKeys.anthropic.placeholder", lang)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            )}

            {needsGoogle && (
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted)]">
                  {t("settings.apiKeys.google.label", lang)}
                </label>
                <input
                  type="password"
                  value={settings.apiKeys.google}
                  onChange={(e) => updateApiKey("google", e.target.value)}
                  placeholder={t("settings.apiKeys.google.placeholder", lang)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            )}

            {needsGroq && (
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted)]">
                  {t("settings.apiKeys.groq.label", lang)}
                </label>
                <input
                  type="password"
                  value={settings.apiKeys.groq}
                  onChange={(e) => updateApiKey("groq", e.target.value)}
                  placeholder={t("settings.apiKeys.groq.placeholder", lang)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            )}
          </div>

          {/* === Speech Language === */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">
              {t("settings.speechLanguage.label", lang)}
            </label>
            <select
              value={settings.speechLanguage}
              onChange={(e) => updateField("speechLanguage", e.target.value)}
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

          {/* === Hotkey === */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">
              {t("settings.hotkey.label", lang)}
            </label>
            <input
              type="text"
              value={settings.hotkey}
              onChange={(e) => updateField("hotkey", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono"
            />
            <p className="text-xs text-[var(--muted)]">
              {t("settings.hotkey.description", lang)}
            </p>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-[var(--border)] shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-colors"
          >
            {t("settings.done", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
