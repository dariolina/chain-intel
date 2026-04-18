import type { Chain } from "@/lib/types";

export const CHAINS: {
  id: Chain;
  label: string;
  short: string;
}[] = [
  { id: "eth", label: "Ethereum", short: "ETH" },
  { id: "base", label: "Base", short: "BASE" },
  { id: "polygon", label: "Polygon", short: "MATIC" },
  { id: "arbitrum", label: "Arbitrum", short: "ARB" },
  { id: "optimism", label: "Optimism", short: "OP" },
  { id: "btc", label: "Bitcoin", short: "BTC" },
];

const EXPLORERS: Record<Chain, string> = {
  eth: "https://etherscan.io",
  base: "https://basescan.org",
  polygon: "https://polygonscan.com",
  arbitrum: "https://arbiscan.io",
  optimism: "https://optimistic.etherscan.io",
  btc: "https://mempool.space",
};

export function chainLabel(chain: Chain): string {
  return CHAINS.find((c) => c.id === chain)?.label ?? chain;
}

export function explorerAddressUrl(chain: Chain, address: string): string {
  const base = EXPLORERS[chain];
  if (chain === "btc") return `${base}/address/${address}`;
  return `${base}/address/${address}`;
}

export function explorerTxUrl(chain: Chain, hash: string): string {
  const base = EXPLORERS[chain];
  if (chain === "btc") return `${base}/tx/${hash}`;
  return `${base}/tx/${hash}`;
}
