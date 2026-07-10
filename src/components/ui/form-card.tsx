import type { ReactNode } from "react";

interface FormCardProps {
  children: ReactNode;
}

export function FormCard({ children }: FormCardProps) {
  return (
    <div
      className="mx-auto w-full max-w-lg rounded-2xl bg-zinc-900 p-8 shadow-[0_1px_2px_rgba(0,0,0,0.2),0_16px_40px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.08] sm:p-10"
    >
      {children}
    </div>
  );
}
