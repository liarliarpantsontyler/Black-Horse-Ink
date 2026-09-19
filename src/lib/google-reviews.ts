import { unstable_cache } from "next/cache";
import { reviewSchema, type SiteConfig } from "@/content/schemas";
import { z } from "zod";

const googleReviewSchema = z.object({
  name: z.string().optional(),
  rating: z.number().optional(),
  text: z
    .object({
      text: z.string(),
    })
    .optional(),
  authorAttribution: z
    .object({
      displayName: z.string().optional(),
      uri: z.string().optional(),
    })
    .optional(),
  publishTime: z.string().optional(),
});

const placeDetailsSchema = z.object({
  rating: z.number().optional(),
  userRatingCount: z.number().optional(),
  googleMapsUri: z.string().url().optional(),
  reviews: z.array(googleReviewSchema).optional(),
});

export type GoogleReviewsPayload = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews: z.infer<typeof reviewSchema>[];
};

function mapPlaceReviews(
  data: z.infer<typeof placeDetailsSchema>,
): GoogleReviewsPayload {
  const reviews = (data.reviews ?? [])
    .map((r, index) => {
      const text = r.text?.text?.trim();
      if (!text) return null;
      const author = r.authorAttribution?.displayName?.trim() || "Google reviewer";
      const id =
        r.name?.split("/").pop() ??
        `${r.publishTime ?? "review"}-${author}-${index}`;
      return reviewSchema.parse({
        id,
        author,
        text,
        rating: r.rating,
        sourceUrl: r.authorAttribution?.uri,
      });
    })
    .filter((r): r is z.infer<typeof reviewSchema> => r !== null);

  return {
    rating: data.rating,
    userRatingCount: data.userRatingCount,
    googleMapsUri: data.googleMapsUri,
    reviews,
  };
}

async function fetchPlaceReviewsFromGoogle(
  placeId: string,
  apiKey: string,
): Promise<GoogleReviewsPayload | null> {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "reviews,rating,userRatingCount,googleMapsUri",
      },
    },
  );

  if (!res.ok) {
    console.error(
      "[google-reviews] Places API error",
      res.status,
      await res.text(),
    );
    return null;
  }

  const json: unknown = await res.json();
  const parsed = placeDetailsSchema.safeParse(json);
  if (!parsed.success) {
    console.error("[google-reviews] Unexpected Places API shape", parsed.error);
    return null;
  }

  const payload = mapPlaceReviews(parsed.data);
  if (!payload.reviews.length) return null;
  return payload;
}

export async function getGoogleReviews(
  placeId: string,
): Promise<GoogleReviewsPayload | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey?.trim() || !placeId.trim()) return null;

  return unstable_cache(
    () => fetchPlaceReviewsFromGoogle(placeId, apiKey),
    ["google-reviews", placeId],
    { revalidate: 86_400, tags: [`google-reviews-${placeId}`] },
  )();
}

export function resolveGooglePlaceId(studio: SiteConfig["studio"]): string | null {
  const id = studio.googlePlaceId?.trim();
  if (!id || id.startsWith("[")) return null;
  return id;
}
