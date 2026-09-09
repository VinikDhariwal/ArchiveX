import ObjectCard from '../archive/ObjectCard.jsx';

/** Thin discover card wrapper — keeps ObjectCard as the visual surface. */
export default function ProductCard({ object, featured = false }) {
  return (
    <div className={`product-card-shell ${featured ? 'product-card-shell--featured' : ''}`}>
      <ObjectCard object={object} />
    </div>
  );
}
