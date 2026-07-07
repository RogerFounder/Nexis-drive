import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade — Nexus Drive",
};

export default function PrivacidadePage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/"
          className="text-sm text-zinc-400 transition-colors duration-150 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          ← Voltar
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Última atualização: 07 de julho de 2026
        </p>

        <div className="mt-10 flex flex-col gap-8 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300">
          <section>
            <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              1. Quem trata os seus dados
            </h2>
            <p>
              Este formulário é operado pelo estabelecimento responsável pelo atendimento que
              você está solicitando (o negócio cujo nome e contato aparecem nesta página). É
              esse estabelecimento quem decide o que fazer com os dados que você envia aqui, nos
              termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              2. Quais dados coletamos
            </h2>
            <p>Ao preencher o formulário de solicitação, coletamos:</p>
            <ul className="mt-2 list-disc pl-5">
              <li>Nome completo</li>
              <li>Número de WhatsApp</li>
              <li>
                Informações sobre o serviço solicitado (ex.: modelo do dispositivo e descrição do
                problema, ou marca/modelo do veículo e serviço desejado)
              </li>
            </ul>
            <p className="mt-2">
              Se você levar um dispositivo ou veículo até o estabelecimento, as condições de
              entrada (avarias, itens faltantes, observações) podem ser registradas em um laudo
              técnico associado ao seu atendimento.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              3. Para que usamos esses dados
            </h2>
            <p>
              Usamos seus dados exclusivamente para entrar em contato pelo WhatsApp, elaborar um
              orçamento, prestar o serviço solicitado e, quando aplicável, emitir o laudo técnico
              de entrada que protege as duas partes contra reclamações indevidas sobre o estado do
              item recebido.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              4. Base legal
            </h2>
            <p>
              O tratamento dos seus dados se baseia no seu consentimento (art. 7º, I, da LGPD),
              dado ao marcar a caixa de aceite antes de enviar o formulário, e na execução de
              procedimentos preliminares relacionados à prestação do serviço que você está
              solicitando (art. 7º, V).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              5. Compartilhamento
            </h2>
            <p>
              Seus dados não são vendidos nem compartilhados com terceiros para fins de
              publicidade. Eles ficam armazenados em infraestrutura de nuvem (hospedagem e banco
              de dados) usada para operar este sistema, contratada apenas para viabilizar o
              serviço — não para uso próprio desses fornecedores.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              6. Por quanto tempo guardamos seus dados
            </h2>
            <p>
              Mantemos seus dados enquanto durar a relação comercial com o estabelecimento ou até
              que você solicite a exclusão, conforme a seção 7 abaixo.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              7. Seus direitos e como exercê-los
            </h2>
            <p>
              Você pode solicitar a qualquer momento a confirmação, o acesso, a correção ou a
              exclusão dos seus dados, nos termos do art. 18 da LGPD. Para isso, entre em contato
              diretamente com o estabelecimento pelo mesmo canal de WhatsApp usado no atendimento
              e informe o que deseja — a exclusão dos seus dados é confirmada assim que
              processada.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              8. Segurança
            </h2>
            <p>
              Adotamos medidas técnicas razoáveis para proteger seus dados, incluindo conexão
              criptografada (HTTPS/TLS) entre o seu navegador e nossos servidores e controle de
              acesso restrito ao painel administrativo do estabelecimento.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              9. Alterações desta política
            </h2>
            <p>
              Esta política pode ser atualizada periodicamente. A data no topo desta página
              indica a versão mais recente.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
