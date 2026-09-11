import { useCallback, useEffect, useId, useRef, useState } from 'react';
import MuseumFrame from './MuseumFrame.jsx';

export default function ProductGallery({ images = [], productName }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [broken, setBroken] = useState({});
  const closeRef = useRef(null);
  const labelId = useId();
  const active = images[activeIndex] || null;
  const isBroken = Boolean(active && broken[active.url]);

  useEffect(() => {
    setActiveIndex(0);
    setLightboxOpen(false);
  }, [images]);

  const goTo = (nextIndex) => {
    if (!images.length || nextIndex === activeIndex) return;
    setIsFading(true);
    window.setTimeout(() => {
      setActiveIndex(nextIndex);
      setIsFading(false);
    }, 120);
  };

  const step = useCallback(
    (delta) => {
      if (!images.length) return;
      setIsFading(true);
      window.setTimeout(() => {
        setActiveIndex((index) => (index + delta + images.length) % images.length);
        setIsFading(false);
      }, 120);
    },
    [images.length]
  );

  useEffect(() => {
    const onKey = (event) => {
      if (!images.length) return;
      // Never hijack arrow keys while the user is typing or moving a caret.
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (lightboxOpen && event.key === 'Escape') {
        setLightboxOpen(false);
        return;
      }
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, lightboxOpen, step]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [lightboxOpen]);

  if (!active) {
    return <div className="feedback-state">No images available.</div>;
  }

  const imageNode = (
    <img
      className={`product-gallery__image ${isFading ? 'is-fading' : ''} ${isBroken ? 'is-broken' : ''}`}
      src={isBroken ? '' : active.url}
      alt={active.alt || `${productName} — image ${activeIndex + 1}`}
      width={active.width}
      height={active.height}
      fetchPriority={activeIndex === 0 ? 'high' : 'auto'}
      onError={() => setBroken((prev) => ({ ...prev, [active.url]: true }))}
    />
  );

  return (
    <div className="product-gallery">
      <MuseumFrame className="product-gallery__main">
        <button
          type="button"
          className="product-gallery__open"
          onClick={() => setLightboxOpen(true)}
          aria-label={`Open lightbox for ${productName}`}
        >
          {isBroken ? (
            <div className="product-gallery__fallback" role="img" aria-label="Image unavailable">
              Plate unavailable
            </div>
          ) : (
            imageNode
          )}
        </button>
      </MuseumFrame>

      {images.length > 1 ? (
        <div className="product-gallery__nav" role="group" aria-label="Gallery controls">
          <button type="button" className="btn btn--soft" onClick={() => step(-1)}>
            Previous
          </button>
          <button type="button" className="btn btn--soft" onClick={() => step(1)}>
            Next
          </button>
        </div>
      ) : null}

      {images.length > 1 ? (
        <div className="product-gallery__thumbs" role="list">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              role="listitem"
              className={`product-gallery__thumb ${index === activeIndex ? 'is-active' : ''}`}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === activeIndex}
              onClick={() => goTo(index)}
            >
              <img src={image.url} alt="" width={120} height={90} loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}

      <p className="demo-note product-gallery__meta">
        {active.type} · {activeIndex + 1} / {images.length} · arrow keys · click to enlarge
      </p>

      {lightboxOpen ? (
        <div className="product-lightbox" role="dialog" aria-modal="true" aria-labelledby={labelId}>
          <button
            type="button"
            className="product-lightbox__backdrop"
            aria-label="Close lightbox"
            onClick={() => setLightboxOpen(false)}
          />
          <div className="product-lightbox__panel">
            <div className="product-lightbox__toolbar">
              <p id={labelId} className="meta">
                {productName} · {activeIndex + 1} / {images.length}
              </p>
              <button
                ref={closeRef}
                type="button"
                className="btn btn--soft"
                onClick={() => setLightboxOpen(false)}
              >
                Close
              </button>
            </div>
            {isBroken ? (
              <div className="product-gallery__fallback">Plate unavailable</div>
            ) : (
              <img
                src={active.url}
                alt={active.alt || `${productName} — enlarged plate ${activeIndex + 1}`}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
