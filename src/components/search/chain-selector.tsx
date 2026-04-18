"use client";

import { ChevronDownIcon } from "lucide-react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import type { Chain } from "@/lib/types";
import { CHAINS } from "@/lib/chains";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChainLogo } from "@/components/search/chain-logo";
import { cn } from "@/lib/utils";

export function ChainSelector({
  value,
  onChange,
  id,
  className,
  variant = "default",
}: {
  value: Chain;
  onChange: (c: Chain) => void;
  id?: string;
  className?: string;
  variant?: "default" | "embedded";
}) {
  if (variant === "embedded") {
    const current = CHAINS.find((c) => c.id === value);
    return (
      <Select value={value} onValueChange={(v) => onChange(v as Chain)}>
        <SelectPrimitive.Trigger
          id={id}
          render={
            <button
              type="button"
              aria-label="Seleziona chain"
              className={cn(
                "flex h-10 shrink-0 items-center gap-1.5 rounded-l-lg pr-2 pl-3 text-sm font-medium transition-colors outline-none select-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset",
                className,
              )}
            />
          }
        >
          <ChainLogo chain={value} size={18} />
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {current?.short ?? value.toUpperCase()}
          </span>
          <ChevronDownIcon
            className="h-3.5 w-3.5 text-muted-foreground"
            aria-hidden
          />
        </SelectPrimitive.Trigger>
        <SelectContent align="start" alignItemWithTrigger={false}>
          {CHAINS.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              <span className="flex items-center gap-2">
                <ChainLogo chain={c.id} size={18} />
                <span>{c.label}</span>
                <span className="ml-auto font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  {c.short}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={(v) => onChange(v as Chain)}>
      <SelectTrigger id={id} size="default" className={className}>
        <SelectValue>
          <span className="flex items-center gap-2">
            <ChainLogo chain={value} size={18} />
            <span>{CHAINS.find((c) => c.id === value)?.label ?? value}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {CHAINS.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            <span className="flex items-center gap-2">
              <ChainLogo chain={c.id} size={18} />
              <span>{c.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
