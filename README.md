# Voice Intelligence App

A desktop application that records voice input, transcribes it, and enriches the output through AI processing. Built with Next.js and Tauri for a native desktop experience.

## Problem

Capturing spoken thoughts and transforming them into usable, structured content is a common need - whether for meeting notes, emails, task extraction, or organized notes. Manually transcribing and formatting speech is tedious. This app automates the entire pipeline: **Record -> Transcribe -> Enrich**.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Tauri Shell                       │
│  ┌───────────────────────────────────────────────┐  │
│  │              Next.js Frontend                 │  │
│  │                                               │  │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐  │  │
│  │  │  Record   │──>│Transcribe│──>│  Enrich  │  │  │
│  │  │MediaRecordl│  │ Whisper/ │   │ GPT-4o   │  │  │
│  │  │   API     │  │WebSpeech │   │  mini    │  │  │
│  │  └──────────┘   └──────────┘   └──────────┘  │  │
│  │       │              │              │         │  │
│  │       ▼              ▼              ▼         │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │           React UI Components           │  │  │
│  │  │  RecordButton │ ModeSelector │ Output    │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Tauri Plugins: global-shortcut, clipboard, notify  │
└─────────────────────────────────────────────────────┘
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `src/hooks/useAudioRecorder.ts` | MediaRecorder API wrapper with audio level visualization |
| `src/hooks/useGlobalHotkey.ts` | Tauri global shortcut registration with browser fallback |
| `src/lib/transcription.ts` | Dual transcription: OpenAI Whisper API + Web Speech API |
| `src/lib/enrichment.ts` | LLM enrichment pipeline with 6 processing modes |
| `src/lib/settings.ts` | Persistent settings management via localStorage |
| `src/components/` | UI components (Titlebar, RecordButton, ModeSelector, etc.) |
| `src-tauri/` | Tauri v2 desktop runtime configuration |

### Voice Pipeline

1. **Recording**: Browser MediaRecorder API captures audio (WebM/Opus). Real-time audio level analysis drives the waveform visualization.
2. **Transcription**: Two options:
   - **Web Speech API** (default, free): Real-time browser-based speech recognition, no API key needed
   - **OpenAI Whisper** (optional): Higher accuracy, supports more languages, requires API key
3. **Enrichment**: Transcript is sent to GPT-4o-mini with a mode-specific system prompt. Six built-in modes:
   - **Smart Notes**: Structures spoken thoughts into organized, formatted notes
   - **Meeting Summary**: Extracts key decisions, action items, and open questions
   - **Email Draft**: Converts spoken ideas into professional email format
   - **Task Extraction**: Identifies actionable to-dos with priorities
   - **Translate to English**: Translates and cleans up into English
   - **Custom Prompt**: User-defined processing instructions

### Hotkey Activation

The app registers a global hotkey (`Ctrl+Shift+V` by default) via Tauri's `global-shortcut` plugin. Pressing the hotkey toggles recording on/off, allowing seamless integration into any workflow. The hotkey is configurable in Settings.

## Prerequisites

- **Node.js** >= 18
- **Rust** >= 1.77 (for Tauri)
- **System dependencies for Tauri**: see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)
  - Linux: `sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev`
  - macOS: Xcode Command Line Tools
  - Windows: Microsoft Visual Studio C++ Build Tools, WebView2

## Setup

```bash
# Clone the repository
git clone <repo-url>
cd VoiceIntelligenceApp

# Install Node.js dependencies
npm install

# (Optional) Copy and configure environment
cp .env.example .env
# Edit .env and add your OpenAI API key

# Run in development mode (browser only)
npm run dev

# Run as desktop app (Tauri)
npm run tauri:dev

# Build desktop app for production
npm run tauri:build
```

### Configuration

On first launch, click the **Settings** icon (gear) to configure:

1. **OpenAI API Key**: Required for Whisper transcription and AI enrichment
2. **Transcription Method**: Choose between Web Speech API (free) or Whisper (better quality)
3. **Language**: Set the speech recognition language
4. **Global Hotkey**: Customize the activation shortcut

Settings are persisted in localStorage.

## Design Decisions

### Why Tauri over Electron?
Tauri produces significantly smaller binaries (~5-10MB vs ~150MB+), uses less memory at runtime, and leverages the OS webview instead of bundling Chromium. The Rust backend also provides better security through its capability-based permission system.

### Why client-side API calls instead of a backend proxy?
For a desktop app, API calls go directly from the client to OpenAI. This simplifies the architecture - no server to deploy/maintain, and the API key stays on the user's machine in localStorage. A production version could add a backend proxy for key management.

### Why Web Speech API as default?
It works out of the box without any API key, providing zero-friction onboarding. Users can upgrade to Whisper for better accuracy once they add an API key.

### Why GPT-4o-mini for enrichment?
It provides a good balance of quality, speed, and cost. The enrichment tasks (formatting, summarizing, extracting) don't require the full capability of larger models.

### Why static export (`output: "export"`)?
Tauri serves local files rather than running a Node.js server. Static export ensures the Next.js output is a set of HTML/JS/CSS files that Tauri's webview can load directly. API calls go directly to OpenAI from the frontend.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Desktop Runtime**: Tauri v2
- **Styling**: Tailwind CSS v4
- **Voice-to-Text**: OpenAI Whisper API + Web Speech API
- **LLM**: OpenAI GPT-4o-mini
- **Language**: TypeScript (frontend), Rust (Tauri backend)
