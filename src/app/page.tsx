import { SiteShell } from "@/components/layout/SiteShell";
import { Hero } from "@/components/home/Hero";
import { ArtistSelectorSection } from "@/components/artists/ArtistCard";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { LocationBlock } from "@/components/home/LocationBlock";

export default function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <ArtistSelectorSection />
      <PortfolioGrid />
      <HowItWorks />
      <ReviewsSection />
      <FAQAccordion />
      <LocationBlock />
    </SiteShell>
  );
}
