"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  requestPasswordResetAction,
  type RequestPasswordResetState,
} from "@/server/actions/request-password-reset.action";
import { FormCard } from "@/components/ui/form-card";
import { FormAlert } from "@/components/ui/form-alert";
import { TextField } from "@/components/ui/text-field";
import { SubmitButton } from "@/components/ui/submit-button";

const INITIAL_STATE: RequestPasswordResetState = { submitted: false };

export function RequestPasswordResetForm() {
  const [state, formAction] = useActionState(requestPasswordResetAction, INITIAL_STATE);

  return (
    <FormCard>
      {state.submitted ? (
        <div className="flex flex-col gap-4">
          <FormAlert variant="success">
            Se esse e-mail estiver cadastrado, enviamos um link de redefinição para ele. Confira
            também a caixa de spam.
          </FormAlert>
          <Link
            href="/login"
            className="text-center text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Voltar ao login
          </Link>
        </div>
      ) : (
        <form action={formAction} noValidate className="flex flex-col gap-6">
          {state.formError && <FormAlert variant="error">{state.formError}</FormAlert>}

          <TextField
            id="reset-email"
            name="email"
            type="email"
            label="E-mail"
            placeholder="voce@empresa.com"
            autoComplete="email"
            required
            error={state.fieldErrors?.email}
          />

          <SubmitButton pendingLabel="Enviando...">Enviar link de redefinição</SubmitButton>

          <Link
            href="/login"
            className="text-center text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Voltar ao login
          </Link>
        </form>
      )}
    </FormCard>
  );
}
