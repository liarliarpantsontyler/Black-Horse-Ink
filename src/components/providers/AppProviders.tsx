"use client";

import { Suspense, type ReactNode } from "react";
import { QuoteProvider } from "@/context/QuoteContext";
import { AttributionCapture } from "@/components/AttributionCapture";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QuoteProvider>
      <Suspense fallback={null}>
        <AttributionCapture />
      </Suspense>
      {children}
    </QuoteProvider>
  );
}
