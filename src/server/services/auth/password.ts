import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Always runs the same scrypt work whether the stored hash is real or a
 * dummy placeholder — callers should pass a fixed dummy hash when no account
 * exists, so login timing never reveals whether an email is registered.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hashHex] = storedHash.split(":");
  if (!salt || !hashHex) return false;

  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  const storedKeyBuffer = Buffer.from(hashHex, "hex");
  if (storedKeyBuffer.length !== derivedKey.length) return false;

  return timingSafeEqual(storedKeyBuffer, derivedKey);
}
