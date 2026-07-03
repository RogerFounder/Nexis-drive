"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  submitEsteticaMotoresLead,
  type EsteticaMotoresLeadActionState,
} from "@/server/actions/estetica-motores-lead.action";
import { FormCard } from "@/components/ui/form-card";
import { FormAlert } from "@/components/ui/form-alert";
import { TextField } from "@/components/ui/text-field";
import { TextAreaField } from "@/components/ui/text-area-field";
import { WhatsAppField } from "@/components/ui/whatsapp-field";
import { SubmitButton } from "@/components/ui/submit-button";

const INITIAL_STATE: EsteticaMotoresLeadActionState = { success: false };

export function EsteticaMotoresLeadForm() {
  const [state, formAction] = useActionState(submitEsteticaMotoresLead, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success, state.leadId]);

  return (
    <FormCard>
      <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-6">
        <header>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Estética e Manutenção de Motores
          </h2>
          <p className="mt-1.5 text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            Diga o que o seu veículo precisa — montamos um orçamento e falamos com você pelo
            WhatsApp.
          </p>
        </header>

        {state.success && (
          <FormAlert variant="success">
            Solicitação recebida! Nossa equipe entrará em contato pelo WhatsApp em breve.
          </FormAlert>
        )}
        {state.formError && <FormAlert variant="error">{state.formError}</FormAlert>}

        <div className="flex flex-col gap-5">
          <TextField
            id="em-nome"
            name="nome"
            label="Nome completo"
            placeholder="Como podemos te chamar?"
            autoComplete="name"
            required
            error={state.fieldErrors?.nome}
          />
          <WhatsAppField
            id="em-whatsapp"
            name="whatsapp"
            label="WhatsApp"
            required
            error={state.fieldErrors?.whatsapp}
          />
          <TextField
            id="em-veiculo"
            name="veiculo"
            label="Marca e modelo do veículo"
            placeholder="Ex.: Honda Civic 2020"
            required
            error={state.fieldErrors?.veiculo}
          />
          <TextAreaField
            id="em-servico"
            name="servicoDesejado"
            label="Serviço desejado"
            placeholder="O que você gostaria de fazer no veículo?"
            rows={4}
            required
            maxLength={500}
            showCounter
            error={state.fieldErrors?.servicoDesejado}
          />
        </div>

        <SubmitButton pendingLabel="Enviando...">Solicitar orçamento</SubmitButton>
      </form>
    </FormCard>
  );
}
