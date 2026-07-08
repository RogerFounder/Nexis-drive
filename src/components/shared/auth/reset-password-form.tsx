"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ResetPasswordState } from "@/server/actions/reset-password.action";
import { FormCard } from "@/components/ui/form-card";
import { FormAlert } from "@/components/ui/form-alert";
import { TextField } from "@/components/ui/text-field";
import { SubmitButton } from "@/components/ui/submit-button";

const INITIAL_STATE: ResetPasswordState = {};

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const boundAction = resetPasswordAction.bind(null, token);
  const [state, formAction] = useActionState(boundAction, INITIAL_STATE);

  return (
    <FormCard>
      <form action={formAction} noValidate className="flex flex-col gap-6">
        {state.formError && <FormAlert variant="error">{state.formError}</FormAlert>}

        <TextField
          id="reset-password"
          name="password"
          type="password"
          label="Nova senha"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          hint="Pelo menos 8 caracteres."
          error={state.fieldErrors?.password}
        />
        <TextField
          id="reset-confirm-password"
          name="confirmPassword"
          type="password"
          label="Confirme a nova senha"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          error={state.fieldErrors?.confirmPassword}
        />

        <SubmitButton pendingLabel="Redefinindo...">Redefinir senha</SubmitButton>
      </form>
    </FormCard>
  );
}
