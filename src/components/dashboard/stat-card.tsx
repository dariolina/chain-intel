import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  Icon?: LucideIcon;
}) {
  return (
    <Card size="sm">
      <CardHeader className="flex-row items-center justify-between pb-1">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />}
      </CardHeader>
      <CardContent className="pt-0">
        <p className="font-heading text-2xl font-semibold tracking-tight">
          {value}
        </p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
