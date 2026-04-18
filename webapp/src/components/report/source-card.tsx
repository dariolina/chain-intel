import type { RiskSource, Severity } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SeverityIcon } from "@/components/report/severity-icon";
import { ExternalLink } from "@/components/common/external-link";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const borderColor: Record<Severity, string> = {
  danger: "border-l-severity-danger",
  warning: "border-l-severity-warning",
  info: "border-l-severity-info",
  clean: "border-l-severity-clean",
  unknown: "border-l-muted-foreground/40",
};

const iconBg: Record<Severity, string> = {
  danger: "bg-severity-danger/10 text-severity-danger",
  warning: "bg-severity-warning/10 text-severity-warning",
  info: "bg-severity-info/10 text-severity-info",
  clean: "bg-severity-clean/10 text-severity-clean",
  unknown: "bg-muted text-muted-foreground",
};

const statusLabel: Record<string, string> = {
  ok: "OK",
  flagged: "Segnalato",
  error: "Errore",
  skipped: "Saltato",
  unconfigured: "Non configurato",
};

export function SourceCard({
  source,
  index = 0,
}: {
  source: RiskSource;
  index?: number;
}) {
  const isUnconfigured = source.status === "unconfigured";
  const delay = `${index * 80}ms`;
  const flags = Array.isArray(source.details?.flags)
    ? (source.details!.flags as unknown[]).map(String)
    : [];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/70 bg-card",
        "border-l-4 shadow-sm",
        "animate-in fade-in-0 slide-in-from-bottom-3 duration-500 fill-mode-both",
        borderColor[source.severity],
        isUnconfigured && "opacity-60",
      )}
      style={{ animationDelay: delay }}
    >
      <div className="flex flex-col gap-3 p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                iconBg[source.severity],
              )}
            >
              <SeverityIcon severity={source.severity} className="h-3.5 w-3.5" decorative />
            </div>
            <span className="text-sm font-semibold leading-tight">{source.label}</span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 text-[0.6rem] uppercase tracking-wider",
              source.status === "flagged" && "border-severity-danger/40 text-severity-danger",
              source.status === "ok" && "border-severity-clean/40 text-severity-clean",
            )}
          >
            {statusLabel[source.status] ?? source.status}
          </Badge>
        </div>

        {/* Message */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {source.message}
        </p>

        {/* Flags */}
        {flags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {flags.map((f) => (
              <span
                key={f}
                className="rounded-md bg-severity-danger/8 px-2 py-0.5 font-mono text-[0.65rem] text-severity-danger"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {isUnconfigured && (
          <p className="text-xs text-muted-foreground">
            Fonte non configurata. Vedi{" "}
            <Link href="/docs#configure-sources" className="underline underline-offset-4">
              documentazione
            </Link>
            .
          </p>
        )}

        {/* Footer */}
        {source.externalUrl && !isUnconfigured && (
          <ExternalLink
            href={source.externalUrl}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Apri fonte
          </ExternalLink>
        )}
      </div>
    </div>
  );
}
