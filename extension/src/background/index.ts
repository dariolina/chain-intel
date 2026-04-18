import {
  API_BASE_URL_KEY,
  DEFAULT_API_BASE_URL,
} from "../lib/api";
import { getDemoReport, generateMockReport } from "../lib/demo";
import type { RiskReport, ScreenMessage, ScreenPayload, ScreenResponse } from "../lib/types";

const CACHE_TTL_MS = 30_000;
const responseCache = new Map<string, { expiresAt: number; report: RiskReport }>();

function cacheKey(payload: ScreenPayload, baseUrl: string): string {
  return [baseUrl, payload.chain, payload.kind, payload.address.toLowerCase()].join(":");
}

function readFromCache(payload: ScreenPayload, baseUrl: string): RiskReport | null {
  const entry = responseCache.get(cacheKey(payload, baseUrl));

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    responseCache.delete(cacheKey(payload, baseUrl));
    return null;
  }

  return { ...entry.report, cached: true };
}

function writeToCache(payload: ScreenPayload, baseUrl: string, report: RiskReport): void {
  responseCache.set(cacheKey(payload, baseUrl), {
    expiresAt: Date.now() + CACHE_TTL_MS,
    report,
  });
}

async function ensureDefaultConfig(): Promise<void> {
  const current = await chrome.storage.sync.get(API_BASE_URL_KEY);
  if (typeof current[API_BASE_URL_KEY] === "string") {
    return;
  }

  await chrome.storage.sync.set({
    [API_BASE_URL_KEY]: DEFAULT_API_BASE_URL,
  });
}

async function handleScreenRequest(payload: ScreenPayload): Promise<ScreenResponse> {
  if (!payload.force) {
    const cached = readFromCache(payload, "mock");
    if (cached) return { ok: true, report: cached };
  }

  // Indirizzi demo specifici → report dettagliati preconfigurati
  const demoReport = getDemoReport(payload.address);
  if (demoReport) {
    writeToCache(payload, "mock", demoReport);
    return { ok: true, report: demoReport };
  }

  // Qualsiasi altro indirizzo → mock generato deterministicamente
  const mockReport = generateMockReport(payload.address, payload.chain, payload.kind);
  writeToCache(payload, "mock", mockReport);
  return { ok: true, report: mockReport };
}

chrome.runtime.onInstalled.addListener(() => {
  void ensureDefaultConfig();
});

chrome.runtime.onMessage.addListener((message: ScreenMessage, _sender, sendResponse) => {
  if (message?.type !== "screen") {
    return undefined;
  }

  void handleScreenRequest(message.payload)
    .then((response) => sendResponse(response))
    .catch((error) => {
      const fallback: ScreenResponse = {
        ok: false,
        code: "network",
        message: error instanceof Error ? error.message : "Errore inatteso nel service worker.",
      };
      sendResponse(fallback);
    });

  return true;
});
