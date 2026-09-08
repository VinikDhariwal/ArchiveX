import { Skeleton, SkeletonText } from './Skeleton.jsx';

/** Inline loading placeholder — skeleton only, no loading copy. */
export default function LoadingState() {
  return (
    <div className="feedback-state feedback-state--skeleton" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading</span>
      <Skeleton className="skeleton--meta" />
      <SkeletonText lines={2} />
    </div>
  );
}
