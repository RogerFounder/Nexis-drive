import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { getActiveVertical, VERTICAL_TAGLINE } from "@/config/verticals";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus Drive",
  description: VERTICAL_TAGLINE[getActiveVertical()],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Reading the nonce here (set by the CSP in src/proxy.ts) is what makes
  // Next.js attach it to its own framework-injected <script> tags — without
  // this, the strict `script-src 'nonce-...' 'strict-dynamic'` policy
  // silently blocks every script the app needs to hydrate/become interactive.
  await headers();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
