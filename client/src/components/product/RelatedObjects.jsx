import { Link } from 'react-router-dom';
import { getPrimaryImage } from '../../utils/archiveObject.js';

export default function RelatedObjects({ products = [], isLoading }) {
  return (
    <section className="product-section" aria-labelledby="product-related-title">
      <h2 id="product-related-title" className="product-section__title">
        Related objects
      </h2>

      {isLoading ? <p className="product-section__note">Gathering related plates…</p> : null}

      {!isLoading && !products.length ? (
        <p className="product-section__note">No closely related approved objects yet.</p>
      ) : null}

      {products.length ? (
        <ul className="related-objects">
          {products.map((item) => {
            const image = getPrimaryImage(item);
            return (
              <li key={item.id}>
                <Link className="related-objects__card" to={`/products/${item.slug}`}>
                  {image ? (
                    <img src={image.url} alt="" loading="lazy" width={320} height={220} />
                  ) : (
                    <div className="related-objects__placeholder" aria-hidden="true" />
                  )}
                  <div>
                    <p className="meta">
                      {item.brand} · {item.productType}
                    </p>
                    <p className="related-objects__name">{item.name}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
