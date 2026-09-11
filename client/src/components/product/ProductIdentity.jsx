import { formatProductType } from '../../utils/formatProductType.js';

export default function ProductIdentity({ product }) {
  if (!product) return null;

  return (
    <header className="product-identity">
      <p className="meta product-identity__brand">{product.brand}</p>
      <h1 className="display product-detail__title">{product.name}</h1>
      {product.reference ? <p className="product-identity__reference">{product.reference}</p> : null}
      <p className="product-detail__lede">{product.shortDescription}</p>
      <div className="featured-object__meta-row product-identity__meta">
        <span>{formatProductType(product.productType)}</span>
        {product.year ? <span>{product.year}</span> : null}
        <span className="rarity">{product.rarity}</span>
        {product.availability ? <span>{product.availability}</span> : null}
        {product.marketSignals?.marketRange ? <span>{product.marketSignals.marketRange}</span> : null}
      </div>
    </header>
  );
}
