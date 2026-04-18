import type { RiskReport } from "@/lib/types";

const NOW = () => new Date().toISOString();

// Indirizzi demo per mostrare la pagina report con dati significativi.
// Accedibili su /address/eth/0xdeadbeef…, /address/eth/0xcafebabe…, /address/eth/0x1111…
const builders: Record<string, (address: string) => RiskReport> = {
  "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef": (address) => ({
    address,
    chain: "eth",
    kind: "address",
    severity: "danger",
    summary:
      "Indirizzo ad alto rischio: segnalato da OFAC SDN, GoPlus (phishing, money laundering) e ScamSniffer.",
    sources: [
      {
        id: "ofac",
        label: "OFAC SDN",
        status: "flagged",
        severity: "danger",
        message:
          "Presente nella lista sanzioni OFAC (Tornado Cash / sanzioni US). Qualsiasi interazione è sconsigliata e potenzialmente illegale.",
        externalUrl: "https://sanctionssearch.ofac.treas.gov/",
        fetchedAt: NOW(),
      },
      {
        id: "goplus",
        label: "GoPlus Security",
        status: "flagged",
        severity: "danger",
        message:
          "Flag rilevati: phishing_activities, money_laundering, darkweb_transactions, stealing_attack.",
        details: { flags: ["phishing", "money laundering", "darkweb", "stealing"] },
        externalUrl: `https://gopluslabs.io/token-security/1/${address}`,
        fetchedAt: NOW(),
      },
      {
        id: "scamsniffer",
        label: "ScamSniffer",
        status: "flagged",
        severity: "danger",
        message:
          "Indirizzo nella blacklist pubblica ScamSniffer come drainer/phishing noto.",
        externalUrl: "https://scamsniffer.io/",
        fetchedAt: NOW(),
      },
      {
        id: "etherscan",
        label: "Etherscan V2",
        status: "ok",
        severity: "info",
        message: "EOA con saldo 0.0000 ETH. 847 transazioni su Ethereum Mainnet.",
        details: { isContract: false, balanceWei: "0" },
        externalUrl: `https://etherscan.io/address/${address}`,
        fetchedAt: NOW(),
      },
    ],
    generatedAt: NOW(),
    cached: false,
    ttlSeconds: 3600,
  }),

  "0xcafebabecafebabecafebabecafebabecafebabe": (address) => ({
    address,
    chain: "eth",
    kind: "address",
    severity: "warning",
    summary:
      "Segnali di rischio moderati: GoPlus rileva attività di mixer e indirizzi correlati ad honeypot.",
    sources: [
      {
        id: "ofac",
        label: "OFAC SDN",
        status: "ok",
        severity: "clean",
        message: "Nessun match nella lista OFAC di riferimento.",
        externalUrl: "https://sanctionssearch.ofac.treas.gov/",
        fetchedAt: NOW(),
      },
      {
        id: "goplus",
        label: "GoPlus Security",
        status: "flagged",
        severity: "warning",
        message:
          "Flag GoPlus: mixer, honeypot_related_address. Associato a servizi di mixing e contratti trap.",
        details: { flags: ["mixer", "honeypot"] },
        externalUrl: `https://gopluslabs.io/token-security/1/${address}`,
        fetchedAt: NOW(),
      },
      {
        id: "scamsniffer",
        label: "ScamSniffer",
        status: "ok",
        severity: "clean",
        message: "Nessun match nella blacklist ScamSniffer.",
        externalUrl: "https://scamsniffer.io/",
        fetchedAt: NOW(),
      },
      {
        id: "etherscan",
        label: "Etherscan V2",
        status: "ok",
        severity: "info",
        message: "Contratto con saldo 12.4420 ETH. Deployato su Ethereum Mainnet.",
        details: { isContract: true },
        externalUrl: `https://etherscan.io/address/${address}`,
        fetchedAt: NOW(),
      },
    ],
    generatedAt: NOW(),
    cached: false,
    ttlSeconds: 3600,
  }),

  "0x1111111111111111111111111111111111111111": (address) => ({
    address,
    chain: "eth",
    kind: "address",
    severity: "clean",
    summary:
      "Nessun segnale di rischio rilevato. Indirizzo pulito su tutte le fonti attive.",
    sources: [
      {
        id: "ofac",
        label: "OFAC SDN",
        status: "ok",
        severity: "clean",
        message: "Nessun match nella lista OFAC di riferimento.",
        externalUrl: "https://sanctionssearch.ofac.treas.gov/",
        fetchedAt: NOW(),
      },
      {
        id: "goplus",
        label: "GoPlus Security",
        status: "ok",
        severity: "clean",
        message: "Nessun flag di sicurezza rilevato (EOA).",
        externalUrl: `https://gopluslabs.io/token-security/1/${address}`,
        fetchedAt: NOW(),
      },
      {
        id: "scamsniffer",
        label: "ScamSniffer",
        status: "ok",
        severity: "clean",
        message: "Nessun match nella blacklist ScamSniffer.",
        externalUrl: "https://scamsniffer.io/",
        fetchedAt: NOW(),
      },
      {
        id: "etherscan",
        label: "Etherscan V2",
        status: "ok",
        severity: "info",
        message: "EOA con saldo 0.8310 ETH. Ultima attività recente.",
        details: { isContract: false },
        externalUrl: `https://etherscan.io/address/${address}`,
        fetchedAt: NOW(),
      },
    ],
    generatedAt: NOW(),
    cached: false,
    ttlSeconds: 3600,
  }),
};

export function getMockReport(address: string): RiskReport | null {
  const fn = builders[address.toLowerCase()];
  return fn ? fn(address.toLowerCase()) : null;
}
