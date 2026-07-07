import { describe, expect, it } from "vitest";
import { nomeCompletoSchema, whatsappSchema, sanitizedTextSchema } from "./common.schema";

describe("nomeCompletoSchema", () => {
  it("accepts a normal full name", () => {
    expect(nomeCompletoSchema.parse("Maria da Silva")).toBe("Maria da Silva");
  });

  it("accepts accented letters and common name punctuation", () => {
    expect(nomeCompletoSchema.parse("José O'Brien-Souza")).toBe("José O'Brien-Souza");
  });

  it("trims surrounding whitespace", () => {
    expect(nomeCompletoSchema.parse("  Ana Lima  ")).toBe("Ana Lima");
  });

  it("rejects names shorter than 3 characters", () => {
    expect(() => nomeCompletoSchema.parse("Jo")).toThrow();
  });

  it("rejects digits", () => {
    expect(() => nomeCompletoSchema.parse("Jo4o Silva")).toThrow();
  });

  it("rejects HTML/script injection attempts", () => {
    expect(() => nomeCompletoSchema.parse("<script>alert(1)</script>")).toThrow();
  });
});

describe("whatsappSchema", () => {
  it("normalizes a local DDD number to E.164 with +55", () => {
    expect(whatsappSchema.parse("(11) 98765-4321")).toBe("+5511987654321");
  });

  it("normalizes a number already prefixed with +55", () => {
    expect(whatsappSchema.parse("+55 11 98765-4321")).toBe("+5511987654321");
  });

  it("normalizes a number prefixed with 55 but no plus", () => {
    expect(whatsappSchema.parse("5511987654321")).toBe("+5511987654321");
  });

  it("accepts numbers without the leading 9", () => {
    expect(whatsappSchema.parse("(11) 8765-4321")).toBe("+551187654321");
  });

  it("rejects obviously invalid input", () => {
    expect(() => whatsappSchema.parse("abc")).toThrow();
  });

  it("rejects a number that's too short", () => {
    expect(() => whatsappSchema.parse("123")).toThrow();
  });
});

describe("sanitizedTextSchema", () => {
  const schema = sanitizedTextSchema({ min: 5, max: 100, fieldLabel: "O campo" });

  it("accepts text within bounds", () => {
    expect(schema.parse("Texto válido")).toBe("Texto válido");
  });

  it("rejects text shorter than the minimum", () => {
    expect(() => schema.parse("oi")).toThrow();
  });

  it("rejects text longer than the maximum", () => {
    expect(() => schema.parse("a".repeat(101))).toThrow();
  });

  it("rejects angle brackets (HTML/script injection) within otherwise valid length", () => {
    expect(() => schema.parse("<script>bad</script>")).toThrow();
  });

  it("rejects backticks", () => {
    expect(() => schema.parse("valor `malicioso`")).toThrow();
  });

  it("allows common punctuation used in real descriptions", () => {
    expect(schema.parse("Tela trincada, não liga (bateria?)")).toBe(
      "Tela trincada, não liga (bateria?)"
    );
  });
});
