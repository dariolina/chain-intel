import "server-only";
import type { Chain, HealthResponse, Kind, RiskReport } from "@/lib/types";

export class RiskFetchError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
    public readonly retryAfter?: number
  ) {
    super(`Risk API ${status}`);
    this.name = "RiskFetchError";
  }
}

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export async function fetchRiskReport(params: {
  chain: Chain;
  kind: Kind;
  address: string;
  fresh?: boolean;
}): Promise<RiskReport> {
  const qs = new URLSearchParams({
    chain: params.chain,
    kind: params.kind,
    address: params.address,
    ...(params.fresh ? { fresh: "1" } : {}),
  });
  const res = await fetch(`${getBaseUrl()}/api/risk?${qs}`, {
    ...(params.fresh
      ? { cache: "no-store" as const }
      : { next: { revalidate: 60 } }),
  });
  if (!res.ok) {
    let retryAfter: number | undefined;
    if (res.status === 429) {
      try {
        const j = (await res.clone().json()) as { retryAfter?: number };
        if (typeof j.retryAfter === "number") retryAfter = j.retryAfter;
      } catch {
        const ra = res.headers.get("retry-after");
        if (ra) retryAfter = Number.parseInt(ra, 10);
      }
    }
    throw new RiskFetchError(res.status, await res.text(), retryAfter);
  }
  return res.json() as Promise<RiskReport>;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${getBaseUrl()}/api/health`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new RiskFetchError(res.status, await res.text());
  }
  return res.json() as Promise<HealthResponse>;
}
