import { z } from "zod";

export const leadSizeSchema = z.enum([
  "tiny",
  "small",
  "medium",
  "large",
  "not_sure",
]);

export const leadTimingSchema = z.enum([
  "asap",
  "couple_weeks",
  "next_month",
  "exploring",
  "",
]);

export const leadStatusSchema = z.enum([
  "new",
  "contacted",
  "quoted",
  "booked",
  "lost",
]);

export const leadFormSchema = z.object({
  firstName: z.string().min(1).max(80),
  phone: z.string().min(7).max(30),
  email: z.string().email().optional().or(z.literal("")),
  artistId: z.string().optional(),
  idea: z.string().min(3).max(5000),
  size: leadSizeSchema,
  placement: z.string().min(1),
  placementNotes: z.string().max(500).optional(),
  timing: leadTimingSchema.optional(),
  website: z.string().max(0).optional(),
  attribution: z
    .object({
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
      utm_content: z.string().optional(),
      utm_term: z.string().optional(),
      gclid: z.string().optional(),
      landing_page: z.string().optional(),
      referrer: z.string().optional(),
    })
    .optional(),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;
