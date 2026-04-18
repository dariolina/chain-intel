import type { RiskReport, ScreenFailure, ScreenPayload, ScreenResponse } from "./types";

export const API_BASE_URL_KEY = "API_BASE_URL";
export const DEFAULT_API_BASE_URL = "http://localhost:3000";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRiskReport(value: unknown): value is RiskReport {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.address === "string" &&
    typeof value.chain === "string" &&
    (value.kind === "address" || value.kind === "tx") &&
    typeof value.summary === "string" &&
    typeof value.generatedAt === "string" &&
    Array.isArray(value.sources) &&
    typeof value.severity === "string"
  );
}

function readStorageSync<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (result) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(error);
        return;
      }

      resolve(result[key] as T | undefined);
    });
  });
}

export function normalizeApiBaseUrl(value?: string): string {
  const candidate = value?.trim() || DEFAULT_API_BASE_URL;
  return candidate.replace(/\/+$/, "");
}

export async function getApiBaseUrl(): Promise<string> {
  const configured = await readStorageSync<string>(API_BASE_URL_KEY);
  return normalizeApiBaseUrl(configured);
}

export function buildRiskUrl(baseUrl: string, payload: ScreenPayload): string {
  const url = new URL("/api/risk", `${normalizeApiBaseUrl(baseUrl)}/`);
  url.searchParams.set("address", payload.address);
  url.searchParams.set("chain", payload.chain);
  url.searchParams.set("kind", payload.kind);
  return url.toString();
}

async function toFailure(response: Response): Promise<ScreenFailure> {
  let errorMessage = `Backend error (${response.status}).`;

  try {
    const payload = (await response.json()) as unknown;
    if (isObject(payload) && typeof payload.error === "string") {
      errorMessage = payload.error;
    }
  } catch {
    // Ignore invalid error payloads.
  }

  if (response.status === 400) {
    return {
      ok: false,
      code: "bad_request",
      message: errorMessage,
      status: response.status,
    };
  }

  if (response.status === 429) {
    return {
      ok: false,
      code: "rate_limited",
      message: "Rate limit raggiunto. Riprova tra poco.",
      status: response.status,
    };
  }

  return {
    ok: false,
    code: "server",
    message: errorMessage,
    status: response.status,
  };
}

export async function requestRiskReport(
  payload: ScreenPayload,
  init?: { baseUrl?: string; signal?: AbortSignal },
): Promise<ScreenResponse> {
  const baseUrl = init?.baseUrl ?? (await getApiBaseUrl());
  const url = buildRiskUrl(baseUrl, payload);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      signal: init?.signal,
    });

    if (!response.ok) {
      return toFailure(response);
    }

    const body = (await response.json()) as unknown;
    if (!isRiskReport(body)) {
      return {
        ok: false,
        code: "invalid_response",
        message: "Il backend ha risposto con un payload non valido.",
      };
    }

    return {
      ok: true,
      report: body,
    };
  } catch (error) {
    return {
      ok: false,
      code: "network",
      message:
        error instanceof Error
          ? error.message
          : "Richiesta fallita. Verifica che il backend sia raggiungibile.",
    };
  }
}

export function defaultRiskReport(payload: ScreenPayload): RiskReport {
  return {
    address: payload.address,
    chain: payload.chain,
    kind: payload.kind,
    severity: "unknown",
    summary: "Nessun dato disponibile.",
    sources: [],
    generatedAt: new Date().toISOString(),
  };
}
