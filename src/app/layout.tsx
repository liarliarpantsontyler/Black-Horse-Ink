import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { buildMetadata } from "@/lib/metadata";
import { tattooParlorJsonLd } from "@/lib/seo/jsonld";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = buildMetadata({
  title: "Fine-line & custom tattoos",
  description:
    "Get a tattoo quote by text. Fine-line, small, and custom tattoos at Black Horse Ink.",
  path: "/",
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = tattooParlorJsonLd();

  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AnalyticsScripts />
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
