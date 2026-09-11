import useDocumentTitle from '../hooks/useDocumentTitle.js';
import ArchiveHero from '../components/archive/ArchiveHero.jsx';
import ArchivePromise from '../components/archive/ArchivePromise.jsx';
import BrandMarquee from '../components/archive/BrandMarquee.jsx';
import DomainPaths from '../components/archive/DomainPaths.jsx';
import FeaturedObject from '../components/archive/FeaturedObject.jsx';
import EditorialStory from '../components/archive/EditorialStory.jsx';
import HomeClose from '../components/archive/HomeClose.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import { useGetBrandsQuery, useGetHomeQuery } from '../app/api.js';
import {
  archivePromise as demoPromise,
  domainPaths as demoDomains,
  editorialStory as demoEditorial,
  hero as demoHero,
  homeClose as demoClose,
} from '../data/demoData.js';

function buildClientFallback() {
  return {
    hero: {
      enabled: true,
      brand: demoHero.brand,
      headlineLine1: demoHero.headlineLine1,
      headlineLine2: demoHero.headlineLine2,
      lede: demoHero.lede,
      primaryCta: demoHero.primaryCta,
      plates: demoHero.plates,
    },
    brands: {
      enabled: true,
      label: 'The brands',
      ctaLabel: 'View all brands',
      ctaHref: '/brands',
    },
    promise: { enabled: true, ...demoPromise },
    domains: {
      enabled: true,
      meta: 'The chambers',
      title: 'Explore domain by domain.',
      lede: 'Cars and motorcycles lead the archive. Watches remain a fully supported second chamber.',
      feedCtaLabel: 'View the full feed',
      feedCtaHref: '/discover',
      chambers: demoDomains,
    },
    signatures: {
      enabled: true,
      meta: 'Catalogue plates',
      title: 'Objects with a story to tell.',
      lede: 'Automotive first, then two wheels — plates from the public archive.',
    },
    featured: { enabled: true, slots: [] },
    editorial: { enabled: true, ...demoEditorial },
    close: { enabled: true, ...demoClose },
  };
}

export default function HomePage() {
  useDocumentTitle('Home');

  const { data: home, isLoading: homeLoading, isError } = useGetHomeQuery();
  const { data: brands = [], isLoading: brandsLoading } = useGetBrandsQuery();

  const config = home || (isError ? buildClientFallback() : null);

  if (homeLoading && !config) {
    return <LoadingState />;
  }

  if (!config) {
    return <LoadingState />;
  }

  return (
    <>
      {config.hero?.enabled !== false ? <ArchiveHero hero={config.hero} /> : null}

      {config.brands?.enabled !== false && !brandsLoading ? (
        <BrandMarquee brands={brands} config={config.brands} />
      ) : null}

      {config.promise?.enabled !== false ? (
        <ArchivePromise promise={config.promise} />
      ) : null}

      {config.domains?.enabled !== false ? (
        <DomainPaths domains={config.domains.chambers || []} head={config.domains} />
      ) : null}

      {config.signatures?.enabled !== false ? (
        <section className="signatures" aria-labelledby="signatures-title" data-reveal>
          <div className="signatures__head">
            <p className="meta">{config.signatures.meta}</p>
            <span className="hairline" aria-hidden="true" />
            <h2 id="signatures-title" className="display">
              {config.signatures.title}
            </h2>
            <p className="signatures__lede">{config.signatures.lede}</p>
          </div>
        </section>
      ) : null}

      {config.featured?.enabled !== false
        ? (config.featured.slots || []).map((slot, index) =>
            slot.product ? (
              <FeaturedObject
                key={slot.product.id || slot.product.slug || index}
                object={slot.product}
                eyebrow={slot.eyebrow}
                sectionId={`featured-${slot.product.slug || index}`}
                flipped={Boolean(slot.flipped)}
              />
            ) : null
          )
        : null}

      {config.editorial?.enabled !== false && config.editorial?.image?.url ? (
        <EditorialStory story={config.editorial} />
      ) : null}

      {config.close?.enabled !== false ? <HomeClose close={config.close} /> : null}
    </>
  );
}
