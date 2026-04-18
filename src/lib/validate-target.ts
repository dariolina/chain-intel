import type { Chain } from "@/lib/types";

const EVM_ADDR = /^0x[a-fA-F0-9]{40}$/;
const EVM_TX = /^0x[a-fA-F0-9]{64}$/;
const BTC_ADDR = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
const BTC_TX = /^[a-fA-F0-9]{64}$/;

export function isValidAddressForChain(chain: Chain, value: string): boolean {
  if (chain === "btc") return BTC_ADDR.test(value);
  return EVM_ADDR.test(value);
}

export function isValidTxForChain(chain: Chain, value: string): boolean {
  if (chain === "btc") return BTC_TX.test(value);
  return EVM_TX.test(value);
}
