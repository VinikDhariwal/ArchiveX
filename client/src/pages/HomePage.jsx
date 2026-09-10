import useDocumentTitle from '../hooks/useDocumentTitle.js';
import ArchiveHero from '../components/archive/ArchiveHero.jsx';
import ArchivePromise from '../components/archive/ArchivePromise.jsx';
import BrandMarquee from '../components/archive/BrandMarquee.jsx';
import DomainPaths from '../components/archive/DomainPaths.jsx';
import FeaturedObject from '../components/archive/FeaturedObject.jsx';
import EditorialStory from '../components/archive/EditorialStory.jsx';
import HomeClose from '../components/archive/HomeClose.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import { useGetBrandsQuery, useGetProductsQuery } from '../app/api.js';
import { archivePromise, domainPaths, editorialStory, homeClose } from '../data/demoData.js';

export default function HomePage() {
  useDocumentTitle('Home');

  const { data: brands = [], isLoading: brandsLoading } = useGetBrandsQuery();
  const { data: featuredCars, isLoading: carsLoading } = useGetProductsQuery({
    productType: 'car',
    featured: 'true',
    limit: 1,
  });
  const { data: featuredMotorcycles, isLoading: motoLoading } = useGetProductsQuery({
    productType: 'motorcycle',
    featured: 'true',
    limit: 1,
  });

  const featuredCar = featuredCars?.items?.[0] || null;
  const featuredMotorcycle = featuredMotorcycles?.items?.[0] || null;
  const loadingFeatured = carsLoading || motoLoading;

  return (
    <>
      <ArchiveHero />
      {brandsLoading ? null : <BrandMarquee brands={brands} />}
      <ArchivePromise promise={archivePromise} />
      <DomainPaths domains={domainPaths} />

      <section className="signatures" aria-labelledby="signatures-title" data-reveal>
        <div className="signatures__head">
          <p className="meta">The signatures</p>
          <span className="hairline" aria-hidden="true" />
          <h2 id="signatures-title" className="display">
            Objects with a story to tell.
          </h2>
          <p className="signatures__lede">
            A few of the tales collectors return for — automotive first, then two wheels.
          </p>
        </div>
      </section>

      {loadingFeatured ? <LoadingState /> : null}

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
        />
      ) : null}

      <EditorialStory story={editorialStory} />
      <HomeClose close={homeClose} />
    </>
  );
}
