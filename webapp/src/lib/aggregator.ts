import "server-only";
import type { Chain, Kind, RiskReport, RiskSource } from "@/lib/types";
import { worstSeverity } from "@/lib/types";
import { cacheGet, cacheSet } from "@/lib/cache";
import { getMockReport } from "@/lib/mock";
import { checkOfac } from "@/lib/sources/ofac";
import { checkGoPlus } from "@/lib/sources/goplus";
import { checkScamsniffer } from "@/lib/sources/scamsniffer";
import { checkEtherscan } from "@/lib/sources/etherscan";
import { checkMempool } from "@/lib/sources/mempool";

function ttlSeconds(): number {
  const n = Number(process.env.RISK_CACHE_TTL_SECONDS ?? "3600");
  return Number.isFinite(n) && n > 0 ? n : 3600;
}

function cacheKey(address: string, chain: Chain, kind: Kind): string {
  return `risk:${chain}:${kind}:${address.toLowerCase()}`;
}

function buildSummary(sources: RiskSource[]): string {
  const flagged = sources.filter((s) => s.status === "flagged");
  if (flagged.length === 0) {
    const worst = worstSeverity(sources);
    if (worst === "clean") return "Nessun segnale di rischio rilevato dalle fonti attive.";
    if (worst === "info") return "Analisi completata: nessun flag, solo metadati.";
    return "Analisi parziale: alcune fonti non disponibili.";
  }
  const labels = flagged.map((s) => s.label).join(", ");
  return `Segnali di rischio da: ${labels}.`;
}

interface BuildOptions {
  address: string;
  chain: Chain;
  kind: Kind;
  fresh?: boolean;
}

export async function buildRiskReport(
  opts: BuildOptions,
): Promise<{ report: RiskReport; cached: boolean }> {
  const { address, chain, kind, fresh } = opts;
  const key = cacheKey(address, chain, kind);
  const ttl = ttlSeconds();

  if (!fresh) {
    const hit = cacheGet<RiskReport>(key);
    if (hit) {
      return {
        report: { ...hit.value, cached: true, ttlSeconds: ttl },
        cached: true,
      };
    }
  }

  // Mock data per indirizzi demo
  const mock = getMockReport(address);
  if (mock) return { report: mock, cached: false };

  const checks: Array<{ id: string; run: () => Promise<RiskSource> }> = [];
  if (chain === "btc") {
    checks.push({ id: "mempool", run: () => checkMempool(address, chain, kind) });
  } else {
    checks.push({ id: "ofac", run: () => checkOfac(address, chain) });
    checks.push({ id: "goplus", run: () => checkGoPlus(address, chain) });
    checks.push({ id: "scamsniffer", run: () => checkScamsniffer(address, chain) });
    checks.push({ id: "etherscan", run: () => checkEtherscan(address, chain, kind) });
  }

  const settled = await Promise.allSettled(checks.map((c) => c.run()));
  const sources: RiskSource[] = settled.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      id: checks[i].id as RiskSource["id"],
      label: checks[i].id,
      status: "error",
      severity: "unknown",
      message: `Errore: ${(r.reason as Error).message}`,
      fetchedAt: new Date().toISOString(),
    };
  });

  const severity = worstSeverity(sources);
  const report: RiskReport = {
    address,
    chain,
    kind,
    severity,
    summary: buildSummary(sources),
    sources,
    generatedAt: new Date().toISOString(),
    cached: false,
    ttlSeconds: ttl,
  };

  cacheSet(key, report, ttl);
  return { report, cached: false };
}
