import { Hero } from "@/components/marketing/hero";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { SupportedChains } from "@/components/marketing/supported-chains";
import { InstallExtension } from "@/components/marketing/install-extension";
import { Faq } from "@/components/marketing/faq";
import { InvalidSearchBanner } from "@/components/marketing/invalid-search-banner";
import { parseChainParam } from "@/lib/chain-schema";
import type { Chain } from "@/lib/types";

export const revalidate = 3600;

export default function HomePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const err = searchParams.error;
  const showInvalid = err === "invalid";
  const qRaw = searchParams.q;
  const initialQuery = typeof qRaw === "string" ? qRaw : "";
  const chainRaw = searchParams.chain;
  const initialChain: Chain | undefined =
    typeof chainRaw === "string" ? parseChainParam(chainRaw) ?? undefined : undefined;

  return (
    <>
      {showInvalid && <InvalidSearchBanner />}
      <Hero initialQuery={initialQuery} initialChain={initialChain} />
      <FeatureGrid />
      <SupportedChains />
      <InstallExtension />
      <Faq />
    </>
  );
}
