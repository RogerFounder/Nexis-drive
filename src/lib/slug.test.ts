import { describe, expect, it } from "vitest";
import { toSlug } from "./slug";

describe("toSlug", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(toSlug("Oficina do João")).toBe("oficina-do-joao");
  });

  it("removes accents", () => {
    expect(toSlug("Assistência Técnica")).toBe("assistencia-tecnica");
  });

  it("collapses multiple spaces and hyphens", () => {
    expect(toSlug("  Oficina   do   João  ")).toBe("oficina-do-joao");
    expect(toSlug("moto--sport")).toBe("moto-sport");
  });

  it("removes leading and trailing hyphens", () => {
    expect(toSlug("--oficina--")).toBe("oficina");
  });

  it("removes special characters not allowed in slugs", () => {
    expect(toSlug("Oficina & Cia. Ltda!")).toBe("oficina-cia-ltda");
  });

  it("truncates to 60 characters", () => {
    const long = "a".repeat(100);
    expect(toSlug(long).length).toBeLessThanOrEqual(60);
  });

  it("returns empty string for a name that produces no valid slug chars", () => {
    expect(toSlug("!@#$%")).toBe("");
  });

  it("handles names with only numbers", () => {
    expect(toSlug("123 Oficinas")).toBe("123-oficinas");
  });
});
