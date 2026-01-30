"use client";

import { ENRICHMENT_MODES, type EnrichmentMode } from "@/lib/enrichment";

interface ModeSelectorProps {
  selectedMode: EnrichmentMode;
  onModeChange: (mode: EnrichmentMode) => void;
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
}

export default function ModeSelector({
  selectedMode,
  onModeChange,
  customPrompt,
  onCustomPromptChange,
}: ModeSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
        Processing Mode
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {ENRICHMENT_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all duration-150 ${
              selectedMode === mode.id
                ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]"
                : "border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
            }`}
          >
            <svg
              className={`w-4 h-4 mt-0.5 shrink-0 ${
                selectedMode === mode.id ? "text-[var(--primary)]" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={mode.icon} />
            </svg>
            <div className="min-w-0">
              <div className="text-sm font-medium">{mode.label}</div>
              <div className="text-[10px] text-[var(--muted)] leading-tight mt-0.5">
                {mode.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedMode === "freeform" && (
        <div className="fade-in">
          <textarea
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            placeholder="Enter your custom processing instructions..."
            className="w-full h-24 p-3 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted)] resize-none focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
      )}
    </div>
  );
}
