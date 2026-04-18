export function InvalidSearchBanner() {
  return (
    <div
      className="border-b border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      <strong className="font-medium">Invalid input.</strong> Enter a valid EVM
      address, EVM transaction hash, or Bitcoin address / transaction id.
    </div>
  );
}
