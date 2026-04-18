import type { RiskReport, Severity } from "@/lib/types";
import { cn } from "@/lib/utils";
import { chainLabel } from "@/lib/chains";
import { formatRelativeTime } from "@/lib/format";
import { SeverityIcon } from "@/components/report/severity-icon";
import { CopyButton } from "@/components/common/copy-button-loader";
import { ExternalLink } from "@/components/common/external-link";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const heroBg: Record<Severity, string> = {
  danger: "bg-severity-danger/6 border-severity-danger/20",
  warning: "bg-severity-warning/6 border-severity-warning/20",
  info: "bg-severity-info/6 border-severity-info/20",
  clean: "bg-severity-clean/6 border-severity-clean/20",
  unknown: "bg-muted/40 border-border",
};

const heroBorder: Record<Severity, string> = {
  danger: "border-t-severity-danger",
  warning: "border-t-severity-warning",
  info: "border-t-severity-info",
  clean: "border-t-severity-clean",
  unknown: "border-t-border",
};

const severityLabel: Record<Severity, string> = {
  danger: "ALTO RISCHIO",
  warning: "RISCHIO MODERATO",
  info: "INFORMATIVO",
  clean: "PULITO",
  unknown: "SCONOSCIUTO",
};

const severityText: Record<Severity, string> = {
  danger: "text-severity-danger",
  warning: "text-severity-warning",
  info: "text-severity-info",
  clean: "text-severity-clean",
  unknown: "text-muted-foreground",
};

export function SeverityHero({
  report,
  explorerUrl,
  pathnameForCopy,
  freshHref,
}: {
  report: RiskReport;
  explorerUrl: string;
  pathnameForCopy: string;
  freshHref: string;
}) {
  const { severity } = report;
  const isAddress = report.kind === "address";
  const displayFull = report.address;
  const displayShort =
    displayFull.length > 18
      ? `${displayFull.slice(0, 10)}…${displayFull.slice(-8)}`
      : displayFull;

  return (
    <div
      className={cn(
        "animate-in fade-in-0 slide-in-from-top-2 duration-500",
        "rounded-2xl border border-t-4 px-6 py-7 shadow-sm",
        heroBg[severity],
        heroBorder[severity],
      )}
    >
      {/* Severity label + icon */}
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            "bg-background/80 shadow-sm ring-1 ring-border/60",
          )}
        >
          <SeverityIcon
            severity={severity}
            className={cn("h-5 w-5", severityText[severity])}
            decorative
          />
        </div>
        <span
          className={cn(
            "text-xs font-bold uppercase tracking-[0.15em]",
            severityText[severity],
          )}
        >
          {severityLabel[severity]}
        </span>
      </div>

      {/* Address */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xl font-semibold tracking-tight break-all sm:text-2xl">
          {displayShort}
        </span>
        <CopyButton text={displayFull} label="Copia indirizzo completo" />
      </div>

      {/* Chain / kind / meta */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="rounded-md bg-background/70 px-2 py-0.5 ring-1 ring-border/60">
          {chainLabel(report.chain)}
        </span>
        <span className="rounded-md bg-background/70 px-2 py-0.5 ring-1 ring-border/60 uppercase">
          {isAddress ? "address" : "transaction"}
        </span>
        <span>
          Aggiornato {formatRelativeTime(report.generatedAt)}
          {report.cached && " · cache"}
        </span>
        {typeof report.ttlSeconds === "number" && (
          <span>TTL {report.ttlSeconds}s</span>
        )}
      </div>

      {/* Summary */}
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {report.summary}
      </p>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link
          href={freshHref}
          prefetch={false}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "inline-flex items-center gap-1.5 bg-background/70",
          )}
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Refresh
        </Link>
        <ExternalLink
          href={explorerUrl}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "inline-flex items-center gap-1.5 bg-background/70",
          )}
        >
          Explorer
        </ExternalLink>
        <CopyButton text={pathnameForCopy} label="Copia link al report" />
      </div>
    </div>
  );
}
