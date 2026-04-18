import Link from "next/link";

const DEMOS = [
  {
    address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    label: "0xdead…beef",
    severity: "danger" as const,
    hint: "OFAC + phishing",
  },
  {
    address: "0xcafebabecafebabecafebabecafebabecafebabe",
    label: "0xcafe…babe",
    severity: "warning" as const,
    hint: "mixer / honeypot",
  },
  {
    address: "0x1111111111111111111111111111111111111111",
    label: "0x1111…1111",
    severity: "clean" as const,
    hint: "pulito",
  },
];

const dot: Record<(typeof DEMOS)[number]["severity"], string> = {
  danger: "bg-severity-danger",
  warning: "bg-severity-warning",
  clean: "bg-severity-clean",
};

const chip: Record<(typeof DEMOS)[number]["severity"], string> = {
  danger:
    "border-severity-danger/25 bg-severity-danger/6 text-severity-danger hover:bg-severity-danger/12",
  warning:
    "border-severity-warning/25 bg-severity-warning/6 text-severity-warning hover:bg-severity-warning/12",
  clean:
    "border-severity-clean/25 bg-severity-clean/6 text-severity-clean hover:bg-severity-clean/12",
};

export function DemoSuggestions() {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
      <span className="text-xs text-muted-foreground shrink-0">Prova →</span>
      {DEMOS.map((d) => (
        <Link
          key={d.address}
          href={`/address/eth/${d.address}`}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono font-medium transition-colors ${chip[d.severity]}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot[d.severity]}`} />
          {d.label}
          <span className="font-sans text-[0.6rem] opacity-70 normal-case">
            {d.hint}
          </span>
        </Link>
      ))}
    </div>
  );
}
