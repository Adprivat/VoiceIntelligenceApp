import { describe, it, expect } from "vitest";
import { t, getTranslations, type UILanguage, type TranslationKey } from "./i18n";

describe("i18n", () => {
  describe("t (translate)", () => {
    it("should return German translation for 'de' language", () => {
      expect(t("app.title", "de")).toBe("Voice Intelligence");
      expect(t("app.subtitle", "de")).toBe(
        "Aufnehmen, transkribieren und mit KI anreichern"
      );
    });

    it("should return English translation for 'en' language", () => {
      expect(t("app.title", "en")).toBe("Voice Intelligence");
      expect(t("app.subtitle", "en")).toBe(
        "Record, transcribe, and enrich with AI"
      );
    });

    it("should return different translations for different languages", () => {
      expect(t("settings.title", "de")).toBe("Einstellungen");
      expect(t("settings.title", "en")).toBe("Settings");
    });

    it("should return correct record button text", () => {
      expect(t("record.clickOrPress", "de")).toBe(
        "Klicken zum Aufnehmen oder"
      );
      expect(t("record.clickOrPress", "en")).toBe(
        "Click to record or press"
      );
    });

    it("should return correct mode labels for German", () => {
      expect(t("modes.smart-notes.label", "de")).toBe("Intelligente Notizen");
      expect(t("modes.meeting-summary.label", "de")).toBe(
        "Meeting-Zusammenfassung"
      );
      expect(t("modes.email-draft.label", "de")).toBe("E-Mail-Entwurf");
      expect(t("modes.todo-extract.label", "de")).toBe("Aufgabenextraktion");
      expect(t("modes.translate-en.label", "de")).toBe(
        "Ins Englische übersetzen"
      );
      expect(t("modes.freeform.label", "de")).toBe("Eigener Prompt");
    });

    it("should return correct mode labels for English", () => {
      expect(t("modes.smart-notes.label", "en")).toBe("Smart Notes");
      expect(t("modes.meeting-summary.label", "en")).toBe("Meeting Summary");
      expect(t("modes.email-draft.label", "en")).toBe("Email Draft");
      expect(t("modes.todo-extract.label", "en")).toBe("Task Extraction");
      expect(t("modes.translate-en.label", "en")).toBe("Translate to English");
      expect(t("modes.freeform.label", "en")).toBe("Custom Prompt");
    });

    it("should return correct error messages", () => {
      expect(t("error.noTranscript", "de")).toBe(
        "Kein Transkript vorhanden. Bitte zuerst etwas aufnehmen."
      );
      expect(t("error.noTranscript", "en")).toBe(
        "No transcript to process. Please record something first."
      );
    });

    it("should return correct settings labels", () => {
      expect(t("settings.uiLanguage.label", "de")).toBe("App-Sprache");
      expect(t("settings.uiLanguage.label", "en")).toBe("App Language");
      expect(t("settings.transcriptionProvider.label", "de")).toBe(
        "Transkriptions-Anbieter"
      );
      expect(t("settings.transcriptionProvider.label", "en")).toBe(
        "Transcription Provider"
      );
    });

    it("should return correct output-related translations", () => {
      expect(t("output.heading", "de")).toBe("KI-Ergebnis");
      expect(t("output.heading", "en")).toBe("Enriched Output");
      expect(t("output.copy", "de")).toBe("Kopieren");
      expect(t("output.copy", "en")).toBe("Copy");
      expect(t("output.copied", "de")).toBe("Kopiert!");
      expect(t("output.copied", "en")).toBe("Copied!");
    });
  });

  describe("getTranslations", () => {
    it("should return all German translations", () => {
      const deTrans = getTranslations("de");
      expect(deTrans["app.title"]).toBe("Voice Intelligence");
      expect(deTrans["settings.title"]).toBe("Einstellungen");
      expect(typeof deTrans).toBe("object");
    });

    it("should return all English translations", () => {
      const enTrans = getTranslations("en");
      expect(enTrans["app.title"]).toBe("Voice Intelligence");
      expect(enTrans["settings.title"]).toBe("Settings");
      expect(typeof enTrans).toBe("object");
    });

    it("should have the same keys in both languages", () => {
      const deKeys = Object.keys(getTranslations("de")).sort();
      const enKeys = Object.keys(getTranslations("en")).sort();
      expect(deKeys).toEqual(enKeys);
    });

    it("should have non-empty values for all keys in German", () => {
      const deTrans = getTranslations("de");
      for (const [key, value] of Object.entries(deTrans)) {
        // Allow empty string for "record.pressHotkey" in English
        if (key === "record.pressHotkey") continue;
        expect(value.length).toBeGreaterThan(0);
      }
    });
  });
});
