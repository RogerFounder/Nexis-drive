import type { ReactNode } from "react";

interface FormAlertProps {
  variant: "success" | "error";
  children: ReactNode;
}

const VARIANT_STYLES: Record<FormAlertProps["variant"], string> = {
  success:
    "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  error:
    "bg-red-50 text-red-700 ring-1 ring-red-600/10 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20",
};

function AlertIcon({ variant }: { variant: FormAlertProps["variant"] }) {
  if (variant === "success") {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0">
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.169 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function FormAlert({ variant, children }: FormAlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`animate-banner-in flex items-start gap-2.5 rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${VARIANT_STYLES[variant]}`}
    >
      <AlertIcon variant={variant} />
      <p>{children}</p>
    </div>
  );
}
