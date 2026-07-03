"use client";

import { useActionState } from "react";
import { loginAction, type LoginActionState } from "@/server/actions/login.action";
import { FormCard } from "@/components/ui/form-card";
import { FormAlert } from "@/components/ui/form-alert";
import { TextField } from "@/components/ui/text-field";
import { SubmitButton } from "@/components/ui/submit-button";

const INITIAL_STATE: LoginActionState = { success: false };

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, INITIAL_STATE);

  return (
    <FormCard>
      <form action={formAction} noValidate className="flex flex-col gap-6">
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

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
      </form>
    </FormCard>
  );
}
