import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getPrimaryImage } from '../../utils/archiveObject.js';
import { formatProductType } from '../../utils/formatProductType.js';

export default function ObjectDetailModal({ object, onClose }) {
  const primary = getPrimaryImage(object);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!object || !primary) return null;

  return createPortal(
    <div className="object-modal" role="presentation">
      <button type="button" className="object-modal__backdrop" aria-label="Close details" onClick={onClose} />
      <div
        className="object-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`object-modal-title-${object.id}`}
      >
        <button type="button" className="object-modal__close" onClick={onClose}>
          Close
        </button>

        <div className="object-modal__card" data-type={object.productType}>
          <div className="object-modal__media">
            <img
              src={primary.url}
              alt={primary.alt || object.name}
              style={{ objectPosition: primary.objectPosition || 'center' }}
            />
          </div>

          <div className="object-modal__body">
            <span className="object-card__badge">{formatProductType(object.productType)}</span>
            <p className="meta">
              {object.brand} · {object.year}
            </p>
            <h2 id={`object-modal-title-${object.id}`} className="display">
              {object.name}
            </h2>
            <p className="object-modal__lede">{object.shortDescription}</p>

            <div className="featured-object__meta-row object-modal__meta">
              {object.rarity ? <span className="rarity">{object.rarity}</span> : null}
              <span>{object.images?.length || 1} plates</span>
            </div>

            <div className="object-modal__actions">
              <button type="button" className="quiet-action" onClick={onClose}>
                Back to feed
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
