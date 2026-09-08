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

export default function HomePage() {
  useSectionReveal();
  useDocumentTitle('Home');

  const featuredCar = getObjectById(featuredCarId);
  const featuredMotorcycle = getObjectById(featuredMotorcycleId);

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
        />
      ) : null}

      {featuredMotorcycle ? (
        <FeaturedObject
          object={featuredMotorcycle}
          eyebrow="Signature · Motorcycle"
          sectionId="featured-motorcycle"
          flipped
        />
      ) : null}

      <EditorialStory story={editorialStory} />
      <HomeClose close={homeClose} />
    </>
  );
}
