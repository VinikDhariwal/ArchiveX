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

/** Seed operator — set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in server/.env (see LOCAL_CREDENTIALS.md). */
const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const LEGACY_ADMIN_EMAIL = 'editor@archivex.local';

function img(url, alt, type = 'gallery', sortOrder = 0, width = 1400, height = 933) {
  return { url, alt, type, sortOrder, width, height };
}

function unsplash(id, w = 1400) {
  return `https://images.unsplash.com/${id}?auto=format&fit=max&w=${w}&q=80`;
}

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

  return {
    whyItMatters: whyByType[type] || whyByType.car,
    rarityProfile: {
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
    },
    marketSignals: {
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
    },
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
    const doc = await upsertBySlug(Brand, entry.slug, {
      name: entry.name,
      slug: entry.slug,
      description: entry.description || '',
      foundedYear: entry.foundedYear,
      country: entry.country,
      primaryDomains: entry.domains,
      status: 'active',
    });
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
    if (entry.key) categories[entry.key] = doc;
  }

  const tags = {
    ultraRare: await upsertBySlug(Tag, 'ultra-rare', { name: 'Ultra-rare', slug: 'ultra-rare' }),
    iconic: await upsertBySlug(Tag, 'iconic', { name: 'Iconic', slug: 'iconic' }),
    heritage: await upsertBySlug(Tag, 'heritage', { name: 'Heritage', slug: 'heritage' }),
    competition: await upsertBySlug(Tag, 'competition', { name: 'Competition', slug: 'competition' }),
  };

  const products = [
    {
      name: 'Mercedes-Benz 300 SL',
      slug: 'mercedes-benz-300-sl',
      reference: 'AX-0001',
      productType: 'car',
      brand: brands.mercedes._id,
      category: categories.carIcons._id,
      tags: [tags.iconic._id, tags.heritage._id],
      shortDescription:
        'The Gullwing coupe that defined postwar sports-car theatre.',
      description:
        'Space-frame chassis and upward-hinging doors — archival engineering and collector myth.',
      releaseYear: 1955,
      productionPeriod: '1954–1957',
      rarity: 'ICONIC',
      availability: 'private',
      featured: true,
      status: 'approved',
      publisher: 'ArchiveX',
      materials: ['aluminium', 'steel'],
      colors: ['silver'],
      images: [
        img(unsplash('photo-1772550327967-4d9123809a65'), 'Silver Mercedes-Benz 300 SL Gullwing coupe', 'hero', 0),
      ],
      specifications: buildSpecifications('car', {
        engine: 'Inline-6',
        power: '215 PS',
        bodyStyle: 'coupe',
        productionPeriod: '1954–1957',
      }),
    },
    {
      name: 'Bugatti Chiron',
      slug: 'bugatti-chiron',
      reference: 'AX-0057',
      productType: 'car',
      brand: brands.bugatti._id,
      category: categories.carIcons._id,
      tags: [tags.iconic._id],
      shortDescription: 'Molsheim’s modern hypercar — horseshoe grille and W16 theatre.',
      description: 'Eight-eye lamps, quad-turbo W16 presence, and contemporary Bugatti geometry.',
      releaseYear: 2016,
      rarity: 'ICONIC',
      availability: 'private',
      featured: true,
      status: 'approved',
      publisher: 'ArchiveX',
      images: [
        img(unsplash('photo-1544636331-e26879cd4d9b'), 'White Bugatti Chiron front study at night', 'hero', 0),
      ],
      specifications: buildSpecifications('car', {
        engine: 'W16 quad-turbo',
        bodyStyle: 'coupe',
      }),
    },
    {
      name: 'Ferrari F40',
      slug: 'ferrari-f40',
      reference: 'AX-0108',
      productType: 'car',
      brand: brands.ferrari._id,
      category: categories.carIcons._id,
      tags: [tags.iconic._id],
      shortDescription: 'Twin-turbo V8 legend — raw engineering made collectible myth.',
      description: 'Enzo’s final road car and a cornerstone of modern collector mythology.',
      releaseYear: 1987,
      rarity: 'ICONIC',
      availability: 'private',
      featured: true,
      status: 'approved',
      publisher: 'ArchiveX',
      images: [
        img(unsplash('photo-1750712344309-b62744ffae18'), 'Black Ferrari F40 on display', 'hero', 0),
        img(unsplash('photo-1726739569681-14cc0392b4bc'), 'Red Ferrari F40 in garage light', 'gallery', 1),
        img(unsplash('photo-1762111215490-0afdb55466c2'), 'Cream Ferrari F40 on the street', 'gallery', 2),
      ],
      specifications: buildSpecifications('car', {
        engine: 'V8 twin-turbo',
        power: '478 PS',
        aspiration: 'twin-turbo',
        bodyStyle: 'coupe',
      }),
    },
    {
      name: 'Porsche 911 Carrera 4',
      slug: 'porsche-911-carrera',
      reference: 'AX-0911',
      productType: 'car',
      brand: brands.porsche._id,
      category: categories.carIcons._id,
      tags: [tags.iconic._id],
      shortDescription: 'The enduring 911 silhouette — precision, balance, and collector continuity.',
      description: 'A modern Carrera 4 plate for the demonstration archive.',
      releaseYear: 2019,
      rarity: 'COLLECTIBLE',
      availability: 'production',
      status: 'approved',
      publisher: 'ArchiveX',
      images: [
        img(unsplash('photo-1578911717720-4272f961231b'), 'Porsche 911 Carrera 4 rear badge study', 'hero', 0),
      ],
      specifications: buildSpecifications('car', {
        engine: 'Flat-six',
        drivetrain: 'AWD',
        bodyStyle: 'coupe',
      }),
    },
    {
      name: 'Lamborghini Huracán',
      slug: 'lamborghini-huracan',
      reference: 'AX-0012',
      productType: 'car',
      brand: brands.lamborghini._id,
      category: categories.carIcons._id,
      tags: [tags.iconic._id],
      shortDescription: 'Sant’Agata V10 wedge — sharp lamps and hexagonal intake geometry.',
      description: 'Modern bull presence for the automotive chamber.',
      releaseYear: 2014,
      rarity: 'RARE',
      availability: 'private',
      status: 'approved',
      publisher: 'ArchiveX',
      images: [
        img(unsplash('photo-1519245659620-e859806a8d3b'), 'Dark grey Lamborghini Huracán with racing stripes', 'hero', 0),
      ],
      specifications: buildSpecifications('car', {
        engine: 'V10',
        drivetrain: 'AWD',
        bodyStyle: 'coupe',
      }),
    },
    {
      name: 'McLaren P1',
      slug: 'mclaren-p1',
      reference: 'AX-0003',
      productType: 'car',
      brand: brands.mclaren._id,
      category: categories.carIcons._id,
      tags: [tags.iconic._id, tags.competition._id],
      shortDescription: 'Hybrid hypercar craftsmanship with motorsport bloodline.',
      description: 'Woking’s hybrid flagship — demonstration plate for modern hypercar craft.',
      releaseYear: 2013,
      rarity: 'ICONIC',
      availability: 'private',
      status: 'approved',
      publisher: 'ArchiveX',
      images: [
        img(unsplash('photo-1748028265529-0be0aee7f674'), 'McLaren P1 displayed front view', 'hero', 0),
      ],
      specifications: buildSpecifications('car', {
        engine: 'V8 hybrid',
        aspiration: 'twin-turbo',
        bodyStyle: 'coupe',
        productionUnits: '375',
      }),
    },
    {
      name: 'Harley-Davidson Heritage',
      slug: 'harley-davidson-heritage',
      reference: 'AX-1916',
      productType: 'motorcycle',
      brand: brands.harley._id,
      category: categories.motoCraft._id,
      tags: [tags.heritage._id],
      shortDescription: 'Classic Milwaukee cruiser presence with long-road character.',
      description: 'Tank-badge heritage for the two-wheel chamber.',
      releaseYear: 1948,
      rarity: 'COLLECTIBLE',
      availability: 'private',
      featured: true,
      status: 'approved',
      publisher: 'ArchiveX',
      images: [
        img(unsplash('photo-1459372537964-e38c57a5e86f'), 'Vintage Harley-Davidson motorcycle study', 'hero', 0),
      ],
      specifications: buildSpecifications('motorcycle', {
        engine: 'V-twin',
        productionPeriod: '1948',
      }),
    },
    {
      name: 'Suzuki Café Racer',
      slug: 'suzuki-cafe-racer',
      reference: 'AX-1919',
      productType: 'motorcycle',
      brand: brands.suzuki._id,
      category: categories.motoCraft._id,
      tags: [tags.heritage._id],
      shortDescription: 'A stripped café-racer build with lean tank lines and workshop craft.',
      description: 'Custom Suzuki café geometry for the two-wheel chamber.',
      releaseYear: 1975,
      rarity: 'COLLECTIBLE',
      availability: 'private',
      featured: true,
      status: 'approved',
      publisher: 'ArchiveX',
      images: [
        img(unsplash('photo-1508349661974-9927dbd8399c'), 'Custom Suzuki café racer motorcycle profile', 'hero', 0),
      ],
      specifications: buildSpecifications('motorcycle', {
        modelGeneration: 'Café racer',
        productionPeriod: '1975',
      }),
    },
    {
      name: 'Ducati Panigale V4',
      slug: 'ducati-panigale',
      reference: 'AX-0DUC',
      productType: 'motorcycle',
      brand: brands.ducati._id,
      category: categories.motoCraft._id,
      tags: [tags.iconic._id],
      shortDescription: 'Italian superbike form — winglet aero and Desmo character.',
      description: 'Bologna Panigale V4 presence for the two-wheel chamber.',
      releaseYear: 2018,
      rarity: 'COLLECTIBLE',
      availability: 'private',
      status: 'approved',
      publisher: 'ArchiveX',
      images: [
        img(unsplash('photo-1632157256334-518122d788bd'), 'Red Ducati Panigale V4 on mountain road', 'hero', 0),
      ],
      specifications: buildSpecifications('motorcycle', {
        engine: 'V4',
        finalDrive: 'chain',
      }),
    },
    {
      name: 'Honda Scrambler',
      slug: 'honda-scrambler',
      reference: 'AX-0HON',
      productType: 'motorcycle',
      brand: brands.honda._id,
      category: categories.motoCraft._id,
      tags: [tags.heritage._id],
      shortDescription: 'Custom Honda scrambler craft — knobby tires and forest-road stance.',
      description: 'Demonstration Honda scrambler for the two-wheel chamber.',
      releaseYear: 1972,
      rarity: 'COLLECTIBLE',
      availability: 'private',
      status: 'approved',
      publisher: 'ArchiveX',
      images: [
        img(unsplash('photo-1502744688674-c619d1586c9e'), 'Custom Honda scrambler on forest trail', 'hero', 0),
      ],
      specifications: buildSpecifications('motorcycle', {
        modelGeneration: 'Scrambler',
      }),
    },
    {
      name: 'Yamaha YZF-R6',
      slug: 'yamaha-yzf-r6',
      reference: 'AX-0R6',
      productType: 'motorcycle',
      brand: brands.yamaha._id,
      category: categories.motoCraft._id,
      tags: [tags.competition._id],
      shortDescription: 'Sculptural supersport craftsmanship with archival track presence.',
      description: 'A modern supersport plate for the motorcycle chamber.',
      releaseYear: 2008,
      rarity: 'COLLECTIBLE',
      availability: 'production',
      status: 'approved',
      publisher: 'ArchiveX',
      images: [
        img(unsplash('photo-1609630875171-b1321377ee65'), 'Yamaha YZF-R6 orange and black superbike', 'hero', 0),
      ],
      specifications: buildSpecifications('motorcycle', {
        engine: 'Inline-4',
        displacement: '599 cc',
        transmission: '6-speed',
      }),
    },
    {
      name: 'KTM RC 390',
      slug: 'ktm-rc-390',
      reference: 'AX-0KTM',
      productType: 'motorcycle',
      brand: brands.ktm._id,
      category: categories.motoCraft._id,
      tags: [tags.competition._id],
      shortDescription: 'Orange-framed Race Competition roadster energy.',
      description: 'KTM RC 390 for the two-wheel chamber.',
      releaseYear: 2014,
      rarity: 'COLLECTIBLE',
      availability: 'production',
      status: 'approved',
      publisher: 'ArchiveX',
      images: [
        img(unsplash('photo-1449426468159-d96dbf08f19f'), 'KTM RC 390 sport motorcycle parked outdoors', 'hero', 0),
      ],
      specifications: buildSpecifications('motorcycle', {
        displacement: '373 cc',
        modelGeneration: 'RC 390',
      }),
    },
    {
      name: 'Patek Philippe Henry Graves Supercomplication',
      slug: 'patek-philippe-henry-graves-supercomplication',
      reference: 'AX-1933',
      productType: 'watch',
      brand: brands.patek._id,
      category: categories.watchChamber._id,
      tags: [tags.ultraRare._id, tags.heritage._id],
      shortDescription: 'A unique pocket-watch summit of twentieth-century complications.',
      description: 'Secondary-domain horology plate — demonstration stand-in for the Graves Supercomplication.',
      releaseYear: 1933,
      rarity: 'UNIQUE',
      availability: 'private',
      featured: true,
      status: 'approved',
      publisher: 'ArchiveX',
      images: [
        img(unsplash('photo-1509048191080-d2984bad6ae5'), 'Antique pocket watch', 'hero', 0),
      ],
      specifications: buildSpecifications('watch', {
        movement: 'manual',
        productionPeriod: '1925–1933',
      }),
    },
    {
      name: 'Rolex Air-King',
      slug: 'rolex-air-king',
      reference: 'AX-0AIR',
      productType: 'watch',
      brand: brands.rolex._id,
      category: categories.watchChamber._id,
      tags: [tags.heritage._id],
      shortDescription: 'Aviation chronometer language preserved for collector study.',
      description: 'Secondary watch chamber plate.',
      releaseYear: 1945,
      rarity: 'RARE',
      availability: 'production',
      status: 'approved',
      publisher: 'ArchiveX',
      images: [
        img(unsplash('photo-1547996160-81dfa63595aa'), 'Rolex Air-King on book surface', 'hero', 0),
      ],
      specifications: buildSpecifications('watch', {
        movement: 'automatic',
        bracelet: 'metal',
      }),
    },
    {
      name: 'Omega Seamaster Planet Ocean',
      slug: 'omega-seamaster-planet-ocean',
      reference: 'AX-0SEA',
      productType: 'watch',
      brand: brands.omega._id,
      category: categories.watchChamber._id,
      tags: [tags.iconic._id, tags.heritage._id],
      shortDescription: 'Diving chronograph history with enduring archival significance.',
      description: 'Secondary watch chamber plate for the demonstration catalog.',
      releaseYear: 2005,
      rarity: 'ICONIC',
      availability: 'production',
      status: 'approved',
      publisher: 'ArchiveX',
      images: [
        img(unsplash('photo-1523170335258-f5ed11844a49'), 'Omega Seamaster Planet Ocean chronograph', 'hero', 0),
      ],
      specifications: buildSpecifications('watch', {
        movement: 'automatic',
        waterResistance: '300m',
        bracelet: 'metal',
      }),
    },
    {
      name: 'Cartier Santos',
      slug: 'cartier-santos',
      reference: 'AX-0SAN',
      productType: 'watch',
      brand: brands.cartier._id,
      category: categories.watchChamber._id,
      tags: [tags.heritage._id],
      shortDescription: 'Early pilot wristwatch geometry still shaping dress codes.',
      description: 'Square case geometry as a quieter secondary-domain entry.',
      releaseYear: 1904,
      rarity: 'COLLECTIBLE',
      availability: 'production',
      status: 'approved',
      publisher: 'ArchiveX',
      images: [
        img(unsplash('photo-1523170335258-f5ed11844a49'), 'Luxury wristwatch study', 'hero', 0),
      ],
      specifications: buildSpecifications('watch', {
        caseMaterial: 'steel/gold',
        dialColor: 'white',
        bracelet: 'metal',
      }),
    },
  ];

  for (const product of products) {
    const intelligence = intelligenceFor(product);
    await Product.findOneAndUpdate(
      { slug: product.slug },
      {
        $set: {
          ...product,
          ...intelligence,
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
