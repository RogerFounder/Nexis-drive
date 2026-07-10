import Link from "next/link";
import { getFieldErrorClassName } from "./field-styles";

interface PrivacyConsentCheckboxProps {
  id: string;
  name: string;
  error?: string[];
}

export function PrivacyConsentCheckbox({ id, name, error }: PrivacyConsentCheckboxProps) {
  const errorMessage = error?.[0];
  const errorId = errorMessage ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-zinc-400"
      >
        <input
          type="checkbox"
          id={id}
          name={name}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={errorId}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-600 text-zinc-100 focus:ring-zinc-100/20"
        />
        <span>
          Li e concordo com a{" "}
          <Link
            href="/privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-100 underline underline-offset-2"
          >
            Política de Privacidade
          </Link>
          , que explica como meus dados são usados.
        </span>
      </label>
      {errorMessage && (
        <p id={errorId} role="alert" className={getFieldErrorClassName()}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
