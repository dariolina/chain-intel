import "server-only";
import type { Chain, RiskSource } from "@/lib/types";
import { isEvm, nowIso } from "./_shared";

const SOURCE_URL =
  "https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist/address.json";
const TTL_MS = 6 * 60 * 60 * 1000;

let cached: { set: Set<string>; loadedAt: number } | null = null;

async function loadSet(): Promise<Set<string>> {
  if (cached && Date.now() - cached.loadedAt < TTL_MS) return cached.set;
  const res = await fetch(SOURCE_URL, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`ScamSniffer ${res.status}`);
  const raw = (await res.json()) as unknown;
  const list: string[] = Array.isArray(raw)
    ? (raw as unknown[]).filter((v): v is string => typeof v === "string")
    : [];
  const set = new Set(list.map((s) => s.toLowerCase()));
  cached = { set, loadedAt: Date.now() };
  return set;
}

export async function checkScamsniffer(
  address: string,
  chain: Chain,
): Promise<RiskSource> {
  const fetchedAt = nowIso();
  if (!isEvm(chain)) {
    return {
      id: "scamsniffer",
      label: "ScamSniffer",
      status: "skipped",
      severity: "unknown",
      message: "ScamSniffer copre principalmente indirizzi EVM.",
      fetchedAt,
    };
  }
  try {
    const set = await loadSet();
    const flagged = set.has(address.toLowerCase());
    return {
      id: "scamsniffer",
      label: "ScamSniffer",
      status: flagged ? "flagged" : "ok",
      severity: flagged ? "danger" : "clean",
      message: flagged
        ? "Indirizzo nella blacklist pubblica ScamSniffer (drainer/phishing)."
        : "Nessun match nella blacklist ScamSniffer.",
      externalUrl: "https://scamsniffer.io/",
      details: { listSize: set.size },
      fetchedAt,
    };
  } catch (err) {
    return {
      id: "scamsniffer",
      label: "ScamSniffer",
      status: "error",
      severity: "unknown",
      message: `Errore caricamento lista ScamSniffer: ${(err as Error).message}`,
      fetchedAt,
    };
  }
}

export async function scamsnifferHealth(): Promise<string> {
  try {
    const set = await loadSet();
    return `ok (${set.size} entries)`;
  } catch (err) {
    return `error: ${(err as Error).message}`;
  }
}
