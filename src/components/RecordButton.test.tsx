import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RecordButton from "./RecordButton";

describe("RecordButton", () => {
  const defaultProps = {
    isRecording: false,
    isPaused: false,
    audioLevel: 0,
    duration: 0,
    onStart: vi.fn(),
    onStop: vi.fn(),
    onPause: vi.fn(),
    lang: "en" as const,
    hotkey: "CmdOrCtrl+Shift+V",
  };

  it("should render the record button", () => {
    render(<RecordButton {...defaultProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should show hotkey hint when not recording", () => {
    render(<RecordButton {...defaultProps} />);
    expect(screen.getByText("Click to record or press")).toBeInTheDocument();
    expect(screen.getByText("Ctrl+Shift+V")).toBeInTheDocument();
  });

  it("should format CmdOrCtrl as Ctrl in hotkey display", () => {
    render(<RecordButton {...defaultProps} hotkey="CmdOrCtrl+Shift+V" />);
    expect(screen.getByText("Ctrl+Shift+V")).toBeInTheDocument();
  });

  it("should call onStart when record button is clicked and not recording", () => {
    const onStart = vi.fn();
    render(<RecordButton {...defaultProps} onStart={onStart} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onStart).toHaveBeenCalled();
  });

  it("should call onStop when record button is clicked and recording", () => {
    const onStop = vi.fn();
    render(
      <RecordButton {...defaultProps} isRecording={true} onStop={onStop} />
    );

    const buttons = screen.getAllByRole("button");
    // First button is the main record/stop button
    fireEvent.click(buttons[0]);
    expect(onStop).toHaveBeenCalled();
  });

  it("should show duration and pause button when recording", () => {
    render(
      <RecordButton
        {...defaultProps}
        isRecording={true}
        duration={65}
      />
    );

    expect(screen.getByText("01:05")).toBeInTheDocument();
  });

  it("should format duration correctly", () => {
    render(
      <RecordButton
        {...defaultProps}
        isRecording={true}
        duration={125}
      />
    );

    expect(screen.getByText("02:05")).toBeInTheDocument();
  });

  it("should format zero duration correctly", () => {
    render(
      <RecordButton
        {...defaultProps}
        isRecording={true}
        duration={0}
      />
    );

    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("should call onPause when pause button is clicked", () => {
    const onPause = vi.fn();
    render(
      <RecordButton
        {...defaultProps}
        isRecording={true}
        onPause={onPause}
      />
    );

    // Pause button is the second button
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);
    expect(onPause).toHaveBeenCalled();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<RecordButton {...defaultProps} disabled={true} />);

    const button = screen.getAllByRole("button")[0];
    expect(button).toBeDisabled();
  });

  it("should not show hotkey hint when recording", () => {
    render(<RecordButton {...defaultProps} isRecording={true} />);
    expect(
      screen.queryByText("Click to record or press")
    ).not.toBeInTheDocument();
  });

  it("should render German text when lang is 'de'", () => {
    render(<RecordButton {...defaultProps} lang="de" />);
    // Text is split across elements due to <kbd> tag inline
    expect(
      screen.getByText(/Klicken zum Aufnehmen oder/)
    ).toBeInTheDocument();
  });
});
