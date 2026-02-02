import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Titlebar from "./Titlebar";

describe("Titlebar", () => {
  it("should render the app title", () => {
    render(<Titlebar />);
    expect(screen.getByText("Voice Intelligence")).toBeInTheDocument();
  });

  it("should not show window controls in non-Tauri environment", () => {
    // By default, __TAURI__ is not in window
    render(<Titlebar />);

    // Should have the title but no minimize/maximize/close buttons
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(0);
  });

  it("should render the microphone icon", () => {
    render(<Titlebar />);

    const svg = document.querySelector("svg");
    expect(svg).toBeTruthy();
  });
});
