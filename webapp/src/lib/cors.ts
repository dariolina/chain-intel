import "server-only";

export function corsHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  if (!origin) return headers;

  const allowedIds = (process.env.ALLOWED_EXTENSION_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (origin.startsWith("chrome-extension://")) {
    const id = origin.replace("chrome-extension://", "");
    if (allowedIds.length === 0 || allowedIds.includes(id)) {
      headers["Access-Control-Allow-Origin"] = origin;
    }
  } else if (
    origin.startsWith("http://localhost") ||
    origin.startsWith("http://127.0.0.1")
  ) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}
