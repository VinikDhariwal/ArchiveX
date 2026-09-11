import mongoose from 'mongoose';
import { Article, HomePageConfig, Product } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { recordAudit } from './auditService.js';
import { serializeArticleCard } from './articleService.js';
import { serializeProduct } from './productService.js';
import { buildHomeDefaults } from './homeDefaults.js';

const PUBLIC_PRODUCT = { status: 'approved', deletedAt: null };
const PUBLIC_ARTICLE = { status: 'approved', deletedAt: null };

const SECTION_KEYS = [
  'hero',
  'brands',
  'promise',
  'domains',
  'signatures',
  'featured',
  'editorial',
  'close',
];

function isObjectId(value) {
  return Boolean(value) && mongoose.Types.ObjectId.isValid(String(value));
}

function primaryImage(product) {
  const images = product?.images || [];
  const hero = images.find((image) => image.type === 'hero') || images[0];
  if (!hero?.url) return null;
  return {
    url: hero.url,
    alt: hero.alt || product.name || '',
    width: hero.width || 1600,
    height: hero.height || 1200,
    objectPosition: 'center',
  };
}

function productToPlate(product) {
  if (!product?.slug) return null;
  const image = primaryImage(product);
  if (!image?.url) return null;
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    year: product.year,
    productType: product.productType,
    rarity: product.rarity,
    image,
  };
}

function domainRank(productType) {
  if (productType === 'car') return 0;
  if (productType === 'motorcycle') return 1;
  return 2;
}

export function serializeAdminHome(doc) {
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: String(plain._id),
    key: plain.key,
    hero: plain.hero,
    brands: plain.brands,
    promise: plain.promise,
    domains: plain.domains,
    signatures: plain.signatures,
    featured: plain.featured,
    editorial: plain.editorial,
    close: plain.close,
    updatedAt: plain.updatedAt ? new Date(plain.updatedAt).toISOString() : null,
  };
}

export async function getOrCreateHomeConfig() {
  let doc = await HomePageConfig.findOne({ key: 'home' });
  if (!doc) {
    doc = await HomePageConfig.create(buildHomeDefaults());
  }
  return doc;
}

export async function getAdminHome() {
  const doc = await getOrCreateHomeConfig();
  return serializeAdminHome(doc);
}

function pickSectionPatch(incoming, defaults) {
  if (!incoming || typeof incoming !== 'object') return defaults;
  return { ...defaults, ...incoming };
}

export async function updateAdminHome(actorId, body = {}) {
  const doc = await getOrCreateHomeConfig();
  const defaults = buildHomeDefaults();

  for (const key of SECTION_KEYS) {
    if (body[key] === undefined) continue;
    const next = pickSectionPatch(body[key], doc[key]?.toObject?.() || defaults[key]);

    if (key === 'hero' && Array.isArray(next.plateProductIds)) {
      next.plateProductIds = next.plateProductIds
        .map(String)
        .filter(Boolean)
        .slice(0, 5);
    }

    if (key === 'featured' && Array.isArray(next.slots)) {
      next.slots = next.slots.slice(0, 4).map((slot) => ({
        productId: slot.productId ? String(slot.productId) : '',
        productType: slot.productType || '',
        eyebrow: slot.eyebrow || '',
        flipped: Boolean(slot.flipped),
      }));
    }

    if (key === 'domains' && Array.isArray(next.chambers)) {
      next.chambers = next.chambers.map((chamber) => ({
        id: chamber.id,
        label: chamber.label || '',
        title: chamber.title || '',
        summary: chamber.summary || '',
        href: chamber.href || '/discover',
        imageProductId: chamber.imageProductId ? String(chamber.imageProductId) : '',
        image: chamber.image || {},
      }));
    }

    if (key === 'close' && Array.isArray(next.paths)) {
      next.paths = next.paths.slice(0, 4);
    }

    doc.set(key, next);
  }

  await doc.save();

  await recordAudit({
    actorId,
    action: 'home.update',
    entityType: 'HomePageConfig',
    entityId: String(doc._id),
    summary: 'Updated home page configuration',
  });

  return serializeAdminHome(doc);
}

async function loadProductsByIds(ids) {
  const valid = [...new Set(ids.map(String).filter(isObjectId))];
  if (!valid.length) return new Map();
  const docs = await Product.find({
    ...PUBLIC_PRODUCT,
    _id: { $in: valid },
  }).populate('brand', 'name slug');
  const map = new Map();
  for (const doc of docs) {
    map.set(String(doc._id), serializeProduct(doc));
  }
  return map;
}

async function loadFeaturedByType(productType) {
  const doc = await Product.findOne({
    ...PUBLIC_PRODUCT,
    productType,
    featured: true,
  })
    .sort({ updatedAt: -1 })
    .populate('brand', 'name slug');
  return serializeProduct(doc);
}

async function loadHeroPool() {
  const docs = await Product.find({
    ...PUBLIC_PRODUCT,
    $or: [{ featured: true }, { rarity: { $in: ['ICONIC', 'LEGENDARY', 'RARE'] } }],
  })
    .sort({ featured: -1, updatedAt: -1 })
    .limit(24)
    .populate('brand', 'name slug');
  return docs.map(serializeProduct).filter(Boolean);
}

async function resolveHero(hero) {
  const enabled = hero?.enabled !== false;
  const copy = {
    enabled,
    brand: hero?.brand || 'ArchiveX',
    headlineLine1: hero?.headlineLine1 || '',
    headlineLine2: hero?.headlineLine2 || '',
    lede: hero?.lede || '',
    primaryCta: {
      label: hero?.primaryCta?.label || 'Explore the archive',
      href: hero?.primaryCta?.href || '/discover',
    },
  };

  if (!enabled) return { ...copy, plates: [] };

  const ids = (hero?.plateProductIds || []).map(String).filter(Boolean);
  let plates = [];

  if (ids.length) {
    const map = await loadProductsByIds(ids);
    plates = ids.map((id) => productToPlate(map.get(id))).filter(Boolean);
  }

  if (plates.length < 2) {
    const pool = await loadHeroPool();
    const seen = new Set(plates.map((plate) => plate.slug));
    const sorted = [...pool].sort(
      (a, b) => domainRank(a.productType) - domainRank(b.productType)
    );
    for (const product of sorted) {
      if (product.productType === 'watch' && plates.length >= 3) continue;
      const plate = productToPlate(product);
      if (!plate || seen.has(plate.slug)) continue;
      seen.add(plate.slug);
      plates.push(plate);
      if (plates.length >= 5) break;
    }
  }

  if (!plates.length) {
    plates = (hero?.fallbackPlates || []).filter((plate) => plate?.image?.url).slice(0, 5);
  } else if (plates.length < 2) {
    const seen = new Set(plates.map((plate) => plate.slug));
    for (const plate of hero?.fallbackPlates || []) {
      if (!plate?.image?.url || seen.has(plate.slug)) continue;
      seen.add(plate.slug);
      plates.push(plate);
      if (plates.length >= 5) break;
    }
  }

  return { ...copy, plates: plates.slice(0, 5) };
}

async function resolveDomains(domains) {
  const enabled = domains?.enabled !== false;
  const chambersIn = domains?.chambers?.length
    ? domains.chambers
    : buildHomeDefaults().domains.chambers;

  const productIds = chambersIn
    .map((chamber) => chamber.imageProductId)
    .filter(Boolean);
  const map = await loadProductsByIds(productIds);

  const chambers = [];
  for (const chamber of chambersIn) {
    let image = chamber.image?.url ? { ...chamber.image } : null;
    if (chamber.imageProductId && map.has(String(chamber.imageProductId))) {
      const fromProduct = primaryImage(map.get(String(chamber.imageProductId)));
      if (fromProduct) image = fromProduct;
    }
    if (!image?.url) {
      const fallback = await loadFeaturedByType(chamber.id);
      const fromFeatured = primaryImage(fallback);
      if (fromFeatured) image = fromFeatured;
    }
    if (!image?.url) {
      image = buildHomeDefaults().domains.chambers.find((item) => item.id === chamber.id)?.image;
    }

    chambers.push({
      id: chamber.id,
      label: chamber.label,
      title: chamber.title,
      summary: chamber.summary,
      href: chamber.href || `/discover?domain=${chamber.id}`,
      image: image || { url: '', alt: '', width: 1800, height: 1200 },
    });
  }

  return {
    enabled,
    meta: domains?.meta || 'The chambers',
    title: domains?.title || 'Explore domain by domain.',
    lede: domains?.lede || '',
    feedCtaLabel: domains?.feedCtaLabel || 'View the full feed',
    feedCtaHref: domains?.feedCtaHref || '/discover',
    chambers,
  };
}

async function resolveFeatured(featured) {
  const enabled = featured?.enabled !== false;
  const slotsIn = featured?.slots?.length
    ? featured.slots
    : buildHomeDefaults().featured.slots;

  const map = await loadProductsByIds(slotsIn.map((slot) => slot.productId).filter(Boolean));
  const slots = [];

  for (const slot of slotsIn) {
    let product = slot.productId ? map.get(String(slot.productId)) : null;
    if (!product && slot.productType) {
      product = await loadFeaturedByType(slot.productType);
    }
    if (!product) continue;
    slots.push({
      eyebrow: slot.eyebrow || `Plate · ${product.productType}`,
      flipped: Boolean(slot.flipped),
      product,
    });
  }

  return { enabled, slots };
}

async function resolveEditorial(editorial) {
  const enabled = editorial?.enabled !== false;
  const fallback = {
    enabled,
    type: editorial?.type || 'The chamber',
    title: editorial?.title || '',
    excerpt: editorial?.excerpt || '',
    href: editorial?.href || '/journal',
    cta: editorial?.cta || 'Continue reading',
    image: editorial?.image?.url
      ? editorial.image
      : buildHomeDefaults().editorial.image,
  };

  if (!enabled) return fallback;

  if (editorial?.articleId && isObjectId(editorial.articleId)) {
    const doc = await Article.findOne({
      ...PUBLIC_ARTICLE,
      _id: editorial.articleId,
    });
    const card = serializeArticleCard(doc);
    if (card) {
      return {
        enabled,
        type: card.type || fallback.type,
        title: card.title,
        excerpt: card.excerpt || fallback.excerpt,
        href: `/journal/${card.slug}`,
        cta: editorial.cta || 'Continue reading',
        image: card.image || fallback.image,
      };
    }
  }

  const latest = await Article.findOne(PUBLIC_ARTICLE)
    .sort({ featured: -1, publishedAt: -1 })
    .limit(1);
  const card = serializeArticleCard(latest);
  if (card) {
    return {
      enabled,
      type: card.type || fallback.type,
      title: card.title,
      excerpt: card.excerpt || fallback.excerpt,
      href: `/journal/${card.slug}`,
      cta: editorial?.cta || 'Continue reading',
      image: card.image || fallback.image,
    };
  }

  return fallback;
}

export async function getPublicHome() {
  const doc = await getOrCreateHomeConfig();
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;

  const [hero, domains, featured, editorial] = await Promise.all([
    resolveHero(plain.hero),
    resolveDomains(plain.domains),
    resolveFeatured(plain.featured),
    resolveEditorial(plain.editorial),
  ]);

  return {
    hero,
    brands: {
      enabled: plain.brands?.enabled !== false,
      label: plain.brands?.label || 'The brands',
      ctaLabel: plain.brands?.ctaLabel || 'View all brands',
      ctaHref: plain.brands?.ctaHref || '/brands',
    },
    promise: {
      enabled: plain.promise?.enabled !== false,
      eyebrow: plain.promise?.eyebrow || '',
      title: plain.promise?.title || '',
      body: plain.promise?.body || '',
      quote: plain.promise?.quote || '',
      quoteCredit: plain.promise?.quoteCredit || '',
    },
    domains,
    signatures: {
      enabled: plain.signatures?.enabled !== false,
      meta: plain.signatures?.meta || 'Catalogue plates',
      title: plain.signatures?.title || 'Objects with a story to tell.',
      lede: plain.signatures?.lede || '',
    },
    featured,
    editorial,
    close: {
      enabled: plain.close?.enabled !== false,
      eyebrow: plain.close?.eyebrow || '',
      title: plain.close?.title || '',
      paths: plain.close?.paths?.length
        ? plain.close.paths
        : buildHomeDefaults().close.paths,
    },
  };
}

export async function requireHomeConfigExists() {
  const doc = await HomePageConfig.findOne({ key: 'home' });
  if (!doc) throw new ApiError('Home config missing', 404, 'HOME_NOT_FOUND');
  return doc;
}
