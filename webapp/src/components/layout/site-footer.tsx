import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { ExternalLink } from "@/components/common/external-link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-heading text-sm font-medium">{siteConfig.name}</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {siteConfig.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <ExternalLink
            href={siteConfig.extensionChromeUrl}
            className="text-muted-foreground hover:text-foreground"
          >
            Browser extension
          </ExternalLink>
          <ExternalLink
            href={siteConfig.githubUrl}
            className="text-muted-foreground hover:text-foreground"
          >
            Source
          </ExternalLink>
          <Link
            href="/docs"
            className="text-muted-foreground hover:text-foreground"
          >
            Documentation
          </Link>
          <Link
            href="/status"
            className="text-muted-foreground hover:text-foreground"
          >
            Service status
          </Link>
        </div>
      </div>
    </footer>
  );
}
