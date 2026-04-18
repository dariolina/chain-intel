import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type { Chain, Kind, RiskReport, Severity } from "@/lib/types";

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;
  const dbPath = process.env.SQLITE_PATH ?? "./data/justice.db";
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT NOT NULL,
      chain TEXT NOT NULL,
      kind TEXT NOT NULL,
      severity TEXT NOT NULL,
      summary TEXT NOT NULL,
      report_json TEXT NOT NULL,
      ai_analysis TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_searches_created ON searches(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_searches_address ON searches(address);
  `);
  return db;
}

export interface SearchRow {
  id: number;
  address: string;
  chain: Chain;
  kind: Kind;
  severity: Severity;
  summary: string;
  report_json: string;
  ai_analysis: string | null;
  created_at: string;
}

export function recordSearch(report: RiskReport): number {
  const stmt = getDb().prepare(`
    INSERT INTO searches (address, chain, kind, severity, summary, report_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const res = stmt.run(
    report.address,
    report.chain,
    report.kind,
    report.severity,
    report.summary,
    JSON.stringify(report),
  );
  return Number(res.lastInsertRowid);
}

export function attachAiAnalysis(id: number, text: string): void {
  getDb().prepare(`UPDATE searches SET ai_analysis = ? WHERE id = ?`).run(text, id);
}

export function listSearches(limit = 50): SearchRow[] {
  return getDb()
    .prepare(`SELECT * FROM searches ORDER BY created_at DESC LIMIT ?`)
    .all(limit) as SearchRow[];
}

export function getSearch(id: number): SearchRow | null {
  const row = getDb().prepare(`SELECT * FROM searches WHERE id = ?`).get(id) as
    | SearchRow
    | undefined;
  return row ?? null;
}

export function deleteSearch(id: number): void {
  getDb().prepare(`DELETE FROM searches WHERE id = ?`).run(id);
}

export function purgeSearches(): number {
  const res = getDb().prepare(`DELETE FROM searches`).run();
  return Number(res.changes);
}

export interface DashboardStats {
  total: number;
  flagged: number;
  byChain: { chain: string; count: number }[];
  perDay: { day: string; count: number }[];
}

export function getStats(): DashboardStats {
  const d = getDb();
  const total = (d.prepare(`SELECT COUNT(*) as c FROM searches`).get() as { c: number }).c;
  const flagged = (
    d
      .prepare(
        `SELECT COUNT(*) as c FROM searches WHERE severity IN ('warning','danger')`,
      )
      .get() as { c: number }
  ).c;
  const byChain = d
    .prepare(`SELECT chain, COUNT(*) as count FROM searches GROUP BY chain ORDER BY count DESC`)
    .all() as { chain: string; count: number }[];
  const perDay = d
    .prepare(
      `SELECT date(created_at) as day, COUNT(*) as count
       FROM searches
       WHERE created_at >= datetime('now', '-7 days')
       GROUP BY day
       ORDER BY day ASC`,
    )
    .all() as { day: string; count: number }[];
  return { total, flagged, byChain, perDay };
}
