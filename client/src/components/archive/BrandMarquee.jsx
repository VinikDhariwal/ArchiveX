import { Fragment } from 'react';
import { Link } from 'react-router-dom';

export default function BrandMarquee({ brands }) {
  if (!brands?.length) return null;

  const loop = [...brands, ...brands];

  return (
    <section className="brand-marquee" aria-label="Brands in the archive">
      <div className="brand-marquee__inner">
        <div className="brand-marquee__head">
          <div>
            <p className="meta">The marques</p>
            <span className="hairline" aria-hidden="true" />
          </div>
          <Link className="btn btn--soft" to="/brands">
            View all brands
          </Link>
        </div>

        <div className="brand-marquee__rail">
          <div className="brand-marquee__track">
            {loop.map((brand, index) => (
              <Fragment key={`${brand.id || brand.slug}-${index}`}>
                {brand.slug ? (
                  <Link className="brand-marquee__item" to={`/brands/${brand.slug}`}>
                    {brand.name}
                  </Link>
                ) : (
                  <span className="brand-marquee__item">{brand.name}</span>
                )}
                <span className="brand-marquee__sep" aria-hidden="true">
                  ·
                </span>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
