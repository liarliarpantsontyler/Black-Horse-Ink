"use client";

import { siteConfig } from "@/content/site.config";
import { useQuote } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";

const steps = [
  {
    title: "Send your idea",
    body: "Tell us what you're thinking and upload inspiration.",
  },
  {
    title: "Get a text",
    body: "We'll follow up with pricing, availability, and any questions.",
  },
  {
    title: "Book your tattoo",
    body: "Pick a time, leave your deposit, and you're set.",
  },
];

export function HowItWorks() {
  const { openQuote } = useQuote();

  return (
    <section className="border-y border-border/50 bg-surface py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="font-display text-3xl">How it works</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-3">
              <span className="text-sm font-medium text-accent">0{i + 1}</span>
              <h3 className="text-xl font-medium">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
        <Button type="button" className="mt-10" onClick={() => openQuote()}>
          Start a Quote
        </Button>
        <p className="mt-3 text-xs text-muted">{siteConfig.copy.ctaSubtext}</p>
      </div>
    </section>
  );
}
