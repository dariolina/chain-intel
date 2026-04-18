import "server-only";
import type { Chain, RiskSource, Severity } from "@/lib/types";
import { isEvm, nowIso } from "./_shared";

// https://docs.gopluslabs.io/reference/api-overview
// Endpoint gratuito senza API key: rate ~30 rpm per IP.
const CHAIN_ID: Partial<Record<Chain, number>> = {
  eth: 1,
  base: 8453,
  polygon: 137,
  arbitrum: 42161,
  optimism: 10,
};

const HIGH_RISK_FLAGS = [
  "cybercrime",
  "money_laundering",
  "financial_crime",
  "darkweb_transactions",
  "phishing_activities",
  "stealing_attack",
  "blackmail_activities",
  "sanctioned",
  "mixer",
  "malicious_mining_activities",
] as const;

const MEDIUM_RISK_FLAGS = [
  "honeypot_related_address",
  "blacklist_doubt",
  "fake_kyc",
  "fake_token",
  "fake_standard_interface",
  "gas_abuse",
  "reinit",
] as const;

const LABELS: Record<string, string> = {
  cybercrime: "cybercrime",
  money_laundering: "riciclaggio",
  financial_crime: "crimine finanziario",
  darkweb_transactions: "darkweb",
  phishing_activities: "phishing",
  stealing_attack: "furto",
  blackmail_activities: "ricatto",
  sanctioned: "sanzionato",
  mixer: "mixer",
  malicious_mining_activities: "mining malevolo",
  honeypot_related_address: "legato a honeypot",
  blacklist_doubt: "blacklist sospetta",
  fake_kyc: "fake KYC",
  fake_token: "fake token",
  fake_standard_interface: "interfaccia fake",
  gas_abuse: "abuso gas",
  reinit: "reinit",
};

interface GoPlusResponse {
  code: number;
  message: string;
  result?: Record<string, string>;
}

export async function checkGoPlus(
  address: string,
  chain: Chain,
): Promise<RiskSource> {
  const fetchedAt = nowIso();
  const externalUrl = `https://gopluslabs.io/token-security/${CHAIN_ID[chain] ?? 1}/${address}`;

  if (!isEvm(chain)) {
    return {
      id: "goplus",
      label: "GoPlus",
      status: "skipped",
      severity: "unknown",
      message: "GoPlus supportato solo su EVM in questa versione.",
      fetchedAt,
    };
  }

  const chainId = CHAIN_ID[chain];
  if (!chainId) {
    return {
      id: "goplus",
      label: "GoPlus",
      status: "skipped",
      severity: "unknown",
      message: `Chain ${chain} non mappata su GoPlus.`,
      fetchedAt,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(
      `https://api.gopluslabs.io/api/v1/address_security/${address}?chain_id=${chainId}`,
      { signal: controller.signal, headers: { Accept: "application/json" } },
    );
    clearTimeout(timeout);

    if (res.status === 429) {
      return {
        id: "goplus",
        label: "GoPlus",
        status: "error",
        severity: "unknown",
        message: "Rate limit GoPlus raggiunto (free tier: ~30 rpm per IP).",
        externalUrl,
        fetchedAt,
      };
    }
    if (!res.ok) {
      return {
        id: "goplus",
        label: "GoPlus",
        status: "error",
        severity: "unknown",
        message: `GoPlus ha risposto ${res.status}.`,
        externalUrl,
        fetchedAt,
      };
    }

    const json = (await res.json()) as GoPlusResponse;
    if (json.code !== 1 || !json.result) {
      return {
        id: "goplus",
        label: "GoPlus",
        status: "error",
        severity: "unknown",
        message: json.message || "risposta GoPlus non valida",
        externalUrl,
        fetchedAt,
      };
    }

    const flagged: string[] = [];
    let severity: Severity = "clean";
    for (const k of HIGH_RISK_FLAGS) {
      if (json.result[k] === "1") {
        flagged.push(LABELS[k] ?? k);
        severity = "danger";
      }
    }
    for (const k of MEDIUM_RISK_FLAGS) {
      if (json.result[k] === "1") {
        flagged.push(LABELS[k] ?? k);
        if (severity !== "danger") severity = "warning";
      }
    }

    const isContract = json.result.contract_address === "1";
    const badContractsCreated = Number(
      json.result.number_of_malicious_contracts_created ?? "0",
    );
    if (badContractsCreated > 0 && severity === "clean") severity = "warning";

    if (flagged.length === 0 && badContractsCreated === 0) {
      return {
        id: "goplus",
        label: "GoPlus",
        status: "ok",
        severity: "clean",
        message: isContract
          ? "Nessun flag di sicurezza rilevato (contratto)."
          : "Nessun flag di sicurezza rilevato.",
        details: { isContract, dataSource: json.result.data_source || undefined },
        externalUrl,
        fetchedAt,
      };
    }

    return {
      id: "goplus",
      label: "GoPlus",
      status: "flagged",
      severity,
      message:
        flagged.length > 0
          ? `Flag GoPlus: ${flagged.join(", ")}.`
          : `Ha creato ${badContractsCreated} contratti segnalati come malevoli.`,
      details: {
        isContract,
        badContractsCreated,
        dataSource: json.result.data_source || undefined,
        flags: flagged,
      },
      externalUrl,
      fetchedAt,
    };
  } catch (err) {
    return {
      id: "goplus",
      label: "GoPlus",
      status: "error",
      severity: "unknown",
      message: `Errore contatto GoPlus: ${(err as Error).message}`,
      externalUrl,
      fetchedAt,
    };
  }
}

export function goplusHealth(): string {
  return "ok (no key required)";
}
