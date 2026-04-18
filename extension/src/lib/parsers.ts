import { getHostConfig } from "./hosts";
import type { HostConfig, Kind, ParsedTarget } from "./types";

export const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
export const EVM_TX_REGEX = /^0x[a-fA-F0-9]{64}$/;
export const BTC_ADDRESS_REGEX = /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/;
export const BTC_TX_REGEX = /^[a-fA-F0-9]{64}$/;

function cleanCandidate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return decodeURIComponent(value).trim().replace(/[/?#]+$/, "");
}

function isValidCandidate(value: string, family: HostConfig["family"], kind: Kind): boolean {
  if (family === "evm" && kind === "address") {
    return EVM_ADDRESS_REGEX.test(value);
  }

  if (family === "evm" && kind === "tx") {
    return EVM_TX_REGEX.test(value);
  }

  if (family === "btc" && kind === "address") {
    return BTC_ADDRESS_REGEX.test(value);
  }

  return BTC_TX_REGEX.test(value);
}

function parsePathname(pathname: string, hostConfig: HostConfig): ParsedTarget | null {
  const segments = pathname.split("/").filter(Boolean);

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    const value = cleanCandidate(segments[index + 1]);

    if (!value) {
      continue;
    }

    if (segment === "address" && isValidCandidate(value, hostConfig.family, "address")) {
      return {
        address: value,
        chain: hostConfig.chain,
        kind: "address",
      };
    }

    if (segment === "tx" && isValidCandidate(value, hostConfig.family, "tx")) {
      return {
        address: value,
        chain: hostConfig.chain,
        kind: "tx",
      };
    }
  }

  return null;
}

function candidateFromHref(href: string, family: HostConfig["family"]): { value: string; kind: Kind } | null {
  try {
    const url = new URL(href, window.location.href);
    const segments = url.pathname.split("/").filter(Boolean);

    for (let index = 0; index < segments.length - 1; index += 1) {
      const segment = segments[index];
      const next = cleanCandidate(segments[index + 1]);

      if (!next) {
        continue;
      }

      if (segment === "address" && isValidCandidate(next, family, "address")) {
        return { value: next, kind: "address" };
      }

      if (segment === "tx" && isValidCandidate(next, family, "tx")) {
        return { value: next, kind: "tx" };
      }
    }
  } catch {
    return null;
  }

  return null;
}

function parseFromDom(documentRef: Document, hostConfig: HostConfig): ParsedTarget | null {
  const selectors = [
    "meta[property='og:url']",
    "link[rel='canonical']",
    "a[href*='/address/']",
    "a[href*='/tx/']",
  ];

  for (const selector of selectors) {
    const nodes = documentRef.querySelectorAll(selector);

    for (const node of nodes) {
      const href =
        node instanceof HTMLMetaElement
          ? node.content
          : node instanceof HTMLLinkElement || node instanceof HTMLAnchorElement
            ? node.href
            : "";

      const candidate = candidateFromHref(href, hostConfig.family);
      if (!candidate) {
        continue;
      }

      return {
        address: candidate.value,
        chain: hostConfig.chain,
        kind: candidate.kind,
      };
    }
  }

  return null;
}

export function parseTarget(locationHref: string, documentRef: Document): ParsedTarget | null {
  const url = new URL(locationHref);
  const hostConfig = getHostConfig(url.hostname);

  if (!hostConfig) {
    return null;
  }

  return parsePathname(url.pathname, hostConfig) ?? parseFromDom(documentRef, hostConfig);
}

export function parseTargetFromUrl(locationHref: string): ParsedTarget | null {
  const url = new URL(locationHref);
  const hostConfig = getHostConfig(url.hostname);

  if (!hostConfig) {
    return null;
  }

  return parsePathname(url.pathname, hostConfig);
}
