import { selectProductItems, selectProductMeta } from './productApi.js';

export { selectProductItems, selectProductMeta };

export function selectProductsByType(result, productType) {
  const items = selectProductItems(result);
  if (!productType || productType === 'all') return items;
  return items.filter((item) => item.productType === productType);
}

export function selectFeaturedProducts(result) {
  return selectProductItems(result).filter((item) => item.featured);
}
