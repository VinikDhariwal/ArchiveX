export default function MarketSignals({ product }) {
  const signals = product?.marketSignals;
  if (!signals) return null;

  const rows = [
    { label: 'Archive estimate', value: signals.archiveEstimate },
    { label: 'Market range', value: signals.marketRange },
    { label: 'Collector interest', value: signals.collectorInterest },
    { label: 'Availability signal', value: signals.availabilitySignal },
    { label: 'Price movement', value: signals.priceMovement },
  ].filter((row) => row.value);

  if (!rows.length) return null;

  const updated = signals.lastUpdated
    ? new Date(signals.lastUpdated).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <section className="product-section product-section--compact" aria-labelledby="product-market-title">
      <h2 id="product-market-title" className="product-section__title">
        Market signals
      </h2>
      <dl className="product-specs product-specs--signals">
        {rows.map((row) => (
          <div className="product-specs__row" key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
        {updated ? (
          <div className="product-specs__row">
            <dt>Last updated</dt>
            <dd>{updated}</dd>
          </div>
        ) : null}
      </dl>
      <p className="product-section__note">
        {signals.disclaimer ||
          'Informational archive signals only — not a guarantee of price, availability, or investment outcome.'}
      </p>
    </section>
  );
}
