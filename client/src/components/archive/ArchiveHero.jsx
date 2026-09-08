import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getObjectBySlug, hero } from '../../data/demoData.js';
import MuseumFrame from './MuseumFrame.jsx';

export default function ArchiveHero() {
  const featured = getObjectBySlug(hero.featuredSlug);
  const plates = useMemo(() => {
    if (featured?.images?.length) return featured.images;
    return hero.image ? [hero.image] : [];
  }, [featured]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const active = plates[activeIndex] || hero.image;

  useEffect(() => {
    if (plates.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setIsFading(true);
      window.setTimeout(() => {
        setActiveIndex((index) => (index + 1) % plates.length);
        setIsFading(false);
      }, 140);
    }, 3800);

    return () => window.clearInterval(timer);
  }, [plates.length]);

  return (
    <section
      className="archive-hero"
      id="top"
      aria-labelledby="hero-headline"
      style={{
        '--hero-gallery-image': `url(${hero.galleryBackground.url})`,
      }}
    >
      <div className="archive-hero__gallery-bg" aria-hidden="true" />

      <div className="archive-hero__main">
        <div className="archive-hero__copy">
          <p className="archive-hero__kicker">{hero.kicker}</p>
          <h1 id="hero-headline" className="archive-hero__headline">
            {hero.headlineLine1}
            <br />
            <em>{hero.headlineLine2}</em>
          </h1>
          <p className="archive-hero__lede">{hero.lede}</p>
          <div className="archive-hero__actions">
            <Link className="link-cta" to={hero.primaryCta.href}>
              {hero.primaryCta.label}
            </Link>
            <Link className="link-cta link-cta--muted" to={hero.secondaryCta.href}>
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>

        <div className="archive-hero__stage">
          <Link
            to={`/products/${hero.featuredSlug}`}
            className="archive-hero__feature"
            aria-label={`View featured object ${featured?.name || ''}`}
          >
            <MuseumFrame>
              <img
                className={`archive-hero__plate ${isFading ? 'is-fading' : ''}`}
                src={active.url}
                alt={active.alt}
                width={active.width}
                height={active.height}
                fetchPriority="high"
              />
            </MuseumFrame>
            <div className="archive-hero__feature-meta">
              <p className="meta">
                {featured?.brand} · {featured?.year} · {featured?.rarity}
              </p>
              <p className="archive-hero__feature-name">{featured?.name}</p>
              {plates.length > 1 ? (
                <span className="archive-hero__plate-dashes" aria-hidden="true">
                  {plates.map((plate, index) => (
                    <i
                      key={plate.url + index}
                      className={index === activeIndex ? 'is-active' : ''}
                    />
                  ))}
                </span>
              ) : null}
            </div>
          </Link>
        </div>
      </div>

      <div className="archive-hero__scroll-cue" aria-hidden="true">
        <span>Scroll</span>
      </div>
    </section>
  );
}
