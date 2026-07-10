"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { Spinner } from "./spinner";

interface SubmitButtonProps {
  children: ReactNode;
  pendingLabel: string;
}

export function SubmitButton({ children, pendingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-medium text-zinc-900 transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <Spinner tone="onLight" />}
      {pending ? pendingLabel : children}
    </button>
  );
}
