"use client";

interface TranscriptPanelProps {
  transcript: string;
  isTranscribing: boolean;
  onEdit: (text: string) => void;
}

export default function TranscriptPanel({
  transcript,
  isTranscribing,
  onEdit,
}: TranscriptPanelProps) {
  if (!transcript && !isTranscribing) return null;

  return (
    <div className="fade-in space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
          Transcript
        </h3>
        {isTranscribing && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            <span className="text-xs text-[var(--primary)]">Transcribing...</span>
          </div>
        )}
      </div>
      <textarea
        value={transcript}
        onChange={(e) => onEdit(e.target.value)}
        className="w-full min-h-[80px] p-3 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--foreground)] resize-y focus:outline-none focus:border-[var(--primary)] transition-colors"
        placeholder="Transcript will appear here..."
      />
    </div>
  );
}
