export function Skeleton({ className = '', style, shimmer = true }) {
  return (
    <span
      className={`skeleton ${shimmer ? 'skeleton--shimmer' : ''} ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`skeleton-text ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={`skeleton-text__line ${index === lines - 1 ? 'is-short' : ''}`}
        />
      ))}
    </div>
  );
}

export function SkeletonMedia({ className = '', ratio = '5 / 4' }) {
  return (
    <Skeleton
      className={`skeleton-media ${className}`.trim()}
      style={{ aspectRatio: ratio }}
    />
  );
}

export default Skeleton;
