import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import useSectionReveal from '../hooks/useSectionReveal.js';
import ArchiveHero from '../components/archive/ArchiveHero.jsx';
import ArchiveIndex from '../components/archive/ArchiveIndex.jsx';
import FeaturedObject from '../components/archive/FeaturedObject.jsx';
import ObjectCard from '../components/archive/ObjectCard.jsx';
import EditorialStory from '../components/archive/EditorialStory.jsx';
import BrandIndex from '../components/archive/BrandIndex.jsx';
import JournalPreview from '../components/archive/JournalPreview.jsx';
import {
  brands,
  curatedObjectIds,
  editorialStory,
  featuredCarId,
  featuredMotorcycleId,
  getObjectById,
  getObjectsByIds,
  journalArticles,
} from '../data/demoData.js';

const MAX_COMPARE = 4;

export default function HomePage() {
  const [compareIds, setCompareIds] = useState([]);
  useSectionReveal();

  const featuredCar = getObjectById(featuredCarId);
  const featuredMotorcycle = getObjectById(featuredMotorcycleId);
  const curated = useMemo(() => getObjectsByIds(curatedObjectIds), []);

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
    <AppShell compareCount={compareIds.length} onOpenCompare={() => undefined}>
      <ArchiveHero />
      <ArchiveIndex />

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

      <section className="curated-grid" id="curated" aria-labelledby="curated-title" data-reveal>
        <div className="curated-grid__head">
          <div>
            <p className="meta">Curated objects</p>
            <span className="hairline" aria-hidden="true" />
            <h2 id="curated-title">Across the archive</h2>
          </div>
          <Link className="link-cta" to="/discover">
            View all objects
          </Link>
        </div>
        <div className="object-grid">
          {curated.map((object, index) => (
            <ObjectCard
              key={object.id}
              object={object}
              wide={index === 0 || index === 3}
              onToggleCompare={toggleCompare}
              isCompared={compareIds.includes(object.id)}
            />
          ))}
        </div>
      </section>

      <EditorialStory story={editorialStory} />
      <BrandIndex brands={brands} />
      <JournalPreview articles={journalArticles} />

      <div
        className={`compare-tray ${compareIds.length ? 'is-visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        <span>
          Compare tray · {compareIds.length}/{MAX_COMPARE} objects selected
        </span>
        <button type="button" className="btn" style={{ color: 'var(--paper)', borderColor: 'rgba(241,238,231,0.4)' }} onClick={clearCompare}>
          Clear
        </button>
      </div>
    </AppShell>
  );
}
