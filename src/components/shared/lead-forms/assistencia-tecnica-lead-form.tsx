"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  submitAssistenciaTecnicaLead,
  type AssistenciaTecnicaLeadActionState,
} from "@/server/actions/assistencia-tecnica-lead.action";
import { FormCard } from "@/components/ui/form-card";
import { FormAlert } from "@/components/ui/form-alert";
import { TextField } from "@/components/ui/text-field";
import { TextAreaField } from "@/components/ui/text-area-field";
import { WhatsAppField } from "@/components/ui/whatsapp-field";
import { PrivacyConsentCheckbox } from "@/components/ui/privacy-consent-checkbox";
import { SubmitButton } from "@/components/ui/submit-button";

const INITIAL_STATE: AssistenciaTecnicaLeadActionState = { success: false };

export function AssistenciaTecnicaLeadForm() {
  const [state, formAction] = useActionState(submitAssistenciaTecnicaLead, INITIAL_STATE);
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
            Assistência Técnica Premium
          </h2>
          <p className="mt-1.5 text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            Conte o que aconteceu com o seu aparelho — respondemos pelo WhatsApp em poucos
            minutos.
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
            id="at-nome"
            name="nome"
            label="Nome completo"
            placeholder="Como podemos te chamar?"
            autoComplete="name"
            required
            error={state.fieldErrors?.nome}
          />
          <WhatsAppField
            id="at-whatsapp"
            name="whatsapp"
            label="WhatsApp"
            required
            error={state.fieldErrors?.whatsapp}
          />
          <TextField
            id="at-modelo"
            name="modeloDispositivo"
            label="Modelo do dispositivo"
            placeholder="Ex.: iPhone 14 Pro Max"
            required
            error={state.fieldErrors?.modeloDispositivo}
          />
          <TextAreaField
            id="at-descricao"
            name="descricaoProblema"
            label="Descreva o problema"
            placeholder="O que está acontecendo com o aparelho?"
            rows={4}
            required
            maxLength={1000}
            showCounter
            error={state.fieldErrors?.descricaoProblema}
          />
        </div>

        <PrivacyConsentCheckbox
          id="at-consentimento"
          name="consentimentoDados"
          error={state.fieldErrors?.consentimentoDados}
        />

        <SubmitButton pendingLabel="Enviando...">Solicitar atendimento</SubmitButton>
      </form>
    </FormCard>
  );
}
