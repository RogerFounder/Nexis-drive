"use client";

import { useActionState } from "react";
import { FormCard } from "@/components/ui/form-card";
import { FormAlert } from "@/components/ui/form-alert";
import { TextField } from "@/components/ui/text-field";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  initiateCheckoutAction,
  type InitiateCheckoutState,
} from "@/server/actions/initiate-checkout.action";
import { UTM_PARAM_NAMES, type UtmParams } from "@/lib/utm";

const INITIAL_STATE: InitiateCheckoutState = { success: false };

interface CheckoutFormProps {
  planType: "MENSAL" | "VITALICIO";
  planLabel: string;
  utm: UtmParams;
}

export function CheckoutForm({ planType, planLabel, utm }: CheckoutFormProps) {
  const [state, formAction] = useActionState(initiateCheckoutAction, INITIAL_STATE);

  return (
    <FormCard>
      <form action={formAction} noValidate className="flex flex-col gap-6">
        <input type="hidden" name="planType" value={planType} />
        {UTM_PARAM_NAMES.map(
          (name) => utm[name] && <input key={name} type="hidden" name={name} value={utm[name]} />
        )}

        <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-3">
          <p className="text-xs text-zinc-500">Plano selecionado</p>
          <p className="mt-0.5 text-sm font-medium text-zinc-100">{planLabel}</p>
        </div>

        {state.formError && <FormAlert variant="error">{state.formError}</FormAlert>}

        <div className="flex flex-col gap-5">
          <TextField
            id="owner-name"
            name="ownerName"
            type="text"
            label="Nome completo"
            placeholder="João da Silva"
            autoComplete="name"
            required
            error={state.fieldErrors?.ownerName ? [state.fieldErrors.ownerName] : undefined}
          />
          <TextField
            id="email"
            name="email"
            type="email"
            label="E-mail"
            placeholder="joao@empresa.com"
            autoComplete="email"
            required
            error={state.fieldErrors?.email ? [state.fieldErrors.email] : undefined}
          />
          <TextField
            id="cpf-cnpj"
            name="cpfCnpj"
            type="text"
            label="CPF ou CNPJ"
            placeholder="000.000.000-00"
            autoComplete="off"
            required
            error={state.fieldErrors?.cpfCnpj ? [state.fieldErrors.cpfCnpj] : undefined}
          />
        </div>

        <SubmitButton pendingLabel="Redirecionando para o pagamento…">
          Ir para o pagamento
        </SubmitButton>
      </form>
    </FormCard>
  );
}
