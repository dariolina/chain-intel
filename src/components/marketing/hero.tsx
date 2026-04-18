import { SearchBar } from "@/components/search/search-bar";
import { DemoSuggestions } from "@/components/search/demo-suggestions";
import type { Chain } from "@/lib/types";

export function Hero({
  initialQuery,
  initialChain,
}: {
  initialQuery?: string;
  initialChain?: Chain;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-intel opacity-80"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            On-chain intelligence
          </p>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Screen addresses and transactions before they hit your books.
          </h1>
          <p className="mt-4 text-base text-muted-foreground text-balance sm:text-lg">
            Justice aggregates public risk signals into a single, readable
            report—built for analysts who need clarity, not noise.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          <SearchBar initialQuery={initialQuery} initialChain={initialChain} />
          <DemoSuggestions />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Press <kbd className="rounded border border-border px-1 py-0.5 font-mono">/</kbd>{" "}
            to focus search. EVM and Bitcoin supported.
          </p>
        </div>
      </div>
    </section>
  );
}
