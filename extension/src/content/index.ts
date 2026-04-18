import { RiskPanel } from "./panel";

import { parseTarget } from "../lib/parsers";
import type { ScreenMessage, ScreenResponse } from "../lib/types";

const ROUTE_CHANGE_EVENT = "route:change";
const REPARSE_DEBOUNCE_MS = 150;

const panel = new RiskPanel({
  onRefresh: () => {
    void screenCurrentPage(true);
  },
});

let historyPatched = false;
let debounceHandle: number | undefined;
let requestSequence = 0;

function sendScreenMessage(message: ScreenMessage): Promise<ScreenResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: ScreenResponse | undefined) => {
      const error = chrome.runtime.lastError;
      if (error) {
        resolve({
          ok: false,
          code: "network",
          message: error.message || "Impossibile contattare il service worker.",
        });
        return;
      }

      if (!response) {
        resolve({
          ok: false,
          code: "invalid_response",
          message: "Il service worker non ha restituito alcuna risposta.",
        });
        return;
      }

      resolve(response);
    });
  });
}

function emitRouteChange(): void {
  window.dispatchEvent(new CustomEvent(ROUTE_CHANGE_EVENT));
}

function patchHistoryMethod(methodName: "pushState" | "replaceState"): void {
  const original = history[methodName];

  history[methodName] = function patchedHistory(
    this: History,
    ...args: Parameters<History["pushState"]>
  ): ReturnType<History["pushState"]> {
    const result = original.apply(this, args);
    emitRouteChange();
    return result;
  };
}

function patchHistory(): void {
  if (historyPatched) {
    return;
  }

  historyPatched = true;
  patchHistoryMethod("pushState");
  patchHistoryMethod("replaceState");
}

function scheduleScreening(): void {
  window.clearTimeout(debounceHandle);
  debounceHandle = window.setTimeout(() => {
    void screenCurrentPage(false);
  }, REPARSE_DEBOUNCE_MS);
}

async function screenCurrentPage(force: boolean): Promise<void> {
  const target = parseTarget(window.location.href, document);

  if (!target) {
    panel.hide();
    return;
  }

  const sequence = ++requestSequence;
  panel.showLoading({ ...target, force });

  const response = await sendScreenMessage({
    type: "screen",
    payload: { ...target, force },
  });

  if (sequence !== requestSequence) {
    return;
  }

  if (response.ok) {
    panel.showResult(response.report);
    return;
  }

  if (response.code === "rate_limited") {
    panel.showError(response.message, {
      tone: "neutral",
      retryable: true,
    });
    return;
  }

  panel.showError(response.message, {
    tone: "critical",
    retryable: response.code !== "bad_request",
  });
}

patchHistory();

window.addEventListener("popstate", scheduleScreening);
window.addEventListener(ROUTE_CHANGE_EVENT, scheduleScreening);
window.addEventListener("DOMContentLoaded", scheduleScreening, { once: true });

scheduleScreening();
