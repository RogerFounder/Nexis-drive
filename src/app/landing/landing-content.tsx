"use client";

import { useEffect, useRef, useState } from "react";
import { buildWhatsAppLink } from "@/lib/whatsapp-link";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function trackLeadClick() {
  window.fbq?.("track", "Lead");
}

interface LandingContentProps {
  salesWhatsAppE164: string;
}

/** Tracked manually by Roger alongside the founder-slot count in PLANS below. */
const FOUNDER_SLOTS_FILLED = 6;
const FOUNDER_SLOTS_TOTAL = 10;

const TABS = [
  {
    id: "curiosos",
    label: "Curiosos x clientes",
    title: "Menos tempo com quem não vai fechar",
    body: "Cada lead entra já organizado por status — Novo, Contatado, Convertido ou Descartado. Você enxerga na hora quem está realmente perto de fechar, e para de insistir com quem só queria saber o preço.",
  },
  {
    id: "resposta",
    label: "Resposta rápida",
    title: "Resposta na hora, sem perder o cliente",
    body: "Chame o cliente direto no WhatsApp assim que o lead cai no painel. Quem demora perde o serviço pra quem respondeu primeiro — o Nexus Drive tira essa demora do caminho.",
  },
  {
    id: "laudo",
    label: "Sem acusação injusta",
    title: "Ninguém te acusa de algo que não fez",
    body: "Você já recebeu uma moto ou aparelho, entregou certo, e meses depois o cliente volta dizendo que o problema já estava lá? Com o laudo registrado no momento da entrada, você tem o estado real do equipamento documentado — e a palavra final não fica só no \"ele disse, ela disse\".",
  },
  {
    id: "financeiro",
    label: "Sem susto no caixa",
    title: "Sem susto no fim do mês",
    body: "Total recebido e total em aberto, atualizados a cada lead, num único painel — sem depender de planilha paralela ou de memória pra saber quanto ainda falta entrar.",
  },
];

const FAQS = [
  {
    q: "Qual a diferença entre os dois planos?",
    a: "No vitalício você paga R$597 uma única vez e nunca mais paga mensalidade. No mensal você paga R$147 por mês, sem taxa de entrada, e pode cancelar quando quiser.",
  },
  {
    q: "Funciona pra uma oficina ou assistência pequena, começando agora?",
    a: "Sim. O sistema foi pensado pra quem atende sozinho ou com uma equipe pequena — não exige estrutura grande pra usar.",
  },
  {
    q: "Preciso entender de sistema ou computador pra usar?",
    a: "Não. O painel foi feito pra ser usado do celular, no dia a dia, sem treinamento técnico.",
  },
  {
    q: "Como eu recebo o acesso depois de pagar?",
    a: "Hoje a liberação é feita diretamente pela nossa equipe: assim que o pagamento é confirmado, entramos em contato pelo telefone informado no checkout com seu acesso.",
  },
  {
    q: "A mensalidade aumenta com o tempo?",
    a: "Não. O valor da mensalidade contratado nesta fase fica fixo — não sobe depois.",
  },
];

/**
 * The 10 founder slots are tracked manually by Roger, not enforced by the
 * system. Once they're gone, swap this "vitalicio" entry for the regular
 * annual plan (R$1.587,60 — 10% off the R$1.764/year equivalent of paying
 * monthly) rather than adding a third card; the landing always shows two
 * plans side by side.
 */
const PLANS = [
  {
    id: "vitalicio",
    tag: "OFERTA FUNDADOR · 10 VAGAS",
    price: "R$ 597",
    priceNote: "uma vez só, sem mensalidade — exclusivo pros 10 primeiros clientes",
    ctaLabel: "Quero o plano vitalício →",
    checkoutUrl: "https://www.asaas.com/c/uqsj6wt6gl7ostwt",
    highlight: true,
  },
  {
    id: "mensal",
    tag: "SEM TAXA DE ENTRADA",
    price: "R$ 147/mês",
    priceNote: "sem taxa de ativação — cancele quando quiser",
    ctaLabel: "Quero o plano mensal →",
    checkoutUrl: "https://www.asaas.com/c/q8ksc6ofgltka04s",
    highlight: false,
  },
] as const;

function useFadeUpOnScroll() {
  useEffect(() => {
    const els = document.querySelectorAll(".fade-up");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in-view");
        });
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export function LandingContent({ salesWhatsAppE164 }: LandingContentProps) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const tabPanelRef = useRef<HTMLDivElement>(null);
  useFadeUpOnScroll();

  const activeTabData = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  const talkWhatsAppLink = buildWhatsAppLink(
    salesWhatsAppE164,
    "Olá! Vi o Nexus Drive e queria entender melhor como funciona antes de decidir.",
  );

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-zinc-950">
      <div
        aria-hidden
        className="animate-glow-a pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-glow-b pointer-events-none absolute -right-24 -bottom-24 h-[28rem] w-[28rem] rounded-full bg-amber-500/10 blur-3xl"
      />

      {/* NAV */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-16">
        <span className="text-lg font-semibold tracking-wide text-zinc-50">
          NEXUS<span className="text-amber-400">·</span>DRIVE
        </span>
        <a
          href="#acesso"
          className="font-mono text-xs tracking-wider text-zinc-400 transition hover:text-zinc-100"
        >
          VER ACESSO →
        </a>
      </nav>

      <main className="relative z-10">
        {/* HERO */}
        <section className="px-6 pt-16 pb-24 md:px-16">
          <p className="mb-4 font-mono text-xs tracking-[0.15em] text-blue-400">ENTRADA</p>
          <div className="fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/35 bg-blue-500/[0.06] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="font-mono text-xs tracking-wider text-blue-300">
              SISTEMA PARA SERVIÇOS TÉCNICOS — ASSISTÊNCIAS E OFICINAS DE MOTO
            </span>
          </div>
          <h1 className="fade-up max-w-3xl text-4xl leading-[1.05] font-semibold text-zinc-50 md:text-6xl">
            O sistema que conecta cada etapa do seu <span className="text-blue-400">crescimento</span> em um único fluxo.
          </h1>
          <p className="fade-up mt-6 max-w-xl text-lg text-zinc-400">
            Nexus Drive centraliza seus leads, o contato direto pelo WhatsApp, a geração de laudo e o controle financeiro
            em um único painel — feito para assistências técnicas e oficinas de moto.
          </p>
          <div className="fade-up mt-9 flex flex-wrap gap-4">
            <a
              href="#acesso"
              className="rounded-full bg-amber-400 px-7 py-3.5 font-semibold text-zinc-950 transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Quero ter acesso
            </a>
            <a
              href={talkWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackLeadClick}
              className="rounded-full border border-zinc-700 px-7 py-3.5 text-zinc-100 transition hover:border-blue-400 active:scale-[0.98]"
            >
              Falar com a equipe no WhatsApp
            </a>
          </div>
        </section>

        {/* PROBLEMA */}
        <section className="px-6 py-20 md:px-16">
          <p className="mb-4 font-mono text-xs tracking-[0.15em] text-blue-400">O PONTO DE PARTIDA</p>
          <div className="grid gap-8 md:grid-cols-2">
            <h2 className="fade-up text-2xl leading-snug font-semibold text-zinc-50 md:text-3xl">
              Não é sistema, é menos tempo perdido e menos dor de cabeça.
            </h2>
            <p className="fade-up leading-relaxed text-zinc-400">
              Curioso que não fecha, cliente que some no meio do atendimento, e aquele que volta meses depois acusando
              você de um problema que já existia antes do serviço. É isso que o Nexus Drive tira do seu caminho.
            </p>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="px-6 py-20 md:px-16">
          <p className="mb-4 font-mono text-xs tracking-[0.15em] text-blue-400">A SOLUÇÃO</p>
          <h2 className="fade-up mb-8 text-2xl font-semibold text-zinc-50 md:text-3xl">
            Menos dor de cabeça no seu dia a dia
          </h2>

          <div className="fade-up">
            <div className="mb-8 flex gap-6 overflow-x-auto border-b border-zinc-800">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 border-b-2 pb-3 whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? "border-blue-400 text-zinc-50"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              ref={tabPanelRef}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 md:p-10"
            >
              <p className="mb-3 font-mono text-xs text-blue-400">MÓDULO</p>
              <h3 className="mb-3 text-xl font-semibold text-zinc-50">{activeTabData.title}</h3>
              <p className="leading-relaxed text-zinc-400">{activeTabData.body}</p>
            </div>
          </div>
        </section>

        {/* O QUE VOCÊ RECEBE */}
        <section className="px-6 py-20 md:px-16">
          <p className="mb-4 font-mono text-xs tracking-[0.15em] text-blue-400">NOVA FASE</p>
          <h2 className="fade-up mb-3 text-2xl font-semibold text-zinc-50 md:text-3xl">
            Abrimos vagas nesta nova fase
          </h2>
          <p className="fade-up mb-10 max-w-xl text-zinc-400">
            O Nexus Drive entrou numa nova fase — e por isso abrimos, neste momento, um número limitado de vagas antes
            do valor voltar ao padrão.
          </p>

          <div className="fade-up grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <p className="mb-2 font-semibold text-zinc-50">Menos tempo com curioso</p>
              <p className="text-sm text-zinc-400">
                Veja de cara quem está perto de fechar e pare de gastar energia com quem só queria saber o preço.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <p className="mb-2 font-semibold text-zinc-50">Sem acusação injusta depois</p>
              <p className="text-sm text-zinc-400">
                Laudo registrado na entrada do serviço, pra você não levar a culpa por um problema que já existia antes.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <p className="mb-2 font-semibold text-zinc-50">Sem susto no fim do mês</p>
              <p className="text-sm text-zinc-400">
                Total recebido e total em aberto, sempre visíveis, sem depender de memória ou planilha à parte.
              </p>
            </div>
          </div>
        </section>

        {/* ACESSO / CTA FINAL */}
        <section id="acesso" className="px-6 py-24 md:px-16">
          <p className="mb-4 font-mono text-xs tracking-[0.15em] text-blue-400">ACESSO</p>
          <h2 className="fade-up mb-10 text-3xl font-semibold text-zinc-50 md:text-4xl">Entre no Nexus Drive</h2>

          <p className="fade-up mb-8 max-w-lg text-sm text-zinc-500">
            NOVA FASE DO NEXUS DRIVE · VAGAS LIMITADAS — escolha o formato que faz mais sentido pro seu momento.
          </p>

          <div className="fade-up grid gap-5 md:grid-cols-2">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border bg-zinc-900/60 p-8 md:p-10 ${
                  plan.highlight ? "border-amber-400/40" : "border-zinc-800"
                }`}
              >
                <p className={`font-mono text-xs ${plan.highlight ? "text-amber-400" : "text-blue-400"}`}>
                  {plan.tag}
                </p>
                <p className="mt-2 mb-1 text-4xl font-semibold text-zinc-50">{plan.price}</p>
                <p className="mb-6 text-xs text-zinc-500">{plan.priceNote}</p>
                {plan.id === "vitalicio" && (
                  <div className="mb-6">
                    <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-400">
                      <span>
                        {FOUNDER_SLOTS_FILLED}/{FOUNDER_SLOTS_TOTAL} vagas preenchidas
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${(FOUNDER_SLOTS_FILLED / FOUNDER_SLOTS_TOTAL) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                <ul className="mb-8 space-y-2 font-mono text-sm text-zinc-400">
                  <li>→ Painel completo de leads</li>
                  <li>→ WhatsApp direto pelo sistema</li>
                  <li>→ Geração de laudo</li>
                  <li>→ Controle financeiro em tempo real</li>
                </ul>
                <a
                  href={plan.checkoutUrl}
                  onClick={trackLeadClick}
                  className={`block rounded-full px-6 py-3.5 text-center font-semibold transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${
                    plan.highlight ? "bg-amber-400 text-zinc-950" : "border border-zinc-700 text-zinc-100"
                  }`}
                >
                  {plan.ctaLabel}
                </a>
              </div>
            ))}
          </div>

          <p className="mt-6 max-w-lg text-xs text-zinc-500">
            Ao clicar em qualquer um dos planos, você vai para o pagamento seguro. Depois de confirmado, nossa equipe
            entra em contato pelo telefone informado no checkout para liberar seu acesso. A mensalidade não aumenta
            com o tempo. Nesta nova fase, as vagas são limitadas.
          </p>

          {/* FAQ */}
          <div className="fade-up mt-16 max-w-2xl">
            <h3 className="mb-6 text-xl font-semibold text-zinc-50">Perguntas frequentes</h3>
            <dl className="space-y-6">
              {FAQS.map((faq) => (
                <div key={faq.q}>
                  <dt className="mb-1 font-medium text-zinc-100">{faq.q}</dt>
                  <dd className="text-sm text-zinc-400">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className="relative z-10 flex items-center justify-between border-t border-zinc-800 px-6 py-10 md:px-16">
        <p className="font-mono text-xs text-zinc-500">NEXUS DRIVE</p>
        <p className="font-mono text-xs text-zinc-500">© 2026</p>
      </footer>
    </div>
  );
}
