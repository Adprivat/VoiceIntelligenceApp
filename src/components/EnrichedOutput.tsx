"use client";

import { useState, useEffect } from "react";
import { t, type UILanguage } from "@/lib/i18n";
import { exportFile } from "@/lib/export";

interface EnrichedOutputProps {
  content: string;
  isProcessing: boolean;
  onCopy: () => void;
  lang: UILanguage;
}

function renderMarkdown(text: string): string {
  let html = text;

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Headers
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Checkbox list items
  html = html.replace(/^- \[x\] (.+)$/gm, '<li><input type="checkbox" checked disabled /> $1</li>');
  html = html.replace(/^- \[ \] (.+)$/gm, '<li><input type="checkbox" disabled /> $1</li>');
  // Unordered list items
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  // Ordered list items
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");
  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr />");
  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, "</p><p>");
  // Single newlines within paragraphs
  html = html.replace(/\n/g, "<br />");

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*<\/li><br \/>?)+)/g, "<ul>$1</ul>");
  html = html.replace(/<ul><br \/>/g, "<ul>");
  html = html.replace(/<\/li><br \/>/g, "</li>");

  return `<p>${html}</p>`;
}

export default function EnrichedOutput({
  content,
  isProcessing,
  onCopy,
  lang,
}: EnrichedOutputProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!content && !isProcessing) return null;

  const handleCopy = () => {
    onCopy();
    setCopied(true);
  };

  const handleExport = async () => {
    await exportFile(content, "ki-ergebnis.md", [
      { name: "Markdown", extensions: ["md"] },
      { name: "Text", extensions: ["txt"] },
    ]);
  };

  return (
    <div className="fade-in space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
          {t("output.heading", lang)}
        </h3>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-xs text-[var(--accent)]">
                {t("output.processing", lang)}
              </span>
            </div>
          )}
          {content && (
            <>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] text-xs transition-colors"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {t("output.export", lang)}
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] text-xs transition-colors"
              >
                {copied ? (
                  <>
                    <svg className="w-3 h-3 text-[var(--success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-[var(--success)]">{t("output.copied", lang)}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    {t("output.copy", lang)}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
      <div className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)] min-h-[120px] max-h-[400px] overflow-y-auto">
        {isProcessing && !content ? (
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            {t("output.aiProcessing", lang)}
          </div>
        ) : (
          <div
            className="enriched-output text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
      </div>
    </div>
  );
}
