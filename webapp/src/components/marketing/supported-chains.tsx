import { CHAINS } from "@/lib/chains";

export function SupportedChains() {
  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-center font-heading text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Supported networks
        </h2>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {CHAINS.map((c) => (
            <li
              key={c.id}
              className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-foreground"
            >
              {c.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
