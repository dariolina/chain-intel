import { NextRequest, NextResponse } from "next/server";
import { listSearches, purgeSearches } from "@/lib/db";
import { corsHeaders } from "@/lib/cors";

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
  const url = new URL(req.url);
  const limit = Math.min(
    200,
    Math.max(1, Number(url.searchParams.get("limit") ?? "50")),
  );
  const rows = listSearches(limit).map((r) => ({
    id: r.id,
    address: r.address,
    chain: r.chain,
    kind: r.kind,
    severity: r.severity,
    summary: r.summary,
    createdAt: r.created_at,
    hasAiAnalysis: !!r.ai_analysis,
  }));
  return NextResponse.json({ items: rows }, { headers });
}

export async function DELETE(req: NextRequest) {
  const headers = corsHeaders(req.headers.get("origin"));
  const removed = purgeSearches();
  return NextResponse.json({ removed }, { headers });
}
