import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(180)
    .email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe a senha.").max(200),
});
