import type { Metadata } from "next";
import { fetchHealth, RiskFetchError } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Service status",
  description: "Configured sources and cache health for Justice.",
};

export default async function StatusPage() {
  let health;
  let err: string | null = null;
  try {
    health = await fetchHealth();
  } catch (e) {
    if (e instanceof RiskFetchError) {
      err = `Health check failed (${e.status}).`;
    } else {
      err = "Health check failed.";
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Status
      </h1>
      <p className="mt-3 text-muted-foreground">
        Snapshot from <code className="font-mono text-sm">GET /api/health</code>.
      </p>

      {err && (
        <Card className="mt-8 border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {err} Ensure the backend is running; see{" "}
            <Link
              href="/docs#configure-sources"
              className="text-primary underline underline-offset-4"
            >
              configuring sources
            </Link>
            .
          </CardContent>
        </Card>
      )}

      {health && (
        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>
                State:{" "}
                <span className="font-medium text-foreground">
                  {health.ok ? "ok" : "degraded"}
                </span>
              </p>
            </CardContent>
          </Card>
          {health.sources && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {Object.entries(health.sources).map(([k, v]) => (
                    <li
                      key={k}
                      className="flex justify-between gap-4 border-b border-border/60 py-2 last:border-0"
                    >
                      <span className="font-mono text-xs">{k}</span>
                      <span className="text-muted-foreground">{v}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {health.cache && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cache</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 font-mono text-xs text-muted-foreground">
                <p>size: {health.cache.size}</p>
                {typeof health.cache.ageP50Ms === "number" && (
                  <p>ageP50Ms: {health.cache.ageP50Ms}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
