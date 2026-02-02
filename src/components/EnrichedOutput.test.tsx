import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EnrichedOutput from "./EnrichedOutput";

describe("EnrichedOutput", () => {
  const defaultProps = {
    content: "",
    isProcessing: false,
    onCopy: vi.fn(),
    lang: "en" as const,
  };

  it("should return null when no content and not processing", () => {
    const { container } = render(<EnrichedOutput {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render when content is present", () => {
    render(
      <EnrichedOutput {...defaultProps} content="Some enriched content" />
    );
    expect(screen.getByText("Enriched Output")).toBeInTheDocument();
  });

  it("should render when isProcessing is true even without content", () => {
    render(
      <EnrichedOutput {...defaultProps} isProcessing={true} />
    );
    expect(screen.getByText("Enriched Output")).toBeInTheDocument();
  });

  it("should show processing animation when processing without content", () => {
    render(
      <EnrichedOutput {...defaultProps} isProcessing={true} />
    );
    expect(
      screen.getByText("AI is processing your transcript...")
    ).toBeInTheDocument();
  });

  it("should show processing indicator in header while processing", () => {
    render(
      <EnrichedOutput
        {...defaultProps}
        content="content"
        isProcessing={true}
      />
    );
    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("should show copy button when content is present", () => {
    render(
      <EnrichedOutput {...defaultProps} content="Some content" />
    );
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("should not show copy button when no content", () => {
    render(
      <EnrichedOutput {...defaultProps} isProcessing={true} />
    );
    expect(screen.queryByText("Copy")).not.toBeInTheDocument();
  });

  it("should call onCopy and show 'Copied!' when copy button is clicked", () => {
    const onCopy = vi.fn();
    render(
      <EnrichedOutput {...defaultProps} content="Content to copy" onCopy={onCopy} />
    );

    fireEvent.click(screen.getByText("Copy"));
    expect(onCopy).toHaveBeenCalled();
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });

  it("should render markdown content as HTML", () => {
    render(
      <EnrichedOutput
        {...defaultProps}
        content="**bold text** and *italic text*"
      />
    );

    const outputDiv = document.querySelector(".enriched-output");
    expect(outputDiv).toBeTruthy();
    expect(outputDiv!.innerHTML).toContain("<strong>bold text</strong>");
    expect(outputDiv!.innerHTML).toContain("<em>italic text</em>");
  });

  it("should render headers in markdown", () => {
    render(
      <EnrichedOutput {...defaultProps} content="## Heading Two" />
    );

    const outputDiv = document.querySelector(".enriched-output");
    expect(outputDiv!.innerHTML).toContain("<h2>Heading Two</h2>");
  });

  it("should render list items in markdown", () => {
    render(
      <EnrichedOutput {...defaultProps} content={"- Item 1\n- Item 2"} />
    );

    const outputDiv = document.querySelector(".enriched-output");
    expect(outputDiv!.innerHTML).toContain("<li>");
    expect(outputDiv!.innerHTML).toContain("Item 1");
    expect(outputDiv!.innerHTML).toContain("Item 2");
  });

  it("should render checkbox items", () => {
    render(
      <EnrichedOutput
        {...defaultProps}
        content="- [ ] Unchecked\n- [x] Checked"
      />
    );

    const outputDiv = document.querySelector(".enriched-output");
    expect(outputDiv!.innerHTML).toContain('type="checkbox"');
    expect(outputDiv!.innerHTML).toContain("checked");
  });

  it("should render inline code", () => {
    render(
      <EnrichedOutput {...defaultProps} content="Use `console.log`" />
    );

    const outputDiv = document.querySelector(".enriched-output");
    expect(outputDiv!.innerHTML).toContain("<code>console.log</code>");
  });

  it("should render German text when lang is 'de'", () => {
    render(
      <EnrichedOutput {...defaultProps} lang="de" content="Content" />
    );

    expect(screen.getByText("KI-Ergebnis")).toBeInTheDocument();
    expect(screen.getByText("Kopieren")).toBeInTheDocument();
  });
});
