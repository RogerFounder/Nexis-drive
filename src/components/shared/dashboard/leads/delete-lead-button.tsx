"use client";

import { useActionState } from "react";
import { deleteLeadAction, type DeleteLeadState } from "@/server/actions/delete-lead.action";
import { FormAlert } from "@/components/ui/form-alert";

const INITIAL_STATE: DeleteLeadState = {};

interface DeleteLeadButtonProps {
  leadId: string;
  leadNome: string;
}

export function DeleteLeadButton({ leadId, leadNome }: DeleteLeadButtonProps) {
  const boundAction = deleteLeadAction.bind(null, leadId);
  const [state, formAction] = useActionState(boundAction, INITIAL_STATE);

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 dark:border-red-500/20 dark:bg-red-500/5">
      <h2 className="text-sm font-semibold text-red-900 dark:text-red-300">
        Excluir dados deste cliente
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-red-800/80 dark:text-red-300/70">
        Use isso para atender a um pedido de exclusão de dados (LGPD). Remove permanentemente o
        lead de {leadNome} e qualquer laudo técnico associado — não pode ser desfeito.
      </p>
      {state.formError && (
        <div className="mt-3">
          <FormAlert variant="error">{state.formError}</FormAlert>
        </div>
      )}
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!confirm(`Excluir permanentemente os dados de ${leadNome}? Essa ação não pode ser desfeita.`)) {
            event.preventDefault();
          }
        }}
        className="mt-4"
      >
        <button
          type="submit"
          className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-100 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
        >
          Excluir dados permanentemente
        </button>
      </form>
    </div>
  );
}
