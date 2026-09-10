import { formatSpecLabel } from './productDetail.js';

const SHARED_ROWS = [
  { key: 'brand', label: 'Brand', get: (p) => p.brand },
  { key: 'productType', label: 'Domain', get: (p) => p.productType },
  { key: 'year', label: 'Year', get: (p) => p.year },
  { key: 'reference', label: 'Reference', get: (p) => p.reference },
  { key: 'rarity', label: 'Rarity', get: (p) => p.rarity },
  { key: 'availability', label: 'Availability', get: (p) => p.availability },
];

const RARITY_ROWS = [
  {
    key: 'productionHistory',
    label: 'Production history',
    get: (p) => p.rarityProfile?.productionHistory,
  },
  {
    key: 'collectorInterest',
    label: 'Collector interest',
    get: (p) => p.rarityProfile?.collectorInterest || p.marketSignals?.collectorInterest,
  },
  {
    key: 'historicalSignificance',
    label: 'Historical significance',
    get: (p) => p.rarityProfile?.historicalSignificance,
  },
];

const MARKET_ROWS = [
  {
    key: 'archiveEstimate',
    label: 'Archive estimate',
    get: (p) => p.marketSignals?.archiveEstimate,
  },
  {
    key: 'marketRange',
    label: 'Market range',
    get: (p) => p.marketSignals?.marketRange,
  },
  {
    key: 'availabilitySignal',
    label: 'Availability signal',
    get: (p) => p.marketSignals?.availabilitySignal,
  },
];

function display(value) {
  if (value == null || value === '') return '—';
  return String(value);
}

function collectSpecKeys(products) {
  const keys = new Set();
  for (const product of products) {
    const fields = product?.specifications?.fields || {};
    Object.keys(fields).forEach((key) => {
      if (fields[key]) keys.add(key);
    });
  }
  return [...keys];
}

function rowHasValue(row, products) {
  return products.some((product) => {
    const value = row.get(product);
    return value != null && value !== '';
  });
}

/**
 * Build domain-aware compare sections for up to 4 products.
 * Mixed domains keep shared + rarity/market sections, then type-specific specs.
 */
export function buildCompareSections(products = []) {
  if (!products.length) return [];

  const types = [...new Set(products.map((p) => p.productType).filter(Boolean))];
  const sections = [
    {
      id: 'shared',
      title: 'Shared',
      rows: SHARED_ROWS.filter((row) => rowHasValue(row, products)).map((row) => ({
        key: row.key,
        label: row.label,
        values: products.map((p) => display(row.get(p))),
      })),
    },
  ];

  const rarityRows = RARITY_ROWS.filter((row) => rowHasValue(row, products)).map((row) => ({
    key: row.key,
    label: row.label,
    values: products.map((p) => display(row.get(p))),
  }));
  if (rarityRows.length) {
    sections.push({ id: 'rarity', title: 'Rarity profile', rows: rarityRows });
  }

  const marketRows = MARKET_ROWS.filter((row) => rowHasValue(row, products)).map((row) => ({
    key: row.key,
    label: row.label,
    values: products.map((p) => display(row.get(p))),
  }));
  if (marketRows.length) {
    sections.push({ id: 'market', title: 'Market signals', rows: marketRows });
  }

  const allSpecKeys = collectSpecKeys(products);

  if (types.length <= 1) {
    const rows = allSpecKeys.map((key) => ({
      key: `spec-${key}`,
      label: formatSpecLabel(key),
      values: products.map((p) => display(p.specifications?.fields?.[key])),
    }));
    if (rows.length) {
      sections.push({
        id: 'specs',
        title: types[0] ? `${types[0]} specifications` : 'Specifications',
        rows,
      });
    }
  } else {
    for (const type of types) {
      const typeProducts = products.filter((p) => p.productType === type);
      const keys = collectSpecKeys(typeProducts);
      const rows = keys.map((key) => ({
        key: `spec-${type}-${key}`,
        label: formatSpecLabel(key),
        values: products.map((p) =>
          p.productType === type ? display(p.specifications?.fields?.[key]) : '—'
        ),
      }));
      if (rows.length) {
        sections.push({
          id: `specs-${type}`,
          title: `${type} specifications`,
          rows,
        });
      }
    }
  }

  return sections.filter((section) => section.rows.length);
}
