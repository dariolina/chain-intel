"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PurgeButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  async function doPurge() {
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (!res.ok) throw new Error(`status ${res.status}`);
    } catch (e) {
      console.error(e);
    } finally {
      setConfirming(false);
      startTransition(() => router.refresh());
    }
  }

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setConfirming(true)}
        className="gap-1.5"
      >
        <Trash2 className="h-4 w-4" />
        Svuota cronologia
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Sei sicuro?</span>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={doPurge}
      >
        {isPending ? "Elimino…" : "Conferma"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(false)}
        disabled={isPending}
      >
        Annulla
      </Button>
    </div>
  );
}
