"use client";

import { useState, type ChangeEvent, type TextareaHTMLAttributes } from "react";
import {
  getFieldControlClassName,
  getFieldErrorClassName,
  getFieldHintClassName,
  getFieldLabelClassName,
} from "./field-styles";

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string[];
  hint?: string;
  showCounter?: boolean;
}

export function TextAreaField({
  label,
  error,
  hint,
  id,
  className,
  rows = 4,
  showCounter = false,
  maxLength,
  defaultValue,
  onChange,
  ...textareaProps
}: TextAreaFieldProps) {
  const [length, setLength] = useState(
    typeof defaultValue === "string" ? defaultValue.length : 0
  );
  const errorMessage = error?.[0];
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;
  const counterId = showCounter && maxLength ? `${id}-counter` : undefined;
  const describedBy = [hintId, errorId, counterId].filter(Boolean).join(" ") || undefined;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setLength(event.target.value.length);
    onChange?.(event);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={getFieldLabelClassName()}>
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        defaultValue={defaultValue}
        onChange={handleChange}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={describedBy}
        className={`resize-none leading-relaxed ${getFieldControlClassName(Boolean(errorMessage), className)}`}
        {...textareaProps}
      />
      <div className="flex items-start justify-between gap-2">
        <div>
          {hint && !errorMessage && <p id={hintId} className={getFieldHintClassName()}>{hint}</p>}
          {errorMessage && (
            <p id={errorId} role="alert" className={getFieldErrorClassName()}>
              {errorMessage}
            </p>
          )}
        </div>
        {showCounter && maxLength && (
          <span
            id={counterId}
            className="shrink-0 text-xs tabular-nums text-zinc-500"
          >
            {length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
