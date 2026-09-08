import { useState } from 'react';
import { Link } from 'react-router-dom';
import useSectionReveal from '../hooks/useSectionReveal.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import ArchiveHero from '../components/archive/ArchiveHero.jsx';
import ArchivePromise from '../components/archive/ArchivePromise.jsx';
import BrandMarquee from '../components/archive/BrandMarquee.jsx';
import DomainPaths from '../components/archive/DomainPaths.jsx';
import FeaturedObject from '../components/archive/FeaturedObject.jsx';
import EditorialStory from '../components/archive/EditorialStory.jsx';
import HomeClose from '../components/archive/HomeClose.jsx';
import {
  archivePromise,
  brands,
  domainPaths,
  editorialStory,
  featuredCarId,
  featuredMotorcycleId,
  getObjectById,
  homeClose,
} from '../data/demoData.js';

const MAX_COMPARE = 4;

export default function HomePage() {
  const [compareIds, setCompareIds] = useState([]);
  useSectionReveal();
  useDocumentTitle('Home');

  const featuredCar = getObjectById(featuredCarId);
  const featuredMotorcycle = getObjectById(featuredMotorcycleId);

  const toggleCompare = (id) => {
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= MAX_COMPARE) {
        return current;
      }
      return [...current, id];
    });
  };

  const clearCompare = () => setCompareIds([]);

  return (
    <>
      <ArchiveHero />
      <BrandMarquee brands={brands} />
      <ArchivePromise promise={archivePromise} />
      <DomainPaths domains={domainPaths} />

      <section className="signatures" aria-labelledby="signatures-title" data-reveal>
        <div className="signatures__head">
          <p className="meta">The signatures</p>
          <span className="hairline" aria-hidden="true" />
          <h2 id="signatures-title" className="display">
            Objects with a story to tell.
          </h2>
          <p className="signatures__lede">A few of the tales collectors return for — automotive first, then two wheels.</p>
        </div>
      </section>

      {featuredCar ? (
        <FeaturedObject
          object={featuredCar}
          eyebrow="House favourite · Automotive"
          sectionId="featured-car"
          onToggleCompare={toggleCompare}
          isCompared={compareIds.includes(featuredCar.id)}
        />
      ) : null}

      {featuredMotorcycle ? (
        <FeaturedObject
          object={featuredMotorcycle}
          eyebrow="Signature · Motorcycle"
          sectionId="featured-motorcycle"
          flipped
          onToggleCompare={toggleCompare}
          isCompared={compareIds.includes(featuredMotorcycle.id)}
        />
      ) : null}

      <EditorialStory story={editorialStory} />
      <HomeClose close={homeClose} />

      <div
        className={`compare-tray ${compareIds.length ? 'is-visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        <span>
          Compare tray · {compareIds.length}/{MAX_COMPARE} objects selected
        </span>
        <div className="compare-tray__actions">
          <Link className="link-cta link-cta--light" to="/compare">
            Open compare
          </Link>
          <button
            type="button"
            className="btn"
            style={{ color: 'var(--paper)', borderColor: 'rgba(241,238,231,0.4)' }}
            onClick={clearCompare}
          >
            Clear
          </button>
        </div>
      </div>
    </>
  );
}
