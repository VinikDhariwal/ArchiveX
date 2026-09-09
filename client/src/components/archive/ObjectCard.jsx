import { useState } from 'react';
import { getPrimaryImage, getPublisher } from '../../utils/archiveObject.js';
import ObjectDetailModal from './ObjectDetailModal.jsx';

export default function ObjectCard({ object }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const primary = getPrimaryImage(object);
  const publisher = getPublisher(object);

  if (!primary) return null;

  return (
    <>
      <article className="object-card" data-type={object.productType}>
        <button
          type="button"
          className="object-card__surface object-card__surface--button"
          onClick={() => setDetailsOpen(true)}
          aria-label={`View details for ${object.name}`}
        >
          <div className="object-card__media" aria-hidden="true">
            <img
              src={primary.url}
              alt=""
              loading="lazy"
              style={{ objectPosition: primary.objectPosition || 'center' }}
            />
          </div>
          <div className="object-card__body">
            <span className="object-card__badge">{object.productType}</span>
            <p className="meta">
              {object.brand} · {object.year}
            </p>
            <h3>{object.name}</h3>
            <p>{object.shortDescription}</p>
          </div>
        </button>
        <div className="object-card__actions">
          <button type="button" className="btn btn--soft" onClick={() => setDetailsOpen(true)}>
            Details
          </button>
          <span className="object-card__publisher" title="Publisher">
            {publisher}
          </span>
        </div>
      </article>

      {detailsOpen ? (
        <ObjectDetailModal object={object} onClose={() => setDetailsOpen(false)} />
      ) : null}
    </>
  );
}
