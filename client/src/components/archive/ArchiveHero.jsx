import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hero as demoHero } from '../../data/demoData.js';
import { formatProductType } from '../../utils/formatProductType.js';

const HOLD_MS = 5200;
const CROSSFADE_MS = 900;
const SWIPE_THRESHOLD = 56;
const CLICK_TOLERANCE = 10;

function objectMetaLine(plate, index) {
  const objectNo = String(index + 1).padStart(3, '0');
  const domain = formatProductType(plate.productType, { singular: true }).toUpperCase() || 'OBJECT';
  return [
    `OBJECT ${objectNo}`,
    plate.brand ? String(plate.brand).toUpperCase() : null,
    plate.year || null,
    domain,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Full-bleed museum-plate opening for Home. */
export default function ArchiveHero({ hero: heroProp }) {
  const navigate = useNavigate();
  const hero = heroProp || demoHero;
  const plates = useMemo(() => {
    const fromConfig = (hero.plates || []).filter((plate) => plate?.image?.url);
    if (fromConfig.length) return fromConfig;
    return (demoHero.plates || []).filter((plate) => plate?.image?.url);
  }, [hero]);

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

  const onPlaneClick = (event) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      suppressClickRef.current = false;
      return;
    }
    if (!active?.slug) return;
    navigate(`/products/${active.slug}`);
  };

  const onPlaneKeyDown = (event) => {
    if (!active?.slug) return;
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
        transform: `translateX(${dragX * 0.18}px) scale(1.02)`,
        transition: 'none',
      }
    : undefined;

  const primaryCta = hero.primaryCta || demoHero.primaryCta;

  return (
    <section
      className="archive-hero archive-hero--plate"
      id="top"
      aria-labelledby="hero-headline"
      style={{ '--hero-crossfade': `${CROSSFADE_MS}ms` }}
    >
      <div
        className={`archive-hero__plane ${isDragging ? 'is-dragging' : ''}`}
        style={dragStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={onPlaneClick}
        onKeyDown={onPlaneKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`View featured object ${active.name}. Drag sideways to browse.`}
      >
        {plates.map((plate, index) => (
          <img
            key={plate.slug || plate.name || index}
            className={`archive-hero__plane-image ${index === activeIndex ? 'is-active' : ''}`}
            src={plate.image.url}
            alt=""
            width={plate.image.width}
            height={plate.image.height}
            style={{ objectPosition: plate.image.objectPosition || 'center' }}
            fetchPriority={index === 0 ? 'high' : 'low'}
            draggable={false}
          />
        ))}
      </div>

      <div className="archive-hero__veil" aria-hidden="true" />

      <div className="archive-hero__content">
        <p className="archive-hero__brand-mark">{hero.brand || demoHero.brand}</p>

        <div className="archive-hero__object-stack" aria-live="polite">
          {plates.map((plate, index) => (
            <p
              key={`meta-${plate.slug || plate.name || index}`}
              className={`archive-hero__object-line ${index === activeIndex ? 'is-active' : ''}`}
            >
              {objectMetaLine(plate, index)}
            </p>
          ))}
        </div>

        <h1 id="hero-headline" className="archive-hero__headline">
          {hero.headlineLine1 || demoHero.headlineLine1}
          <br />
          <em>{hero.headlineLine2 || demoHero.headlineLine2}</em>
        </h1>

        <p className="archive-hero__lede">{hero.lede || demoHero.lede}</p>

        <div className="archive-hero__actions">
          <Link className="btn" to={primaryCta.href}>
            {primaryCta.label}
          </Link>
          <Link
            className="quiet-action archive-hero__object-link"
            to={`/products/${active.slug}`}
          >
            Open plate
          </Link>
        </div>

        {plates.length > 1 ? (
          <div className="archive-hero__controls">
            <span className="archive-hero__plate-dashes" aria-hidden="true">
              {plates.map((plate, index) => (
                <i
                  key={`dash-${plate.slug || plate.name || index}`}
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
    </section>
  );
}
