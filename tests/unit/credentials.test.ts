import { describe, expect, it } from "vitest";
import {
  friendlyAuthMessage,
  normalizeEmail,
  validateEmailForAuth,
  validatePasswordPresent,
} from "@/lib/auth/credentials";

describe("normalizeEmail", () => {
  it("remove espaços e passa para minúsculas", () => {
    expect(normalizeEmail("  Foo@BAR.com  ")).toBe("foo@bar.com");
  });
});

describe("validateEmailForAuth", () => {
  it("rejeita vazio", () => {
    expect(validateEmailForAuth("   ")).toBe("Indica o teu email.");
  });

  it("aceita email habitual", () => {
    expect(validateEmailForAuth("a@b.co")).toBeNull();
    expect(validateEmailForAuth("user+tag@example.com")).toBeNull();
  });

  it("rejeita formato inválido", () => {
    expect(validateEmailForAuth("sem-arroba")).toBe(
      "Indica um email com formato válido.",
    );
  });
});

describe("validatePasswordPresent", () => {
  it("rejeita vazio", () => {
    expect(validatePasswordPresent("")).toBe("Indica a palavra-passe.");
  });

  it("aceita qualquer não vazio (sem regra de complexidade)", () => {
    expect(validatePasswordPresent("x")).toBeNull();
    expect(validatePasswordPresent("::::")).toBeNull();
  });
});

describe("friendlyAuthMessage", () => {
  it("traduz credenciais inválidas", () => {
    expect(friendlyAuthMessage("Invalid login credentials")).toContain(
      "incorretos",
    );
  });

  it("preserva mensagem desconhecida", () => {
    expect(friendlyAuthMessage("Algo raro")).toBe("Algo raro");
  });
});
