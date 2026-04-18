import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "@/components/report/severity-badge";
import { Badge } from "@/components/ui/badge";
import { PurgeButton } from "@/app/history/purge-button";
import { listSearches } from "@/lib/db";
import { chainLabel } from "@/lib/chains";
import { formatDateTime, truncateMiddle } from "@/lib/format";
import type { Chain, Kind, Severity } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Cronologia",
  description: "Tutte le analisi on-chain salvate localmente.",
};

export default function HistoryPage() {
  const rows = listSearches(200);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Cronologia
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Report salvati localmente in SQLite. Clic sull&apos;elemento per
            riaprirlo.
          </p>
        </div>
        {rows.length > 0 && <PurgeButton />}
      </header>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            {rows.length} record
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {rows.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Nessuna analisi registrata. Eseguine una dalla{" "}
              <Link
                href="/dashboard"
                className="text-primary underline underline-offset-4"
              >
                dashboard
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {rows.map((r) => {
                const href =
                  r.kind === "tx"
                    ? `/tx/${r.chain}/${r.address}`
                    : `/address/${r.chain}/${r.address}`;
                return (
                  <li key={r.id}>
                    <Link
                      href={href}
                      className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm">
                            {truncateMiddle(r.address, 10, 6)}
                          </span>
                          <Badge variant="outline" className="text-[0.65rem]">
                            {chainLabel(r.chain as Chain)}
                          </Badge>
                          <Badge variant="outline" className="text-[0.65rem] uppercase">
                            {r.kind as Kind}
                          </Badge>
                          {r.ai_analysis && (
                            <Badge className="text-[0.65rem]">AI</Badge>
                          )}
                        </div>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {r.summary}
                        </p>
                        <p className="text-[0.65rem] text-muted-foreground">
                          {formatDateTime(r.created_at)}
                        </p>
                      </div>
                      <SeverityBadge severity={r.severity as Severity} size="sm" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
