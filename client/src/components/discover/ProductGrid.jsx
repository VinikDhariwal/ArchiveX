import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products }) {
  if (!products?.length) return null;

  return (
    <div className="object-grid object-grid--discover product-grid">
      {products.map((object, index) => (
        <ProductCard
          key={object.id || object.slug}
          object={object}
          featured={Boolean(object.featured) && index < 2}
        />
      ))}
    </div>
  );
}
