import { RequestPasswordResetForm } from "@/components/shared/auth/request-password-reset-form";
import { AuthSplitLayout } from "@/components/shared/auth/auth-split-layout";

export default function EsqueciSenhaPage() {
  return (
    <AuthSplitLayout
      heading="Esqueceu sua senha?"
      tagline="Informe o e-mail da sua conta e enviaremos um link para você escolher uma nova senha."
    >
      <RequestPasswordResetForm />
    </AuthSplitLayout>
  );
}
