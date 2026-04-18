import { NextRequest, NextResponse } from "next/server";
import { cacheStats } from "@/lib/cache";
import { corsHeaders } from "@/lib/cors";
import { goplusHealth } from "@/lib/sources/goplus";
import { scamsnifferHealth } from "@/lib/sources/scamsniffer";
import { ofacHealth } from "@/lib/sources/ofac";
import { etherscanHealth } from "@/lib/sources/etherscan";
import { mempoolHealth } from "@/lib/sources/mempool";
import type { HealthResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function GET(req: NextRequest) {
  const headers = corsHeaders(req.headers.get("origin"));
  const [scam, ofac] = await Promise.all([
    scamsnifferHealth().catch((e) => `error: ${(e as Error).message}`),
    ofacHealth().catch((e) => `error: ${(e as Error).message}`),
  ]);

  const sources: Record<string, string> = {
    goplus: goplusHealth(),
    scamsniffer: scam,
    ofac: ofac,
    etherscan: etherscanHealth(),
    mempool: mempoolHealth(),
    openai: process.env.OPENAI_API_KEY ? "ok (api key set)" : "unconfigured",
  };

  const hasError = Object.values(sources).some((v) => v.startsWith("error"));

  const body: HealthResponse = {
    ok: !hasError,
    sources,
    cache: cacheStats(),
  };
  return NextResponse.json(body, { headers });
}
