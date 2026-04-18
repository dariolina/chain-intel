export function Sparkline({
  data,
  width = 260,
  height = 56,
  ariaLabel = "Trend ultimi 7 giorni",
}: {
  data: number[];
  width?: number;
  height?: number;
  ariaLabel?: string;
}) {
  if (data.length === 0) {
    return (
      <div
        className="flex h-14 items-center text-xs text-muted-foreground"
        role="img"
        aria-label={ariaLabel}
      >
        nessun dato
      </div>
    );
  }

  const max = Math.max(...data, 1);
  const stepX = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - (v / max) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const poly = points.join(" ");
  const lastX = (data.length - 1) * stepX;
  const lastY = height - (data[data.length - 1] / max) * (height - 4) - 2;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className="text-primary"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={poly}
      />
      <circle cx={lastX} cy={lastY} r={2.5} fill="currentColor" />
    </svg>
  );
}
