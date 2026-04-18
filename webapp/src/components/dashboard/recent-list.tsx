import Link from "next/link";
import type { Chain, Kind, Severity } from "@/lib/types";
import { SeverityBadge } from "@/components/report/severity-badge";
import { chainLabel } from "@/lib/chains";
import { truncateMiddle, formatRelativeTime } from "@/lib/format";

interface RecentItem {
  id: number;
  address: string;
  chain: Chain;
  kind: Kind;
  severity: Severity;
  createdAt: string;
}

function href(item: RecentItem): string {
  return item.kind === "tx"
    ? `/tx/${item.chain}/${item.address}`
    : `/address/${item.chain}/${item.address}`;
}

export function RecentList({ items }: { items: RecentItem[] }) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        Nessuna ricerca ancora. Usa la barra per analizzare un indirizzo o una
        transazione.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border/60">
      {items.map((it) => (
        <li key={it.id}>
          <Link
            href={href(it)}
            className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-sm">
                {truncateMiddle(it.address, 8, 6)}
              </p>
              <p className="text-xs text-muted-foreground">
                {chainLabel(it.chain)} · {it.kind === "tx" ? "tx" : "address"}{" "}
                · {formatRelativeTime(it.createdAt)}
              </p>
            </div>
            <SeverityBadge severity={it.severity} size="sm" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
