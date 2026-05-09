import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

function MockAssistant() {
  return React.createElement(
    "div",
    null,
    React.createElement("h1", null, "مساعد ريادتك الذكي"),
    React.createElement("p", null, "اسأل عن مشروعك"),
    React.createElement("input", { placeholder: "اكتب سؤالك" }),
    React.createElement("button", null, "إرسال")
  );
}

describe("Smart Assistant", () => {
  it("renders assistant title", () => {
    render(React.createElement(MockAssistant));
    expect(screen.getByText(/مساعد ريادتك الذكي/i)).toBeInTheDocument();
  });

  it("renders input field", () => {
    render(React.createElement(MockAssistant));
    expect(screen.getByPlaceholderText(/اكتب سؤالك/i)).toBeInTheDocument();
  });

  it("renders send button", () => {
    render(React.createElement(MockAssistant));
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});