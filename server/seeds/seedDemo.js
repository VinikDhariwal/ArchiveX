/**
 * Phase 4 demo seed — migrates current website demo catalog into MongoDB Atlas.
 * Cars & motorcycles primary, watches secondary. Operator content is pre-approved.
 *
 * Usage:
 *   npm run seed --prefix server
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import env from '../config/env.js';
import { connectDatabase } from '../config/database.js';
import {
  Article,
  Brand,
  Category,
  Product,
  Tag,
  User,
  buildSpecifications,
} from '../models/index.js';
import { BRAND_CATALOG, CATEGORY_CATALOG } from './brandCatalog.js';
import { buildProductCatalog, img, unsplash } from './productCatalog.js';
import { PRODUCT_STORIES } from './productStories.js';

/** Seed operator — set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in server/.env (see LOCAL_CREDENTIALS.md). */
const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const LEGACY_ADMIN_EMAIL = 'editor@archivex.local';

/** Clearbit-style domains for house marks stored as remote URLs in Atlas. */
const BRAND_LOGO_DOMAINS = {
  'mercedes-benz': 'mercedes-benz.com',
  ferrari: 'ferrari.com',
  bugatti: 'bugatti.com',
  porsche: 'porsche.com',
  lamborghini: 'lamborghini.com',
  mclaren: 'mclaren.com',
  'aston-martin': 'astonmartin.com',
  jaguar: 'jaguar.com',
  bmw: 'bmw.com',
  ford: 'ford.com',
  chevrolet: 'chevrolet.com',
  nissan: 'nissanusa.com',
  'rolls-royce': 'rolls-roycemotorcars.com',
  'harley-davidson': 'harley-davidson.com',
  suzuki: 'suzukicycles.com',
  ducati: 'ducati.com',
  honda: 'honda.com',
  yamaha: 'yamaha-motor.com',
  ktm: 'ktm.com',
  triumph: 'triumphmotorcycles.com',
  kawasaki: 'kawasaki.com',
  'bmw-motorrad': 'bmw-motorrad.com',
  'patek-philippe': 'patek.com',
  omega: 'omegawatches.com',
  rolex: 'rolex.com',
  cartier: 'cartier.com',
  'audemars-piguet': 'audemarspiguet.com',
  iwc: 'iwc.com',
  'grand-seiko': 'grand-seiko.com',
};

function intelligenceFor(product) {
  const type = product.productType;
  const name = product.name;
  const year = product.releaseYear;
  const availability = product.availability || 'unknown';

  const whyByType = {
    car: `${name} remains a study object for engineering theatre, silhouette discipline, and the cultural memory of the road-going machine.`,
    motorcycle: `${name} carries two-wheel craft into the archive — geometry, workshop myth, and the balance between machine and rider.`,
    watch: `${name} holds horological language that collectors still return to — movement, case geometry, and quiet historical presence.`,
  };

  const baseRarity = {
    productionHistory:
      product.productionPeriod
        ? `Documented production window ${product.productionPeriod}.`
        : year
          ? `Associated with the ${year} era in the ArchiveX catalog.`
          : 'Production history preserved for collector study.',
    collectorInterest:
      type === 'watch'
        ? 'Secondary-domain interest remains steady among archive readers.'
        : 'Primary-domain collector attention stays high across Discover and journal paths.',
    historicalSignificance:
      type === 'watch'
        ? 'Horological and design context matter as much as technical specification.'
        : 'Engineering, design, and cultural impact define its place in the chamber.',
  };

  const baseMarket = {
    archiveEstimate: 'Archive study range — not a formal appraisal',
    marketRange:
      product.rarity === 'ICONIC' || product.rarity === 'UNIQUE' || product.rarity === 'ULTRA-RARE'
        ? 'Elevated private / auction band'
        : product.rarity === 'RARE'
          ? 'Selective private band'
          : 'Broader collector band',
    collectorInterest:
      product.featured ? 'High among returning readers' : 'Steady within its chamber',
    availabilitySignal: availability,
    priceMovement: 'Observational — no guaranteed trajectory',
    lastUpdated: new Date('2026-09-09T12:00:00.000Z'),
    disclaimer:
      'Informational archive signals only — not a guarantee of price, availability, or investment outcome.',
  };

  return {
    whyItMatters: product.whyItMatters || whyByType[type] || whyByType.car,
    rarityProfile: { ...baseRarity, ...(product.rarityProfile || {}) },
    marketSignals: {
      ...baseMarket,
      ...(product.marketSignals || {}),
      lastUpdated: product.marketSignals?.lastUpdated || baseMarket.lastUpdated,
      disclaimer: product.marketSignals?.disclaimer || baseMarket.disclaimer,
    },
  };
}

function applyStory(product) {
  const story = PRODUCT_STORIES[product.slug];
  if (!story) return product;

  const {
    specifications: storySpecs,
    shortDescription,
    description,
    whyItMatters,
    materials,
    colors,
    productionPeriod,
    rarityProfile,
    marketSignals,
  } = story;

  return {
    ...product,
    ...(shortDescription ? { shortDescription } : {}),
    ...(description ? { description } : {}),
    ...(whyItMatters ? { whyItMatters } : {}),
    ...(materials ? { materials } : {}),
    ...(colors ? { colors } : {}),
    ...(productionPeriod ? { productionPeriod } : {}),
    ...(rarityProfile ? { rarityProfile } : {}),
    ...(marketSignals ? { marketSignals } : {}),
    ...(storySpecs
      ? { specifications: buildSpecifications(product.productType, storySpecs) }
      : {}),
  };
}

async function upsertBySlug(Model, slug, data) {
  return Model.findOneAndUpdate(
    { slug },
    { $set: data },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function seed() {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is required to run the Phase 4 seed');
  }
  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    throw new Error(
      'Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in server/.env (see LOCAL_CREDENTIALS.md)'
    );
  }

  await connectDatabase();

  const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);

  await User.deleteOne({ email: LEGACY_ADMIN_EMAIL });

  const admin = await User.findOneAndUpdate(
    { email: SEED_ADMIN_EMAIL },
    {
      $set: {
        name: 'ArchiveX Admin',
        firstName: 'ArchiveX',
        lastName: 'Admin',
        username: 'archivex_admin',
        email: SEED_ADMIN_EMAIL,
        passwordHash,
        role: 'admin',
        status: 'active',
        tokenVersion: 0,
        preferences: { newsletter: false, locale: 'en' },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const brands = {};
  for (const entry of BRAND_CATALOG) {
    const logoDomain = BRAND_LOGO_DOMAINS[entry.slug];
    const doc = await upsertBySlug(Brand, entry.slug, {
      name: entry.name,
      slug: entry.slug,
      description: entry.description || '',
      foundedYear: entry.foundedYear,
      country: entry.country,
      primaryDomains: entry.domains,
      status: 'active',
      ...(logoDomain
        ? {
            logo: {
              url: `https://logo.clearbit.com/${logoDomain}`,
              alt: `${entry.name} mark`,
              type: 'other',
              sortOrder: 0,
            },
          }
        : {}),
    });
    brands[entry.slug] = doc;
    if (entry.key) brands[entry.key] = doc;
  }

  const categories = {};
  for (const entry of CATEGORY_CATALOG) {
    const doc = await upsertBySlug(Category, entry.slug, {
      name: entry.name,
      slug: entry.slug,
      description: entry.description || '',
      productType: entry.productType,
      status: 'active',
    });
    categories[entry.slug] = doc;
    if (entry.key) categories[entry.key] = doc;
  }

  const tags = {
    ultraRare: await upsertBySlug(Tag, 'ultra-rare', { name: 'Ultra-rare', slug: 'ultra-rare' }),
    iconic: await upsertBySlug(Tag, 'iconic', { name: 'Iconic', slug: 'iconic' }),
    heritage: await upsertBySlug(Tag, 'heritage', { name: 'Heritage', slug: 'heritage' }),
    competition: await upsertBySlug(Tag, 'competition', { name: 'Competition', slug: 'competition' }),
  };

  const products = buildProductCatalog({
    brands,
    categories,
    tags,
    buildSpecifications,
  }).map(applyStory);

  for (const product of products) {
    const intelligence = intelligenceFor(product);
    const { rarityProfile, marketSignals, whyItMatters, ...productFields } = product;
    await Product.findOneAndUpdate(
      { slug: product.slug },
      {
        $set: {
          ...productFields,
          whyItMatters: intelligence.whyItMatters,
          rarityProfile: intelligence.rarityProfile,
          marketSignals: intelligence.marketSignals,
          createdBy: admin._id,
          updatedBy: admin._id,
          submittedBy: admin._id,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const productBySlug = Object.fromEntries(
    (
      await Product.find({
        slug: {
          $in: [
            'ferrari-f40',
            'bugatti-chiron',
            'ducati-panigale',
            'mercedes-benz-300-sl',
            'omega-seamaster-planet-ocean',
            'rolex-air-king',
          ],
        },
      }).select('_id slug')
    ).map((doc) => [doc.slug, doc._id])
  );

  const publishedAt = new Date('2026-09-09T16:00:00.000Z');

  const articles = [
    {
      title: 'The private garage as museum',
      slug: 'the-private-garage-as-museum',
      articleType: 'Archive Essay',
      excerpt: 'How collectors curate mechanical memory beyond the sales floor.',
      featured: true,
      domains: ['car'],
      relatedProducts: [productBySlug['ferrari-f40'], productBySlug['mercedes-benz-300-sl']].filter(
        Boolean
      ),
      heroImage: img(
        unsplash('photo-1726739569681-14cc0392b4bc'),
        'Ferrari garage archive atmosphere',
        'editorial',
        0,
        1200,
        750
      ),
      sections: [
        {
          heading: 'A quieter inventory',
          body: 'Collectors rarely begin with a sales floor. They begin with a room that holds machines like evidence — of travel, of risk, of a decade’s taste. ArchiveX treats that room as a museum chamber: objects are studied for silhouette, provenance language, and the stories that survive between workshops.',
        },
        {
          heading: 'Beyond the listing',
          body: 'A private garage becomes archival when attention replaces urgency. Reference numbers, production windows, and rarity signals matter, but so does the atmosphere around the machine. Essays in this journal keep that atmosphere intact while still serving discovery.',
        },
      ],
      status: 'approved',
      publishedAt,
      byline: 'ArchiveX Editorial',
      publisher: 'ArchiveX',
      createdBy: admin._id,
      updatedBy: admin._id,
    },
    {
      title: 'Italian superbike memory',
      slug: 'italian-superbike-memory',
      articleType: 'Model History',
      excerpt: 'Form, sound, and racing inheritance in one silhouette.',
      featured: false,
      domains: ['motorcycle'],
      relatedProducts: [productBySlug['ducati-panigale']].filter(Boolean),
      heroImage: img(
        unsplash('photo-1632157256334-518122d788bd'),
        'Ducati superbike journal plate',
        'editorial',
        0,
        1200,
        750
      ),
      sections: [
        {
          heading: 'Geometry with intent',
          body: 'Italian superbike silhouettes carry racing inheritance into road language. Seat height, fairing tension, and Desmo lore are not accessories — they are the archive’s way of reading a motorcycle as a composed object.',
        },
        {
          heading: 'Sound as provenance',
          body: 'Collectors remember engines by character as much as by displacement. This model history follows that memory trail: how Bologna craft, track myth, and street presence braid into a single chamber object.',
        },
      ],
      status: 'approved',
      publishedAt: new Date('2026-09-08T16:00:00.000Z'),
      byline: 'ArchiveX Editorial',
      publisher: 'ArchiveX',
      createdBy: admin._id,
      updatedBy: admin._id,
    },
    {
      title: 'Chronographs that traveled',
      slug: 'chronographs-that-traveled',
      articleType: 'Design Study',
      excerpt: 'Secondary domain notes on watches that earned archival attention.',
      featured: false,
      domains: ['watch'],
      relatedProducts: [
        productBySlug['omega-seamaster-planet-ocean'],
        productBySlug['rolex-air-king'],
      ].filter(Boolean),
      heroImage: img(
        unsplash('photo-1523170335258-f5ed11844a49'),
        'Watch editorial demonstration plate',
        'editorial',
        0,
        1200,
        750
      ),
      sections: [
        {
          heading: 'Secondary, not secondary thought',
          body: 'Watches sit behind cars and motorcycles in ArchiveX priority, yet they still earn chamber time. Chronographs that traveled — across oceans, air routes, and workshop benches — hold design studies worth preserving beside primary-domain machines.',
        },
        {
          heading: 'Dial as landscape',
          body: 'Case geometry, movement language, and dial atmosphere become the archive’s reading tools. This essay treats those tools as carefully as horsepower charts on a product plate.',
        },
      ],
      status: 'approved',
      publishedAt: new Date('2026-09-07T16:00:00.000Z'),
      byline: 'ArchiveX Editorial',
      publisher: 'ArchiveX',
      createdBy: admin._id,
      updatedBy: admin._id,
    },
  ];

  for (const article of articles) {
    await upsertBySlug(Article, article.slug, article);
  }

  // Remove superseded demo plates from earlier mismatched catalog names.
  await Product.deleteMany({
    slug: {
      $in: [
        'mercedes-benz-300-slr-uhlenhaut-coupe',
        'bugatti-type-57sc-atlantic',
        'lamborghini-aventador',
        '1916-cyclone-board-track-racer',
        '1919-traub-motorcycle',
        'honda-cb750',
        'ktm-rc',
        'omega-seamaster',
      ],
    },
  });
  await Brand.deleteMany({ slug: { $in: ['cyclone', 'traub'] } });

  // Denormalize product hero → brand.coverImage so Brands index stays fast.
  const plated = await Product.find({ status: 'approved', deletedAt: null, 'images.0': { $exists: true } })
    .select('brand images featured updatedAt')
    .sort({ featured: -1, updatedAt: -1 })
    .lean();
  const coverByBrand = new Map();
  for (const product of plated) {
    const brandId = String(product.brand);
    if (coverByBrand.has(brandId)) continue;
    const hero = product.images.find((image) => image.type === 'hero') || product.images[0];
    if (!hero?.url) continue;
    coverByBrand.set(brandId, {
      url: hero.url,
      alt: hero.alt || '',
      type: 'editorial',
      sortOrder: 0,
      width: hero.width,
      height: hero.height,
    });
  }
  await Brand.updateMany({}, { $unset: { coverImage: 1 } });
  for (const [brandId, coverImage] of coverByBrand) {
    await Brand.updateOne({ _id: brandId }, { $set: { coverImage } });
  }

  const counts = {
    users: await User.countDocuments(),
    brands: await Brand.countDocuments(),
    brandsCar: await Brand.countDocuments({ primaryDomains: 'car', status: 'active' }),
    brandsMotorcycle: await Brand.countDocuments({ primaryDomains: 'motorcycle', status: 'active' }),
    brandsWatch: await Brand.countDocuments({ primaryDomains: 'watch', status: 'active' }),
    categories: await Category.countDocuments(),
    tags: await Tag.countDocuments(),
    products: await Product.countDocuments(),
    articles: await Article.countDocuments(),
    cars: await Product.countDocuments({ productType: 'car' }),
    motorcycles: await Product.countDocuments({ productType: 'motorcycle' }),
    watches: await Product.countDocuments({ productType: 'watch' }),
    approved: await Product.countDocuments({ status: 'approved' }),
    approvedArticles: await Article.countDocuments({ status: 'approved' }),
  };

  console.info('[seed] Demo catalog migrated to MongoDB Atlas');
  console.info('[seed] counts', counts);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('[seed] failed', error.message);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
