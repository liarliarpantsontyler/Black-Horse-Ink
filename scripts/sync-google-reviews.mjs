#!/usr/bin/env node
/**
 * Pull Google Business reviews into src/content/reviews.generated.json
 *
 * Requires GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID (or place id in site.config).
 * See scripts/README.md
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_PATH = path.join(ROOT, "src/content/reviews.generated.json");
const SITE_CONFIG_PATH = path.join(ROOT, "src/content/site.config.ts");

function readPlaceIdFromConfig() {
  const src = fs.readFileSync(SITE_CONFIG_PATH, "utf8");
  const match = src.match(/googlePlaceId:\s*"([^"]+)"/);
  const id = match?.[1]?.trim();
  if (!id || id.startsWith("[")) return null;
  return id;
}

function mapReviews(data) {
  return (data.reviews ?? [])
    .map((r, index) => {
      const text = r.text?.text?.trim();
      if (!text) return null;
      const author =
        r.authorAttribution?.displayName?.trim() || "Google reviewer";
      const id =
        r.name?.split("/").pop() ??
        `${r.publishTime ?? "review"}-${author}-${index}`;
      return {
        id,
        author,
        text,
        ...(typeof r.rating === "number" ? { rating: r.rating } : {}),
        ...(r.authorAttribution?.uri
          ? { sourceUrl: r.authorAttribution.uri }
          : {}),
      };
    })
    .filter(Boolean);
}

async function main() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId =
    process.env.GOOGLE_PLACE_ID?.trim() || readPlaceIdFromConfig();

  if (!apiKey) {
    console.error("GOOGLE_PLACES_API_KEY is required.");
    process.exit(1);
  }
  if (!placeId) {
    console.error(
      "Set GOOGLE_PLACE_ID or add studio.googlePlaceId in src/content/site.config.ts",
    );
    process.exit(1);
  }

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
    console.error("Places API error", res.status, await res.text());
    process.exit(1);
  }

  const data = await res.json();
  const reviews = mapReviews(data);

  if (!reviews.length) {
    console.warn("No text reviews returned — keeping existing file if any.");
    process.exit(0);
  }

  const payload = {
    fetchedAt: new Date().toISOString(),
    rating: data.rating ?? null,
    userRatingCount: data.userRatingCount ?? null,
    googleMapsUri: data.googleMapsUri ?? null,
    reviews,
  };

  fs.writeFileSync(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(
    `Wrote ${reviews.length} reviews to src/content/reviews.generated.json`,
  );
}

main();
