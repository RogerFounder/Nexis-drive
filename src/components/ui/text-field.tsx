import type { InputHTMLAttributes } from "react";
import {
  getFieldControlClassName,
  getFieldErrorClassName,
  getFieldHintClassName,
  getFieldLabelClassName,
} from "./field-styles";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string[];
  hint?: string;
}

export function TextField({ label, error, hint, id, className, ...inputProps }: TextFieldProps) {
  const errorMessage = error?.[0];
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={getFieldLabelClassName()}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={describedBy}
        className={getFieldControlClassName(Boolean(errorMessage), className)}
        {...inputProps}
      />
      {hint && !errorMessage && (
        <p id={hintId} className={getFieldHintClassName()}>
          {hint}
        </p>
      )}
      {errorMessage && (
        <p id={errorId} role="alert" className={getFieldErrorClassName()}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
