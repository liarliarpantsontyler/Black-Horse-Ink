import { z } from "zod";
import { siteConfig } from "./site.config";
import { reviewSchema } from "./schemas";
import generated from "./reviews.generated.json";
import {
  getGoogleReviews,
  resolveGooglePlaceId,
  type GoogleReviewsPayload,
} from "@/lib/google-reviews";

const generatedReviewsSchema = z.object({
  rating: z.number().nullable().optional(),
  userRatingCount: z.number().nullable().optional(),
  googleMapsUri: z.string().url().nullable().optional(),
  reviews: z.array(reviewSchema),
});

export type SiteReviews = {
  reviews: z.infer<typeof reviewSchema>[];
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  source: "google-live" | "google-sync" | "config";
};

function fromGenerated(): SiteReviews | null {
  const parsed = generatedReviewsSchema.safeParse(generated);
  if (!parsed.success || !parsed.data.reviews.length) return null;
  const { rating, userRatingCount, googleMapsUri, reviews } = parsed.data;
  return {
    reviews,
    rating: rating ?? undefined,
    userRatingCount: userRatingCount ?? undefined,
    googleMapsUri: googleMapsUri ?? siteConfig.studio.mapsUrl,
    source: "google-sync",
  };
}

function fromConfig(): SiteReviews | null {
  if (!siteConfig.reviews.length) return null;
  return {
    reviews: siteConfig.reviews,
    googleMapsUri: siteConfig.studio.mapsUrl,
    source: "config",
  };
}

function fromGoogleLive(payload: GoogleReviewsPayload): SiteReviews {
  return {
    reviews: payload.reviews,
    rating: payload.rating,
    userRatingCount: payload.userRatingCount,
    googleMapsUri: payload.googleMapsUri ?? siteConfig.studio.mapsUrl,
    source: "google-live",
  };
}

export async function getSiteReviews(): Promise<SiteReviews | null> {
  const placeId = resolveGooglePlaceId(siteConfig.studio);
  if (placeId) {
    const live = await getGoogleReviews(placeId);
    if (live?.reviews.length) return fromGoogleLive(live);
  }

  return fromGenerated() ?? fromConfig();
}
