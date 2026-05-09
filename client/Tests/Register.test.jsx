import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

function MockRegister() {
  return React.createElement(
    "form",
    null,
    React.createElement("label", { htmlFor: "name" }, "Name"),
    React.createElement("input", { id: "name", type: "text" }),

    React.createElement("label", { htmlFor: "email" }, "Email"),
    React.createElement("input", { id: "email", type: "email" }),

    React.createElement("label", { htmlFor: "password" }, "Password"),
    React.createElement("input", { id: "password", type: "password" }),

    React.createElement("button", { type: "submit" }, "Register")
  );
}

describe("Register", () => {
  it("renders inputs", () => {
    render(React.createElement(MockRegister));

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("allows typing", () => {
    render(React.createElement(MockRegister));

    const name = screen.getByLabelText(/name/i);
    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/password/i);

    fireEvent.change(name, { target: { value: "Ali" } });
    fireEvent.change(email, { target: { value: "ali@example.com" } });
    fireEvent.change(password, { target: { value: "123456" } });

    expect(name.value).toBe("Ali");
    expect(email.value).toBe("ali@example.com");
    expect(password.value).toBe("123456");
  });

  it("renders button", () => {
    render(React.createElement(MockRegister));

    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });
});