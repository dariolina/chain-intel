import type { Metadata } from "next";
import { Activity, AlertTriangle, Database, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Sparkline } from "@/components/dashboard/sparkline";
import { RecentList } from "@/components/dashboard/recent-list";
import { SearchBar } from "@/components/search/search-bar";
import { getStats, listSearches } from "@/lib/db";
import type { Chain, Kind, Severity } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Dashboard",
  description: "Statistiche e cronologia delle analisi on-chain.",
};

const EMPTY_STATS = {
  total: 0,
  flagged: 0,
  byChain: [] as { chain: string; count: number }[],
  perDay: [] as { day: string; count: number }[],
};

export default function DashboardPage() {
  let stats = EMPTY_STATS;
  let recent: { id: number; address: string; chain: Chain; kind: Kind; severity: Severity; createdAt: string }[] = [];
  try {
    stats = getStats();
    recent = listSearches(8).map((r) => ({
      id: r.id,
      address: r.address,
      chain: r.chain as Chain,
      kind: r.kind as Kind,
      severity: r.severity as Severity,
      createdAt: r.created_at,
    }));
  } catch {
    // SQLite non disponibile (es. first boot su Vercel) — mostra dati vuoti
  }

  const last7 = fillLast7Days(stats.perDay);
  const topChain = stats.byChain[0]?.chain ?? "—";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Panoramica delle analisi eseguite su questa istanza. Ricerca un
          indirizzo o una transazione per aggregare le fonti in tempo reale.
        </p>
      </header>

      <div className="mt-6">
        <SearchBar />
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Analisi totali"
          value={stats.total}
          hint="Conteggio persistito localmente"
          Icon={Database}
        />
        <StatCard
          label="Segnalati"
          value={stats.flagged}
          hint="Severity warning o danger"
          Icon={AlertTriangle}
        />
        <StatCard
          label="Ultimi 7 giorni"
          value={last7.reduce((a, b) => a + b, 0)}
          hint="Volume recente"
          Icon={Activity}
        />
        <StatCard
          label="Top chain"
          value={topChain}
          hint="Più analizzata"
          Icon={ShieldCheck}
        />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Trend ultimi 7 giorni
            </CardTitle>
            <CardDescription>Analisi registrate per giorno</CardDescription>
          </CardHeader>
          <CardContent>
            <Sparkline data={last7} width={280} height={64} />
            <div className="mt-3 flex justify-between text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              <span>−7g</span>
              <span>oggi</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Ricerche recenti
            </CardTitle>
            <CardDescription>
              Le ultime analisi eseguite. Clic per riaprire.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <RecentList items={recent} />
          </CardContent>
        </Card>
      </section>

      {stats.byChain.length > 0 && (
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Distribuzione per chain
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {stats.byChain.map((c) => (
                  <li
                    key={c.chain}
                    className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2"
                  >
                    <span className="font-mono text-xs uppercase tracking-wider">
                      {c.chain}
                    </span>
                    <span className="text-muted-foreground">{c.count}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

function fillLast7Days(perDay: { day: string; count: number }[]): number[] {
  const map = new Map(perDay.map((p) => [p.day, p.count]));
  const out: number[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push(map.get(key) ?? 0);
  }
  return out;
}
