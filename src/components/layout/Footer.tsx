import Link from "next/link";
import { siteConfig } from "@/content/site.config";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:px-6">
        <div className="flex flex-col gap-2">
          <p className="font-display text-xl">{siteConfig.studio.name}</p>
          <p className="text-sm text-muted">{siteConfig.studio.cityState}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <a
            href={siteConfig.studio.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-foreground"
          >
            Instagram
          </a>
          <Link href="/privacy" className="text-muted hover:text-foreground">
            Privacy
          </Link>
          <Link href="/admin/login" className="text-muted hover:text-foreground">
            Studio login
          </Link>
        </div>
        <p className="text-xs text-muted/80">
          © {new Date().getFullYear()} {siteConfig.studio.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
