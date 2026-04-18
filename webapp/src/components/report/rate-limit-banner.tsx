export function RateLimitBanner({
  retryAfter,
}: {
  retryAfter?: number;
}) {
  const hint =
    typeof retryAfter === "number" && Number.isFinite(retryAfter)
      ? `Try again in about ${retryAfter} seconds.`
      : "Please wait a moment and try again.";
  return (
    <div
      className="border-b border-severity-warning/40 bg-severity-warning/10 px-4 py-3 text-sm text-severity-warning"
      role="status"
    >
      <strong className="font-medium">Rate limited.</strong> {hint}
    </div>
  );
}
