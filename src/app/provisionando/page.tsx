import type { Metadata } from "next";
import { AuthSplitLayout } from "@/components/shared/auth/auth-split-layout";
import { FormCard } from "@/components/ui/form-card";

export const metadata: Metadata = { title: "Configurando seu painel — Nexus Drive" };

export default function ProvisionandoPage() {
  return (
    <AuthSplitLayout
      heading="Estamos configurando tudo"
      tagline="Seu painel Nexus Drive está sendo criado agora"
    >
      <FormCard>
        <div className="flex flex-col items-center gap-6 py-2 text-center">
          <svg
            className="h-10 w-10 animate-spin text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>

          <div className="flex flex-col gap-2">
            <p className="text-sm leading-relaxed text-zinc-300">
              Estamos criando seu banco de dados, configurando o ambiente e
              preparando seu painel. Isso leva de <strong className="text-zinc-100">2 a 5 minutos</strong>.
            </p>
            <p className="text-sm text-zinc-500">
              Você receberá um e-mail assim que estiver pronto, com o link
              de acesso e o passo a passo para definir sua senha.
            </p>
          </div>

          <p className="text-xs text-zinc-600">Pode fechar esta aba — o processo continua em segundo plano.</p>
        </div>
      </FormCard>
    </AuthSplitLayout>
  );
}
