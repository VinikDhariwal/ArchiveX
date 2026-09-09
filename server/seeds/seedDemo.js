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
  Brand,
  Category,
  Product,
  Tag,
  User,
  buildSpecifications,
} from '../models/index.js';

/** Demo admin login (local/dev seed only): editor@archivex.local / ArchiveX!admin */
const SEED_ADMIN_PASSWORD = 'ArchiveX!admin';

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

  await connectDatabase();

  const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);

  const admin = await User.findOneAndUpdate(
    { email: 'editor@archivex.local' },
    {
      $set: {
        name: 'ArchiveX Editor',
        email: 'editor@archivex.local',
        passwordHash,
        role: 'admin',
        status: 'active',
        tokenVersion: 0,
        preferences: { newsletter: false, locale: 'en' },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const brands = {
    mercedes: await upsertBySlug(Brand, 'mercedes-benz', {
      name: 'Mercedes-Benz',
      slug: 'mercedes-benz',
      description: 'Stuttgart house of engineering and rare competition silhouettes.',
      foundedYear: 1926,
      country: 'Germany',
      primaryDomains: ['car'],
      status: 'active',
    }),
    ferrari: await upsertBySlug(Brand, 'ferrari', {
      name: 'Ferrari',
      slug: 'ferrari',
      description: 'Maranello icons spanning racing myth and road legend.',
      foundedYear: 1947,
      country: 'Italy',
      primaryDomains: ['car'],
      status: 'active',
    }),
    bugatti: await upsertBySlug(Brand, 'bugatti', {
      name: 'Bugatti',
      slug: 'bugatti',
      description: 'Molsheim hypercar craft and horseshoe-grille theatre.',
      foundedYear: 1909,
      country: 'France',
      primaryDomains: ['car'],
      status: 'active',
    }),
    porsche: await upsertBySlug(Brand, 'porsche', {
      name: 'Porsche',
      slug: 'porsche',
      description: 'Enduring sports-car geometry and collector continuity.',
      foundedYear: 1931,
      country: 'Germany',
      primaryDomains: ['car'],
      status: 'active',
    }),
    lamborghini: await upsertBySlug(Brand, 'lamborghini', {
      name: 'Lamborghini',
      slug: 'lamborghini',
      description: 'Sant’Agata wedge drama and V10/V12 presence.',
      foundedYear: 1963,
      country: 'Italy',
      primaryDomains: ['car'],
      status: 'active',
    }),
    mclaren: await upsertBySlug(Brand, 'mclaren', {
      name: 'McLaren',
      slug: 'mclaren',
      description: 'Woking hybrid hypercar craftsmanship.',
      foundedYear: 1963,
      country: 'United Kingdom',
      primaryDomains: ['car'],
      status: 'active',
    }),
    yamaha: await upsertBySlug(Brand, 'yamaha', {
      name: 'Yamaha',
      slug: 'yamaha',
      description: 'Sculptural supersport motorcycles with track presence.',
      foundedYear: 1955,
      country: 'Japan',
      primaryDomains: ['motorcycle'],
      status: 'active',
    }),
    ducati: await upsertBySlug(Brand, 'ducati', {
      name: 'Ducati',
      slug: 'ducati',
      description: 'Bologna superbike geometry and Desmo lore.',
      foundedYear: 1926,
      country: 'Italy',
      primaryDomains: ['motorcycle'],
      status: 'active',
    }),
    harley: await upsertBySlug(Brand, 'harley-davidson', {
      name: 'Harley-Davidson',
      slug: 'harley-davidson',
      description: 'Milwaukee cruiser heritage and tank-badge presence.',
      foundedYear: 1903,
      country: 'United States',
      primaryDomains: ['motorcycle'],
      status: 'active',
    }),
    suzuki: await upsertBySlug(Brand, 'suzuki', {
      name: 'Suzuki',
      slug: 'suzuki',
      description: 'Japanese road craft spanning café builds and superbikes.',
      foundedYear: 1909,
      country: 'Japan',
      primaryDomains: ['motorcycle'],
      status: 'active',
    }),
    honda: await upsertBySlug(Brand, 'honda', {
      name: 'Honda',
      slug: 'honda',
      description: 'Custom and production motorcycle craft.',
      foundedYear: 1948,
      country: 'Japan',
      primaryDomains: ['motorcycle'],
      status: 'active',
    }),
    ktm: await upsertBySlug(Brand, 'ktm', {
      name: 'KTM',
      slug: 'ktm',
      description: 'Orange-framed Race Competition roadsters.',
      foundedYear: 1934,
      country: 'Austria',
      primaryDomains: ['motorcycle'],
      status: 'active',
    }),
    patek: await upsertBySlug(Brand, 'patek-philippe', {
      name: 'Patek Philippe',
      slug: 'patek-philippe',
      description: 'Geneva complications and archival horology.',
      foundedYear: 1839,
      country: 'Switzerland',
      primaryDomains: ['watch'],
      status: 'active',
    }),
    omega: await upsertBySlug(Brand, 'omega', {
      name: 'Omega',
      slug: 'omega',
      description: 'Precision instruments with expedition heritage.',
      foundedYear: 1848,
      country: 'Switzerland',
      primaryDomains: ['watch'],
      status: 'active',
    }),
    rolex: await upsertBySlug(Brand, 'rolex', {
      name: 'Rolex',
      slug: 'rolex',
      description: 'Tool-watch language and chronometer heritage.',
      foundedYear: 1905,
      country: 'Switzerland',
      primaryDomains: ['watch'],
      status: 'active',
    }),
    cartier: await upsertBySlug(Brand, 'cartier', {
      name: 'Cartier',
      slug: 'cartier',
      description: 'Early pilot wristwatch geometry still shaping dress codes.',
      foundedYear: 1847,
      country: 'France',
      primaryDomains: ['watch'],
      status: 'active',
    }),
  };

  const categories = {
    carIcons: await upsertBySlug(Category, 'automotive-icons', {
      name: 'Automotive icons',
      slug: 'automotive-icons',
      description: 'Scarce silhouettes and engineering lore.',
      productType: 'car',
      status: 'active',
    }),
    motoCraft: await upsertBySlug(Category, 'two-wheel-craft', {
      name: 'Two-wheel craft',
      slug: 'two-wheel-craft',
      description: 'Superbikes and heritage roadsters.',
      productType: 'motorcycle',
      status: 'active',
    }),
    watchChamber: await upsertBySlug(Category, 'watch-chamber', {
      name: 'Watch chamber',
      slug: 'watch-chamber',
      description: 'Secondary luxury watch archive.',
      productType: 'watch',
      status: 'active',
    }),
  };

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
    categories: await Category.countDocuments(),
    tags: await Tag.countDocuments(),
    products: await Product.countDocuments(),
    cars: await Product.countDocuments({ productType: 'car' }),
    motorcycles: await Product.countDocuments({ productType: 'motorcycle' }),
    watches: await Product.countDocuments({ productType: 'watch' }),
    approved: await Product.countDocuments({ status: 'approved' }),
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
