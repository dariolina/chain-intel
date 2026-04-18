import { NextRequest, NextResponse } from "next/server";
import { buildAnalysisPrompt, getOpenAI } from "@/lib/openai";
import { corsHeaders } from "@/lib/cors";
import { attachAiAnalysis, listSearches } from "@/lib/db";
import { hit } from "@/lib/rate-limit";
import type { RiskReport } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anon"
  );
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function POST(req: NextRequest) {
  const headers = corsHeaders(req.headers.get("origin"));

  const rl = hit(`ai:${clientIp(req)}`, 6);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate limit exceeded", retryAfter: rl.resetInSeconds },
      { status: 429, headers: { ...headers, "Retry-After": String(rl.resetInSeconds) } },
    );
  }

  let report: RiskReport;
  try {
    report = (await req.json()) as RiskReport;
    if (!report || typeof report !== "object" || !Array.isArray(report.sources)) {
      throw new Error("payload non valido");
    }
  } catch (err) {
    return NextResponse.json(
      { error: `payload non valido: ${(err as Error).message}` },
      { status: 400, headers },
    );
  }

  const client = getOpenAI();
  if (!client) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY non impostata sul server." },
      { status: 501, headers },
    );
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const prompt = buildAnalysisPrompt(report);

  try {
    const stream = await client.chat.completions.create({
      model,
      stream: true,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    let full = "";
    const encoder = new TextEncoder();
    const rs = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              full += delta;
              controller.enqueue(encoder.encode(delta));
            }
          }
          try {
            const recent = listSearches(20).find(
              (r) =>
                r.address === report.address &&
                r.chain === report.chain &&
                r.kind === report.kind,
            );
            if (recent) attachAiAnalysis(recent.id, full);
          } catch {
            /* best-effort */
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(rs, {
      headers: {
        ...headers,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `OpenAI error: ${(err as Error).message}` },
      { status: 502, headers },
    );
  }
}
