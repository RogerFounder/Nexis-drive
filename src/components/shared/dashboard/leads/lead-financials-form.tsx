"use client";

import { useActionState } from "react";
import {
  updateLeadFinancialsAction,
  type UpdateLeadFinancialsState,
} from "@/server/actions/update-lead-financials.action";
import { TextField } from "@/components/ui/text-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormAlert } from "@/components/ui/form-alert";
import { PAYMENT_STATUS_LABELS } from "@/components/ui/payment-status-badge";
import { getFieldControlClassName, getFieldLabelClassName } from "@/components/ui/field-styles";
import type { StatusPagamento } from "@/generated/prisma/client";

const INITIAL_STATE: UpdateLeadFinancialsState = { success: false };

const PAYMENT_STATUS_OPTIONS: readonly StatusPagamento[] = ["PENDENTE", "PAGO"];

interface LeadFinancialsFormProps {
  leadId: string;
  valorServico: number | null;
  statusPagamento: StatusPagamento;
}

export function LeadFinancialsForm({
  leadId,
  valorServico,
  statusPagamento,
}: LeadFinancialsFormProps) {
  const boundAction = updateLeadFinancialsAction.bind(null, leadId);
  const [state, formAction] = useActionState(boundAction, INITIAL_STATE);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.success && <FormAlert variant="success">Dados financeiros atualizados.</FormAlert>}
      {state.formError && <FormAlert variant="error">{state.formError}</FormAlert>}

      <TextField
        id="valorServico"
        name="valorServico"
        type="number"
        step="0.01"
        min="0"
        label="Valor do serviço (R$)"
        placeholder="0,00"
        defaultValue={valorServico ?? ""}
        error={state.fieldErrors?.valorServico}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="statusPagamento" className={getFieldLabelClassName()}>
          Status de pagamento
        </label>
        <select
          id="statusPagamento"
          name="statusPagamento"
          defaultValue={statusPagamento}
          className={getFieldControlClassName(Boolean(state.fieldErrors?.statusPagamento))}
        >
          {PAYMENT_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status} className="bg-zinc-900 text-zinc-100">
              {PAYMENT_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <SubmitButton pendingLabel="Salvando...">Salvar dados financeiros</SubmitButton>
    </form>
  );
}
