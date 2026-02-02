import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ModeSelector from "./ModeSelector";

describe("ModeSelector", () => {
  const defaultProps = {
    selectedMode: "smart-notes" as const,
    onModeChange: vi.fn(),
    customPrompt: "",
    onCustomPromptChange: vi.fn(),
    lang: "en" as const,
  };

  it("should render the heading", () => {
    render(<ModeSelector {...defaultProps} />);
    expect(screen.getByText("Processing Mode")).toBeInTheDocument();
  });

  it("should render all 6 enrichment modes", () => {
    render(<ModeSelector {...defaultProps} />);

    expect(screen.getByText("Smart Notes")).toBeInTheDocument();
    expect(screen.getByText("Meeting Summary")).toBeInTheDocument();
    expect(screen.getByText("Email Draft")).toBeInTheDocument();
    expect(screen.getByText("Task Extraction")).toBeInTheDocument();
    expect(screen.getByText("Translate to English")).toBeInTheDocument();
    expect(screen.getByText("Custom Prompt")).toBeInTheDocument();
  });

  it("should render mode descriptions", () => {
    render(<ModeSelector {...defaultProps} />);

    expect(
      screen.getByText("Structure spoken thoughts into organized notes")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Summarize with key decisions and action items")
    ).toBeInTheDocument();
  });

  it("should call onModeChange when a mode button is clicked", () => {
    const onModeChange = vi.fn();
    render(<ModeSelector {...defaultProps} onModeChange={onModeChange} />);

    fireEvent.click(screen.getByText("Meeting Summary"));
    expect(onModeChange).toHaveBeenCalledWith("meeting-summary");
  });

  it("should not show textarea when mode is not freeform", () => {
    render(<ModeSelector {...defaultProps} selectedMode="smart-notes" />);

    expect(
      screen.queryByPlaceholderText(
        "Enter your custom processing instructions..."
      )
    ).not.toBeInTheDocument();
  });

  it("should show textarea when freeform mode is selected", () => {
    render(<ModeSelector {...defaultProps} selectedMode="freeform" />);

    expect(
      screen.getByPlaceholderText(
        "Enter your custom processing instructions..."
      )
    ).toBeInTheDocument();
  });

  it("should call onCustomPromptChange when textarea is changed", () => {
    const onCustomPromptChange = vi.fn();
    render(
      <ModeSelector
        {...defaultProps}
        selectedMode="freeform"
        onCustomPromptChange={onCustomPromptChange}
      />
    );

    const textarea = screen.getByPlaceholderText(
      "Enter your custom processing instructions..."
    );
    fireEvent.change(textarea, { target: { value: "My custom prompt" } });
    expect(onCustomPromptChange).toHaveBeenCalledWith("My custom prompt");
  });

  it("should display custom prompt value in textarea", () => {
    render(
      <ModeSelector
        {...defaultProps}
        selectedMode="freeform"
        customPrompt="Existing prompt"
      />
    );

    const textarea = screen.getByPlaceholderText(
      "Enter your custom processing instructions..."
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe("Existing prompt");
  });

  it("should render German labels when lang is 'de'", () => {
    render(<ModeSelector {...defaultProps} lang="de" />);

    expect(screen.getByText("Verarbeitungsmodus")).toBeInTheDocument();
    expect(screen.getByText("Intelligente Notizen")).toBeInTheDocument();
    expect(screen.getByText("Meeting-Zusammenfassung")).toBeInTheDocument();
  });
});
