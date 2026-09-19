import { siteConfigSchema, type SiteConfig } from "./schemas";

const raw: SiteConfig = {
  studio: {
    name: "Black Horse Ink",
    slug: "black-horse-ink",
    tagline: "Fine-line, small & custom tattoos in [CITY, STATE].",
    cityState: "[CITY, STATE]",
    address: "[STUDIO ADDRESS]",
    phoneDisplay: "[PHONE]",
    hours: ["[HOURS — e.g. Tue–Sat 11am–7pm]"],
    parkingNote: "[PARKING INSTRUCTIONS IF NEEDED]",
    mapsUrl: "https://maps.google.com/?q=[STUDIO+ADDRESS]",
    instagram: "https://www.instagram.com/blackhorseink/",
    shopMinimum: "[SHOP MINIMUM]",
  },
  copy: {
    primaryCta: "Get a Quote",
    ctaSubtext: "Tell us your idea. We'll text you back. No phone call needed.",
    responseTimeCopy: "Usually replies within minutes during shop hours",
    artistResponseTimeTemplate: "{{artistName}} usually responds in minutes",
    smsConsent:
      "By submitting, you agree to receive text messages related to your tattoo inquiry. Message and data rates may apply. Reply STOP to opt out.",
    confirmationSmsTemplate:
      "Hey {{firstName}}, this is {{studioName}} 👋 We got your tattoo request. Someone from the shop will take a look and text you here shortly. Feel free to reply if there's anything else you want us to know.",
  },
  artists: [
    {
      id: "lucia",
      slug: "lucia",
      name: "Lucia",
      pronouns: "she/her",
      portrait: "/images/artists/lucia-portrait.jpg",
      bio: "Lucia specializes in fine-line, minimalist, and small tattoos with a delicate, precise touch.",
      specialties: ["Fine-line", "Small tattoos", "Minimalist", "Delicate work"],
      instagram: "https://www.instagram.com/inkbylucia/",
      instagramHandle: "inkbylucia",
      acceptingInquiries: true,
      inquiryType: "primary",
      visualWeight: "emphasized",
    },
    {
      id: "juan",
      slug: "juan",
      name: "Juan",
      pronouns: "he/him",
      portrait: "/images/artists/juan-portrait.jpg",
      bio: "Juan creates small to medium custom tattoos across a wide range of styles — from clean linework to bold custom pieces.",
      specialties: ["Small to medium", "Custom tattoos", "Generalist styles"],
      instagram: "https://www.instagram.com/juzertattoo/",
      instagramHandle: "juzertattoo",
      acceptingInquiries: true,
      inquiryType: "primary",
      visualWeight: "emphasized",
    },
    {
      id: "marcos",
      slug: "marcos",
      name: "Marcos",
      pronouns: "he/him",
      portrait: "/images/artists/marcos-portrait.jpg",
      bio: "Marcos focuses on larger custom projects and multi-session work for clients ready to go bigger.",
      specialties: ["Large tattoos", "Custom projects", "Multi-session pieces"],
      instagram: "https://www.instagram.com/cacoink/",
      instagramHandle: "cacoink",
      acceptingInquiries: true,
      inquiryType: "large_projects",
      visualWeight: "de-emphasized",
    },
  ],
  faqs: [
    {
      id: "cost",
      question: "How much will my tattoo cost?",
      answer:
        "Pricing depends on size, placement, and detail. After you send your idea, we'll text you a quote range or ask a quick follow-up before giving numbers.",
    },
    {
      id: "minimum",
      question: "What is your shop minimum?",
      answer: "[SHOP MINIMUM] — we'll confirm for your specific piece when we reply.",
    },
    {
      id: "walkins",
      question: "Do you take walk-ins?",
      answer:
        "[CONFIGURE: Walk-in policy]. For the fastest response, start a quote and we'll text you back.",
    },
    {
      id: "timing",
      question: "How soon can I get tattooed?",
      answer:
        "Availability varies by artist. We'll share open dates when we follow up — often within a few days to a couple of weeks depending on the project.",
    },
    {
      id: "consult",
      question: "Do I need a consultation?",
      answer:
        "Many pieces can be quoted from your description and references. Larger or complex work may include a brief consult by text or in person.",
    },
    {
      id: "references",
      question: "Can I send reference photos?",
      answer:
        "Yes — upload inspiration in the quote flow. Screenshots and Pinterest saves are totally fine.",
    },
    {
      id: "deposit",
      question: "Do you require a deposit?",
      answer:
        "[CONFIGURE: Deposit policy]. We'll explain next steps when we text you.",
    },
    {
      id: "artist",
      question: "Can I choose my artist?",
      answer:
        "Absolutely. Pick Lucia, Juan, or Marcos in the quote flow — or choose \"Not sure\" and we'll route you to the right fit.",
    },
    {
      id: "age",
      question: "How old do I have to be?",
      answer:
        "[CONFIGURE: Age and ID policy per local law and shop rules.]",
    },
    {
      id: "payment",
      question: "What forms of payment do you accept?",
      answer: "[CONFIGURE: Payment methods accepted at the studio.]",
    },
    {
      id: "location",
      question: "Where are you located?",
      answer: "We're at [STUDIO ADDRESS] in [CITY, STATE]. Tap Get Directions on this page for maps.",
    },
    {
      id: "prep",
      question: "What should I do before my appointment?",
      answer:
        "Get good sleep, eat beforehand, stay hydrated, and avoid alcohol. We'll send any artist-specific prep when your appointment is booked.",
    },
  ],
  reviews: [],
};

export const siteConfig = siteConfigSchema.parse(raw);

export function getArtistById(id: string) {
  return siteConfig.artists.find((a) => a.id === id);
}

export function getArtistBySlug(slug: string) {
  return siteConfig.artists.find((a) => a.slug === slug);
}
