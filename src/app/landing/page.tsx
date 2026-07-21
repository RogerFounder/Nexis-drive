import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { LandingContent } from "./landing-content";

export const metadata: Metadata = {
  title: "Nexus Drive — Menos curioso, menos dor de cabeça",
  description:
    "O sistema que centraliza leads, WhatsApp, laudo técnico e financeiro para assistências técnicas e oficinas de moto.",
};

const SALES_WHATSAPP_E164 = "5551981351255";

// Dedicated to the Nexus Drive paid-traffic funnel — deliberately not on
// authenticated dashboard routes, which have no reason to report to Meta.
const META_PIXEL_ID = "2044446372870014";

export default async function LandingPage() {
  // This codebase is deployed once per client (each with its own Vercel
  // project), all tracking the same `main` branch. Without this gate, this
  // sales page for Nexus Drive itself would go live inside every client's
  // own deployment. Only the flagship deployment sets this env var.
  if (process.env.ENABLE_MARKETING_LANDING !== "true") {
    notFound();
  }

  // The CSP in src/proxy.ts requires every script to carry this per-request
  // nonce — Next.js auto-applies it to its own bundled scripts, but custom
  // inline scripts like this one need it passed explicitly.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive" nonce={nonce}>
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          alt=""
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
      <LandingContent salesWhatsAppE164={SALES_WHATSAPP_E164} />
    </>
  );
}
