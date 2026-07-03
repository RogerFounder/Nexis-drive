"use client";

import type { ChangeEvent } from "react";
import {
  getFieldControlClassName,
  getFieldErrorClassName,
  getFieldLabelClassName,
} from "./field-styles";

interface WhatsAppFieldProps {
  id: string;
  name: string;
  label: string;
  error?: string[];
  required?: boolean;
  defaultValue?: string;
}

function formatBrazilianPhone(rawValue: string): string {
  let digits = rawValue.replace(/\D/g, "");
  if (digits.length > 11 && digits.startsWith("55")) {
    digits = digits.slice(2);
  }
  digits = digits.slice(0, 11);

  if (digits.length === 0) return "";

  const ddd = digits.slice(0, 2);
  if (digits.length <= 2) return `(${ddd}`;

  const rest = digits.slice(2);
  if (rest.length <= 5) return `(${ddd}) ${rest}`;

  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
  event.target.value = formatBrazilianPhone(event.target.value);
}

export function WhatsAppField({ id, name, label, error, required, defaultValue }: WhatsAppFieldProps) {
  const errorMessage = error?.[0];
  const errorId = errorMessage ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={getFieldLabelClassName()}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required={required}
        placeholder="(11) 98765-4321"
        maxLength={16}
        defaultValue={defaultValue ? formatBrazilianPhone(defaultValue) : undefined}
        onChange={handlePhoneChange}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorId}
        className={getFieldControlClassName(Boolean(errorMessage))}
      />
      {errorMessage && (
        <p id={errorId} role="alert" className={getFieldErrorClassName()}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
