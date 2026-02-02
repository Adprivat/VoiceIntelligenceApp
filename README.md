# Voice Intelligence App

Eine Desktop-Anwendung, die Spracheingaben aufnimmt, transkribiert und durch KI-gestützte Verarbeitung anreichert. Gebaut mit Next.js und Tauri für eine native Desktop-Erfahrung.

## Problem

Gesprochene Gedanken in strukturierte, nutzbare Inhalte umzuwandeln ist ein alltäglicher Bedarf - ob für Meeting-Notizen, E-Mails, Aufgabenextraktion oder organisierte Notizen. Manuelles Transkribieren und Formatieren von Sprache ist mühsam. Diese App automatisiert die gesamte Pipeline: **Aufnehmen -> Transkribieren -> Anreichern**.

## Architektur

```
┌──────────────────────────────────────────────────────────┐
│                      Tauri Shell                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │               Next.js Frontend                     │  │
│  │                                                    │  │
│  │  ┌──────────┐   ┌─────────────┐   ┌───────────┐  │  │
│  │  │ Aufnahme │──>│ Transkript. │──>│Anreicherung│  │  │
│  │  │MediaRec. │   │ Whisper/    │   │ OpenAI/    │  │  │
│  │  │  API     │   │ Groq/Web    │   │ Anthropic/ │  │  │
│  │  │          │   │ Speech API  │   │ Google/Groq│  │  │
│  │  └──────────┘   └─────────────┘   └───────────┘  │  │
│  │       │               │                │          │  │
│  │       ▼               ▼                ▼          │  │
│  │  ┌────────────────────────────────────────────┐   │  │
│  │  │         React UI (Deutsch/English)         │   │  │
│  │  │  RecordButton │ ModeSelector │ Output      │   │  │
│  │  └────────────────────────────────────────────┘   │  │
│  │                                                    │  │
│  │  i18n: DE (Standard) / EN (umschaltbar)           │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Tauri Plugins: global-shortcut, clipboard, notification,│
│                 dialog, fs                               │
└──────────────────────────────────────────────────────────┘
```

### Schlüsselkomponenten

| Komponente | Zweck |
|-----------|---------|
| `src/lib/i18n.ts` | Internationalisierung (Deutsch/Englisch) mit ~80 Übersetzungsschlüsseln |
| `src/lib/settings.ts` | Einstellungsverwaltung mit Multi-Provider-Konfiguration, Mikrofon-Auswahl und Migrationslogik |
| `src/lib/transcription.ts` | Transkription: Web Speech API, OpenAI Whisper, Groq Whisper |
| `src/lib/enrichment.ts` | LLM-Anreicherung via OpenAI, Anthropic, Google, Groq mit 6 Modi |
| `src/lib/export.ts` | Datei-Export via Tauri Save-Dialog (Desktop) oder Blob-Download (Browser) |
| `src/hooks/useAudioRecorder.ts` | MediaRecorder API mit Echtzeit-Audiopegel-Visualisierung und Mikrofon-Auswahl |
| `src/hooks/useGlobalHotkey.ts` | Tauri Global Shortcut mit Browser-Fallback |
| `src/components/SettingsPanel.tsx` | Umfangreiche Einstellungen: Sprache, Mikrofon, Anbieter, API-Schlüssel, Programm beenden |
| `src-tauri/` | Tauri v2 Desktop-Runtime-Konfiguration |

### Voice Pipeline

1. **Aufnahme**: Browser MediaRecorder API erfasst Audio (WebM/Opus) vom gewählten Mikrofon. Echtzeit-Audiopegel-Analyse treibt die Wellenform-Visualisierung.
2. **Transkription**: Drei Optionen, wählbar in den Einstellungen:
   - **Web Speech API** (Standard, kostenlos): Echtzeit-Spracherkennung im Browser, kein API-Schlüssel nötig
   - **OpenAI Whisper**: Höhere Genauigkeit, unterstützt mehr Sprachen, benötigt OpenAI API-Schlüssel
   - **Groq Whisper**: Sehr schnelle Transkription, benötigt Groq API-Schlüssel
3. **Anreicherung**: Transkript wird an den gewählten LLM-Anbieter mit modus-spezifischem System-Prompt gesendet. Sechs eingebaute Modi:
   - **Intelligente Notizen**: Strukturiert gesprochene Gedanken in organisierte Notizen
   - **Meeting-Zusammenfassung**: Extrahiert Entscheidungen, Aufgaben und offene Fragen
   - **E-Mail-Entwurf**: Wandelt gesprochene Ideen in professionelle E-Mail um
   - **Aufgabenextraktion**: Identifiziert To-Dos mit Prioritäten
   - **Ins Englische übersetzen**: Übersetzt und bereinigt in Englisch
   - **Eigener Prompt**: Benutzerdefinierte Verarbeitungsanweisungen
4. **Export**: Transkript und KI-Ergebnis können über den Export-Button als Datei gespeichert werden. In der Desktop-App öffnet sich ein nativer Speichern-Dialog (Tauri Dialog + FS Plugin), im Browser wird ein Download ausgelöst.
   - **Transkript**: Export als `.txt`-Datei
   - **KI-Ergebnis**: Export als `.md`-Datei (Markdown)

### Mikrofon-Auswahl

In den Einstellungen kann das gewünschte Eingabemikrofon ausgewählt werden. Die App listet alle verfügbaren Audiogeräte auf und speichert die Auswahl persistent. Ein Aktualisieren-Button ermöglicht das Neuladen der Geräteliste (z.B. nach Anschluss eines USB-Mikrofons).

### Unterstützte KI-Anbieter

| Funktion | Anbieter | Modell |
|----------|----------|--------|
| Transkription | Web Speech API | Browser-integriert (kostenlos) |
| Transkription | OpenAI | Whisper-1 |
| Transkription | Groq | Whisper Large v3 Turbo |
| Anreicherung | OpenAI | GPT-4o-mini |
| Anreicherung | Anthropic | Claude 3.5 Sonnet |
| Anreicherung | Google | Gemini 2.0 Flash |
| Anreicherung | Groq | Llama 3.3 70B |

### Internationalisierung (i18n)

Die App ist **nativ auf Deutsch**. In den Einstellungen kann auf Englisch umgeschaltet werden. Alle UI-Elemente, Fehlermeldungen, Labels und Beschreibungen sind vollständig übersetzt. Die Sprachumschaltung erfolgt sofort ohne Neustart.

### Hotkey-Aktivierung

Die App registriert einen globalen Hotkey (`Ctrl+Shift+V` standardmäßig) über Tauris `global-shortcut` Plugin. Der Hotkey schaltet die Aufnahme ein/aus und ist in den Einstellungen konfigurierbar.

## Voraussetzungen

- **Node.js** >= 18
- **Rust** >= 1.77 (für Tauri)
- **Systemabhängigkeiten für Tauri**: siehe [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/)
  - Linux: `sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev`
  - macOS: Xcode Command Line Tools
  - Windows: Microsoft Visual Studio C++ Build Tools, WebView2

## Setup

```bash
# Repository klonen
git clone <repo-url>
cd VoiceIntelligenceApp

# Node.js-Abhängigkeiten installieren
npm install

# Im Entwicklungsmodus starten (nur Browser)
npm run dev

# Als Desktop-App starten (Tauri)
npm run tauri:dev

# Desktop-App für Produktion bauen
npm run tauri:build
```

### Konfiguration

Beim ersten Start das **Einstellungen**-Icon (Zahnrad) klicken:

1. **App-Sprache**: Deutsch (Standard) oder Englisch
2. **Mikrofon**: Eingabegerät auswählen (Standard = Systemmikrofon)
3. **Transkriptions-Anbieter**: Web Speech API (kostenlos), OpenAI Whisper, oder Groq Whisper
4. **KI-Anbieter (LLM)**: OpenAI, Anthropic, Google, oder Groq
5. **API-Schlüssel**: Nur die Schlüssel für die gewählten Anbieter werden angezeigt/benötigt
6. **Spracherkennungssprache**: Deutsch, Englisch, Französisch, etc.
7. **Globaler Hotkey**: Tastenkombination anpassen
8. **Programm beenden**: App komplett schließen (nur Desktop)

Einstellungen werden im localStorage des Browsers gespeichert.

## Design-Entscheidungen

### Warum Tauri statt Electron?
Tauri erzeugt deutlich kleinere Binärdateien (~5-10MB vs ~150MB+), verbraucht weniger Speicher und nutzt die OS-WebView statt Chromium zu bündeln. Das Rust-Backend bietet zudem bessere Sicherheit durch ein Capability-basiertes Berechtigungssystem.

### Warum Multi-Provider statt nur OpenAI?
Verschiedene Nutzer haben verschiedene Präferenzen und bestehende API-Zugänge. Anthropic Claude bietet oft bessere Textqualität, Groq extrem schnelle Antwortzeiten, Google eine kostenfreie Einstiegsoption. Die intelligente API-Schlüssel-Verwaltung zeigt nur relevante Felder an.

### Warum client-seitige API-Aufrufe statt Backend-Proxy?
Für eine Desktop-App gehen API-Aufrufe direkt vom Client zum Anbieter. Das vereinfacht die Architektur - kein Server zu deployen/warten, und der API-Schlüssel bleibt auf dem Gerät des Nutzers.

### Warum Deutsch als Standardsprache?
Die App richtet sich primär an deutschsprachige Nutzer. Alle UI-Elemente, Fehlermeldungen und Beschreibungen sind nativ auf Deutsch. Über die Einstellungen kann jederzeit auf Englisch umgeschaltet werden.

### Warum Web Speech API als Standard?
Sie funktioniert sofort ohne API-Schlüssel und ermöglicht reibungsloses Onboarding. Nutzer können auf Whisper oder Groq upgraden, sobald ein API-Schlüssel vorhanden ist.

### Warum statischer Export (`output: "export"`)?
Tauri liefert lokale Dateien statt einen Node.js-Server zu betreiben. Statischer Export stellt sicher, dass der Next.js-Output eine Menge HTML/JS/CSS-Dateien ist, die Tauris WebView direkt laden kann.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Desktop-Runtime**: Tauri v2
- **Tauri-Plugins**: global-shortcut, clipboard-manager, notification, dialog, fs, shell, log
- **Styling**: Tailwind CSS v4
- **Transkription**: Web Speech API + OpenAI Whisper + Groq Whisper
- **LLM**: OpenAI GPT-4o-mini, Anthropic Claude 3.5 Sonnet, Google Gemini 2.0 Flash, Groq Llama 3.3 70B
- **Export**: Nativer Speichern-Dialog (Desktop) / Blob-Download (Browser)
- **i18n**: Eigenes Übersetzungssystem (Deutsch/Englisch)
- **Sprachen**: TypeScript (Frontend), Rust (Tauri-Backend)
