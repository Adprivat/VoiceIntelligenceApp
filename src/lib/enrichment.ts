export type EnrichmentMode =
  | "smart-notes"
  | "meeting-summary"
  | "email-draft"
  | "todo-extract"
  | "translate-en"
  | "freeform";

export interface EnrichmentModeConfig {
  id: EnrichmentMode;
  label: string;
  description: string;
  icon: string;
  systemPrompt: string;
}

export const ENRICHMENT_MODES: EnrichmentModeConfig[] = [
  {
    id: "smart-notes",
    label: "Smart Notes",
    description: "Structure spoken thoughts into organized notes",
    icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    systemPrompt: `You are an expert note-taking assistant. Transform the following spoken text into well-structured, organized notes.

Rules:
- Use clear headings and subheadings where appropriate
- Use bullet points for key points
- Highlight important terms or concepts in **bold**
- Fix grammar and remove filler words (um, uh, etc.)
- Maintain the original meaning and intent
- Keep the language of the original text (if German, output German; if English, output English)
- Be concise but don't lose important details
- Use markdown formatting`,
  },
  {
    id: "meeting-summary",
    label: "Meeting Summary",
    description: "Summarize with key decisions and action items",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    systemPrompt: `You are a meeting summarizer. Transform the following spoken text into a concise meeting summary.

Structure the output as:
## Summary
Brief overview of what was discussed.

## Key Decisions
- List of decisions made

## Action Items
- [ ] Action item with responsible person if mentioned
- [ ] Next action item

## Open Questions
- Any unresolved questions or topics for follow-up

Rules:
- Keep the language of the original text
- Be concise and actionable
- Use markdown formatting`,
  },
  {
    id: "email-draft",
    label: "Email Draft",
    description: "Convert spoken ideas into a professional email",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    systemPrompt: `You are a professional email writer. Transform the following spoken text into a well-formatted, professional email.

Structure:
- Subject line suggestion
- Professional greeting
- Clear, structured body
- Appropriate closing

Rules:
- Keep the language of the original text
- Maintain professional but not overly formal tone
- Fix grammar and improve clarity
- Keep it concise
- Use markdown formatting`,
  },
  {
    id: "todo-extract",
    label: "Task Extraction",
    description: "Extract actionable tasks and to-dos",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    systemPrompt: `You are a task extraction assistant. Analyze the following spoken text and extract all actionable tasks, to-dos, and commitments.

Structure:
## Tasks
- [ ] Task 1 (Priority: High/Medium/Low)
- [ ] Task 2 (Priority: High/Medium/Low)

## Deadlines
- Any mentioned deadlines or timeframes

## Dependencies
- Any mentioned dependencies or blockers

Rules:
- Keep the language of the original text
- Be specific about what needs to be done
- Infer priority from context and urgency cues
- Use markdown formatting`,
  },
  {
    id: "translate-en",
    label: "Translate to English",
    description: "Translate and clean up into English",
    icon: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129",
    systemPrompt: `You are a professional translator. Translate the following spoken text into clear, well-written English.

Rules:
- Translate accurately, preserving the original meaning
- Fix grammar issues from the spoken original
- Remove filler words
- Produce natural-sounding English
- If the text is already in English, just clean it up
- Use markdown formatting for structure if the text is long enough`,
  },
  {
    id: "freeform",
    label: "Custom Prompt",
    description: "Process with your own instructions",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    systemPrompt: "",
  },
];

export async function enrichText(
  transcript: string,
  mode: EnrichmentMode,
  apiKey: string,
  customPrompt?: string
): Promise<string> {
  const modeConfig = ENRICHMENT_MODES.find((m) => m.id === mode);
  if (!modeConfig) throw new Error(`Unknown enrichment mode: ${mode}`);

  const systemPrompt =
    mode === "freeform"
      ? customPrompt || "Improve and structure the following text."
      : modeConfig.systemPrompt;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: transcript },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No output generated.";
}
