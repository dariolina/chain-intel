const faqs = [
  {
    q: "Do you track what I search?",
    a: "This public site does not run authenticated accounts. Your queries hit the backend API, which may cache reports for a TTL—see the docs for details.",
  },
  {
    q: "Is this a wallet or a dApp?",
    a: "No. Justice is read-only intelligence: paste an address or hash, read the report. There is no connect wallet flow.",
  },
  {
    q: "Can I self-host?",
    a: "Yes. The API contract is documented on /docs; deploy the backend alongside this frontend per the repository instructions.",
  },
];

export function Faq() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">
        FAQ
      </h2>
      <dl className="mt-8 space-y-8">
        {faqs.map((item) => (
          <div key={item.q}>
            <dt className="font-medium">{item.q}</dt>
            <dd className="mt-2 text-sm text-muted-foreground">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
