import { randomBytes, createHash } from "node:crypto";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/** The raw token — only ever sent in the emailed link, never persisted. */
export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * SHA-256 is fine here (unlike password hashing): this token is a random
 * 256-bit value, not a low-entropy secret a human chose, so brute-forcing
 * the hash is infeasible regardless of hash speed.
 */
export function hashResetToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}
