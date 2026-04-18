import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
  ShieldAlert,
} from "lucide-react";
import type { Severity } from "@/lib/types";
import { cn } from "@/lib/utils";

const map: Record<
  Severity,
  { Icon: typeof CheckCircle2; label: string }
> = {
  clean: { Icon: CheckCircle2, label: "Clean" },
  info: { Icon: Info, label: "Informational" },
  warning: { Icon: AlertTriangle, label: "Warning" },
  danger: { Icon: ShieldAlert, label: "High risk" },
  unknown: { Icon: HelpCircle, label: "Unknown" },
};

export function SeverityIcon({
  severity,
  className,
  decorative,
}: {
  severity: Severity;
  className?: string;
  decorative?: boolean;
}) {
  const { Icon, label } = map[severity];
  return (
    <Icon
      className={cn("h-4 w-4", className)}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
    />
  );
}
