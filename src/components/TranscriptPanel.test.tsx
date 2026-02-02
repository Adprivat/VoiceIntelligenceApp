import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TranscriptPanel from "./TranscriptPanel";

describe("TranscriptPanel", () => {
  const defaultProps = {
    transcript: "",
    isTranscribing: false,
    onEdit: vi.fn(),
    lang: "en" as const,
  };

  it("should return null when no transcript and not transcribing", () => {
    const { container } = render(<TranscriptPanel {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render when transcript is present", () => {
    render(
      <TranscriptPanel {...defaultProps} transcript="Hello world" />
    );

    expect(screen.getByText("Transcript")).toBeInTheDocument();
  });

  it("should render when isTranscribing is true even without transcript", () => {
    render(
      <TranscriptPanel {...defaultProps} isTranscribing={true} />
    );

    expect(screen.getByText("Transcript")).toBeInTheDocument();
    expect(screen.getByText("Transcribing...")).toBeInTheDocument();
  });

  it("should show transcribing indicator", () => {
    render(
      <TranscriptPanel
        {...defaultProps}
        transcript="Some text"
        isTranscribing={true}
      />
    );

    expect(screen.getByText("Transcribing...")).toBeInTheDocument();
  });

  it("should not show transcribing indicator when not transcribing", () => {
    render(
      <TranscriptPanel {...defaultProps} transcript="Some text" />
    );

    expect(screen.queryByText("Transcribing...")).not.toBeInTheDocument();
  });

  it("should display transcript text in textarea", () => {
    render(
      <TranscriptPanel {...defaultProps} transcript="Test transcript" />
    );

    const textarea = screen.getByDisplayValue("Test transcript");
    expect(textarea).toBeInTheDocument();
  });

  it("should call onEdit when textarea is changed", () => {
    const onEdit = vi.fn();
    render(
      <TranscriptPanel
        {...defaultProps}
        transcript="Old text"
        onEdit={onEdit}
      />
    );

    const textarea = screen.getByDisplayValue("Old text");
    fireEvent.change(textarea, { target: { value: "New text" } });
    expect(onEdit).toHaveBeenCalledWith("New text");
  });

  it("should display placeholder text", () => {
    render(
      <TranscriptPanel {...defaultProps} isTranscribing={true} />
    );

    expect(
      screen.getByPlaceholderText("Transcript will appear here...")
    ).toBeInTheDocument();
  });

  it("should render German text when lang is 'de'", () => {
    render(
      <TranscriptPanel
        {...defaultProps}
        lang="de"
        transcript="Text"
        isTranscribing={true}
      />
    );

    expect(screen.getByText("Transkript")).toBeInTheDocument();
    expect(screen.getByText("Wird transkribiert...")).toBeInTheDocument();
  });
});
