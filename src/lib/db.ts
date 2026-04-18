// Database rimosso — stub no-op per compatibilità con eventuali import residui.
export interface SearchRow {
  id: number;
  address: string;
  chain: string;
  kind: string;
  severity: string;
  summary: string;
  report_json: string;
  ai_analysis: string | null;
  created_at: string;
}
export interface DashboardStats {
  total: number;
  flagged: number;
  byChain: { chain: string; count: number }[];
  perDay: { day: string; count: number }[];
}
export function recordSearch(): number { return -1; }
export function attachAiAnalysis(): void { /* no-op */ }
export function listSearches(): SearchRow[] { return []; }
export function getSearch(): SearchRow | null { return null; }
export function deleteSearch(): void { /* no-op */ }
export function purgeSearches(): number { return 0; }
export function getStats(): DashboardStats {
  return { total: 0, flagged: 0, byChain: [], perDay: [] };
}
