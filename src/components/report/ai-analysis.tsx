"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { RiskReport } from "@/lib/types";

function MarkdownLine({ line }: { line: string }) {
  if (line.startsWith("## ")) {
    return (
      <h3 className="mt-4 mb-1 text-sm font-semibold text-foreground">
        {line.slice(3)}
      </h3>
    );
  }
  if (line.startsWith("- ")) {
    return (
      <li className="ml-3 list-disc text-sm text-muted-foreground leading-relaxed">
        {line.slice(2)}
      </li>
    );
  }
  if (line.trim() === "") return <div className="h-1" />;
  return <p className="text-sm text-muted-foreground leading-relaxed">{line}</p>;
}

export function AiAnalysis({ report }: { report: RiskReport }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const ranRef = useRef(false);

  const run = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setErr(null);
    setText("");
    setDone(false);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
      if (!res.ok) {
        const body = await res.text();
        let msg = `status ${res.status}`;
        try { msg = (JSON.parse(body) as { error: string }).error; } catch { /* noop */ }
        throw new Error(msg);
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("stream non disponibile");
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        acc += decoder.decode(value, { stream: true });
        setText(acc);
      }
      setDone(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [report, loading]);

  // Auto-avvio al mount
  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    void run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lines = text.split("\n");

  return (
    <div className="rounded-2xl border border-primary/20 bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold">Analisi AI</span>
          {loading && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-primary animate-pulse">
              Elaborando…
            </span>
          )}
        </div>
        {(done || err) && (
          <button
            type="button"
            onClick={() => { ranRef.current = false; void run(); }}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Rigenera
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4 min-h-[80px]">
        {err && (
          <p className="text-sm text-destructive">
            {err.includes("OPENAI_API_KEY")
              ? "OPENAI_API_KEY non configurata sul server."
              : err}
          </p>
        )}

        {!text && !err && loading && (
          <div className="space-y-2 pt-1">
            {[80, 60, 72].map((w, i) => (
              <div
                key={i}
                className="h-3 animate-pulse rounded-full bg-muted"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        )}

        {text && (
          <div>
            <ul className="space-y-0.5">
              {lines.map((line, i) => (
                <MarkdownLine key={i} line={line} />
              ))}
            </ul>
            {loading && (
              <span className="inline-block h-3.5 w-0.5 translate-y-0.5 animate-[cursor_0.9s_step-end_infinite] bg-primary" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
