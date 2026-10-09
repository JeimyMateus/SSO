/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { UsuarioModalForm } from "../usuario-modal-form";

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("UsuarioModalForm - Document and Phone Validations", () => {
  const onSaveMock = jest.fn();
  const onOpenChangeMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sanitizes document number input to allow only digits and limits to 20 characters", () => {
    render(
      <UsuarioModalForm
        open={true}
        onOpenChange={onOpenChangeMock}
        onSave={onSaveMock}
      />
    );

    const docInput = screen.getByPlaceholderText("1719874563") as HTMLInputElement;

    // Type letters and special characters mixed with numbers
    fireEvent.change(docInput, { target: { value: "171abc-9874563_extra123456789012345" } });

    // Should only contain digits, up to 20 digits
    expect(docInput.value).toBe("17198745631234567890");
    expect(docInput.value.length).toBe(20);
  });

  it("sanitizes phone input to allow leading plus and digits only, capped at 15 digits", () => {
    render(
      <UsuarioModalForm
        open={true}
        onOpenChange={onOpenChangeMock}
        onSave={onSaveMock}
      />
    );

    const phoneInput = screen.getByPlaceholderText("+593 99 123 4567") as HTMLInputElement;

    // Type invalid characters in phone field
    fireEvent.change(phoneInput, { target: { value: "+593abc 99-1234567" } });

    // Should contain + and numeric digits only
    expect(phoneInput.value).toBe("+593991234567");
  });

  it("shows an error if document has fewer than 5 digits when attempting to advance", () => {
    render(
      <UsuarioModalForm
        open={true}
        onOpenChange={onOpenChangeMock}
        onSave={onSaveMock}
      />
    );

    const docInput = screen.getByPlaceholderText("1719874563");
    const nameInput = screen.getByPlaceholderText("Ej: María Fernanda");
    const lastNameInput = screen.getByPlaceholderText("Ej: Gómez Andrade");
    const emailInput = screen.getByPlaceholderText("nombre.apellido@mineduc.gob.ec");

    // Fill valid data with document length < 5
    fireEvent.change(docInput, { target: { value: "1234" } });
    fireEvent.change(nameInput, { target: { value: "Juan" } });
    fireEvent.change(lastNameInput, { target: { value: "Perez" } });
    fireEvent.change(emailInput, { target: { value: "juan.perez@correo.com" } });

    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    fireEvent.click(nextButton);

    expect(
      screen.getByText("El número de documento debe tener entre 5 y 20 dígitos numéricos.")
    ).toBeTruthy();
  });

  it("shows an error if phone format is invalid (fewer than 7 digits)", () => {
    render(
      <UsuarioModalForm
        open={true}
        onOpenChange={onOpenChangeMock}
        onSave={onSaveMock}
      />
    );

    const docInput = screen.getByPlaceholderText("1719874563");
    const nameInput = screen.getByPlaceholderText("Ej: María Fernanda");
    const lastNameInput = screen.getByPlaceholderText("Ej: Gómez Andrade");
    const emailInput = screen.getByPlaceholderText("nombre.apellido@mineduc.gob.ec");
    const phoneInput = screen.getByPlaceholderText("+593 99 123 4567");

    fireEvent.change(docInput, { target: { value: "1719874563" } });
    fireEvent.change(nameInput, { target: { value: "Juan" } });
    fireEvent.change(lastNameInput, { target: { value: "Perez" } });
    fireEvent.change(emailInput, { target: { value: "juan.perez@correo.com" } });
    fireEvent.change(phoneInput, { target: { value: "123" } });

    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    fireEvent.click(nextButton);

    expect(
      screen.getByText("El teléfono debe tener entre 7 y 15 dígitos numéricos.")
    ).toBeTruthy();
  });
});
