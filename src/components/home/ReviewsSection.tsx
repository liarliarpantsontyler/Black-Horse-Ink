import { siteConfig } from "@/content/site.config";

export function ReviewsSection() {
  const { reviews } = siteConfig;
  if (!reviews.length) {
    return (
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="font-display text-3xl">What clients say</h2>
          <p className="mt-4 max-w-xl text-muted">
            Google reviews will appear here once connected. We only show real
            testimonials — no fabricated ratings.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="font-display text-3xl">What clients say</h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-border/60 bg-surface p-6"
            >
              <p className="text-sm leading-relaxed">&ldquo;{r.text}&rdquo;</p>
              <p className="mt-4 text-sm font-medium">{r.author}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
