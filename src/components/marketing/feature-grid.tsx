import { Fingerprint, Layers, ShieldCheck, Zap } from "lucide-react";

const items = [
  {
    title: "Multi-source screening",
    body: "Chain abuse signals, sanctions lists, and chain context in one response.",
    Icon: Layers,
  },
  {
    title: "Built for precision",
    body: "Structured severities and per-source status so you can audit every line.",
    Icon: ShieldCheck,
  },
  {
    title: "Fast, cache-aware API",
    body: "Same contract powers the site, the extension, and your own automations.",
    Icon: Zap,
  },
  {
    title: "Address or transaction",
    body: "Paste an address or hash; we resolve probes consistently across chains.",
    Icon: Fingerprint,
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="max-w-2xl">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          How Justice helps teams
        </h2>
        <p className="mt-2 text-muted-foreground">
          A focused toolkit for compliance and investigations—without turning
          your browser into a trading desk.
        </p>
      </div>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ title, body, Icon }) => (
          <li
            key={title}
            className="rounded-xl border border-border/80 bg-card/50 p-5 ring-1 ring-foreground/5"
          >
            <Icon className="h-5 w-5 text-primary" aria-hidden />
            <h3 className="mt-3 font-heading text-sm font-medium">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
