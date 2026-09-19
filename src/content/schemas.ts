import { z } from "zod";

export const portfolioFilterSchema = z.enum([
  "all",
  "fine-line",
  "small",
  "medium",
  "large",
]);

export const portfolioItemTagSchema = z.enum([
  "fine-line",
  "small",
  "medium",
  "large",
]);

export const artistSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  pronouns: z.string().optional(),
  portrait: z.string(),
  bio: z.string(),
  specialties: z.array(z.string()),
  instagram: z.string().url(),
  instagramHandle: z.string(),
  acceptingInquiries: z.boolean(),
  inquiryType: z.enum(["primary", "large_projects"]),
  visualWeight: z.enum(["emphasized", "de-emphasized"]),
});

export const portfolioItemSchema = z.object({
  id: z.string(),
  image: z.string(),
  alt: z.string(),
  artistId: z.string(),
  tags: z.array(portfolioItemTagSchema),
  featured: z.boolean().optional(),
});

export const faqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

export const reviewSchema = z.object({
  id: z.string(),
  author: z.string(),
  text: z.string(),
  rating: z.number().min(1).max(5).optional(),
  sourceUrl: z.string().url().optional(),
});

export const siteConfigSchema = z.object({
  studio: z.object({
    name: z.string(),
    slug: z.string(),
    tagline: z.string(),
    cityState: z.string(),
    address: z.string(),
    phoneDisplay: z.string().optional(),
    hours: z.array(z.string()),
    parkingNote: z.string().optional(),
    mapsUrl: z.string().url(),
    instagram: z.string().url(),
    shopMinimum: z.string(),
  }),
  copy: z.object({
    primaryCta: z.string(),
    stickyPrimaryCta: z.string(),
    startQuoteCta: z.string(),
    submitQuoteCta: z.string(),
    largeProjectCta: z.string(),
    quoteWithArtistTemplate: z.string(),
    quoteLikeThisHint: z.string(),
    ctaSubtext: z.string(),
    responseTimeCopy: z.string(),
    artistResponseTimeTemplate: z.string(),
    smsConsent: z.string(),
    confirmationSmsTemplate: z.string(),
  }),
  artists: z.array(artistSchema),
  faqs: z.array(faqSchema),
  reviews: z.array(reviewSchema),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type Artist = z.infer<typeof artistSchema>;
export type PortfolioItem = z.infer<typeof portfolioItemSchema>;
