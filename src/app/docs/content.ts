import { siteConfig } from "@/lib/site-config";

export const docsSections = [
  {
    id: "overview",
    title: "What Justice does",
    body: [
      "Justice is a read-only risk screening surface: you provide an on-chain address or transaction identifier, and the backend returns a single JSON report that aggregates multiple public sources.",
      "The public webapp, browser extension, and your own tools can all share the same HTTP contract—no wallet connection and no signed transactions.",
    ],
  },
  {
    id: "flow",
    title: "Request flow",
    body: [
      "Browser or extension calls GET /api/risk with chain, kind, and address (for kind=tx, address is the transaction hash).",
      "The backend normalizes input, queries configured sources in parallel, derives an overall severity, and returns RiskReport JSON.",
      "Responses may be cached with a TTL that depends on severity; use fresh=1 for an on-demand refresh (subject to stricter rate limits).",
    ],
  },
  {
    id: "api-risk",
    title: "GET /api/risk",
    body: [
      "Query parameters: address (required), chain (eth | base | polygon | arbitrum | optimism | btc), kind (address | tx, default address), fresh (0 | 1).",
      "Successful response: RiskReport with address, chain, kind, severity, summary, sources[], generatedAt, optional cached and ttlSeconds.",
      "Errors: 400 invalid_input, 404 tx_not_found, 429 rate_limited with retryAfter, 5xx upstream_failure.",
    ],
  },
  {
    id: "example-curl",
    title: "Example",
    body: [
      `curl -sS "${siteConfig.url}/api/risk?chain=eth&kind=address&address=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" | jq`,
    ],
  },
  {
    id: "configure-sources",
    title: "Configure sources",
    body: [
      "Adding or enabling data sources is a backend concern: environment variables, API keys, and SQLite cache paths are documented in PLAN-BACKEND.md in this repository.",
      "The /status page shows which sources are configured on the running instance.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    body: [
      "This public UI does not run user accounts. Queries hit the API, which may cache reports for a declared TTL—see backend documentation for retention.",
    ],
  },
] as const;
