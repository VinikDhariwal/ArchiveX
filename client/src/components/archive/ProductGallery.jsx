import { useEffect, useState } from 'react';
import MuseumFrame from './MuseumFrame.jsx';

export default function ProductGallery({ images = [], productName }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const active = images[activeIndex] || null;

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  const goTo = (nextIndex) => {
    if (!images.length || nextIndex === activeIndex) return;
    setIsFading(true);
    window.setTimeout(() => {
      setActiveIndex(nextIndex);
      setIsFading(false);
    }, 120);
  };

  useEffect(() => {
    const onKey = (event) => {
      if (!images.length) return;
      if (event.key === 'ArrowRight') {
        setIsFading(true);
        window.setTimeout(() => {
          setActiveIndex((index) => (index + 1) % images.length);
          setIsFading(false);
        }, 120);
      }
      if (event.key === 'ArrowLeft') {
        setIsFading(true);
        window.setTimeout(() => {
          setActiveIndex((index) => (index - 1 + images.length) % images.length);
          setIsFading(false);
        }, 120);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length]);

  if (!active) {
    return <div className="feedback-state">No images available.</div>;
  }

  return (
    <div className="product-gallery">
      <MuseumFrame className="product-gallery__main">
        <img
          className={`product-gallery__image ${isFading ? 'is-fading' : ''}`}
          src={active.url}
          alt={active.alt || `${productName} — image ${activeIndex + 1}`}
          width={active.width}
          height={active.height}
          fetchPriority={activeIndex === 0 ? 'high' : 'auto'}
        />
      </MuseumFrame>

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
        {active.type} · {activeIndex + 1} / {images.length} · arrow keys to change plates
      </p>
    </div>
  );
}
