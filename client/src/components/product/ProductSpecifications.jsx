import { formatSpecLabel } from '../../utils/productDetail.js';

export default function ProductSpecifications({ product }) {
  const fields = product?.specifications?.fields || {};
  const entries = Object.entries(fields).filter(([, value]) => Boolean(value));

  if (!entries.length && !product?.materials?.length && !product?.colors?.length) {
    return null;
  }

  return (
    <section className="product-section" aria-labelledby="product-specs-title">
      <h2 id="product-specs-title" className="product-section__title">
        Specifications
      </h2>
      <dl className="product-specs">
        {entries.map(([key, value]) => (
          <div className="product-specs__row" key={key}>
            <dt>{formatSpecLabel(key)}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        {product.materials?.length ? (
          <div className="product-specs__row">
            <dt>Materials</dt>
            <dd>{product.materials.join(', ')}</dd>
          </div>
        ) : null}
        {product.colors?.length ? (
          <div className="product-specs__row">
            <dt>Colors</dt>
            <dd>{product.colors.join(', ')}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
