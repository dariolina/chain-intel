import type { Metadata } from "next";
import { SearchBar } from "@/components/search/search-bar";
import { DemoSuggestions } from "@/components/search/demo-suggestions";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Analisi on-chain in tempo reale.",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
      <header className="flex flex-col items-center gap-4 text-center">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          Analisi on-chain
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Inserisci un indirizzo EVM o Bitcoin per ottenere un report di rischio
          aggregato da più fonti pubbliche con sintesi AI.
        </p>
      </header>

      <div className="mt-10">
        <SearchBar />
        <DemoSuggestions />
      </div>
    </div>
  );
}
