import type { Severity } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SeverityIcon } from "@/components/report/severity-icon";

const shell: Record<Severity, string> = {
  clean:
    "border-severity-clean/35 bg-severity-clean/12 text-severity-clean",
  info: "border-severity-info/35 bg-severity-info/12 text-severity-info",
  warning:
    "border-severity-warning/35 bg-severity-warning/12 text-severity-warning",
  danger:
    "border-severity-danger/35 bg-severity-danger/12 text-severity-danger",
  unknown:
    "border-severity-unknown/35 bg-severity-unknown/12 text-severity-unknown",
};

const sizeClass = {
  sm: "gap-1 px-2 py-0.5 text-xs [&_svg]:h-3.5 [&_svg]:w-3.5",
  md: "gap-1.5 px-2.5 py-1 text-sm [&_svg]:h-4 [&_svg]:w-4",
  lg: "gap-2 px-3 py-1.5 text-base [&_svg]:h-5 [&_svg]:w-5",
};

export function SeverityBadge({
  severity,
  size = "md",
}: {
  severity: Severity;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border font-medium capitalize",
        shell[severity],
        sizeClass[size]
      )}
    >
      <SeverityIcon
        severity={severity}
        className="shrink-0"
        decorative
      />
      {severity}
    </span>
  );
}
