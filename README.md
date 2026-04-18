# Justice — On-chain risk intelligence

Hackaton project Apr 18

## Struttura

- `webapp/` — Next.js 14 App Router (backend + frontend)
- `extension/` — Chrome Extension MV3 (WIP)

## Webapp — avvio rapido

```bash
cd webapp
npm install --legacy-peer-deps
cp .env.example .env.local
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

### Indirizzi demo

| Indirizzo | Esito |
|---|---|
| `0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef` | 🔴 ALTO RISCHIO — OFAC + GoPlus + ScamSniffer |
| `0xcafebabecafebabecafebabecafebabecafebabe` | 🟡 RISCHIO MODERATO — mixer/honeypot |
| `0x1111111111111111111111111111111111111111` | 🟢 PULITO |

### API

- `GET /api/risk?chain=eth&kind=address&address=0x...` → RiskReport
- `POST /api/ai/analyze` → streaming AI analysis
- `GET /api/health` → status fonti
- `GET/DELETE /api/history` → cronologia SQLite
