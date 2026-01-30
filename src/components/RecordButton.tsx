"use client";

interface RecordButtonProps {
  isRecording: boolean;
  isPaused: boolean;
  audioLevel: number;
  duration: number;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  disabled?: boolean;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function RecordButton({
  isRecording,
  isPaused,
  audioLevel,
  duration,
  onStart,
  onStop,
  onPause,
  disabled,
}: RecordButtonProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main record button */}
      <div className="relative">
        {/* Pulse ring when recording */}
        {isRecording && !isPaused && (
          <>
            <div
              className="absolute inset-0 rounded-full bg-[var(--recording)] pulse-ring"
              style={{ opacity: audioLevel * 0.6 }}
            />
            <div
              className="absolute rounded-full bg-[var(--recording)]/20 transition-all duration-75"
              style={{
                inset: `${-20 * audioLevel}px`,
                borderRadius: "50%",
              }}
            />
          </>
        )}

        <button
          onClick={isRecording ? onStop : onStart}
          disabled={disabled}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
            isRecording
              ? "bg-[var(--recording)] hover:bg-[var(--recording-pulse)] shadow-lg shadow-red-500/25"
              : "bg-[var(--primary)] hover:bg-[var(--primary-hover)] shadow-lg shadow-indigo-500/25"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {isRecording ? (
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>
      </div>

      {/* Duration and controls */}
      {isRecording && (
        <div className="flex items-center gap-3 fade-in">
          <button
            onClick={onPause}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] transition-colors"
          >
            {isPaused ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            )}
          </button>
          <span className="text-sm font-mono text-[var(--muted)]">
            {formatDuration(duration)}
          </span>
          {/* Waveform visualization */}
          <div className="flex items-center gap-[2px] h-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-[3px] bg-[var(--recording)] rounded-full transition-all duration-75"
                style={{
                  height: isPaused
                    ? "4px"
                    : `${Math.max(4, audioLevel * 24 * (0.5 + Math.random() * 0.5))}px`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {!isRecording && (
        <p className="text-xs text-[var(--muted)]">
          Click to record or press <kbd className="px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] text-[10px] font-mono">Ctrl+Shift+V</kbd>
        </p>
      )}
    </div>
  );
}
