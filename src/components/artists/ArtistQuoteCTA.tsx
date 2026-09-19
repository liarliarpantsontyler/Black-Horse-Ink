"use client";

import { getQuoteWithArtist, siteConfig } from "@/content/site.config";
import { useQuote } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

type Props = {
  artistId: string;
  instagram: string;
};

export function ArtistQuoteCTA({ artistId, instagram }: Props) {
  const { openQuote } = useQuote();
  const artist = siteConfig.artists.find((a) => a.id === artistId);
  const label =
    artist?.inquiryType === "large_projects"
      ? siteConfig.copy.largeProjectCta
      : getQuoteWithArtist(artist?.name ?? "Artist");

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Button type="button" onClick={() => openQuote(artistId)}>
        {label}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          trackEvent("instagram_click", { artist_id: artistId });
          window.open(instagram, "_blank", "noopener,noreferrer");
        }}
      >
        View Instagram
      </Button>
    </div>
  );
}
