import { Fragment } from 'react';
import { Link } from 'react-router-dom';

/** Continuous marques ribbon — duration scales with list length so velocity stays calm. */
export default function BrandMarquee({ brands, config }) {
  if (!brands?.length) return null;

  const loop = [...brands, ...brands];
  const durationSec = Math.max(Math.round(brands.length * 3.2), 90);
  const label = config?.label || 'The brands';
  const ctaLabel = config?.ctaLabel || 'View all brands';
  const ctaHref = config?.ctaHref || '/brands';

  return (
    <section className="brand-marquee" aria-label="Brands in the archive">
      <div className="brand-marquee__inner">
        <div className="brand-marquee__head">
          <div>
            <p className="meta">{label}</p>
            <span className="hairline" aria-hidden="true" />
          </div>
          <Link className="btn btn--soft" to={ctaHref}>
            {ctaLabel}
          </Link>
        </div>

        <div className="brand-marquee__rail">
          <div
            className="brand-marquee__track"
            style={{ animationDuration: `${durationSec}s` }}
          >
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
