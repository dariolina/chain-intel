import { NextRequest, NextResponse } from "next/server";
import { parseChainParam } from "@/lib/chain-schema";
import {
  isValidAddressForChain,
  isValidTxForChain,
} from "@/lib/validate-target";
import { buildRiskReport } from "@/lib/aggregator";
import { hit } from "@/lib/rate-limit";
import { corsHeaders } from "@/lib/cors";
import type { Kind } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anon"
  );
}

function maxRpm(): number {
  const n = Number(process.env.RATE_LIMIT_PER_MINUTE ?? "30");
  return Number.isFinite(n) && n > 0 ? n : 30;
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function GET(req: NextRequest) {
  const headers = corsHeaders(req.headers.get("origin"));
  const url = new URL(req.url);
  const chainRaw = url.searchParams.get("chain");
  const kindRaw = (url.searchParams.get("kind") ?? "address") as Kind;
  const address = url.searchParams.get("address")?.trim() ?? "";
  const fresh =
    url.searchParams.get("fresh") === "1" ||
    url.searchParams.get("fresh") === "true";

  const chain = chainRaw ? parseChainParam(chainRaw) : null;
  if (!chain) {
    return NextResponse.json(
      { error: "chain non valida" },
      { status: 400, headers },
    );
  }
  if (kindRaw !== "address" && kindRaw !== "tx") {
    return NextResponse.json(
      { error: "kind non valido" },
      { status: 400, headers },
    );
  }
  const validFormat =
    kindRaw === "address"
      ? isValidAddressForChain(chain, address)
      : isValidTxForChain(chain, address);
  if (!validFormat) {
    return NextResponse.json(
      { error: "address/tx non valido per la chain selezionata" },
      { status: 400, headers },
    );
  }

  const rl = hit(`risk:${clientIp(req)}`, maxRpm());
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: "rate limit exceeded",
        retryAfter: rl.resetInSeconds,
      },
      {
        status: 429,
        headers: {
          ...headers,
          "Retry-After": String(rl.resetInSeconds),
        },
      },
    );
  }

  try {
    const normalized =
      chain === "btc" ? address : address.toLowerCase();
    const { report } = await buildRiskReport({
      address: normalized,
      chain,
      kind: kindRaw,
      fresh,
    });

    return NextResponse.json(report, { headers });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500, headers },
    );
  }
}
