import type { Chain } from "@/lib/types";

// Loghi serviti da icons.llamao.fi (DefiLlama): CDN gratuita, senza CORS, copre tutte le chain.
// In caso di fallimento il componente ChainLogo ricade su un chip testuale con la sigla.
export const CHAIN_LOGOS: Record<Chain, string> = {
  eth: "https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg",
  btc: "https://icons.llamao.fi/icons/chains/rsz_bitcoin.jpg",
  polygon: "https://icons.llamao.fi/icons/chains/rsz_polygon.jpg",
  arbitrum: "https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg",
  optimism: "https://icons.llamao.fi/icons/chains/rsz_optimism.jpg",
  base: "https://icons.llamao.fi/icons/chains/rsz_base.jpg",
};
