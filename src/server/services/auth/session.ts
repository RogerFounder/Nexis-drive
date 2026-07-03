import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "nexis_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  adminId: string;
  email: string;
}

function getSessionSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET não está definida. Configure-a em .env.");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Stateless JWT session, verified in src/proxy.ts (Edge runtime) — this file
 * only uses jose + Web Crypto so it stays Edge-compatible. Do not import
 * Prisma or any Node-only module here.
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSessionSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecretKey());
    if (typeof payload.adminId !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return { adminId: payload.adminId, email: payload.email };
  } catch {
    return null;
  }
}
