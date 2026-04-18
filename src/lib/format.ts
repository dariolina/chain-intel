export function truncateMiddle(value: string, head = 6, tail = 4): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function formatRelativeTime(iso: string, locale = "en"): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffSec = Math.round((date.getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [unit, seconds] of divisions) {
    const delta = diffSec / seconds;
    if (Math.abs(delta) >= 1 || unit === "second") {
      return rtf.format(Math.round(delta), unit);
    }
  }
  return rtf.format(0, "second");
}

export function formatDateTime(iso: string, locale = "en"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
