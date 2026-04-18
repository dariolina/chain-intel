import "server-only";
import type { Chain } from "@/lib/types";

export interface EvmChainInfo {
  explorerBaseUrl: string;
  etherscanApiBaseUrl: string;
  etherscanChainId: number;
}

export const EVM_CHAINS: Partial<Record<Chain, EvmChainInfo>> = {
  eth: {
    explorerBaseUrl: "https://etherscan.io",
    etherscanApiBaseUrl: "https://api.etherscan.io/v2/api",
    etherscanChainId: 1,
  },
  base: {
    explorerBaseUrl: "https://basescan.org",
    etherscanApiBaseUrl: "https://api.etherscan.io/v2/api",
    etherscanChainId: 8453,
  },
  polygon: {
    explorerBaseUrl: "https://polygonscan.com",
    etherscanApiBaseUrl: "https://api.etherscan.io/v2/api",
    etherscanChainId: 137,
  },
  arbitrum: {
    explorerBaseUrl: "https://arbiscan.io",
    etherscanApiBaseUrl: "https://api.etherscan.io/v2/api",
    etherscanChainId: 42161,
  },
  optimism: {
    explorerBaseUrl: "https://optimistic.etherscan.io",
    etherscanApiBaseUrl: "https://api.etherscan.io/v2/api",
    etherscanChainId: 10,
  },
};

export function isEvm(chain: Chain): boolean {
  return chain !== "btc";
}

export function nowIso(): string {
  return new Date().toISOString();
}
