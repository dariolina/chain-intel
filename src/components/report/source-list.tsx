import type { RiskSource } from "@/lib/types";
import { SourceCard } from "@/components/report/source-card";

export function SourceList({ sources }: { sources: RiskSource[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {sources.map((s, i) => (
        <SourceCard key={s.id} source={s} index={i} />
      ))}
    </div>
  );
}
