"use client";

import { useId, useState } from "react";
import { siteConfig } from "@/content/site.config";

export function FAQAccordion() {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(siteConfig.faqs[0]?.id ?? null);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <h2 className="font-display text-3xl">FAQ</h2>
        <ul className="mt-8 divide-y divide-border/60 border-y border-border/60">
          {siteConfig.faqs.map((faq) => {
            const open = openId === faq.id;
            const panelId = `${baseId}-${faq.id}`;
            return (
              <li key={faq.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-medium"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenId(open ? null : faq.id)}
                >
                  {faq.question}
                  <span className="text-muted">{open ? "−" : "+"}</span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  hidden={!open}
                  className="pb-5 text-sm leading-relaxed text-muted"
                >
                  {faq.answer}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
