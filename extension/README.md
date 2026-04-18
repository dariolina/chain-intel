# Justice Chrome Extension

Estensione Chrome MV3 che intercetta address e tx hash sugli explorer supportati, chiama `GET /api/risk` tramite service worker e mostra un pannello Shadow DOM con il riepilogo del rischio.

## Setup

```bash
pnpm install
pnpm dev
```

Poi:

1. Apri `chrome://extensions`.
2. Attiva `Developer mode`.
3. Seleziona `Load unpacked`.
4. Punta a `extension/dist`.

## Configurazione

Dal popup imposta `API_BASE_URL`.

- Default dev: `http://localhost:3000`
- Esempio prod: `https://your-domain.tld`

Il service worker legge `chrome.storage.sync` a ogni richiesta, quindi la config non resta in cache.

## Script

- `pnpm dev`: build/watch con Vite + CRXJS
- `pnpm build`: typecheck + build produzione
- `pnpm test`: test parser con Vitest

## Note

- Le icone in `public/icons` sono placeholder minime e possono essere sostituite con asset definitivi.
- Gli host supportati sono definiti in `src/lib/hosts.ts`.
- I parser URL/DOM sono in `src/lib/parsers.ts`.
