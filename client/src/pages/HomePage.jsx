import { useState } from 'react';
import { Link } from 'react-router-dom';
import useSectionReveal from '../hooks/useSectionReveal.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import ArchiveHero from '../components/archive/ArchiveHero.jsx';
import FeaturedObject from '../components/archive/FeaturedObject.jsx';
import EditorialStory from '../components/archive/EditorialStory.jsx';
import {
  editorialStory,
  featuredCarId,
  featuredMotorcycleId,
  getObjectById,
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

      {featuredCar ? (
        <FeaturedObject
          object={featuredCar}
          eyebrow="Featured automotive object"
          sectionId="featured-car"
          onToggleCompare={toggleCompare}
          isCompared={compareIds.includes(featuredCar.id)}
        />
      ) : null}

      {featuredMotorcycle ? (
        <FeaturedObject
          object={featuredMotorcycle}
          eyebrow="Featured motorcycle object"
          sectionId="featured-motorcycle"
          flipped
          onToggleCompare={toggleCompare}
          isCompared={compareIds.includes(featuredMotorcycle.id)}
        />
      ) : null}

      <EditorialStory story={editorialStory} />

      <section className="home-continue" aria-label="Continue exploring" data-reveal>
        <div className="home-continue__inner">
          <p className="meta">Continue</p>
          <span className="hairline" aria-hidden="true" />
          <div className="home-continue__links">
            <Link className="link-cta" to="/brands">
              Brands
            </Link>
            <Link className="link-cta" to="/journal">
              Journal
            </Link>
            <Link className="link-cta" to="/categories">
              Categories
            </Link>
          </div>
        </div>
      </section>

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
