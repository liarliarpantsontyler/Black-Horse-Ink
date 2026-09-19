import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticRoutes = ["", "/fine-line-tattoos", "/tattoos", "/large-tattoos", "/privacy"];
  const artistRoutes = siteConfig.artists.map((a) => `/artists/${a.slug}`);

  return [...staticRoutes, ...artistRoutes].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
