import type { RiskReport } from "@/lib/types";
import { truncateMiddle } from "@/lib/format";
import { formatRelativeTime } from "@/lib/format";
import { SeverityBadge } from "@/components/report/severity-badge";
import { CopyButton } from "@/components/common/copy-button-loader";
import { ReportActions } from "@/components/report/report-actions";
import { chainLabel } from "@/lib/chains";

export function ReportHeader({
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
  const display = truncateMiddle(report.address, 8, 6);

  return (
    <header className="space-y-6 border-b border-border/80 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {chainLabel(report.chain)} ·{" "}
            {report.kind === "tx" ? "Transaction probe" : "Address"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-xl font-medium tracking-tight sm:text-2xl">
              {display}
            </h1>
            <CopyButton text={report.address} label="Copy full address" />
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {report.summary}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <SeverityBadge severity={report.severity} size="lg" />
            <span aria-hidden>·</span>
            <span>
              Updated {formatRelativeTime(report.generatedAt)}
              {report.cached ? " · cached" : ""}
            </span>
            {typeof report.ttlSeconds === "number" && (
              <>
                <span aria-hidden>·</span>
                <span>TTL {report.ttlSeconds}s</span>
              </>
            )}
          </div>
        </div>
        <ReportActions
          explorerUrl={explorerUrl}
          pathnameForCopy={pathnameForCopy}
          freshHref={freshHref}
        />
      </div>
    </header>
  );
}
