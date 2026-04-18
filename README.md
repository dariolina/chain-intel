# Justice — Webapp

Webapp Next.js (App Router) per l'analisi di rischio on-chain di indirizzi e
transazioni blockchain, con aggregazione multi-fonte e analisi narrativa AI.

La **UI** (layout, pagine report, landing, shadcn/ui, dark mode, SEO,
opengraph-image) proviene dalla base di [chain-intel/webapp](https://github.com/dariolina/chain-intel/tree/main/webapp).
Sopra abbiamo innestato il **backend**: API routes, fonti esterne, cache,
rate-limit, CORS per l'estensione, cronologia SQLite e analisi AI.

## Funzionalità

- **Landing `/`** con hero, feature grid, chain supportate, CTA estensione, FAQ.
- **Analisi indirizzo / tx** (`/address/[chain]/[address]` e `/tx/[chain]/[hash]`):
  aggregatore di fonti (GoPlus Security, ScamSniffer, OFAC SDN, Etherscan V2,
  mempool.space + fallback blockstream.info) in parallelo, con cache in-memory,
  rate limit per IP, parametro `?fresh=1` per forzare bypass cache.
- **Analisi AI** inline nelle pagine report, via `OpenAI` streaming.
- **Dashboard `/dashboard`** con stats (totale, flaggati, ultimi 7g, top chain),
  sparkline trend, ricerche recenti.
- **Cronologia `/history`** persistita localmente (SQLite) con purge.
- **Status `/status`** mostra lo stato delle fonti e della cache da `/api/health`.
- **Docs `/docs`** documentazione API.
- **CORS** dinamico per `chrome-extension://` per consumo dall'estensione.

## Setup

```bash
cd webapp
npm install --legacy-peer-deps   # peer opzionale zod4 ↔ openai4
cp .env.example .env.local
npm run dev
```

> Nota: `--legacy-peer-deps` serve solo perché `openai@4.x` dichiara `zod@^3` come
> peer **opzionale**; la webapp usa `zod@^4` e non c'è conflitto funzionale.

Apri `http://localhost:3000`.

## Variabili d'ambiente

| Variabile                            | Obbligatoria | Note                                                                   |
| ------------------------------------ | ------------ | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`               | no           | Usata anche per `getBaseUrl()` lato server. Default `http://localhost:3000`. |
| `NEXT_PUBLIC_EXTENSION_CHROME_URL`   | no           | URL Web Store dell'estensione.                                         |
| `NEXT_PUBLIC_GITHUB_URL`             | no           | Repo GitHub.                                                           |
| `OPENAI_API_KEY`                     | sì, per AI   | Senza, la card AI mostra errore ma il resto funziona.                  |
| `OPENAI_MODEL`                       | no           | Default `gpt-4o-mini`.                                                 |
| `ETHERSCAN_API_KEY`                  | consigliata  | Unica key V2 per Ethereum/Base/Polygon/Arbitrum/Optimism.              |
| `OFAC_DATA_URL`                      | no           | JSON remoto di indirizzi sanzionati; fallback su `data/ofac-seed.json`.|
| `ALLOWED_EXTENSION_IDS`              | no           | ID estensione Chrome separati da virgola (CORS).                       |
| `RISK_CACHE_TTL_SECONDS`             | no           | Default 3600. Aggressivo per rispettare free tier GoPlus.              |
| `RATE_LIMIT_PER_MINUTE`              | no           | Default 30.                                                            |
| `SQLITE_PATH`                        | no           | Default `./data/justice.db`.                                           |

## Fonti attive (gratuite)

- **GoPlus Security** — phishing, mixer, sanzioni, honeypot, ecc. (~30 rpm free).
- **ScamSniffer** — blacklist community drainer/phishing da GitHub.
- **OFAC SDN** — lista sanzioni USA; seed locale + override via URL.
- **mempool.space / blockstream.info** — API BTC pubbliche con fallback.
- **Etherscan V2** — metadati on-chain per chain EVM (richiede API key).

## API

- `GET /api/risk?chain={chain}&kind={address|tx}&address={value}&fresh=1`
  → `RiskReport` (vedi `src/lib/types.ts`). 429 + `{ retryAfter }` se rate limit.
- `GET /api/health` → stato fonti + cache (consumato da `/status`).
- `POST /api/ai/analyze` → stream testo markdown, body = `RiskReport`.
- `GET /api/history?limit=50` / `DELETE /api/history`
- `GET /api/history/[id]` / `DELETE /api/history/[id]`

## Struttura

```
webapp/
├── data/
│   ├── ofac-seed.json          # seed locale OFAC
│   └── justice.db              # SQLite cronologia (gitignored)
└── src/
    ├── app/
    │   ├── api/{risk,health,ai/analyze,history,history/[id]}/route.ts
    │   ├── address/[chain]/[address]/ # report indirizzo (+ AI card)
    │   ├── tx/[chain]/[hash]/          # report tx (+ AI card)
    │   ├── dashboard/                  # stats + sparkline + recent
    │   ├── history/                    # lista + purge
    │   ├── status/ docs/ page.tsx (landing) …
    ├── components/
    │   ├── dashboard/{stat-card,sparkline,recent-list}.tsx
    │   ├── report/ai-analysis.tsx      # streaming client
    │   ├── report/{report-header,source-card,source-list,…}.tsx
    │   ├── search/…  layout/…  marketing/…  ui/… (shadcn)
    └── lib/
        ├── aggregator.ts cache.ts rate-limit.ts cors.ts db.ts openai.ts
        ├── api-client.ts chain-schema.ts chains.ts format.ts …
        └── sources/{goplus,scamsniffer,ofac,etherscan,mempool,_shared}.ts
```

## Smoke test rapido

```bash
# Indirizzo OFAC su ETH → severity danger
curl -s "http://localhost:3000/api/risk?address=0x8589427373d6d84e98730d7795d8f6f8731fda16&chain=eth&kind=address" | jq

# Bitcoin address
curl -s "http://localhost:3000/api/risk?address=bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq&chain=btc&kind=address" | jq

# Stato fonti
curl -s http://localhost:3000/api/health | jq
```
