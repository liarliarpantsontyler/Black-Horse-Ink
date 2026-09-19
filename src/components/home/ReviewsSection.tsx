import Link from "next/link";
import { getSiteReviews } from "@/content/reviews";

function StarRow({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex gap-0.5 text-accent" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
    </span>
  );
}

export async function ReviewsSection() {
  const data = await getSiteReviews();

  if (!data?.reviews.length) {
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

  const mapsHref = data.googleMapsUri;

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl">What clients say</h2>
            {typeof data.rating === "number" && (
              <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
                <StarRow rating={data.rating} />
                <span className="font-medium text-foreground">
                  {data.rating.toFixed(1)}
                </span>
                {typeof data.userRatingCount === "number" && (
                  <span>({data.userRatingCount} on Google)</span>
                )}
              </p>
            )}
          </div>
          {mapsHref && (
            <Link
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              Read more on Google
            </Link>
          )}
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {data.reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-border/60 bg-surface p-6"
            >
              {typeof r.rating === "number" && (
                <p className="mb-3">
                  <StarRow rating={r.rating} />
                </p>
              )}
              <p className="text-sm leading-relaxed">&ldquo;{r.text}&rdquo;</p>
              <p className="mt-4 text-sm font-medium">{r.author}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
