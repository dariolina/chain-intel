import { NextRequest, NextResponse } from "next/server";
import { deleteSearch, getSearch } from "@/lib/db";
import { corsHeaders } from "@/lib/cors";
import type { RiskReport } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const headers = corsHeaders(req.headers.get("origin"));
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "id non valido" }, { status: 400, headers });
  }
  const row = getSearch(id);
  if (!row) {
    return NextResponse.json({ error: "non trovato" }, { status: 404, headers });
  }
  let report: RiskReport;
  try {
    report = JSON.parse(row.report_json) as RiskReport;
  } catch {
    return NextResponse.json({ error: "record corrotto" }, { status: 500, headers });
  }
  return NextResponse.json(
    {
      id: row.id,
      createdAt: row.created_at,
      aiAnalysis: row.ai_analysis,
      report,
    },
    { headers },
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const headers = corsHeaders(req.headers.get("origin"));
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "id non valido" }, { status: 400, headers });
  }
  deleteSearch(id);
  return NextResponse.json({ ok: true }, { headers });
}
