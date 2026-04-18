import { ExternalLink } from "@/components/common/external-link";
import { siteConfig } from "@/lib/site-config";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function InstallExtension() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="flex flex-col items-start justify-between gap-8 rounded-2xl border border-border bg-card px-6 py-10 ring-1 ring-foreground/5 sm:flex-row sm:items-center sm:px-10">
        <div>
          <h2 className="font-heading text-xl font-semibold">
            Install the Justice extension
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Bring the same screening surface to every page you work on—no wallet
            required, no on-chain signing.
          </p>
        </div>
        <ExternalLink
          href={siteConfig.extensionChromeUrl}
          className={cn(buttonVariants({ size: "lg" }), "shrink-0")}
        >
          Chrome Web Store
        </ExternalLink>
      </div>
    </section>
  );
}
