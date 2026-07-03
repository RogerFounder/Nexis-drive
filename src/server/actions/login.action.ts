"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@/server/validators/login.schema";
import { getAdminByEmail } from "@/server/db/repositories/admin.repository";
import { verifyPassword } from "@/server/services/auth/password";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/server/services/auth/session";

// A fixed, valid-format hash (of an arbitrary string nobody will ever enter)
// so an unknown email still runs a real scrypt comparison — login timing
// never reveals whether an account exists.
const DUMMY_HASH =
  "48f4a625b54e624e272db0b85380e050:dd28aa1272c8a279f3506d974cfd921651fda6087c80a55fb0f683dc6555c2a1bfc4210e5cf5e4495895ce60ab83dc77cf9edf27a1e20a9bfa88e32751a39e64";

export interface LoginActionState {
  success: boolean;
  formError?: string;
}

function resolveRedirectTarget(value: FormDataEntryValue | null): string {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/dashboard";
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, formError: "Informe um e-mail e senha válidos." };
  }

  const admin = await getAdminByEmail(parsed.data.email);
  const passwordMatches = await verifyPassword(parsed.data.password, admin?.passwordHash ?? DUMMY_HASH);

  if (!admin || !passwordMatches) {
    return { success: false, formError: "E-mail ou senha inválidos." };
  }

  const token = await createSessionToken({ adminId: admin.id, email: admin.email });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });

  redirect(resolveRedirectTarget(formData.get("redirectTo")));
}
