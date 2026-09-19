import { z } from "zod";
import { portfolioItemSchema, type PortfolioItem } from "./schemas";
import generated from "./portfolio.generated.json";

const portfolioSchema = z.array(portfolioItemSchema);

export const portfolioItems: PortfolioItem[] = portfolioSchema.parse(generated);

export function getPortfolioByArtist(artistId: string, limit?: number) {
  const items = portfolioItems.filter((p) => p.artistId === artistId);
  return limit ? items.slice(0, limit) : items;
}

export function getFeaturedPortfolio(limit = 12) {
  const featured = portfolioItems.filter((p) => p.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  return portfolioItems.slice(0, limit);
}

const HERO_GALLERY_ARTIST_ORDER = ["lucia", "juan", "marcos"] as const;

/** Round-robin Lucia → Juan → Marcos for hero carousel (cycles through each artist's IG portfolio). */
export function buildHeroGallerySequence(cycles = 5): PortfolioItem[] {
  const items: PortfolioItem[] = [];
  for (let c = 0; c < cycles; c++) {
    for (const artistId of HERO_GALLERY_ARTIST_ORDER) {
      const pool = getPortfolioByArtist(artistId);
      if (pool.length === 0) continue;
      items.push(pool[c % pool.length]);
    }
  }
  return items;
}
