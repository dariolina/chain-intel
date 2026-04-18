import type { HostConfig } from "./types";

const EXACT_HOSTS: Record<string, HostConfig> = {
  "arbiscan.io": { chain: "arbitrum", family: "evm" },
  "basescan.org": { chain: "base", family: "evm" },
  "blockstream.info": { chain: "btc", family: "btc" },
  "etherscan.io": { chain: "eth", family: "evm" },
  "mempool.space": { chain: "btc", family: "btc" },
  "optimistic.etherscan.io": { chain: "optimism", family: "evm" },
  "polygonscan.com": { chain: "polygon", family: "evm" },
};

export function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

export function getHostConfig(hostname: string): HostConfig | null {
  const normalized = normalizeHostname(hostname);
  return EXACT_HOSTS[normalized] ?? null;
}

export function isSupportedHost(hostname: string): boolean {
  return getHostConfig(hostname) !== null;
}
