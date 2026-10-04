import { customerReviews } from "@/content/customer-reviews";

export function ReviewsSection() {
  return (
    <section aria-labelledby="customer-reviews-title" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 id="customer-reviews-title" className="font-display text-3xl md:text-4xl">
          What clients say
        </h2>
        <ul className="mt-8 columns-1 gap-4 md:mt-10 md:columns-2 lg:columns-3">
          {customerReviews.map((review) => (
            <li key={review.author} className="mb-4 break-inside-avoid rounded-2xl border border-border bg-surface p-6 md:p-7">
              <div role="img" aria-label="5 out of 5 stars" className="text-lg tracking-[0.18em] text-accent">
                <span aria-hidden="true">★★★★★</span>
              </div>
              <blockquote className="mt-5">
                <p className="text-base leading-7 text-foreground">“{review.text}”</p>
              </blockquote>
              <p className="mt-5 text-sm font-medium text-muted">{review.author}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
