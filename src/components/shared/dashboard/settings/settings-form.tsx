"use client";

import { useActionState, useState } from "react";
import {
  updateSettingsAction,
  type UpdateSettingsActionState,
} from "@/server/actions/update-settings.action";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { getFieldErrorClassName } from "@/components/ui/field-styles";
import type { Vertical } from "@/config/verticals";
import type { MotorServiceMode } from "@/generated/prisma/client";

const MOTOR_MODE_OPTIONS: { value: MotorServiceMode; label: string; description: string }[] = [
  { value: "ESTETICA", label: "Estética", description: "Polimento, higienização, itens cosméticos." },
  { value: "OFICINA", label: "Oficina", description: "Manutenção mecânica, reparos." },
  { value: "AMBOS", label: "Ambos", description: "Atende estética e oficina no mesmo negócio." },
];

const INITIAL_STATE: UpdateSettingsActionState = { success: false };

interface SettingsFormProps {
  vertical: Vertical;
  initialMotorServiceMode: MotorServiceMode | null;
  initialChecklistItems: readonly string[];
}

export function SettingsForm({
  vertical,
  initialMotorServiceMode,
  initialChecklistItems,
}: SettingsFormProps) {
  const [state, formAction] = useActionState(updateSettingsAction, INITIAL_STATE);
  const [motorServiceMode, setMotorServiceMode] = useState<MotorServiceMode | null>(
    initialMotorServiceMode
  );
  const [items, setItems] = useState<string[]>(
    initialChecklistItems.length > 0 ? [...initialChecklistItems] : [""]
  );

  function updateItem(index: number, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  function addItem() {
    if (items.length >= 20) return;
    setItems((prev) => [...prev, ""]);
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {state.success && <FormAlert variant="success">Configurações salvas.</FormAlert>}
      {state.formError && <FormAlert variant="error">{state.formError}</FormAlert>}

      {vertical === "estetica" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Quais serviços seu negócio oferece?
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {MOTOR_MODE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer flex-col gap-1 rounded-xl border px-3.5 py-3 text-sm transition-colors duration-150 ${
                  motorServiceMode === option.value
                    ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800"
                    : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50"
                }`}
              >
                <span className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-50">
                  <input
                    type="radio"
                    name="motorServiceMode"
                    value={option.value}
                    checked={motorServiceMode === option.value}
                    onChange={() => setMotorServiceMode(option.value)}
                    className="h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-900/20 dark:border-zinc-600"
                  />
                  {option.label}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {option.description}
                </span>
              </label>
            ))}
          </div>
          {state.fieldErrors?.motorServiceMode && (
            <p role="alert" className={getFieldErrorClassName()}>
              {state.fieldErrors.motorServiceMode[0]}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Itens do checklist do laudo
          </p>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            Essas são as opções que aparecem na hora de gerar um laudo técnico. Ajuste como preferir.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                name="checklistItems"
                value={item}
                maxLength={80}
                onChange={(event) => updateItem(index, event.target.value)}
                placeholder="Ex.: Riscos ou marcas na pintura"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length <= 1}
                className="shrink-0 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-400 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                Remover
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          disabled={items.length >= 20}
          className="self-start rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200 transition-colors duration-150 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
        >
          + Adicionar item
        </button>

        {state.fieldErrors?.checklistItems && (
          <p role="alert" className={getFieldErrorClassName()}>
            {state.fieldErrors.checklistItems[0]}
          </p>
        )}
      </div>

      <SubmitButton pendingLabel="Salvando...">Salvar configurações</SubmitButton>
    </form>
  );
}
