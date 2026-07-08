import { describe, expect, it } from "vitest";
import { generateResetToken, hashResetToken } from "./password-reset-token";

describe("generateResetToken", () => {
  it("generates a 64-character hex string (256 bits)", () => {
    const token = generateResetToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("generates a different token on each call", () => {
    expect(generateResetToken()).not.toBe(generateResetToken());
  });
});

describe("hashResetToken", () => {
  it("is deterministic for the same input", () => {
    const token = generateResetToken();
    expect(hashResetToken(token)).toBe(hashResetToken(token));
  });

  it("produces different hashes for different tokens", () => {
    expect(hashResetToken(generateResetToken())).not.toBe(hashResetToken(generateResetToken()));
  });

  it("never returns the raw token as its own hash", () => {
    const token = generateResetToken();
    expect(hashResetToken(token)).not.toBe(token);
  });
});
