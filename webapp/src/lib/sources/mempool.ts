import "server-only";
import type { Chain, Kind, RiskSource } from "@/lib/types";
import { nowIso } from "./_shared";

const PROVIDERS = [
  { name: "mempool.space", api: "https://mempool.space/api", ui: "https://mempool.space" },
  { name: "blockstream.info", api: "https://blockstream.info/api", ui: "https://blockstream.info" },
];
const TIMEOUT_MS = 7000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

async function fetchFirst<T>(pathBuilder: (apiBase: string) => string): Promise<{
  data: T;
  ui: string;
}> {
  let lastErr: unknown = null;
  for (const p of PROVIDERS) {
    try {
      const res = await fetchWithTimeout(pathBuilder(p.api));
      if (!res.ok) {
        lastErr = new Error(`${p.name} ${res.status}`);
        continue;
      }
      const data = (await res.json()) as T;
      return { data, ui: p.ui };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("no BTC provider available");
}

interface BtcAddress {
  address: string;
  chain_stats: {
    funded_txo_sum: number;
    spent_txo_sum: number;
    tx_count: number;
  };
}
interface BtcTx {
  txid: string;
  fee: number;
  status?: { confirmed?: boolean; block_height?: number };
  vin?: { prevout?: { value?: number } }[];
  vout?: { value?: number }[];
}

function formatBtc(sats: number): string {
  return `${(sats / 1e8).toFixed(8)} BTC`;
}

export async function checkMempool(
  address: string,
  chain: Chain,
  kind: Kind,
): Promise<RiskSource> {
  const fetchedAt = nowIso();
  if (chain !== "btc") {
    return {
      id: "mempool",
      label: "mempool.space",
      status: "skipped",
      severity: "unknown",
      message: "mempool.space è usato solo per Bitcoin.",
      fetchedAt,
    };
  }

  try {
    if (kind === "tx") {
      const { data: tx, ui } = await fetchFirst<BtcTx>(
        (base) => `${base}/tx/${address}`,
      );
      const totalOut = (tx.vout ?? []).reduce((s, v) => s + (v.value ?? 0), 0);
      const confirmed = tx.status?.confirmed === true;
      return {
        id: "mempool",
        label: "BTC explorer",
        status: "ok",
        severity: "info",
        message: confirmed
          ? `Tx confermata, output totale ${formatBtc(totalOut)}.`
          : `Tx in mempool, output totale ${formatBtc(totalOut)}.`,
        details: { confirmed, totalOutSats: totalOut, feeSats: tx.fee },
        externalUrl: `${ui}/tx/${address}`,
        fetchedAt,
      };
    }

    const { data: addr, ui } = await fetchFirst<BtcAddress>(
      (base) => `${base}/address/${address}`,
    );
    const funded = addr.chain_stats.funded_txo_sum;
    const spent = addr.chain_stats.spent_txo_sum;
    const balance = funded - spent;
    return {
      id: "mempool",
      label: "BTC explorer",
      status: "ok",
      severity: "info",
      message: `Indirizzo con ${addr.chain_stats.tx_count} tx, saldo ${formatBtc(balance)}.`,
      details: {
        txCount: addr.chain_stats.tx_count,
        balanceSats: balance,
      },
      externalUrl: `${ui}/address/${address}`,
      fetchedAt,
    };
  } catch (err) {
    return {
      id: "mempool",
      label: "BTC explorer",
      status: "error",
      severity: "unknown",
      message: `Errore provider BTC: ${(err as Error).message}`,
      fetchedAt,
    };
  }
}

export function mempoolHealth(): string {
  return "ok (public API)";
}
