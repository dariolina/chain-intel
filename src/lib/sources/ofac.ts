import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import type { Chain, RiskSource } from "@/lib/types";
import { isEvm, nowIso } from "./_shared";

let cached: { set: Set<string>; loadedAt: number } | null = null;
const TTL_MS = 6 * 60 * 60 * 1000;

async function loadSet(): Promise<Set<string>> {
  if (cached && Date.now() - cached.loadedAt < TTL_MS) return cached.set;

  const url = process.env.OFAC_DATA_URL;
  let list: string[] = [];

  if (url) {
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (res.ok) {
        const raw = (await res.json()) as unknown;
        if (Array.isArray(raw)) {
          list = raw.filter((v): v is string => typeof v === "string");
        } else if (
          raw &&
          typeof raw === "object" &&
          Array.isArray((raw as { addresses?: unknown }).addresses)
        ) {
          list = (raw as { addresses: unknown[] }).addresses.filter(
            (v): v is string => typeof v === "string",
          );
        }
      }
    } catch {
      /* fallthrough to seed */
    }
  }

  if (list.length === 0) {
    const seedPath = path.resolve(process.cwd(), "data/ofac-seed.json");
    const raw = JSON.parse(await fs.readFile(seedPath, "utf8")) as {
      addresses: string[];
    };
    list = raw.addresses;
  }

  const set = new Set(list.map((s) => s.toLowerCase()));
  cached = { set, loadedAt: Date.now() };
  return set;
}

export async function checkOfac(
  address: string,
  chain: Chain,
): Promise<RiskSource> {
  const fetchedAt = nowIso();
  if (!isEvm(chain)) {
    return {
      id: "ofac",
      label: "OFAC SDN",
      status: "skipped",
      severity: "unknown",
      message: "OFAC crypto list applicata solo a indirizzi EVM in questa versione.",
      fetchedAt,
    };
  }
  const set = await loadSet();
  const flagged = set.has(address.toLowerCase());
  return {
    id: "ofac",
    label: "OFAC SDN",
    status: flagged ? "flagged" : "ok",
    severity: flagged ? "danger" : "clean",
    message: flagged
      ? "Indirizzo presente nella lista OFAC SDN: interazione sconsigliata e potenzialmente illegale in molte giurisdizioni."
      : "Nessun match nella lista OFAC di riferimento.",
    externalUrl: "https://sanctionssearch.ofac.treas.gov/",
    fetchedAt,
  };
}

export async function ofacHealth(): Promise<string> {
  try {
    const set = await loadSet();
    return `ok (${set.size} entries)`;
  } catch (err) {
    return `error: ${(err as Error).message}`;
  }
}
