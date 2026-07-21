"use client";

import { useActionState } from "react";
import { FormCard } from "@/components/ui/form-card";
import { FormAlert } from "@/components/ui/form-alert";
import { TextField } from "@/components/ui/text-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { submitProvisioningAction, type SubmitProvisioningState } from "@/server/actions/submit-provisioning.action";

const INITIAL_STATE: SubmitProvisioningState = { success: false };

interface PostPaymentFormProps {
  sessionToken: string;
}

export function PostPaymentForm({ sessionToken }: PostPaymentFormProps) {
  const [state, formAction] = useActionState(submitProvisioningAction, INITIAL_STATE);

  return (
    <FormCard>
      <form action={formAction} noValidate className="flex flex-col gap-6">
        <input type="hidden" name="sessionToken" value={sessionToken} />

        {state.formError && <FormAlert variant="error">{state.formError}</FormAlert>}

        <div className="flex flex-col gap-5">
          <TextField
            id="client-name"
            name="clientName"
            type="text"
            label="Nome do negócio"
            placeholder="Oficina do João"
            autoComplete="organization"
            required
            error={state.fieldErrors?.clientName ? [state.fieldErrors.clientName] : undefined}
          />

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-zinc-300">Área de atuação</legend>
            {state.fieldErrors?.vertical && (
              <p className="text-xs text-red-400">{state.fieldErrors.vertical}</p>
            )}
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-3 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-500/10">
              <input
                type="radio"
                name="vertical"
                value="assistencia"
                className="accent-blue-500"
              />
              <span className="text-sm text-zinc-200">Assistência técnica (celulares, eletrônicos)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-3 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-500/10">
              <input
                type="radio"
                name="vertical"
                value="estetica"
                className="accent-blue-500"
              />
              <span className="text-sm text-zinc-200">Estética automotiva / oficina mecânica</span>
            </label>
          </fieldset>
        </div>

        <SubmitButton pendingLabel="Configurando seu painel…">
          Confirmar e criar meu painel
        </SubmitButton>
      </form>
    </FormCard>
  );
}
