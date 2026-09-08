import { useLocation } from 'react-router-dom';
import { Skeleton, SkeletonMedia, SkeletonText } from './Skeleton.jsx';

function HomeSkeleton() {
  return (
    <div className="page-skeleton page-skeleton--home">
      <section className="page-skeleton__hero">
        <div className="page-skeleton__hero-copy">
          <Skeleton className="skeleton--meta" />
          <Skeleton className="skeleton--brand" />
          <Skeleton className="skeleton--display" />
          <Skeleton className="skeleton--display is-second" />
          <SkeletonText lines={3} className="page-skeleton__lede" />
          <div className="page-skeleton__actions">
            <Skeleton className="skeleton--cta" />
            <Skeleton className="skeleton--cta" />
          </div>
        </div>
        <div className="page-skeleton__hero-stage">
          <SkeletonMedia className="page-skeleton__plate" ratio="5 / 4" />
          <Skeleton className="skeleton--title" />
          <Skeleton className="skeleton--meta" />
        </div>
      </section>

      <div className="page-skeleton__marquee">
        <Skeleton className="skeleton--rail" />
      </div>

      <section className="page-skeleton__section">
        <Skeleton className="skeleton--meta" />
        <Skeleton className="skeleton--heading" />
        <SkeletonText lines={2} />
      </section>

      <section className="page-skeleton__cards">
        <SkeletonMedia ratio="4 / 5" />
        <SkeletonMedia ratio="4 / 5" />
        <SkeletonMedia ratio="4 / 5" />
      </section>
    </div>
  );
}

function DiscoverSkeleton() {
  return (
    <div className="page-skeleton page-skeleton--discover section-pad">
      <div className="section-inner">
        <Skeleton className="skeleton--meta" />
        <Skeleton className="skeleton--heading" />
        <SkeletonText lines={1} className="page-skeleton__lede" />
        <div className="page-skeleton__filters">
          <Skeleton className="skeleton--chip" />
          <Skeleton className="skeleton--chip" />
          <Skeleton className="skeleton--chip" />
          <Skeleton className="skeleton--chip" />
        </div>
        <div className="page-skeleton__grid">
          <SkeletonMedia ratio="5 / 4" />
          <SkeletonMedia ratio="4 / 5" />
          <SkeletonMedia ratio="4 / 5" />
          <SkeletonMedia ratio="4 / 5" />
          <SkeletonMedia ratio="4 / 5" />
          <SkeletonMedia ratio="4 / 5" />
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="page-skeleton page-skeleton--product section-pad">
      <div className="section-inner page-skeleton__product-grid">
        <SkeletonMedia className="page-skeleton__gallery" ratio="5 / 4" />
        <div className="page-skeleton__identity">
          <Skeleton className="skeleton--meta" />
          <Skeleton className="skeleton--heading" />
          <SkeletonText lines={3} />
          <div className="page-skeleton__actions">
            <Skeleton className="skeleton--cta" />
            <Skeleton className="skeleton--cta" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="page-skeleton page-skeleton--shell section-pad">
      <div className="section-inner">
        <Skeleton className="skeleton--meta" />
        <Skeleton className="skeleton--heading" />
        <SkeletonText lines={3} className="page-skeleton__lede" />
        <div className="page-skeleton__cards page-skeleton__cards--duo">
          <SkeletonMedia ratio="16 / 10" />
          <SkeletonMedia ratio="16 / 10" />
        </div>
      </div>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="page-skeleton page-skeleton--admin">
      <Skeleton className="skeleton--meta" />
      <Skeleton className="skeleton--heading" />
      <SkeletonText lines={2} />
      <div className="page-skeleton__admin-rows">
        <Skeleton className="skeleton--row" />
        <Skeleton className="skeleton--row" />
        <Skeleton className="skeleton--row" />
        <Skeleton className="skeleton--row" />
      </div>
    </div>
  );
}

export default function PageSkeleton({ variant }) {
  const location = useLocation();
  const path = location.pathname;

  const resolved =
    variant ||
    (path.startsWith('/admin')
      ? 'admin'
      : path.startsWith('/discover')
        ? 'discover'
        : path.startsWith('/products/')
          ? 'product'
          : path === '/' || path === '/home'
            ? 'home'
            : 'shell');

  return (
    <div className="page-skeleton-root" aria-busy="true" aria-live="polite" role="status">
      <span className="sr-only">Loading</span>
      {resolved === 'home' ? <HomeSkeleton /> : null}
      {resolved === 'discover' ? <DiscoverSkeleton /> : null}
      {resolved === 'product' ? <ProductSkeleton /> : null}
      {resolved === 'admin' ? <AdminSkeleton /> : null}
      {resolved === 'shell' ? <ShellSkeleton /> : null}
    </div>
  );
}
