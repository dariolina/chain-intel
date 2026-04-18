import "server-only";
import OpenAI from "openai";
import type { RiskReport } from "@/lib/types";

export function getOpenAI(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export function buildAnalysisPrompt(report: RiskReport): string {
  return [
    `Sei un analista di sicurezza on-chain.`,
    `Riceverai un JSON con gli indicatori aggregati per un indirizzo o transazione blockchain.`,
    `Produci un'analisi concisa in italiano di massimo 180 parole, strutturata in 3 sezioni brevi:`,
    `1) "Verdetto": una frase netta sul livello di rischio.`,
    `2) "Cosa sappiamo": 2-4 bullet concreti, solo dati presenti nel JSON. NON inventare.`,
    `3) "Cosa fare": 2-3 azioni pratiche.`,
    `Non ripetere il JSON. Evita disclaimer boilerplate. Usa markdown leggero (## per sezioni, - per bullet).`,
    ``,
    `DATI:`,
    "```json",
    JSON.stringify(report, null, 2),
    "```",
  ].join("\n");
}
