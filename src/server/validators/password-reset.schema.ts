import { z } from "zod";

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().toLowerCase().min(3).max(180).email("Informe um e-mail válido."),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
      .max(200, "A senha deve ter no máximo 200 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });
