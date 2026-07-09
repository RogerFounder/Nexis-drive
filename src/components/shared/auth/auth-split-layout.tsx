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
 * light/dark preference) with the branding copy and the form card floating
 * on top of it, side by side on lg+ screens. No boxed-in "panel" — the glow
 * bleeds across the whole viewport instead of being clipped to one half.
 */
export function AuthSplitLayout({ heading, tagline, children }: AuthSplitLayoutProps) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-zinc-950">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-24 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-3xl"
      />

      <div className="relative z-10 flex flex-1 flex-col lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-16">
        <div className="hidden lg:flex lg:max-w-md lg:flex-col lg:gap-4">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">{heading}</h1>
          <p className="text-lg leading-relaxed text-zinc-400">{tagline}</p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 lg:px-0 lg:py-0">
          <div className="mb-10 text-center lg:hidden">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">{heading}</h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">{tagline}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
