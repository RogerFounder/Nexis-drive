"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type LoginActionState } from "@/server/actions/login.action";
import { FormCard } from "@/components/ui/form-card";
import { FormAlert } from "@/components/ui/form-alert";
import { TextField } from "@/components/ui/text-field";
import { SubmitButton } from "@/components/ui/submit-button";

const INITIAL_STATE: LoginActionState = { success: false };

interface LoginFormProps {
  redirectTo?: string;
  resetSuccess?: boolean;
}

export function LoginForm({ redirectTo, resetSuccess }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, INITIAL_STATE);

  return (
    <FormCard>
      <form action={formAction} noValidate className="flex flex-col gap-6">
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

        {resetSuccess && (
          <FormAlert variant="success">
            Senha redefinida com sucesso. Entre com sua nova senha.
          </FormAlert>
        )}
        {state.formError && <FormAlert variant="error">{state.formError}</FormAlert>}

        <div className="flex flex-col gap-5">
          <TextField
            id="login-email"
            name="email"
            type="email"
            label="E-mail"
            placeholder="voce@empresa.com"
            autoComplete="email"
            required
          />
          <TextField
            id="login-password"
            name="password"
            type="password"
            label="Senha"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        <SubmitButton pendingLabel="Entrando...">Entrar</SubmitButton>

        <Link
          href="/esqueci-senha"
          className="text-center text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-100"
        >
          Esqueci minha senha
        </Link>
      </form>
    </FormCard>
  );
}
