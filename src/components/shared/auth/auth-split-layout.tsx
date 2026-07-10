import type { ReactNode } from "react";

interface AuthSplitLayoutProps {
  heading: ReactNode;
  tagline: ReactNode;
  children: ReactNode;
}

/**
 * Shared shell for every standalone auth-adjacent page (login, esqueci-senha,
 * redefinir-senha, assinatura): one continuous dark, glowing backdrop (always
 * dark — this is the brand identity of the auth flow, not tied to system
 * light/dark preference), everything centered in a single column regardless
 * of viewport width — no side-by-side split. The glow gives the wide screen
 * presence instead of a second column.
 */
export function AuthSplitLayout({ heading, tagline, children }: AuthSplitLayoutProps) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-zinc-950 px-6 py-20">
      <div
        aria-hidden
        className="animate-glow-a pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-glow-b pointer-events-none absolute -right-24 -bottom-24 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-3xl"
      />

      <div className="relative z-10 flex w-full flex-col items-center">
        <div className="mb-10 max-w-md text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
            {heading}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-zinc-400">{tagline}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
