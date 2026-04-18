import Link from "next/link";
import { ExternalLink } from "@/components/common/external-link";
import { CopyButton } from "@/components/common/copy-button-loader";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

export function ReportActions({
  explorerUrl,
  pathnameForCopy,
  freshHref,
}: {
  explorerUrl: string;
  pathnameForCopy: string;
  freshHref: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={freshHref}
        prefetch={false}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "inline-flex items-center gap-1.5"
        )}
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
        Refresh
      </Link>
      <ExternalLink
        href={explorerUrl}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "inline-flex items-center gap-1.5"
        )}
      >
        Block explorer
      </ExternalLink>
      <CopyButton text={pathnameForCopy} label="Copy link to report" />
    </div>
  );
}
