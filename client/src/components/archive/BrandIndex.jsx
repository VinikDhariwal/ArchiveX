import { Link } from 'react-router-dom';

export default function BrandIndex({ brands }) {
  return (
    <section className="brand-index" id="brands" aria-labelledby="brands-title" data-reveal>
      <div className="brand-index__head">
        <div>
          <p className="meta">Featured houses</p>
          <span className="hairline" aria-hidden="true" />
          <h2 id="brands-title">Brands in the archive</h2>
        </div>
        <Link className="link-cta" to="/brands">
          All brands
        </Link>
      </div>
      <div className="brand-index__grid">
        {brands.map((brand) => (
          <a className="brand-tile" href={`#${brand.id}`} key={brand.id}>
            <span className="meta">{brand.domain}</span>
            <strong>{brand.name}</strong>
            <span className="demo-note">{brand.country}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
