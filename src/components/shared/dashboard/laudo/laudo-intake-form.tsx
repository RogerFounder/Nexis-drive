"use client";

import { useActionState } from "react";
import { createLaudoAction, type CreateLaudoActionState } from "@/server/actions/create-laudo.action";
import { TextAreaField } from "@/components/ui/text-area-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormAlert } from "@/components/ui/form-alert";
import { getFieldErrorClassName } from "@/components/ui/field-styles";

const INITIAL_STATE: CreateLaudoActionState = { success: false };

interface LaudoIntakeFormProps {
  leadId: string;
  checklistItems: readonly string[];
}

export function LaudoIntakeForm({ leadId, checklistItems }: LaudoIntakeFormProps) {
  const boundAction = createLaudoAction.bind(null, leadId);
  const [state, formAction] = useActionState(boundAction, INITIAL_STATE);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      {state.formError && <FormAlert variant="error">{state.formError}</FormAlert>}

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-zinc-300">
          Condições de entrada (marque o que se aplica)
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {checklistItems.map((item) => (
            <label
              key={item}
              className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-zinc-700 bg-zinc-800/50 px-3.5 py-3 text-sm text-zinc-300 transition-colors duration-150 hover:bg-zinc-800"
            >
              <input
                type="checkbox"
                name="itensChecklist"
                value={item}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-600 text-zinc-100 focus:ring-zinc-100/20"
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        {state.fieldErrors?.itensChecklist && (
          <p role="alert" className={getFieldErrorClassName()}>
            {state.fieldErrors.itensChecklist[0]}
          </p>
        )}
      </div>

      <TextAreaField
        id="observacoesEntrada"
        name="observacoesEntrada"
        label="Observações adicionais de entrada"
        placeholder="Descreva com detalhes o estado em que o item foi recebido..."
        rows={4}
        maxLength={1000}
        showCounter
        required
        error={state.fieldErrors?.observacoesEntrada}
      />

      <SubmitButton pendingLabel="Gerando laudo...">Gerar Laudo</SubmitButton>
    </form>
  );
}
