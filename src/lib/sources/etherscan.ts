import "server-only";
import type { Chain, Kind, RiskSource } from "@/lib/types";
import { EVM_CHAINS, isEvm, nowIso } from "./_shared";

interface EtherscanResponse<T> {
  status: string;
  message: string;
  result: T;
}

async function call<T>(
  base: string,
  params: Record<string, string | number>,
): Promise<T> {
  const qs = new URLSearchParams(params as Record<string, string>);
  const key = process.env.ETHERSCAN_API_KEY;
  if (key) qs.set("apikey", key);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${base}?${qs}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`Etherscan ${res.status}`);
    const json = (await res.json()) as EtherscanResponse<T>;
    return json.result;
  } finally {
    clearTimeout(timeout);
  }
}

function formatEth(wei: string): string {
  try {
    const big = BigInt(wei);
    const eth = Number(big) / 1e18;
    return `${eth.toFixed(4)} ETH`;
  } catch {
    return `${wei} wei`;
  }
}

export async function checkEtherscan(
  address: string,
  chain: Chain,
  kind: Kind,
): Promise<RiskSource> {
  const fetchedAt = nowIso();
  const info = EVM_CHAINS[chain];
  if (!isEvm(chain) || !info) {
    return {
      id: "etherscan",
      label: "Etherscan V2",
      status: "skipped",
      severity: "unknown",
      message: "Etherscan V2 è applicabile solo alle chain EVM supportate.",
      fetchedAt,
    };
  }

  if (!process.env.ETHERSCAN_API_KEY) {
    return {
      id: "etherscan",
      label: "Etherscan V2",
      status: "unconfigured",
      severity: "unknown",
      message:
        "ETHERSCAN_API_KEY non impostata: metadati on-chain non disponibili per questa chain.",
      externalUrl: `${info.explorerBaseUrl}/address/${address}`,
      fetchedAt,
    };
  }

  try {
    if (kind === "tx") {
      const tx = await call<{ from?: string; to?: string; value?: string } | null>(
        info.etherscanApiBaseUrl,
        {
          chainid: info.etherscanChainId,
          module: "proxy",
          action: "eth_getTransactionByHash",
          txhash: address,
        },
      );
      if (!tx || typeof tx !== "object") {
        return {
          id: "etherscan",
          label: "Etherscan V2",
          status: "ok",
          severity: "info",
          message: "Transazione non trovata o in mempool.",
          externalUrl: `${info.explorerBaseUrl}/tx/${address}`,
          fetchedAt,
        };
      }
      return {
        id: "etherscan",
        label: "Etherscan V2",
        status: "ok",
        severity: "info",
        message: `Tx ${tx.from ? `da ${tx.from.slice(0, 10)}…` : ""}${tx.to ? ` a ${tx.to.slice(0, 10)}…` : ""}.`,
        details: { from: tx.from, to: tx.to, valueWei: tx.value },
        externalUrl: `${info.explorerBaseUrl}/tx/${address}`,
        fetchedAt,
      };
    }

    const [balance, code] = await Promise.all([
      call<string>(info.etherscanApiBaseUrl, {
        chainid: info.etherscanChainId,
        module: "account",
        action: "balance",
        address,
        tag: "latest",
      }),
      call<string>(info.etherscanApiBaseUrl, {
        chainid: info.etherscanChainId,
        module: "proxy",
        action: "eth_getCode",
        address,
        tag: "latest",
      }),
    ]);
    const isContract = typeof code === "string" && code !== "0x" && code.length > 2;
    return {
      id: "etherscan",
      label: "Etherscan V2",
      status: "ok",
      severity: "info",
      message: isContract
        ? `Contratto con saldo ${formatEth(balance)}.`
        : `EOA con saldo ${formatEth(balance)}.`,
      details: { isContract, balanceWei: balance },
      externalUrl: `${info.explorerBaseUrl}/address/${address}`,
      fetchedAt,
    };
  } catch (err) {
    return {
      id: "etherscan",
      label: "Etherscan V2",
      status: "error",
      severity: "unknown",
      message: `Errore Etherscan: ${(err as Error).message}`,
      externalUrl: `${info.explorerBaseUrl}/address/${address}`,
      fetchedAt,
    };
  }
}

export function etherscanHealth(): string {
  return process.env.ETHERSCAN_API_KEY
    ? "ok (api key set)"
    : "unconfigured (no api key)";
}
