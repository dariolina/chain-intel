import type { Chain } from "@/lib/types";

const EVM_ADDR = /^0x[a-fA-F0-9]{40}$/;
const EVM_TX = /^0x[a-fA-F0-9]{64}$/;
const BTC_ADDR = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
const BTC_TX_HEX = /^[a-fA-F0-9]{64}$/;

export type Detected =
  | { ok: true; kind: "address" | "tx"; chain: Chain; value: string }
  | { ok: false; reason: "invalid" };

function normalizeBtcTx(raw: string): string | null {
  const t = raw.trim();
  if (BTC_TX_HEX.test(t)) return t.toLowerCase();
  return null;
}

export function detectSearchInput(
  raw: string,
  selectedChain: Chain
): Detected {
  const value = raw.trim();
  if (!value) return { ok: false, reason: "invalid" };

  if (EVM_TX.test(value)) {
    const chain = selectedChain === "btc" ? "eth" : selectedChain;
    return { ok: true, kind: "tx", chain, value };
  }
  if (EVM_ADDR.test(value)) {
    const chain = selectedChain === "btc" ? "eth" : selectedChain;
    return {
      ok: true,
      kind: "address",
      chain,
      value: value.toLowerCase(),
    };
  }

  if (selectedChain === "btc" || BTC_ADDR.test(value)) {
    if (BTC_ADDR.test(value)) {
      return { ok: true, kind: "address", chain: "btc", value };
    }
    const tx = normalizeBtcTx(value);
    if (tx) return { ok: true, kind: "tx", chain: "btc", value: tx };
  }

  return { ok: false, reason: "invalid" };
}
