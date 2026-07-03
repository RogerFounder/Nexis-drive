import type { ReactNode } from "react";

interface FormCardProps {
  children: ReactNode;
}

export function FormCard({ children }: FormCardProps) {
  return (
    <div
      className="mx-auto w-full max-w-lg rounded-3xl bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-20px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.06] sm:p-10 dark:bg-zinc-900 dark:ring-white/[0.08]"
    >
      {children}
    </div>
  );
}
