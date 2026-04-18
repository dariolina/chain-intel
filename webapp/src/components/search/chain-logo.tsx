"use client";

import { useState } from "react";
import type { Chain } from "@/lib/types";
import { CHAIN_LOGOS } from "@/lib/chain-logos";
import { CHAINS } from "@/lib/chains";
import { cn } from "@/lib/utils";

export function ChainLogo({
  chain,
  size = 18,
  className,
}: {
  chain: Chain;
  size?: number;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  const short = CHAINS.find((c) => c.id === chain)?.short ?? chain.toUpperCase();

  if (errored) {
    return (
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-muted font-mono text-[0.55rem] font-semibold uppercase tracking-tighter text-muted-foreground",
          className,
        )}
        style={{ width: size, height: size }}
      >
        {short.slice(0, 3)}
      </span>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={CHAIN_LOGOS[chain]}
      alt=""
      aria-hidden
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className={cn("rounded-full object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
