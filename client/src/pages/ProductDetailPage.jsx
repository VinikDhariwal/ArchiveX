import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ProductGallery from '../components/archive/ProductGallery.jsx';
import ProductIdentity from '../components/product/ProductIdentity.jsx';
import ProductActions from '../components/product/ProductActions.jsx';
import ProductSpecifications from '../components/product/ProductSpecifications.jsx';
import RarityProfile from '../components/product/RarityProfile.jsx';
import MarketSignals from '../components/product/MarketSignals.jsx';
import RelatedObjects from '../components/product/RelatedObjects.jsx';
import ProductJournal from '../components/product/ProductJournal.jsx';
import LoadingState from '../components/feedback/LoadingState.jsx';
import ErrorState from '../components/feedback/ErrorState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { formatProductType } from '../utils/formatProductType.js';
import {
  useGetProductBySlugQuery,
  useGetProductJournalQuery,
  useGetRelatedProductsQuery,
  useRecordProductViewMutation,
} from '../app/api.js';
import { getPublisher } from '../utils/archiveObject.js';
import { getSessionKey } from '../utils/productDetail.js';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { data: object, isLoading, isError, refetch } = useGetProductBySlugQuery(slug, {
    skip: !slug,
  });
  const productId = object?.id;
  const { data: related = [], isFetching: relatedLoading } = useGetRelatedProductsQuery(
    { id: productId, limit: 6 },
    { skip: !productId }
  );
  const { data: journal, isFetching: journalLoading } = useGetProductJournalQuery(productId, {
    skip: !productId,
  });
  const [recordView] = useRecordProductViewMutation();
  const publisher = object ? getPublisher(object) : 'ArchiveX';

  useDocumentTitle(object?.name || (isLoading ? 'Loading…' : 'Missing object'));

  useEffect(() => {
    if (!productId) return undefined;
    const timer = window.setTimeout(() => {
      recordView({
        id: productId,
        sessionKey: getSessionKey(),
        source: 'detail',
      }).catch(() => {
        /* non-blocking analytics */
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [productId, recordView]);

  if (isLoading) {
    return (
      <main className="route-shell">
        <div className="route-shell__inner">
          <LoadingState />
        </div>
      </main>
    );
  }

  if (isError || !object) {
    return (
      <main className="route-shell">
        <div className="route-shell__inner">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Discover', to: '/discover' },
              { label: 'Missing' },
            ]}
          />
          <header className="page-head">
            <p className="meta">Missing object</p>
            <h1 className="display page-head__title">This object is not in the public archive</h1>
          </header>
          {isError ? <ErrorState message="Could not load this object." onRetry={refetch} /> : null}
          <p className="route-shell__actions">
            <Link className="link-cta" to="/discover">
              Back to discover
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="product-detail">
      <div className="product-detail__inner section-inner">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Discover', to: '/discover' },
            { label: formatProductType(object.productType), to: `/discover?domain=${object.productType}` },
            { label: object.name },
          ]}
        />

        <div className="product-detail__grid">
          <div className="product-detail__media-col">
            <ProductGallery images={object.images} productName={object.name} />

            <section className="product-section" aria-labelledby="product-overview-title">
              <h2 id="product-overview-title" className="product-section__title">
                Overview
              </h2>
              <div className="product-section__stack">
                {(object.description || object.shortDescription || '')
                  .split(/\n{2,}/)
                  .map((paragraph) => paragraph.trim())
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={`overview-${index}`}>{paragraph}</p>
                  ))}
              </div>
            </section>

            {object.whyItMatters ? (
              <section className="product-section" aria-labelledby="product-why-title">
                <h2 id="product-why-title" className="product-section__title">
                  Why it matters
                </h2>
                <div className="product-section__stack">
                  {object.whyItMatters
                    .split(/\n{2,}/)
                    .map((paragraph) => paragraph.trim())
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p key={`why-${index}`}>{paragraph}</p>
                    ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className="product-detail__identity">
            <ProductIdentity product={object} />
            <p className="product-detail__publisher">
              <span className="meta">Publisher</span>
              <strong>{publisher}</strong>
            </p>
            <ProductActions product={object} />
            <MarketSignals product={object} />
          </div>
        </div>

        <ProductSpecifications product={object} />
        <RarityProfile product={object} />
        <RelatedObjects products={related} isLoading={relatedLoading} />
        <ProductJournal
          items={journal?.items || []}
          meta={journal?.meta || {}}
          isLoading={journalLoading}
        />
      </div>
    </main>
  );
}
