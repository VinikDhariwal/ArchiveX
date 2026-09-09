export default function ProductJournal({ items = [], meta = {}, isLoading }) {
  return (
    <section className="product-section" aria-labelledby="product-journal-title">
      <h2 id="product-journal-title" className="product-section__title">
        Journal coverage
      </h2>

      {isLoading ? <p className="product-section__note">Looking for essays…</p> : null}

      {!isLoading && !items.length ? (
        <p className="product-section__note">
          {meta.note || 'Journal coverage arrives in Phase 10.'}
        </p>
      ) : null}

      {items.length ? (
        <ul className="product-journal">
          {items.map((article) => (
            <li key={article.id || article.slug}>
              <p className="meta">{article.type || 'Essay'}</p>
              <p className="product-journal__title">{article.title}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
