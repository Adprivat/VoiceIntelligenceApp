"use client";

import { t, type UILanguage } from "@/lib/i18n";
import { exportFile } from "@/lib/export";

interface TranscriptPanelProps {
  transcript: string;
  isTranscribing: boolean;
  onEdit: (text: string) => void;
  lang: UILanguage;
}

export default function TranscriptPanel({
  transcript,
  isTranscribing,
  onEdit,
  lang,
}: TranscriptPanelProps) {
  if (!transcript && !isTranscribing) return null;

  const handleExport = async () => {
    await exportFile(transcript, "transkript.txt", [
      { name: "Text", extensions: ["txt"] },
    ]);
  };

  return (
    <div className="fade-in space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
          {t("transcript.heading", lang)}
        </h3>
        <div className="flex items-center gap-2">
          {isTranscribing && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              <span className="text-xs text-[var(--primary)]">
                {t("transcript.transcribing", lang)}
              </span>
            </div>
          )}
          {transcript && !isTranscribing && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] text-xs transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {t("transcript.export", lang)}
            </button>
          )}
        </div>
      </div>
      <textarea
        value={transcript}
        onChange={(e) => onEdit(e.target.value)}
        className="w-full min-h-[80px] p-3 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--foreground)] resize-y focus:outline-none focus:border-[var(--primary)] transition-colors"
        placeholder={t("transcript.placeholder", lang)}
      />
    </div>
  );
}
