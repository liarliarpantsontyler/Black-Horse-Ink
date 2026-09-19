"use client";

import { type ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { StickyQuoteCTA } from "./StickyQuoteCTA";
import { QuoteFlow } from "@/components/quote/QuoteFlow";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <Footer />
      <StickyQuoteCTA />
      <QuoteFlow />
    </>
  );
}
