export default function RarityProfile({ product }) {
  const profile = product?.rarityProfile;
  if (!profile) return null;

  const rows = [
    { label: 'Production history', value: profile.productionHistory },
    { label: 'Collector interest', value: profile.collectorInterest },
    { label: 'Historical significance', value: profile.historicalSignificance },
  ].filter((row) => row.value);

  if (!rows.length) return null;

  return (
    <section className="product-section" aria-labelledby="product-rarity-title">
      <h2 id="product-rarity-title" className="product-section__title">
        Rarity profile
      </h2>
      <div className="product-rarity">
        {rows.map((row) => (
          <article key={row.label} className="product-rarity__card">
            <h3 className="product-rarity__label">{row.label}</h3>
            <p>{row.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
