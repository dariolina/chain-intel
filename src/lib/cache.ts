import "server-only";

interface Entry<T> {
  value: T;
  storedAt: number;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();

export function cacheGet<T>(key: string): { value: T; ageMs: number } | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    store.delete(key);
    return null;
  }
  return { value: hit.value as T, ageMs: Date.now() - hit.storedAt };
}

export function cacheSet<T>(key: string, value: T, ttlSeconds: number): void {
  const now = Date.now();
  store.set(key, { value, storedAt: now, expiresAt: now + ttlSeconds * 1000 });
}

export function cacheDelete(key: string): void {
  store.delete(key);
}

export interface CacheStats {
  size: number;
  ageP50Ms?: number;
}

export function cacheStats(): CacheStats {
  const now = Date.now();
  const ages: number[] = [];
  store.forEach((entry) => {
    if (now > entry.expiresAt) return;
    ages.push(now - entry.storedAt);
  });
  if (ages.length === 0) return { size: 0 };
  ages.sort((a, b) => a - b);
  const ageP50Ms = ages[Math.floor(ages.length / 2)];
  return { size: ages.length, ageP50Ms };
}
