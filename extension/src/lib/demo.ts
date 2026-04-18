import type { Chain, Kind, RiskReport } from "./types";

function now(): string {
  return new Date().toISOString();
}

/** Converte i primi 8 hex dell'indirizzo in un intero per determinismo. */
function addressSeed(address: string): number {
  const hex = address.replace(/^0x/i, "").slice(0, 8);
  return parseInt(hex, 16) || 0;
}

const DEMO_REPORTS: Record<string, Omit<RiskReport, "generatedAt">> = {
  // Tornado Cash — Router principale (sanzionato OFAC ago 2022)
  "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b": {
    address: "0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b",
    chain: "eth",
    kind: "address",
    severity: "danger",
    isDemo: true,
    summary: "Tornado Cash Router: contratto di mixing sanzionato da OFAC (agosto 2022).",
    aiSummary:
      "Questo indirizzo è il router principale di Tornado Cash, un protocollo di mixing su Ethereum sanzionato dal Dipartimento del Tesoro USA (OFAC) il 8 agosto 2022. Il protocollo è stato utilizzato per offuscare la provenienza di oltre $7 miliardi in criptovalute, inclusi fondi sottratti nell'hack Ronin Bridge (~$625M attribuito al Lazarus Group nordcoreano) e Harmony Horizon (~$100M). Interagire con questo contratto espone a rischi legali severi in molte giurisdizioni: gli exchange centralizzati bloccano sistematicamente fondi provenienti da indirizzi associati. Il codice del contratto, sebbene open source, è stato oggetto di controversia legale sulla libertà del codice.",
    sources: [
      {
        id: "ofac",
        label: "OFAC SDN List",
        status: "flagged",
        severity: "danger",
        message: "Match diretto nella lista sanzioni USA. Aggiunto il 8/08/2022.",
        externalUrl:
          "https://home.treasury.gov/news/press-releases/jy0916",
      },
      {
        id: "chainabuse",
        label: "Chainabuse",
        status: "flagged",
        severity: "warning",
        message: "427 segnalazioni di abuso legate a questo contratto.",
        externalUrl: "https://www.chainabuse.com/",
      },
      {
        id: "etherscan",
        label: "Etherscan Labels",
        status: "flagged",
        severity: "warning",
        message: "Etichettato come 'Tornado Cash: Router' con flag sanzioni.",
      },
    ],
  },

  // Indirizzo OFAC — esempio dal PLAN.md
  "0x8589427373d6d84e98730d7795d8f6f8731fda16": {
    address: "0x8589427373D6D84E98730D7795D8f6f8731fda16",
    chain: "eth",
    kind: "address",
    severity: "danger",
    isDemo: true,
    summary: "Indirizzo incluso nella lista OFAC SDN — transazioni bloccate dagli exchange USA.",
    aiSummary:
      "Questo wallet Ethereum è presente nella lista SDN (Specially Designated Nationals) dell'OFAC, l'ufficio del controllo degli asset stranieri del Tesoro USA. Gli indirizzi SDN non possono ricevere transazioni da entità o persone soggette alla giurisdizione statunitense. La presenza in questa lista indica coinvolgimento in attività sanzionate: potenzialmente legato a operazioni di riciclaggio, hacker sponsorizzati da stati, o elusione di sanzioni internazionali. Tutti i principali exchange come Coinbase, Kraken e Binance bloccano automaticamente i prelievi verso questi indirizzi. Interagire con questo wallet può comportare conseguenze legali, incluse sanzioni civili fino a $1M per violazione.",
    sources: [
      {
        id: "ofac",
        label: "OFAC SDN List",
        status: "flagged",
        severity: "danger",
        message: "Match diretto nella lista sanzioni USA.",
        externalUrl: "https://sanctionssearch.ofac.treas.gov/",
      },
      {
        id: "chainabuse",
        label: "Chainabuse",
        status: "ok",
        severity: "clean",
        message: "Nessuna segnalazione su Chainabuse.",
      },
    ],
  },

  // Vitalik Buterin — indirizzo pubblico, pulito ma famoso
  "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": {
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    chain: "eth",
    kind: "address",
    severity: "info",
    isDemo: true,
    summary: "Wallet pubblico di Vitalik Buterin — co-fondatore di Ethereum.",
    aiSummary:
      "Questo è il wallet Ethereum più famoso al mondo: appartiene a Vitalik Buterin, co-fondatore e principale ricercatore di Ethereum. L'indirizzo è stato utilizzato per ricevere donazioni significative (tra cui $1B in Shiba Inu che Vitalik donò a enti benefici indiani durante il COVID), partecipare a lanci di token, e come destinazione di numerosi airdrop. Non ci sono flag di sicurezza associati a questo indirizzo. È spesso usato come caso di test per strumenti blockchain data la sua alta visibilità on-chain. L'ENS corrispondente è vitalik.eth. Il wallet detiene storicamente decine di migliaia di ETH e diversi token a lunga coda.",
    sources: [
      {
        id: "ofac",
        label: "OFAC SDN List",
        status: "ok",
        severity: "clean",
        message: "Nessun match nella lista sanzioni.",
      },
      {
        id: "chainabuse",
        label: "Chainabuse",
        status: "ok",
        severity: "clean",
        message: "Nessuna segnalazione di abuso.",
      },
      {
        id: "etherscan",
        label: "Etherscan Labels",
        status: "ok",
        severity: "clean",
        message: "Etichettato come 'Vitalik Buterin' — noto pubblicamente.",
        externalUrl:
          "https://etherscan.io/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      },
    ],
  },

  // Ronin Bridge Exploiter — hack da $625M (Lazarus Group)
  "0x098b716b8aaf21512996dc57eb0615e2383e2f96": {
    address: "0x098B716B8Aaf21512996dC57EB0615e2383E2f96",
    chain: "eth",
    kind: "address",
    severity: "danger",
    isDemo: true,
    summary: "Ronin Bridge Exploiter — attribuito al Lazarus Group ($625M sottratti il 23/03/2022).",
    aiSummary:
      "Questo indirizzo è stato identificato dall'FBI e dall'OFAC come il wallet utilizzato nell'exploit del Ronin Bridge di Axie Infinity, avvenuto il 23 marzo 2022. Sono stati sottratti 173.600 ETH e 25.5M USDC (circa $625M al momento dell'hack), rappresentando uno dei più grandi furti di criptovalute della storia. L'attacco è stato attribuito al gruppo Lazarus, un'organizzazione hacker sponsorizzata dal governo nordcoreano (DPRK), specializzata in furti di criptovalute per finanziare il programma nucleare. Il wallet è sanzionato OFAC, e la maggior parte dei fondi è stata tracciata attraverso mixer e exchange decentralizzati. Nessun wallet dovrebbe interagire con questo indirizzo.",
    sources: [
      {
        id: "ofac",
        label: "OFAC SDN List",
        status: "flagged",
        severity: "danger",
        message: "Sanzionato OFAC — attribuito al Lazarus Group (DPRK).",
        externalUrl:
          "https://home.treasury.gov/news/press-releases/jy0768",
      },
      {
        id: "chainabuse",
        label: "Chainabuse",
        status: "flagged",
        severity: "danger",
        message: "Identificato come exploit di Ronin Bridge — 892 segnalazioni.",
        externalUrl: "https://www.chainabuse.com/",
      },
      {
        id: "etherscan",
        label: "Etherscan Labels",
        status: "flagged",
        severity: "danger",
        message: "Etichettato come 'Ronin Bridge Exploiter'.",
      },
    ],
  },

  // Uniswap V3: Router2 — contratto pulito, noto
  "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": {
    address: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    chain: "eth",
    kind: "address",
    severity: "clean",
    isDemo: true,
    summary: "Uniswap V3: SwapRouter02 — contratto DEX verificato, ampiamente utilizzato.",
    aiSummary:
      "Questo è il contratto SwapRouter02 di Uniswap V3, il principale aggregatore DEX su Ethereum. Si tratta di un contratto verificato e auditato da molteplici società di sicurezza (Trail of Bits, ABDK, samczsun). Uniswap è il DEX più grande per volume su Ethereum con oltre $1 trilione di volume cumulativo. Il contratto non gestisce direttamente i fondi degli utenti — opera come router per le operazioni di swap attraverso le pool di liquidità. Non ci sono segnalazioni di sicurezza, exploit, o flag normativi associati a questo indirizzo. È uno degli indirizzi più interagiti sull'intera blockchain Ethereum.",
    sources: [
      {
        id: "ofac",
        label: "OFAC SDN List",
        status: "ok",
        severity: "clean",
        message: "Nessun match nella lista sanzioni.",
      },
      {
        id: "chainabuse",
        label: "Chainabuse",
        status: "ok",
        severity: "clean",
        message: "Nessuna segnalazione — contratto legittimo verificato.",
      },
      {
        id: "etherscan",
        label: "Etherscan Labels",
        status: "ok",
        severity: "clean",
        message: "Contratto verificato: 'Uniswap V3: SwapRouter02'.",
        externalUrl:
          "https://etherscan.io/address/0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
      },
    ],
  },

  // USDC (Circle) — stablecoin proxy
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    chain: "eth",
    kind: "address",
    severity: "clean",
    isDemo: true,
    summary: "USDC: contratto ufficiale Circle — stablecoin regolamentata da USD Coin.",
    aiSummary:
      "Questo è il proxy contract del token USDC (USD Coin) emesso da Circle Internet Financial. USDC è una stablecoin pienamente collateralizzata da riserve in dollari USA, soggetta a revisioni mensili da parte di Grant Thornton. Circle è una società regolamentata con licenze money-transmitter in tutti gli stati USA. Il contratto implementa ERC-20 con funzionalità aggiuntive di blocklist (Circle può congelare fondi per compliance normativa o ordini giudiziari) e minting/burning controllato. Nessun rischio di sicurezza noto. È il secondo stablecoin per capitalizzazione di mercato dopo USDT, con oltre $40 miliardi in circolazione.",
    sources: [
      {
        id: "ofac",
        label: "OFAC SDN List",
        status: "ok",
        severity: "clean",
        message: "Contratto emittente regolamentato — nessun flag.",
      },
      {
        id: "chainabuse",
        label: "Chainabuse",
        status: "ok",
        severity: "clean",
        message: "Nessuna segnalazione. Contratto ufficiale Circle.",
      },
      {
        id: "etherscan",
        label: "Etherscan Labels",
        status: "ok",
        severity: "clean",
        message: "Contratto verificato: 'Centre: USD Coin'.",
        externalUrl: "https://etherscan.io/address/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      },
    ],
  },

  // WETH (Wrapped Ether) — contratto canonico
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": {
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    chain: "eth",
    kind: "address",
    severity: "clean",
    isDemo: true,
    summary: "WETH: Wrapped Ether — contratto canonico ERC-20 per ETH su protocolli DeFi.",
    aiSummary:
      "Il contratto WETH (Wrapped Ether) è uno dei più vecchi e utilizzati su Ethereum, deployato nel 2017. Converte ETH nativo nel token ERC-20 WETH con un cambio 1:1, necessario per interagire con protocolli DeFi che richiedono token standardizzati (es. Uniswap V2, Compound, Aave). Il codice è estremamente semplice (~50 righe di Solidity) e non upgradeabile: depositi e prelievi sono sempre garantiti. Oltre $5 miliardi di ETH sono wrappati in qualsiasi momento. Non ha owner, admin key, o meccanismi di pausa — è un contratto completamente permissionless e immutabile. Considerato sicuro quanto ETH stesso.",
    sources: [
      {
        id: "ofac",
        label: "OFAC SDN List",
        status: "ok",
        severity: "clean",
        message: "Nessun flag — contratto infrastrutturale DeFi.",
      },
      {
        id: "chainabuse",
        label: "Chainabuse",
        status: "ok",
        severity: "clean",
        message: "Nessuna segnalazione. Contratto fondamentale dell'ecosistema.",
      },
      {
        id: "etherscan",
        label: "Etherscan Labels",
        status: "ok",
        severity: "clean",
        message: "Contratto verificato: 'WETH9 (Wrapped Ether)'.",
        externalUrl: "https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      },
    ],
  },

  // Euler Finance Exploiter — flash loan attack $197M (mar 2023)
  "0xb66cd966670d962c227b3eaba30a872dbfb995db": {
    address: "0xb66cd966670d962C227B3EABA30a872DbFb995db",
    chain: "eth",
    kind: "address",
    severity: "danger",
    isDemo: true,
    summary: "Euler Finance Exploiter — attacco flash loan da $197M (13 marzo 2023).",
    aiSummary:
      "Questo indirizzo ha eseguito uno degli exploit più sofisticati del 2023: l'attacco a Euler Finance tramite flash loan. Il 13 marzo 2023 l'attaccante ha sfruttato una vulnerabilità nel meccanismo di donazione del protocollo, rubando circa $197M in DAI, USDC, WBTC e stETH in una singola transazione. L'attacco è avvenuto attraverso una serie di operazioni che hanno manipolato il calcolo del collaterale. Sorprendentemente, circa due settimane dopo l'attacco, l'exploiter ha restituito quasi tutti i fondi in seguito a negoziati on-chain tramite transazioni con messaggi in chiaro. Il contratto Euler è stato successivamente riauditato e rilanciato. Questo indirizzo rimane nei database di threat intelligence.",
    sources: [
      {
        id: "chainabuse",
        label: "Chainabuse",
        status: "flagged",
        severity: "danger",
        message: "Identificato come Euler Finance Exploiter — $197M sottratti.",
        externalUrl: "https://www.chainabuse.com/",
      },
      {
        id: "ofac",
        label: "OFAC SDN List",
        status: "ok",
        severity: "info",
        message: "Non sanzionato OFAC (fondi restituiti post-negoziazione).",
      },
      {
        id: "etherscan",
        label: "Etherscan Labels",
        status: "flagged",
        severity: "danger",
        message: "Etichettato come 'Euler Finance Exploiter'.",
        externalUrl: "https://etherscan.io/address/0xb66cd966670d962C227B3EABA30a872DbFb995db",
      },
    ],
  },

  // Multichain (AnySwap) — exploit $126M lug 2023, fondi mai restituiti
  "0x9d5765ae1c95c21d4cc3b1d5bba71bad3b012b68": {
    address: "0x9D5765aE1c95C21D4cc3B1D5bBa71BAd3b012b68",
    chain: "eth",
    kind: "address",
    severity: "danger",
    isDemo: true,
    summary: "Multichain Exploiter — $126M drenati dal bridge (luglio 2023). Fondi non recuperati.",
    aiSummary:
      "Il 6 luglio 2023 il bridge cross-chain Multichain (ex AnySwap) ha subito prelievi anomali per oltre $126M da diversi pool, tra cui Fantom, Moonriver e Dogechain. L'incidente è ancora parzialmente non spiegato: il CEO Zhaojun era scomparso mesi prima (arrestato in Cina), lasciando il team senza accesso alle chiavi MPC del bridge. L'FSIB taiwanese ha aperto indagini. I fondi — tra cui USDC, WETH, WBTC e diversi altcoin — non sono mai stati recuperati. Circle ha blacklistato parte degli USDC sottratti. Questo caso è emblematico dei rischi dei bridge centralizzati con gestione opaca delle chiavi private.",
    sources: [
      {
        id: "chainabuse",
        label: "Chainabuse",
        status: "flagged",
        severity: "danger",
        message: "Wallet coinvolto nel drain Multichain di $126M.",
        externalUrl: "https://www.chainabuse.com/",
      },
      {
        id: "ofac",
        label: "OFAC SDN List",
        status: "ok",
        severity: "info",
        message: "Non ancora inserito nella lista sanzioni OFAC.",
      },
      {
        id: "etherscan",
        label: "Etherscan Labels",
        status: "flagged",
        severity: "danger",
        message: "Etichettato come 'Multichain Exploiter'.",
        externalUrl: "https://etherscan.io/address/0x9D5765aE1c95C21D4cc3B1D5bBa71BAd3b012b68",
      },
    ],
  },

  // Blur: Blend lending — contratto NFT lending legittimo
  "0x29469395eaf6f95920e59f858042f0e28d98a20b": {
    address: "0x29469395eAf6f95920E59F858042f0e28D98a20B",
    chain: "eth",
    kind: "address",
    severity: "info",
    isDemo: true,
    summary: "Blur: Blend — protocollo di lending su NFT. Contratto verificato, uso diffuso.",
    aiSummary:
      "Blend è il protocollo di lending peer-to-peer per NFT sviluppato da Blur, il marketplace NFT che ha scalzato OpenSea per volume nel 2023. Il contratto permette di usare NFT come collaterale per ottenere prestiti ETH. È stato auditato da Spearbit e ha accumulato oltre $500M di volume di prestiti. Non ci sono exploit noti, ma il modello di liquidazione 'dutch auction' introduce rischi specifici per i borrower: in caso di mancato rimborso, il lender può avviare l'asta e il NFT può essere liquidato in pochi blocchi. Contratto non upgradeabile post-deployment. Nessun flag di sicurezza o normativo.",
    sources: [
      {
        id: "ofac",
        label: "OFAC SDN List",
        status: "ok",
        severity: "clean",
        message: "Nessun flag normativo.",
      },
      {
        id: "chainabuse",
        label: "Chainabuse",
        status: "ok",
        severity: "clean",
        message: "Nessuna segnalazione su Chainabuse.",
      },
      {
        id: "etherscan",
        label: "Etherscan Labels",
        status: "ok",
        severity: "info",
        message: "Contratto verificato: 'Blur: Blend'.",
        externalUrl: "https://etherscan.io/address/0x29469395eAf6f95920E59F858042f0e28D98a20B",
      },
    ],
  },
};

/**
 * Cerca un RiskReport demo per l'indirizzo specificato (case-insensitive).
 * Ritorna null se l'indirizzo non è nella lista demo.
 */
export function getDemoReport(address: string): RiskReport | null {
  const key = address.toLowerCase();
  const template = DEMO_REPORTS[key];
  if (!template) return null;
  return { ...template, generatedAt: now() };
}

/** Lista degli indirizzi demo (lowercase) per controllo rapido. */
export const DEMO_ADDRESSES = new Set(Object.keys(DEMO_REPORTS));

// ─────────────────────────────────────────────────────────────────────────────
// Generazione mock per qualsiasi indirizzo
// ─────────────────────────────────────────────────────────────────────────────

interface MockProfile {
  severity: RiskReport["severity"];
  summary: string;
  aiSummary: string;
  chainabuseStatus: RiskReport["sources"][number]["status"];
  chainabuseMessage: string;
  chainabuseSeverity: RiskReport["sources"][number]["severity"];
  ofacStatus: RiskReport["sources"][number]["status"];
  ofacMessage: string;
  ofacSeverity: RiskReport["sources"][number]["severity"];
  etherscanMessage: string;
  etherscanSeverity: RiskReport["sources"][number]["severity"];
}

const MOCK_PROFILES: MockProfile[] = [
  // 0 — clean
  {
    severity: "clean",
    summary: "Nessuna segnalazione trovata. Indirizzo senza precedenti di attività malevola.",
    aiSummary:
      "L'analisi AI non ha rilevato pattern di rischio associati a questo indirizzo. Non risulta presente in liste di sanzioni internazionali (OFAC, EU, UN), non è stato segnalato su piattaforme di abuse reporting come Chainabuse o Scam Sniffer, e non mostra comportamenti anomali tipici di wallet legati a frodi, phishing o mixing. La storia transazionale appare coerente con un utilizzo regolare della rete. Si raccomanda comunque cautela prima di inviare fondi significativi a wallet sconosciuti: verificare sempre l'identità del destinatario tramite canali fuori catena.",
    chainabuseStatus: "ok",
    chainabuseMessage: "Nessuna segnalazione di abuso registrata.",
    chainabuseSeverity: "clean",
    ofacStatus: "ok",
    ofacMessage: "Nessun match nella lista sanzioni USA.",
    ofacSeverity: "clean",
    etherscanMessage: "Nessuna etichetta di rischio. Indirizzo non classificato.",
    etherscanSeverity: "clean",
  },
  // 1 — info (contratto/exchange noto)
  {
    severity: "info",
    summary: "Indirizzo con attività on-chain elevata. Possibile contratto o wallet istituzionale.",
    aiSummary:
      "Questo indirizzo presenta un volume transazionale elevato e interazioni con numerosi protocolli DeFi, caratteristiche tipiche di un hot wallet di exchange, un contratto smart, o un wallet istituzionale. Non risultano flag di sicurezza diretti. L'alta frequenza di transazioni potrebbe indicare un bot di arbitraggio MEV, un aggregatore DEX, o un market maker automatizzato. Prima di interagire, è consigliabile verificare su Etherscan se il contratto è verificato e se l'ABI è pubblica. La presenza di molte interazioni non implica rischio, ma merita attenzione nella verifica dell'identità.",
    chainabuseStatus: "ok",
    chainabuseMessage: "Nessuna segnalazione. Attività regolare rilevata.",
    chainabuseSeverity: "clean",
    ofacStatus: "ok",
    ofacMessage: "Non presente in liste di sanzioni.",
    ofacSeverity: "clean",
    etherscanMessage: "Indirizzo con alta attività. Nessun label noto assegnato.",
    etherscanSeverity: "info",
  },
  // 2 — warning (attività sospetta)
  {
    severity: "warning",
    summary: "Attività sospette rilevate: possibili interazioni con protocolli di mixing o indirizzi flaggati.",
    aiSummary:
      "L'analisi AI ha individuato segnali d'allerta associati a questo indirizzo. Il wallet mostra interazioni con indirizzi precedentemente flaggati per attività di mixing o layering di fondi — tecniche comuni nel riciclaggio di criptovalute. Non è presente nelle liste OFAC, ma alcune controparti dirette risultano in liste di watchlist secondarie. Il pattern di transazioni (molti piccoli invii frammentati seguiti da consolidamento) è coerente con tecniche di tumbling. Questo non implica necessariamente attività criminale, ma è consigliabile evitare transazioni significative e segnalare eventuali richieste di pagamento ricevute da questo indirizzo.",
    chainabuseStatus: "flagged",
    chainabuseMessage: "3 segnalazioni: possibile indirizzo associato a schemi di phishing.",
    chainabuseSeverity: "warning",
    ofacStatus: "ok",
    ofacMessage: "Non presente nella lista SDN, ma monitorato.",
    ofacSeverity: "info",
    etherscanMessage: "Interazioni con indirizzi noti come mixer secondari.",
    etherscanSeverity: "warning",
  },
  // 3 — danger (scam confermato)
  {
    severity: "danger",
    summary: "Indirizzo segnalato come scam confermato. Molteplici vittime riportate.",
    aiSummary:
      "Questo indirizzo è stato segnalato più volte su piattaforme di abuse reporting come destinazione di fondi in schemi di truffa confermati. L'analisi del grafo transazionale mostra un pattern classico di rug pull o pig butchering scam: raccolta di fondi da numerosi wallet (potenziali vittime), seguita da svuotamento rapido verso exchange o bridge. I fondi ricevuti vengono rapidamente dispersi attraverso catene di hop per rendere difficile il recupero. Si sconsiglia fortemente qualsiasi interazione con questo wallet. Se hai inviato fondi, segnala immediatamente l'accaduto alle forze dell'ordine e su chainabuse.com.",
    chainabuseStatus: "flagged",
    chainabuseMessage: "17 segnalazioni confermate: truffa e furto di fondi.",
    chainabuseSeverity: "danger",
    ofacStatus: "ok",
    ofacMessage: "Non ancora sanzionato OFAC, ma sotto indagine.",
    ofacSeverity: "info",
    etherscanMessage: "Etichettato da utenti come 'Reported Scam Address'.",
    etherscanSeverity: "danger",
  },
];

/**
 * Genera un RiskReport mock deterministico per qualsiasi indirizzo.
 * Il profilo è scelto in base all'indirizzo stesso (sempre uguale per lo stesso input).
 */
export function generateMockReport(address: string, chain: Chain, kind: Kind): RiskReport {
  const seed = addressSeed(address);
  // 60% clean/info, 25% warning, 15% danger
  const bucket = seed % 20;
  const profileIndex = bucket < 6 ? 0 : bucket < 12 ? 1 : bucket < 17 ? 2 : 3;
  const p = MOCK_PROFILES[profileIndex];
  const short = address.slice(0, 10) + "…" + address.slice(-6);

  return {
    address,
    chain,
    kind,
    severity: p.severity,
    isDemo: true,
    summary: p.summary,
    aiSummary: p.aiSummary,
    sources: [
      {
        id: "chainabuse",
        label: "Chainabuse",
        status: p.chainabuseStatus,
        severity: p.chainabuseSeverity,
        message: p.chainabuseMessage,
        externalUrl: `https://www.chainabuse.com/address/${address}`,
      },
      {
        id: "ofac",
        label: "OFAC SDN List",
        status: p.ofacStatus,
        severity: p.ofacSeverity,
        message: p.ofacMessage,
      },
      {
        id: "etherscan",
        label: "Etherscan Labels",
        status: p.etherscanSeverity === "clean" ? "ok" : "flagged",
        severity: p.etherscanSeverity,
        message: p.etherscanMessage,
        externalUrl: `https://etherscan.io/address/${address}`,
      },
    ],
    generatedAt: now(),
  };
}
