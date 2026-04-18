import { ImageResponse } from "next/og";
import { parseChainParam } from "@/lib/chain-schema";
import { buildRiskReport } from "@/lib/aggregator";
import { isValidAddressForChain } from "@/lib/validate-target";
import { truncateMiddle } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";
export const alt = "Risk report preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const severityBg: Record<string, string> = {
  clean: "#0f3d2c",
  info: "#0b2a4a",
  warning: "#4a3a0b",
  danger: "#3d0f12",
  unknown: "#2a2830",
};

export default async function Image({
  params,
}: {
  params: { chain: string; address: string };
}) {
  const chain = parseChainParam(params.chain);
  if (!chain || !isValidAddressForChain(chain, params.address)) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0f1a",
            color: "#e8eef7",
            fontSize: 36,
            fontFamily: "ui-sans-serif, system-ui",
          }}
        >
          {siteConfig.name}
        </div>
      ),
      { ...size }
    );
  }

  let severity = "unknown";
  let summary = "On-chain risk report";
  let display = truncateMiddle(params.address, 8, 6);

  try {
    const { report } = await buildRiskReport({
      chain,
      kind: "address",
      address: params.address.toLowerCase(),
    });
    severity = report.severity;
    summary = report.summary;
    display = truncateMiddle(report.address, 8, 6);
  } catch {
    // fall back to defaults
  }

  const bg = severityBg[severity] ?? severityBg.unknown;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: `linear-gradient(145deg, ${bg}, #070b14)`,
          color: "#f4f7fb",
          fontFamily: "ui-sans-serif, system-ui",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: "0.12em", opacity: 0.85 }}>
          {siteConfig.name.toUpperCase()}
        </div>
        <div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {display}
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 26,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              opacity: 0.9,
            }}
          >
            {severity}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 22,
              opacity: 0.8,
              maxWidth: 900,
              lineHeight: 1.35,
            }}
          >
            {summary}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
