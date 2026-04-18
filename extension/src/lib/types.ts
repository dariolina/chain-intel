export const SUPPORTED_CHAINS = [
  "eth",
  "base",
  "polygon",
  "arbitrum",
  "optimism",
  "btc",
] as const;

export type Chain = (typeof SUPPORTED_CHAINS)[number];
export type Kind = "address" | "tx";
export type Severity = "clean" | "info" | "warning" | "danger" | "unknown";
export type RiskSourceId = "chainabuse" | "ofac" | "etherscan" | "mempool";
export type RiskSourceStatus =
  | "ok"
  | "flagged"
  | "error"
  | "skipped"
  | "unconfigured";

export interface RiskSource {
  id: RiskSourceId;
  label: string;
  status: RiskSourceStatus;
  severity: Severity;
  message: string;
  details?: Record<string, unknown>;
  externalUrl?: string;
}

export interface RiskReport {
  address: string;
  chain: string;
  kind: Kind;
  severity: Severity;
  summary: string;
  aiSummary?: string;
  sources: RiskSource[];
  generatedAt: string;
  cached?: boolean;
  isDemo?: boolean;
}

export interface ScreenPayload {
  address: string;
  chain: Chain;
  kind: Kind;
  force?: boolean;
}

export interface ScreenMessage {
  type: "screen";
  payload: ScreenPayload;
}

export interface ScreenSuccess {
  ok: true;
  report: RiskReport;
}

export interface ScreenFailure {
  ok: false;
  code:
    | "bad_config"
    | "bad_request"
    | "rate_limited"
    | "server"
    | "network"
    | "invalid_response";
  message: string;
  status?: number;
}

export type ScreenResponse = ScreenSuccess | ScreenFailure;

export interface ParsedTarget {
  address: string;
  chain: Chain;
  kind: Kind;
}

export interface HostConfig {
  chain: Chain;
  family: "evm" | "btc";
}
