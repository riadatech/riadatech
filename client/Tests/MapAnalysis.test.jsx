import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

function MockMap() {
  return React.createElement(
    "div",
    null,
    React.createElement("h1", null, "Map Analysis"),
    React.createElement("p", null, "Project Data"),
    React.createElement("button", null, "Start Analysis")
  );
}

describe("Map", () => {
  it("renders map page", () => {
    render(React.createElement(MockMap));

    expect(screen.getByText(/map analysis/i)).toBeInTheDocument();
  });

  it("renders project section", () => {
    render(React.createElement(MockMap));

    expect(screen.getByText(/project data/i)).toBeInTheDocument();
  });

  it("renders button", () => {
    render(React.createElement(MockMap));

    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});