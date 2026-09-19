import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { siteConfig } from "@/content/site.config";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Privacy policy for Black Horse Ink website and quote requests.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
        <h1 className="font-display text-4xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-muted">
          Placeholder — requires review and approval by {siteConfig.studio.name}{" "}
          ownership / legal counsel before production use.
        </p>
        <div className="prose prose-invert mt-10 space-y-6 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="text-lg font-medium text-foreground">Quote information</h2>
            <p>
              When you submit a tattoo quote request, we collect the details you provide
              (description, size, placement, timing, and optional reference images) to
              respond to your inquiry.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">Contact information</h2>
            <p>
              We use your name and phone number to follow up about your tattoo request via
              SMS. Email is optional and used only if you provide it.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">SMS communications</h2>
            <p>{siteConfig.copy.smsConsent}</p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">Analytics</h2>
            <p>
              We may use analytics tools (such as Google Analytics) to understand site usage
              and measure advertising performance. Campaign parameters may be stored with your
              lead for internal reporting.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">Uploaded images</h2>
            <p>
              Reference images you upload are stored securely and are not published on the
              public website. Access is limited to studio staff handling your inquiry.
            </p>
          </section>
        </div>
        <Link href="/" className="mt-10 inline-block text-sm text-accent underline-offset-4 hover:underline">
          Back to home
        </Link>
      </article>
    </SiteShell>
  );
}
