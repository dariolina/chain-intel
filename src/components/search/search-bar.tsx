"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useCallback } from "react";
import { Search, LoaderCircle } from "lucide-react";
import type { Chain } from "@/lib/types";
import { detectSearchInput } from "@/lib/search-detect";
import { ChainSelector } from "@/components/search/chain-selector";

export function SearchBar({
  initialQuery = "",
  initialChain = "eth",
}: {
  initialQuery?: string;
  initialChain?: Chain;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [chain, setChain] = useState<Chain>(initialChain);
  const [isPending, startTransition] = useTransition();

  const submit = useCallback(() => {
    const raw = query.trim();
    const detected = detectSearchInput(raw, chain);
    if (!detected.ok) {
      startTransition(() => {
        router.push(`/?q=${encodeURIComponent(raw)}&error=invalid&chain=${chain}`);
      });
      return;
    }
    const path =
      detected.kind === "tx"
        ? `/tx/${detected.chain}/${detected.value}`
        : `/address/${detected.chain}/${detected.value}`;
    startTransition(() => {
      router.push(path);
    });
  }, [chain, query, router]);

  return (
    <div className="w-full">
      <div className="group/search flex h-12 w-full min-w-0 items-center overflow-hidden rounded-xl border border-input bg-transparent shadow-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/40 dark:bg-input/30">
        <ChainSelector
          variant="embedded"
          value={chain}
          onChange={setChain}
          id="chain-select"
          className="h-12 rounded-l-xl"
        />
        <div aria-hidden className="h-6 w-px bg-border/80" />
        <div className="relative flex min-w-0 flex-1 items-center">
          <Search
            className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
            aria-hidden
          />
          <input
            id="site-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Address or transaction hash"
            autoComplete="off"
            spellCheck={false}
            aria-describedby="search-hint"
            disabled={isPending}
            className="h-12 w-full min-w-0 border-0 bg-transparent pl-9 pr-3 font-mono text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="m-1 inline-flex h-10 w-28 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70"
        >
          {isPending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            "Analyze"
          )}
        </button>
      </div>
      <p id="search-hint" className="sr-only">
        Press Enter to search. Supports EVM and Bitcoin formats.
      </p>
    </div>
  );
}
