import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hero } from '../../data/demoData.js';
import { useGetProductsQuery, useGetRecommendedProductsQuery } from '../../app/api.js';
import { getPrimaryImage } from '../../utils/archiveObject.js';

const HOLD_MS = 4200;
const CROSSFADE_MS = 780;
const SWIPE_THRESHOLD = 56;
const CLICK_TOLERANCE = 10;

function toPlate(product) {
  const image = getPrimaryImage(product);
  if (!product?.slug || !image?.url) return null;
  return {
    slug: product.slug,
    name: product.name,
    brand: typeof product.brand === 'string' ? product.brand : product.brand?.name || '',
    year: product.year || product.releaseYear || '',
    rarity: product.rarity || '',
    image: {
      url: image.url,
      alt: image.alt || product.name,
      width: image.width || 1600,
      height: image.height || 1200,
      objectPosition: 'center',
    },
  };
}

export default function ArchiveHero() {
  const navigate = useNavigate();
  const { data: featured } = useGetProductsQuery({ featured: 'true', limit: 10 });
  const { data: recommended = [] } = useGetRecommendedProductsQuery({ limit: 10 });

  const plates = useMemo(() => {
    const seen = new Set();
    const fromApi = [];
    for (const product of [...(featured?.items || []), ...recommended]) {
      const plate = toPlate(product);
      if (!plate || seen.has(plate.slug)) continue;
      seen.add(plate.slug);
      fromApi.push(plate);
      if (fromApi.length >= 5) break;
    }
    if (fromApi.length >= 3) return fromApi;
    return hero.plates?.length ? hero.plates : [];
  }, [featured, recommended]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [resumeToken, setResumeToken] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    active: false,
    startX: 0,
    dx: 0,
    pointerId: null,
  });
  const suppressClickRef = useRef(false);

  const active = plates[activeIndex] || plates[0];
  const prevIndex = plates.length ? (activeIndex - 1 + plates.length) % plates.length : 0;
  const nextIndex = plates.length ? (activeIndex + 1) % plates.length : 0;

  useEffect(() => {
    setActiveIndex(0);
  }, [plates]);

  useEffect(() => {
    plates.forEach((plate) => {
      const preload = new Image();
      preload.src = plate.image.url;
    });
  }, [plates]);

  useEffect(() => {
    if (plates.length < 2 || isDragging) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    let timeoutId;
    const advance = () => {
      timeoutId = window.setTimeout(() => {
        setActiveIndex((index) => (index + 1) % plates.length);
        advance();
      }, HOLD_MS);
    };

    advance();
    return () => window.clearTimeout(timeoutId);
  }, [plates.length, resumeToken, isDragging]);

  const goTo = (index) => {
    setActiveIndex(index);
    setResumeToken((token) => token + 1);
  };

  const showPrevious = (event) => {
    event.preventDefault();
    event.stopPropagation();
    goTo(prevIndex);
  };

  const showNext = (event) => {
    event.preventDefault();
    event.stopPropagation();
    goTo(nextIndex);
  };

  const onPointerDown = (event) => {
    if (plates.length < 2) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    dragRef.current = {
      active: true,
      startX: event.clientX,
      dx: 0,
      pointerId: event.pointerId,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    setDragX(0);
  };

  const onPointerMove = (event) => {
    if (!dragRef.current.active) return;
    const dx = event.clientX - dragRef.current.startX;
    dragRef.current.dx = dx;
    setDragX(dx);
  };

  const finishDrag = () => {
    if (!dragRef.current.active) return;

    const dx = dragRef.current.dx;
    dragRef.current.active = false;
    setIsDragging(false);
    setDragX(0);

    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      suppressClickRef.current = true;
      if (dx < 0) goTo(nextIndex);
      else goTo(prevIndex);
      return;
    }

    if (Math.abs(dx) > CLICK_TOLERANCE) {
      suppressClickRef.current = true;
    }
  };

  const onPointerUp = () => {
    finishDrag();
  };

  const onPointerCancel = () => {
    dragRef.current.active = false;
    setIsDragging(false);
    setDragX(0);
  };

  const onPlateClick = (event) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      suppressClickRef.current = false;
      return;
    }
    navigate(`/products/${active.slug}`);
  };

  const onPlateKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(`/products/${active.slug}`);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(prevIndex);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(nextIndex);
    }
  };

  if (!active) return null;

  const dragStyle = isDragging
    ? {
        transform: `translateX(${dragX * 0.42}px)`,
        transition: 'none',
      }
    : undefined;

  return (
    <section
      className="archive-hero"
      id="top"
      aria-labelledby="hero-headline"
      style={{
        '--hero-gallery-image': `url(${hero.galleryBackground.url})`,
        '--hero-crossfade': `${CROSSFADE_MS}ms`,
      }}
    >
      <div className="archive-hero__gallery-bg" aria-hidden="true" />

      <div className="archive-hero__main">
        <div className="archive-hero__copy">
          <p className="archive-hero__kicker">{hero.kicker}</p>
          <p className="archive-hero__brand-mark">{hero.brand}</p>
          <h1 id="hero-headline" className="archive-hero__headline">
            {hero.headlineLine1}
            <br />
            <em>{hero.headlineLine2}</em>
          </h1>
          <p className="archive-hero__lede">{hero.lede}</p>
          <div className="archive-hero__actions">
            <a className="btn btn--soft" href={hero.primaryCta.href}>
              {hero.primaryCta.label}
            </a>
            <Link className="btn btn--soft" to={hero.secondaryCta.href}>
              {hero.secondaryCta.label}
            </Link>
            <Link className="btn btn--soft" to={hero.tertiaryCta.href}>
              {hero.tertiaryCta.label}
            </Link>
          </div>
        </div>

        <div className="archive-hero__stage">
          {plates.length > 1 ? (
            <div className="archive-hero__orbit" aria-hidden="true">
              {plates.map((plate, index) => (
                <img
                  key={`orbit-prev-${plate.slug}`}
                  className={`archive-hero__orbit-plate is-prev ${
                    index === prevIndex ? 'is-visible' : ''
                  }`}
                  src={plate.image.url}
                  alt=""
                  draggable={false}
                />
              ))}
              {plates.map((plate, index) => (
                <img
                  key={`orbit-next-${plate.slug}`}
                  className={`archive-hero__orbit-plate is-next ${
                    index === nextIndex ? 'is-visible' : ''
                  }`}
                  src={plate.image.url}
                  alt=""
                  draggable={false}
                />
              ))}
            </div>
          ) : null}

          <div className="archive-hero__feature-block">
            <div className="archive-hero__feature">
              <div
                className={`archive-hero__plate-wrap ${isDragging ? 'is-dragging' : ''}`}
                style={dragStyle}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                onClick={onPlateClick}
                onKeyDown={onPlateKeyDown}
                role="button"
                tabIndex={0}
                aria-label={`View featured object ${active.name}. Drag sideways to browse.`}
              >
                {plates.map((plate, index) => (
                  <img
                    key={plate.slug}
                    className={`archive-hero__plate ${index === activeIndex ? 'is-active' : ''}`}
                    src={plate.image.url}
                    alt={plate.image.alt}
                    width={plate.image.width}
                    height={plate.image.height}
                    style={{ objectPosition: plate.image.objectPosition || 'center' }}
                    fetchPriority={index === 0 ? 'high' : 'low'}
                    draggable={false}
                  />
                ))}
              </div>

              <Link
                to={`/products/${active.slug}`}
                className="archive-hero__feature-meta-link"
                aria-label={`Open ${active.name}`}
              >
                <div className="archive-hero__feature-meta">
                  {plates.map((plate, index) => (
                    <div
                      key={`meta-${plate.slug}`}
                      className={`archive-hero__meta-slide ${
                        index === activeIndex ? 'is-active' : ''
                      }`}
                    >
                      <p className="meta">
                        {[plate.brand, plate.year, plate.rarity].filter(Boolean).join(' · ')}
                      </p>
                      <p className="archive-hero__feature-name">{plate.name}</p>
                    </div>
                  ))}
                </div>
              </Link>
            </div>

            {plates.length > 1 ? (
              <div className="archive-hero__controls">
                <span className="archive-hero__plate-dashes" aria-hidden="true">
                  {plates.map((plate, index) => (
                    <i
                      key={`dash-${plate.slug}`}
                      className={index === activeIndex ? 'is-active' : ''}
                    />
                  ))}
                </span>
                <div className="archive-hero__nav" role="group" aria-label="Featured object gallery">
                  <button
                    type="button"
                    className="archive-hero__nav-btn"
                    onClick={showPrevious}
                    aria-label="Previous featured object"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="archive-hero__nav-btn"
                    onClick={showNext}
                    aria-label="Next featured object"
                  >
                    →
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="archive-hero__scroll-cue" aria-hidden="true">
        <span>Begin the story</span>
      </div>
    </section>
  );
}
