import useDocumentTitle from '../hooks/useDocumentTitle.js';
import ArchiveHero from '../components/archive/ArchiveHero.jsx';
import ArchivePromise from '../components/archive/ArchivePromise.jsx';
import BrandMarquee from '../components/archive/BrandMarquee.jsx';
import DomainPaths from '../components/archive/DomainPaths.jsx';
import FeaturedObject from '../components/archive/FeaturedObject.jsx';
import EditorialStory from '../components/archive/EditorialStory.jsx';
import HomeClose from '../components/archive/HomeClose.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import {
  useGetArticlesQuery,
  useGetBrandsQuery,
  useGetProductsQuery,
} from '../app/api.js';
import { archivePromise, domainPaths, editorialStory, homeClose } from '../data/demoData.js';
import { getPrimaryImage } from '../utils/archiveObject.js';

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
  const { data: featuredWatches } = useGetProductsQuery({
    productType: 'watch',
    featured: 'true',
    limit: 1,
  });
  const { data: articles } = useGetArticlesQuery({ limit: 1 });

  const featuredCar = featuredCars?.items?.[0] || null;
  const featuredMotorcycle = featuredMotorcycles?.items?.[0] || null;
  const featuredWatch = featuredWatches?.items?.[0] || null;
  const loadingFeatured = carsLoading || motoLoading;

  const liveDomains = domainPaths.map((domain) => {
    const source =
      domain.id === 'car'
        ? featuredCar
        : domain.id === 'motorcycle'
          ? featuredMotorcycle
          : featuredWatch;
    const image = getPrimaryImage(source);
    if (!image?.url) return domain;
    return {
      ...domain,
      image: {
        ...domain.image,
        url: image.url,
        alt: image.alt || domain.image.alt,
        width: image.width || domain.image.width,
        height: image.height || domain.image.height,
      },
    };
  });

  const journalItem = articles?.items?.[0];
  const liveEditorial = journalItem
    ? {
        type: journalItem.articleType || editorialStory.type,
        title: journalItem.title,
        excerpt: journalItem.excerpt || editorialStory.excerpt,
        href: `/journal/${journalItem.slug}`,
        cta: 'Continue reading',
        image: journalItem.image?.url
          ? {
              url: journalItem.image.url,
              alt: journalItem.image.alt || journalItem.title,
              width: journalItem.image.width || 1400,
              height: journalItem.image.height || 1750,
            }
          : editorialStory.image,
      }
    : editorialStory;

  return (
    <>
      <ArchiveHero />
      {brandsLoading ? null : <BrandMarquee brands={brands} />}
      <ArchivePromise promise={archivePromise} />
      <DomainPaths domains={liveDomains} />

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

      <EditorialStory story={liveEditorial} />
      <HomeClose close={homeClose} />
    </>
  );
}
