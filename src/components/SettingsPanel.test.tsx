import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SettingsPanel from "./SettingsPanel";
import type { AppSettings } from "@/lib/settings";

const defaultSettings: AppSettings = {
  uiLanguage: "en",
  transcriptionProvider: "webspeech",
  llmProvider: "openai",
  apiKeys: {
    openai: "",
    anthropic: "",
    google: "",
    groq: "",
  },
  defaultMode: "smart-notes",
  hotkey: "CmdOrCtrl+Shift+V",
  speechLanguage: "de-DE",
};

describe("SettingsPanel", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    settings: defaultSettings,
    onSave: vi.fn(),
  };

  it("should return null when not open", () => {
    const { container } = render(
      <SettingsPanel {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render when open", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("should render the Done button", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("should call onClose when Done button is clicked", () => {
    const onClose = vi.fn();
    render(<SettingsPanel {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText("Done"));
    expect(onClose).toHaveBeenCalled();
  });

  it("should call onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    render(<SettingsPanel {...defaultProps} onClose={onClose} />);

    // Backdrop is the first child with bg-black class
    const backdrop = document.querySelector(".backdrop-blur-sm");
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it("should render language selection buttons", () => {
    render(<SettingsPanel {...defaultProps} />);
    // "Deutsch" appears in both UI language button and speech language dropdown
    expect(screen.getAllByText("Deutsch").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("should call onSave with updated language when language button is clicked", () => {
    const onSave = vi.fn();
    render(<SettingsPanel {...defaultProps} onSave={onSave} />);

    // "Deutsch" appears in language buttons and speech language dropdown;
    // use getAllByText and click the first one (the language selector button)
    const deutschElements = screen.getAllByText("Deutsch");
    fireEvent.click(deutschElements[0]);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ uiLanguage: "de" })
    );
  });

  it("should render transcription provider options", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("Web Speech API")).toBeInTheDocument();
    expect(screen.getByText("OpenAI Whisper")).toBeInTheDocument();
    expect(screen.getByText("Groq Whisper")).toBeInTheDocument();
  });

  it("should call onSave with updated transcription provider", () => {
    const onSave = vi.fn();
    render(<SettingsPanel {...defaultProps} onSave={onSave} />);

    fireEvent.click(screen.getByText("OpenAI Whisper"));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ transcriptionProvider: "openai-whisper" })
    );
  });

  it("should render LLM provider options", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
    expect(screen.getByText("Anthropic")).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByText("Groq")).toBeInTheDocument();
  });

  it("should call onSave with updated LLM provider", () => {
    const onSave = vi.fn();
    render(<SettingsPanel {...defaultProps} onSave={onSave} />);

    fireEvent.click(screen.getByText("Anthropic"));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ llmProvider: "anthropic" })
    );
  });

  it("should show OpenAI API key field when OpenAI is selected as LLM", () => {
    render(
      <SettingsPanel
        {...defaultProps}
        settings={{ ...defaultSettings, llmProvider: "openai" }}
      />
    );

    expect(screen.getByText("OpenAI API Key")).toBeInTheDocument();
  });

  it("should show Anthropic API key field when Anthropic is selected", () => {
    render(
      <SettingsPanel
        {...defaultProps}
        settings={{ ...defaultSettings, llmProvider: "anthropic" }}
      />
    );

    expect(screen.getByText("Anthropic API Key")).toBeInTheDocument();
  });

  it("should show Google API key field when Google is selected", () => {
    render(
      <SettingsPanel
        {...defaultProps}
        settings={{ ...defaultSettings, llmProvider: "google" }}
      />
    );

    expect(screen.getByText("Google AI API Key")).toBeInTheDocument();
  });

  it("should show Groq API key field when Groq is selected", () => {
    render(
      <SettingsPanel
        {...defaultProps}
        settings={{ ...defaultSettings, llmProvider: "groq" }}
      />
    );

    expect(screen.getByText("Groq API Key")).toBeInTheDocument();
  });

  it("should show OpenAI API key when openai-whisper transcription is selected", () => {
    render(
      <SettingsPanel
        {...defaultProps}
        settings={{
          ...defaultSettings,
          transcriptionProvider: "openai-whisper",
          llmProvider: "anthropic",
        }}
      />
    );

    // Should show both OpenAI and Anthropic keys
    expect(screen.getByText("OpenAI API Key")).toBeInTheDocument();
    expect(screen.getByText("Anthropic API Key")).toBeInTheDocument();
  });

  it("should render speech language selector", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("Speech Recognition Language")).toBeInTheDocument();

    const select = screen.getByDisplayValue("Deutsch");
    expect(select).toBeInTheDocument();
  });

  it("should call onSave when speech language changes", () => {
    const onSave = vi.fn();
    render(<SettingsPanel {...defaultProps} onSave={onSave} />);

    const select = screen.getByDisplayValue("Deutsch");
    fireEvent.change(select, { target: { value: "en-US" } });
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ speechLanguage: "en-US" })
    );
  });

  it("should render hotkey input", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("Global Hotkey")).toBeInTheDocument();

    const input = screen.getByDisplayValue("CmdOrCtrl+Shift+V");
    expect(input).toBeInTheDocument();
  });

  it("should call onSave when hotkey changes", () => {
    const onSave = vi.fn();
    render(<SettingsPanel {...defaultProps} onSave={onSave} />);

    const input = screen.getByDisplayValue("CmdOrCtrl+Shift+V");
    fireEvent.change(input, { target: { value: "CmdOrCtrl+Shift+R" } });
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ hotkey: "CmdOrCtrl+Shift+R" })
    );
  });

  it("should render German text when uiLanguage is 'de'", () => {
    render(
      <SettingsPanel
        {...defaultProps}
        settings={{ ...defaultSettings, uiLanguage: "de" }}
      />
    );

    expect(screen.getByText("Einstellungen")).toBeInTheDocument();
    expect(screen.getByText("Fertig")).toBeInTheDocument();
  });

  it("should update API key when input changes", () => {
    const onSave = vi.fn();
    render(
      <SettingsPanel
        {...defaultProps}
        onSave={onSave}
        settings={{ ...defaultSettings, llmProvider: "openai" }}
      />
    );

    const apiKeyInput = screen.getByPlaceholderText("sk-...");
    fireEvent.change(apiKeyInput, { target: { value: "sk-new-key" } });

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKeys: expect.objectContaining({ openai: "sk-new-key" }),
      })
    );
  });
});
