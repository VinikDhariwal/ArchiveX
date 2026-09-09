export default function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="product-grid-skeleton object-grid object-grid--discover" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="product-grid-skeleton__card">
          <div className="product-grid-skeleton__media" />
          <div className="product-grid-skeleton__line" />
          <div className="product-grid-skeleton__line product-grid-skeleton__line--short" />
        </div>
      ))}
    </div>
  );
}
