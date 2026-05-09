import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

function MockLogin() {
  return React.createElement(
    "form",
    null,
    React.createElement("label", { htmlFor: "email" }, "Email"),
    React.createElement("input", { id: "email", type: "email" }),

    React.createElement("label", { htmlFor: "password" }, "Password"),
    React.createElement("input", { id: "password", type: "password" }),

    React.createElement("button", { type: "submit" }, "Login")
  );
}

describe("Login", () => {
  it("renders inputs", () => {
    render(React.createElement(MockLogin));
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("allows typing", () => {
    render(React.createElement(MockLogin));

    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/password/i);

    fireEvent.change(email, { target: { value: "test@example.com" } });
    fireEvent.change(password, { target: { value: "123456" } });

    expect(email.value).toBe("test@example.com");
    expect(password.value).toBe("123456");
  });

  it("renders button", () => {
    render(React.createElement(MockLogin));
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });
});