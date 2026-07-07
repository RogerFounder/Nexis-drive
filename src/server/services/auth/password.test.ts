import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword / verifyPassword", () => {
  it("verifies the correct password against its own hash", async () => {
    const hash = await hashPassword("SenhaForte123!");
    await expect(verifyPassword("SenhaForte123!", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("SenhaForte123!");
    await expect(verifyPassword("SenhaErrada456!", hash)).resolves.toBe(false);
  });

  it("produces a different hash for the same password on each call (unique salt)", async () => {
    const hashA = await hashPassword("MesmaSenha!");
    const hashB = await hashPassword("MesmaSenha!");
    expect(hashA).not.toBe(hashB);
  });

  it("never stores the plaintext password in the hash output", async () => {
    const hash = await hashPassword("NaoDeveAparecer!");
    expect(hash).not.toContain("NaoDeveAparecer!");
  });

  it("rejects gracefully against a malformed stored hash instead of throwing", async () => {
    await expect(verifyPassword("qualquer", "hash-sem-formato-esperado")).resolves.toBe(false);
  });

  it("is case-sensitive", async () => {
    const hash = await hashPassword("SenhaCaseSensitive");
    await expect(verifyPassword("senhacasesensitive", hash)).resolves.toBe(false);
  });
});
