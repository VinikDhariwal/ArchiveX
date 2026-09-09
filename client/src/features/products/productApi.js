/** Helpers / selectors for public product discovery queries. */

export const DISCOVER_SORT_OPTIONS = [
  { id: 'shuffle', label: 'Archive shuffle' },
  { id: 'popularity', label: 'Popularity' },
  { id: 'newest', label: 'Newest' },
  { id: 'rarity', label: 'Rarity' },
  { id: 'relevance', label: 'Relevance' },
  { id: 'name', label: 'Name' },
];

export const DOMAIN_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'car', label: 'Cars' },
  { id: 'motorcycle', label: 'Motorcycles' },
  { id: 'watch', label: 'Watches' },
];

const URL_KEYS = [
  'domain',
  'q',
  'brand',
  'category',
  'tag',
  'yearMin',
  'yearMax',
  'rarity',
  'material',
  'color',
  'availability',
  'bodyStyle',
  'engine',
  'power',
  'drivetrain',
  'transmission',
  'displacement',
  'productionPeriod',
  'movement',
  'caseMaterial',
  'caseSize',
  'dialColor',
  'waterResistance',
  'sort',
  'page',
  'seed',
];

export function parseDiscoverSearchParams(searchParams) {
  const next = {};
  for (const key of URL_KEYS) {
    const value = searchParams.get(key);
    if (value) next[key] = value;
  }

  if (!next.domain) next.domain = 'all';
  if (!next.sort) next.sort = next.q ? 'relevance' : 'shuffle';
  if (!next.page) next.page = '1';
  if (next.sort === 'shuffle' && !next.seed) next.seed = '1';

  return next;
}

export function discoverParamsToSearchParams(params) {
  const entries = {};
  for (const key of URL_KEYS) {
    const value = params[key];
    if (value === undefined || value === null || value === '') continue;
    if (key === 'domain' && value === 'all') continue;
    if (key === 'page' && String(value) === '1') continue;
    if (key === 'sort' && value === 'shuffle' && !params.q) {
      // Keep shuffle as default (omit unless seed/other filters need it)
    }
    entries[key] = String(value);
  }

  if (params.sort === 'shuffle') {
    entries.sort = 'shuffle';
    entries.seed = String(params.seed || '1');
  }

  return entries;
}

export function buildProductsQueryArgs(params) {
  const args = {
    page: Number(params.page) || 1,
    limit: 24,
    sort: params.sort || 'shuffle',
  };

  if (params.domain && params.domain !== 'all') {
    args.productType = params.domain;
  }

  for (const key of URL_KEYS) {
    if (['domain', 'page', 'sort', 'seed'].includes(key)) continue;
    if (params[key]) args[key] = params[key];
  }

  if (args.sort === 'shuffle') {
    args.shuffle = 'true';
    args.seed = String(params.seed || '1');
  }

  return args;
}

export function selectProductItems(result) {
  return result?.items || [];
}

export function selectProductMeta(result) {
  return result?.meta || { page: 1, limit: 24, total: 0, totalPages: 1 };
}

export function countActiveFilters(params) {
  const ignorable = new Set(['domain', 'sort', 'page', 'seed']);
  return Object.entries(params).filter(([key, value]) => {
    if (ignorable.has(key)) return false;
    return Boolean(value);
  }).length;
}
