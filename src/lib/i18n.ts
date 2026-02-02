export type UILanguage = "de" | "en";

export type TranslationKey = keyof typeof translations.de;

const translations = {
  de: {
    // App
    "app.title": "Voice Intelligence",
    "app.subtitle": "Aufnehmen, transkribieren und mit KI anreichern",

    // Titlebar
    "titlebar.title": "Voice Intelligence",

    // Record button
    "record.clickOrPress": "Klicken zum Aufnehmen oder",
    "record.pressHotkey": "drücken",

    // Mode selector
    "modes.heading": "Verarbeitungsmodus",
    "modes.smart-notes.label": "Intelligente Notizen",
    "modes.smart-notes.description": "Gesprochene Gedanken in strukturierte Notizen umwandeln",
    "modes.meeting-summary.label": "Meeting-Zusammenfassung",
    "modes.meeting-summary.description": "Zusammenfassung mit Entscheidungen und Aufgaben",
    "modes.email-draft.label": "E-Mail-Entwurf",
    "modes.email-draft.description": "Gesprochene Ideen in professionelle E-Mail umwandeln",
    "modes.todo-extract.label": "Aufgabenextraktion",
    "modes.todo-extract.description": "Handlungsfähige Aufgaben und To-Dos extrahieren",
    "modes.translate-en.label": "Ins Englische übersetzen",
    "modes.translate-en.description": "Übersetzen und in Englisch aufbereiten",
    "modes.freeform.label": "Eigener Prompt",
    "modes.freeform.description": "Mit eigenen Anweisungen verarbeiten",
    "modes.freeform.placeholder": "Eigene Verarbeitungsanweisungen eingeben...",

    // Transcript
    "transcript.heading": "Transkript",
    "transcript.transcribing": "Wird transkribiert...",
    "transcript.placeholder": "Transkript erscheint hier...",

    // Enriched output
    "output.heading": "KI-Ergebnis",
    "output.processing": "Wird verarbeitet...",
    "output.aiProcessing": "KI verarbeitet dein Transkript...",
    "output.copy": "Kopieren",
    "output.copied": "Kopiert!",

    // Enrich button
    "enrich.button": "Mit KI anreichern",
    "enrich.processing": "Wird verarbeitet...",

    // Errors
    "error.noTranscript": "Kein Transkript vorhanden. Bitte zuerst etwas aufnehmen.",
    "error.noApiKey": "API-Schlüssel wird für die Anreicherung benötigt. Bitte in den Einstellungen hinzufügen.",
    "error.transcriptionFailed": "Transkription fehlgeschlagen.",
    "error.enrichmentFailed": "Anreicherung fehlgeschlagen.",

    // Reset button
    "reset.button": "Neu",

    // API Key warning
    "warning.noApiKey.title": "Kein API-Schlüssel konfiguriert.",
    "warning.noApiKey.body": "Die Transkription nutzt die Web Speech API (im Browser integriert). Für Whisper-Transkription und KI-Anreicherung",
    "warning.noApiKey.link": "API-Schlüssel in den Einstellungen hinzufügen",

    // Settings
    "settings.title": "Einstellungen",
    "settings.done": "Fertig",

    "settings.uiLanguage.label": "App-Sprache",
    "settings.uiLanguage.description": "Sprache der Benutzeroberfläche.",

    "settings.transcriptionProvider.label": "Transkriptions-Anbieter",
    "settings.transcriptionProvider.webspeech.name": "Web Speech API",
    "settings.transcriptionProvider.webspeech.description": "Kostenlos, browserbasiert",
    "settings.transcriptionProvider.openai-whisper.name": "OpenAI Whisper",
    "settings.transcriptionProvider.openai-whisper.description": "Höhere Qualität, benötigt API-Schlüssel",
    "settings.transcriptionProvider.groq-whisper.name": "Groq Whisper",
    "settings.transcriptionProvider.groq-whisper.description": "Sehr schnell, benötigt API-Schlüssel",

    "settings.llmProvider.label": "KI-Anbieter (LLM)",
    "settings.llmProvider.openai.name": "OpenAI",
    "settings.llmProvider.openai.description": "GPT-4o-mini",
    "settings.llmProvider.anthropic.name": "Anthropic",
    "settings.llmProvider.anthropic.description": "Claude 3.5 Sonnet",
    "settings.llmProvider.google.name": "Google",
    "settings.llmProvider.google.description": "Gemini 2.0 Flash",
    "settings.llmProvider.groq.name": "Groq",
    "settings.llmProvider.groq.description": "Llama 3.3 70B",

    "settings.apiKeys.heading": "API-Schlüssel",
    "settings.apiKeys.openai.label": "OpenAI API-Schlüssel",
    "settings.apiKeys.openai.placeholder": "sk-...",
    "settings.apiKeys.anthropic.label": "Anthropic API-Schlüssel",
    "settings.apiKeys.anthropic.placeholder": "sk-ant-...",
    "settings.apiKeys.google.label": "Google AI API-Schlüssel",
    "settings.apiKeys.google.placeholder": "AI...",
    "settings.apiKeys.groq.label": "Groq API-Schlüssel",
    "settings.apiKeys.groq.placeholder": "gsk_...",
    "settings.apiKeys.description": "Nur die Schlüssel für die ausgewählten Anbieter werden benötigt.",

    "settings.speechLanguage.label": "Spracherkennungssprache",

    "settings.microphone.label": "Mikrofon",
    "settings.microphone.default": "Standard (Systemstandard)",
    "settings.microphone.refresh": "Aktualisieren",

    "settings.hotkey.label": "Globaler Hotkey",
    "settings.hotkey.description": "Tauri-Tastenkombinationsformat (z.B. CmdOrCtrl+Shift+V). Wird beim Neustart angewendet.",

    // Export
    "transcript.export": "Exportieren",
    "output.export": "Exportieren",

    // Quit
    "app.quit": "Programm beenden",
  },

  en: {
    // App
    "app.title": "Voice Intelligence",
    "app.subtitle": "Record, transcribe, and enrich with AI",

    // Titlebar
    "titlebar.title": "Voice Intelligence",

    // Record button
    "record.clickOrPress": "Click to record or press",
    "record.pressHotkey": "",

    // Mode selector
    "modes.heading": "Processing Mode",
    "modes.smart-notes.label": "Smart Notes",
    "modes.smart-notes.description": "Structure spoken thoughts into organized notes",
    "modes.meeting-summary.label": "Meeting Summary",
    "modes.meeting-summary.description": "Summarize with key decisions and action items",
    "modes.email-draft.label": "Email Draft",
    "modes.email-draft.description": "Convert spoken ideas into a professional email",
    "modes.todo-extract.label": "Task Extraction",
    "modes.todo-extract.description": "Extract actionable tasks and to-dos",
    "modes.translate-en.label": "Translate to English",
    "modes.translate-en.description": "Translate and clean up into English",
    "modes.freeform.label": "Custom Prompt",
    "modes.freeform.description": "Process with your own instructions",
    "modes.freeform.placeholder": "Enter your custom processing instructions...",

    // Transcript
    "transcript.heading": "Transcript",
    "transcript.transcribing": "Transcribing...",
    "transcript.placeholder": "Transcript will appear here...",

    // Enriched output
    "output.heading": "Enriched Output",
    "output.processing": "Processing...",
    "output.aiProcessing": "AI is processing your transcript...",
    "output.copy": "Copy",
    "output.copied": "Copied!",

    // Enrich button
    "enrich.button": "Enrich with AI",
    "enrich.processing": "Processing...",

    // Errors
    "error.noTranscript": "No transcript to process. Please record something first.",
    "error.noApiKey": "API key is required for enrichment. Please add it in Settings.",
    "error.transcriptionFailed": "Transcription failed.",
    "error.enrichmentFailed": "Enrichment failed.",

    // Reset button
    "reset.button": "New",

    // API Key warning
    "warning.noApiKey.title": "No API key configured.",
    "warning.noApiKey.body": "Transcription uses Web Speech API (browser-built-in). For Whisper transcription and AI enrichment,",
    "warning.noApiKey.link": "add your API key in Settings",

    // Settings
    "settings.title": "Settings",
    "settings.done": "Done",

    "settings.uiLanguage.label": "App Language",
    "settings.uiLanguage.description": "Language of the user interface.",

    "settings.transcriptionProvider.label": "Transcription Provider",
    "settings.transcriptionProvider.webspeech.name": "Web Speech API",
    "settings.transcriptionProvider.webspeech.description": "Free, browser-based",
    "settings.transcriptionProvider.openai-whisper.name": "OpenAI Whisper",
    "settings.transcriptionProvider.openai-whisper.description": "Higher quality, API key required",
    "settings.transcriptionProvider.groq-whisper.name": "Groq Whisper",
    "settings.transcriptionProvider.groq-whisper.description": "Very fast, API key required",

    "settings.llmProvider.label": "AI Provider (LLM)",
    "settings.llmProvider.openai.name": "OpenAI",
    "settings.llmProvider.openai.description": "GPT-4o-mini",
    "settings.llmProvider.anthropic.name": "Anthropic",
    "settings.llmProvider.anthropic.description": "Claude 3.5 Sonnet",
    "settings.llmProvider.google.name": "Google",
    "settings.llmProvider.google.description": "Gemini 2.0 Flash",
    "settings.llmProvider.groq.name": "Groq",
    "settings.llmProvider.groq.description": "Llama 3.3 70B",

    "settings.apiKeys.heading": "API Keys",
    "settings.apiKeys.openai.label": "OpenAI API Key",
    "settings.apiKeys.openai.placeholder": "sk-...",
    "settings.apiKeys.anthropic.label": "Anthropic API Key",
    "settings.apiKeys.anthropic.placeholder": "sk-ant-...",
    "settings.apiKeys.google.label": "Google AI API Key",
    "settings.apiKeys.google.placeholder": "AI...",
    "settings.apiKeys.groq.label": "Groq API Key",
    "settings.apiKeys.groq.placeholder": "gsk_...",
    "settings.apiKeys.description": "Only the keys for the selected providers are required.",

    "settings.speechLanguage.label": "Speech Recognition Language",

    "settings.microphone.label": "Microphone",
    "settings.microphone.default": "Default (System default)",
    "settings.microphone.refresh": "Refresh",

    "settings.hotkey.label": "Global Hotkey",
    "settings.hotkey.description": "Tauri shortcut format (e.g., CmdOrCtrl+Shift+V). Applied on restart.",

    // Export
    "transcript.export": "Export",
    "output.export": "Export",

    // Quit
    "app.quit": "Quit Application",
  },
} as const;

export function t(key: TranslationKey, lang: UILanguage): string {
  return translations[lang][key] ?? translations.de[key] ?? key;
}

export function getTranslations(lang: UILanguage) {
  return translations[lang];
}
