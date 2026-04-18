export type Severity = "clean" | "info" | "warning" | "danger" | "unknown";
export type Chain =
  | "eth"
  | "base"
  | "polygon"
  | "arbitrum"
  | "optimism"
  | "btc";
export type Kind = "address" | "tx";
export type SourceId =
  | "goplus"
  | "scamsniffer"
  | "ofac"
  | "etherscan"
  | "mempool";

export const SEVERITY_RANK: Record<Severity, number> = {
  unknown: 0,
  clean: 1,
  info: 2,
  warning: 3,
  danger: 4,
};

export function worstSeverity(items: { severity: Severity }[]): Severity {
  let worst: Severity = "unknown";
  for (const it of items) {
    if (SEVERITY_RANK[it.severity] > SEVERITY_RANK[worst]) worst = it.severity;
  }
  return worst;
}

export interface RiskSource {
  id: SourceId;
  label: string;
  status: "ok" | "flagged" | "error" | "skipped" | "unconfigured";
  severity: Severity;
  message: string;
  details?: Record<string, unknown>;
  externalUrl?: string;
  fetchedAt: string;
}

export interface RiskReport {
  address: string;
  chain: Chain;
  kind: Kind;
  severity: Severity;
  summary: string;
  sources: RiskSource[];
  generatedAt: string;
  cached?: boolean;
  ttlSeconds?: number;
}

export interface HealthResponse {
  ok: boolean;
  sources?: Record<string, string>;
  cache?: { size: number; ageP50Ms?: number };
}
