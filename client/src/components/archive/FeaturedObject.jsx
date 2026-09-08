import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPrimaryImage, getPublisher } from '../../data/demoData.js';
import ObjectDetailModal from './ObjectDetailModal.jsx';

export default function FeaturedObject({ object, eyebrow, sectionId, flipped = false }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const primary = getPrimaryImage(object);
  const publisher = getPublisher(object);

  if (!primary) return null;

  return (
    <>
      <section
        id={sectionId}
        className={`featured-object ${flipped ? 'featured-object--flip' : ''}`}
        data-type={object.productType}
        aria-labelledby={`${sectionId}-title`}
        data-reveal
      >
        <div className="featured-object__media">
          <button
            type="button"
            className="featured-object__media-btn"
            onClick={() => setDetailsOpen(true)}
            aria-label={`View details for ${object.name}`}
          >
            <img
              src={primary.url}
              alt={primary.alt}
              width={primary.width}
              height={primary.height}
              loading="lazy"
            />
          </button>
        </div>
        <div className="featured-object__body">
          <p className="meta">{eyebrow}</p>
          <span className="hairline" aria-hidden="true" />
          <h2 id={`${sectionId}-title`}>
            <button type="button" className="featured-object__title-btn" onClick={() => setDetailsOpen(true)}>
              {object.name}
            </button>
          </h2>
          <p>{object.shortDescription}</p>
          <div className="featured-object__meta-row">
            <span>{object.brand}</span>
            <span>{object.productType}</span>
            <span>{object.year}</span>
            <span className="rarity">{object.rarity}</span>
            <span>Published by {publisher}</span>
          </div>
          <div className="featured-object__actions">
            <button type="button" className="link-cta" onClick={() => setDetailsOpen(true)}>
              Details
            </button>
            <Link className="link-cta link-cta--muted" to={`/products/${object.slug}`}>
              Open full plate →
            </Link>
          </div>
        </div>
      </section>

      {detailsOpen ? (
        <ObjectDetailModal object={object} onClose={() => setDetailsOpen(false)} />
      ) : null}
    </>
  );
}
