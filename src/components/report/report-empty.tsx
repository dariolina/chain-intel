import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReportEmpty() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
      <h2 className="font-heading text-lg font-medium">No sources available</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        This report has no configured data sources yet, or every source is
        unconfigured on this instance. Check service configuration and the
        status page.
      </p>
      <Link
        href="/status"
        className={cn(buttonVariants({ size: "default" }), "mt-6 inline-flex")}
      >
        View status
      </Link>
    </div>
  );
}
