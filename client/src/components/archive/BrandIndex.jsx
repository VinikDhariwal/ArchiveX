import { Link } from 'react-router-dom';

function domainLabel(domains = []) {
  if (!domains.length) return 'House';
  if (domains.length === 1) return domains[0];
  return domains.join(' · ');
}

export default function BrandIndex({ brands, showHead = true }) {
  return (
    <section className="brand-index" id="brands" aria-labelledby="brands-title">
      {showHead ? (
        <div className="brand-index__head" data-reveal>
          <div>
            <p className="meta">Featured houses</p>
            <span className="hairline" aria-hidden="true" />
            <h2 id="brands-title">Brands in the archive</h2>
          </div>
          <Link className="link-cta" to="/brands">
            All brands
          </Link>
        </div>
      ) : (
        <h2 id="brands-title" className="visually-hidden">
          Brands in the archive
        </h2>
      )}
      <div className="brand-index__grid" data-reveal>
        {brands.map((brand) => (
          <Link className="brand-tile" to={`/brands/${brand.slug}`} key={brand.id || brand.slug}>
            <span className="meta">{domainLabel(brand.primaryDomains || (brand.domain ? [brand.domain] : []))}</span>
            <strong>{brand.name}</strong>
            <span className="demo-note">
              {[brand.country, brand.productCount ? `${brand.productCount} objects` : null]
                .filter(Boolean)
                .join(' · ') || 'Archive house'}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
