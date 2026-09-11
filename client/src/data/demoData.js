/**
 * Phase 2 local demonstration content.
 * Product titles are aligned to brand-correct photography available for demo.
 * Each object has a multi-image gallery for detail viewing.
 * Not factual market claims.
 */
export const DEMO_DISCLAIMER =
  'Demonstration content for layout and discovery. Not a market valuation or current inventory claim.';

const img = (id, alt, type = 'gallery', width = 1400, height = 1050, options = {}) => {
  // Prefer fit=max so Unsplash does not pre-crop the subject before CSS framing.
  const fit = options.fit || 'max';
  const params = [`auto=format`, `fit=${fit}`, `w=${width}`, `q=80`];
  if (fit === 'crop' && height) params.push(`h=${height}`);
  return {
    url: `https://images.unsplash.com/${id}?${params.join('&')}`,
    alt,
    type,
    width,
    height,
    objectPosition: options.objectPosition || 'center',
  };
};

const heroImg = (id, alt, objectPosition = 'center') =>
  img(id, alt, 'hero', 1600, 1200, { fit: 'max', objectPosition });

export const hero = {
  brand: 'ArchiveX',
  kicker: 'A living archive',
  headlineLine1: 'Objects',
  headlineLine2: 'worth remembering.',
  lede: 'A digital museum for extraordinary cars and motorcycles.',
  primaryCta: { label: 'Explore the archive', href: '/discover' },
  secondaryCta: { label: 'Explore discover', href: '/discover' },
  tertiaryCta: { label: 'Read the journal', href: '/journal' },
  featuredSlug: 'mercedes-benz-300-sl',
  /** Hero stage: five ultra-rare archive objects only */
  plates: [
    {
      slug: 'mercedes-benz-300-sl',
      name: 'Mercedes-Benz 300 SL',
      brand: 'Mercedes-Benz',
      year: 1955,
      productType: 'car',
      rarity: 'ICONIC',
      image: heroImg(
        'photo-1772550327967-4d9123809a65',
        'Silver Mercedes-Benz 300 SL Gullwing coupe',
        'center'
      ),
    },
    {
      slug: 'suzuki-cafe-racer',
      name: 'Suzuki Café Racer',
      brand: 'Suzuki',
      year: 1975,
      productType: 'motorcycle',
      rarity: 'COLLECTIBLE',
      image: heroImg(
        'photo-1508349661974-9927dbd8399c',
        'Custom Suzuki café racer motorcycle profile',
        'center'
      ),
    },
    {
      slug: 'bugatti-chiron',
      name: 'Bugatti Chiron',
      brand: 'Bugatti',
      year: 2016,
      productType: 'car',
      rarity: 'ICONIC',
      image: heroImg(
        'photo-1544636331-e26879cd4d9b',
        'White Bugatti Chiron front study at night',
        'center'
      ),
    },
    {
      slug: 'harley-davidson-heritage',
      name: 'Harley-Davidson Heritage',
      brand: 'Harley-Davidson',
      year: 1948,
      productType: 'motorcycle',
      rarity: 'COLLECTIBLE',
      image: heroImg(
        'photo-1459372537964-e38c57a5e86f',
        'Vintage Harley-Davidson motorcycle study',
        'center'
      ),
    },
  ],
  image: heroImg(
    'photo-1772550327967-4d9123809a65',
    'Mercedes-Benz 300 SL Gullwing — archival hero object'
  ),
  galleryBackground: {
    url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=70',
    alt: 'Soft architectural wash',
  },
};

export const archivePromise = {
  eyebrow: 'What is ArchiveX?',
  title: 'A chamber for objects with a tale.',
  body:
    'Every extraordinary machine carries origin, craft, performance, and provenance. ArchiveX studies those stories — not as merchandise, but as design, engineering, and collector memory.',
  quote:
    'ArchiveX is a place of discovery, of comparison, of quiet study, and of lasting attention. Let the archive begin…',
  quoteCredit: 'The ArchiveX promise',
};

export const domainPaths = [
  {
    id: 'car',
    label: 'Cars',
    title: 'Automotive icons',
    summary: 'Scarce silhouettes, engineering lore, and the machines collectors keep.',
    href: '/discover?domain=car',
    image: img(
      'photo-1772550327967-4d9123809a65',
      'Silver Mercedes-Benz 300 SL in the automotive chamber',
      'editorial',
      1800,
      1200,
      { fit: 'max' }
    ),
  },
  {
    id: 'motorcycle',
    label: 'Motorcycles',
    title: 'Two-wheel craft',
    summary: 'Superbikes and heritage roadsters with sculptural presence.',
    href: '/discover?domain=motorcycle',
    image: img(
      'photo-1459372537964-e38c57a5e86f',
      'Vintage Harley-Davidson in the two-wheel chamber',
      'editorial',
      1800,
      1200,
      { fit: 'max' }
    ),
  },
  {
    id: 'watch',
    label: 'Watches',
    title: 'Secondary chamber',
    summary: 'Luxury timepieces kept in the archive — important, never dominant.',
    href: '/discover?domain=watch',
    image: img(
      'photo-1509048191080-d2984bad6ae5',
      'Antique pocket watch in the secondary chamber',
      'editorial',
      1800,
      1200,
      { fit: 'max' }
    ),
  },
];

export const objects = [
  {
    id: 'demo-mercedes-300-sl',
    slug: 'mercedes-benz-300-sl',
    name: 'Mercedes-Benz 300 SL',
    brand: 'Mercedes-Benz',
    productType: 'car',
    year: 1955,
    rarity: 'ICONIC',
    shortDescription:
      'The Gullwing coupe that defined postwar sports-car theatre — space-frame chassis, upward-hinging doors, and lasting collector myth.',
    images: [
      heroImg('photo-1772550327967-4d9123809a65', 'Silver Mercedes-Benz 300 SL Gullwing coupe'),
    ],
  },
  {
    id: 'demo-suzuki-cafe',
    slug: 'suzuki-cafe-racer',
    name: 'Suzuki Café Racer',
    brand: 'Suzuki',
    productType: 'motorcycle',
    year: 1975,
    rarity: 'COLLECTIBLE',
    shortDescription:
      'A stripped café-racer build — lean tank lines, clip-ons, and workshop craft over showroom gloss.',
    images: [
      heroImg('photo-1508349661974-9927dbd8399c', 'Custom Suzuki café racer motorcycle profile'),
    ],
  },
  {
    id: 'demo-patek-henry-graves',
    slug: 'patek-philippe-henry-graves-supercomplication',
    name: 'Patek Philippe Henry Graves Supercomplication',
    brand: 'Patek Philippe',
    productType: 'watch',
    year: 1933,
    rarity: 'UNIQUE',
    shortDescription:
      'A one-of-one custom pocket watch with 24 complications — over five years in the making in the 1930s, later trading above $24 million.',
    images: [
      heroImg(
        'photo-1509048191080-d2984bad6ae5',
        'Antique pocket watch — demonstration stand-in for the Henry Graves Supercomplication'
      ),
      img('photo-1587836374828-4dbafa94cf0e', 'Luxury watch dial study', 'detail'),
    ],
  },
  {
    id: 'demo-bugatti-chiron',
    slug: 'bugatti-chiron',
    name: 'Bugatti Chiron',
    brand: 'Bugatti',
    productType: 'car',
    year: 2016,
    rarity: 'ICONIC',
    shortDescription:
      'Molsheim’s modern hypercar — horseshoe grille, eight-eye lamps, and quad-turbo W16 theatre.',
    images: [
      heroImg('photo-1544636331-e26879cd4d9b', 'White Bugatti Chiron front study at night'),
    ],
  },
  {
    id: 'demo-harley-heritage',
    slug: 'harley-davidson-heritage',
    name: 'Harley-Davidson Heritage',
    brand: 'Harley-Davidson',
    productType: 'motorcycle',
    year: 1948,
    rarity: 'COLLECTIBLE',
    shortDescription:
      'Classic Milwaukee cruiser presence — tank badge, sprung seat language, and long-road character.',
    images: [
      heroImg('photo-1459372537964-e38c57a5e86f', 'Vintage Harley-Davidson motorcycle study'),
    ],
  },
  {
    id: 'demo-ferrari-f40',
    slug: 'ferrari-f40',
    name: 'Ferrari F40',
    brand: 'Ferrari',
    productType: 'car',
    year: 1987,
    rarity: 'ICONIC',
    shortDescription: 'Twin-turbo V8 legend — raw engineering made collectible myth.',
    images: [
      img('photo-1750712344309-b62744ffae18', 'Black Ferrari F40 on display', 'hero', 1600, 1200, {
        fit: 'max',
        objectPosition: 'center',
      }),
      img('photo-1726739569681-14cc0392b4bc', 'Red Ferrari F40 in garage light', 'gallery'),
      img('photo-1762111215490-0afdb55466c2', 'Cream Ferrari F40 on the street', 'gallery'),
    ],
  },
  {
    id: 'demo-porsche-911',
    slug: 'porsche-911-carrera',
    name: 'Porsche 911 Carrera 4',
    brand: 'Porsche',
    productType: 'car',
    year: 2019,
    rarity: 'COLLECTIBLE',
    shortDescription: 'The enduring 911 silhouette — precision, balance, and collector continuity.',
    images: [
      img('photo-1578911717720-4272f961231b', 'Porsche 911 Carrera 4 rear badge study', 'hero'),
    ],
  },
  {
    id: 'demo-lamborghini-huracan',
    slug: 'lamborghini-huracan',
    name: 'Lamborghini Huracán',
    brand: 'Lamborghini',
    productType: 'car',
    year: 2014,
    rarity: 'RARE',
    shortDescription: 'Sant’Agata V10 wedge — sharp lamps, hexagonal intakes, and modern bull geometry.',
    images: [
      img('photo-1519245659620-e859806a8d3b', 'Dark grey Lamborghini Huracán with racing stripes', 'hero'),
    ],
  },
  {
    id: 'demo-mclaren-p1',
    slug: 'mclaren-p1',
    name: 'McLaren P1',
    brand: 'McLaren',
    productType: 'car',
    year: 2013,
    rarity: 'ICONIC',
    shortDescription: 'Hybrid hypercar craftsmanship with motorsport bloodline.',
    images: [
      img('photo-1748028265529-0be0aee7f674', 'McLaren P1 displayed front view', 'hero'),
    ],
  },
  {
    id: 'demo-ducati-panigale',
    slug: 'ducati-panigale',
    name: 'Ducati Panigale V4',
    brand: 'Ducati',
    productType: 'motorcycle',
    year: 2018,
    rarity: 'COLLECTIBLE',
    shortDescription: 'Italian superbike form — winglet aero and Desmo character on asphalt.',
    images: [
      img('photo-1632157256334-518122d788bd', 'Red Ducati Panigale V4 on mountain road', 'hero'),
    ],
  },
  {
    id: 'demo-honda-scrambler',
    slug: 'honda-scrambler',
    name: 'Honda Scrambler',
    brand: 'Honda',
    productType: 'motorcycle',
    year: 1972,
    rarity: 'COLLECTIBLE',
    shortDescription: 'Custom Honda scrambler craft — knobby tires, wrapped exhaust, forest-road stance.',
    images: [
      img('photo-1502744688674-c619d1586c9e', 'Custom Honda scrambler on forest trail', 'hero'),
    ],
  },
  {
    id: 'demo-yamaha-yzf-r6',
    slug: 'yamaha-yzf-r6',
    name: 'Yamaha YZF-R6',
    brand: 'Yamaha',
    productType: 'motorcycle',
    year: 2008,
    rarity: 'COLLECTIBLE',
    shortDescription: 'Sculptural supersport craftsmanship with archival track presence.',
    images: [
      img('photo-1609630875171-b1321377ee65', 'Yamaha YZF-R6 orange and black superbike', 'hero'),
    ],
  },
  {
    id: 'demo-ktm-rc',
    slug: 'ktm-rc-390',
    name: 'KTM RC 390',
    brand: 'KTM',
    productType: 'motorcycle',
    year: 2014,
    rarity: 'COLLECTIBLE',
    shortDescription: 'Orange-framed Race Competition roadster energy for contemporary collectors.',
    images: [
      img('photo-1449426468159-d96dbf08f19f', 'KTM RC 390 sport motorcycle parked outdoors', 'hero'),
    ],
  },
  {
    id: 'demo-rolex-air-king',
    slug: 'rolex-air-king',
    name: 'Rolex Air-King',
    brand: 'Rolex',
    productType: 'watch',
    year: 1945,
    rarity: 'RARE',
    shortDescription: 'Aviation chronometer language preserved for collector study.',
    images: [
      img('photo-1547996160-81dfa63595aa', 'Rolex Air-King on book surface', 'hero'),
      img('photo-1622434641406-a158123450f9', 'Watch bracelet detail', 'detail'),
      img('photo-1609587312208-cea54be969e7', 'Sports chronograph editorial atmosphere', 'gallery'),
    ],
  },
  {
    id: 'demo-omega-seamaster',
    slug: 'omega-seamaster-planet-ocean',
    name: 'Omega Seamaster Planet Ocean',
    brand: 'Omega',
    productType: 'watch',
    year: 2005,
    rarity: 'ICONIC',
    shortDescription: 'Diving chronograph history with enduring archival significance.',
    images: [
      img('photo-1523170335258-f5ed11844a49', 'Omega Seamaster Planet Ocean chronograph', 'hero'),
      img('photo-1609587312208-cea54be969e7', 'Sports chronograph editorial pair', 'editorial'),
      img('photo-1594534475808-b18fc33b045e', 'Luxury watch case study', 'gallery'),
    ],
  },
  {
    id: 'demo-cartier-santos',
    slug: 'cartier-santos',
    name: 'Cartier Santos',
    brand: 'Cartier',
    productType: 'watch',
    year: 1904,
    rarity: 'COLLECTIBLE',
    shortDescription: 'Early pilot wristwatch geometry still shaping dress codes.',
    images: [
      img('photo-1523170335258-f5ed11844a49', 'Luxury wristwatch on dark surface', 'hero', 1400, 1400, {
        fit: 'max',
        objectPosition: 'center',
      }),
      img('photo-1622434641406-a158123450f9', 'Watch bracelet detail', 'detail'),
      img('photo-1614164185128-e4ec99c436d7', 'Watch dial editorial study', 'dial'),
    ],
  },
];

export const featuredCarId = 'demo-mercedes-300-sl';
export const featuredMotorcycleId = 'demo-harley-heritage';

export const curatedObjectIds = [
  'demo-mercedes-300-sl',
  'demo-bugatti-chiron',
  'demo-suzuki-cafe',
  'demo-harley-heritage',
  'demo-patek-henry-graves',
  'demo-ferrari-f40',
  'demo-ducati-panigale',
  'demo-omega-seamaster',
];

export const editorialStory = {
  type: 'The chamber',
  title: 'Where machines still matter',
  excerpt:
    'Step into a quieter room of asphalt memory and workshop craft — designed so every object feels like an occasion for attention, not a listing.',
  href: '/journal',
  cta: 'Enter the journal',
  image: img(
    'photo-1486262715619-67b85e0b08d3',
    'Workshop tools and mechanical craft demonstration photograph',
    'editorial',
    1400,
    1750
  ),
};

export const homeClose = {
  eyebrow: 'Your next step',
  title: 'Two ways into the tale.',
  paths: [
    {
      label: 'Discover',
      title: 'Browse the mixed feed',
      summary: 'Cars and motorcycles lead; watches follow. Shuffle and filter the archive.',
      href: '/discover',
      cta: 'Open discover',
    },
    {
      label: 'Journal',
      title: 'Read the stories',
      summary: 'Essays, model histories, and notes from the quieter side of collecting.',
      href: '/journal',
      cta: 'Open journal',
    },
  ],
};

export const brands = [
  { id: 'mercedes-benz', name: 'Mercedes-Benz', domain: 'car', country: 'Germany' },
  { id: 'bugatti', name: 'Bugatti', domain: 'car', country: 'France' },
  { id: 'suzuki', name: 'Suzuki', domain: 'motorcycle', country: 'Japan' },
  { id: 'harley-davidson', name: 'Harley-Davidson', domain: 'motorcycle', country: 'United States' },
  { id: 'patek-philippe', name: 'Patek Philippe', domain: 'watch', country: 'Switzerland' },
  { id: 'ferrari', name: 'Ferrari', domain: 'car', country: 'Italy' },
  { id: 'porsche', name: 'Porsche', domain: 'car', country: 'Germany' },
  { id: 'ducati', name: 'Ducati', domain: 'motorcycle', country: 'Italy' },
  { id: 'yamaha', name: 'Yamaha', domain: 'motorcycle', country: 'Japan' },
  { id: 'ktm', name: 'KTM', domain: 'motorcycle', country: 'Austria' },
  { id: 'mclaren', name: 'McLaren', domain: 'car', country: 'United Kingdom' },
  { id: 'rolex', name: 'Rolex', domain: 'watch', country: 'Switzerland' },
  { id: 'omega', name: 'Omega', domain: 'watch', country: 'Switzerland' },
  { id: 'honda', name: 'Honda', domain: 'motorcycle', country: 'Japan' },
  { id: 'lamborghini', name: 'Lamborghini', domain: 'car', country: 'Italy' },
  { id: 'cartier', name: 'Cartier', domain: 'watch', country: 'France' },
  { id: 'bmw-motorrad', name: 'BMW Motorrad', domain: 'motorcycle', country: 'Germany' },
];

export const journalArticles = [
  {
    id: 'essay-machines',
    type: 'Archive Essay',
    title: 'The private garage as museum',
    excerpt: 'How collectors curate mechanical memory beyond the sales floor.',
    image: img('photo-1726739569681-14cc0392b4bc', 'Ferrari garage archive atmosphere', 'editorial', 1200, 750),
  },
  {
    id: 'essay-ducati',
    type: 'Model History',
    title: 'Italian superbike memory',
    excerpt: 'Form, sound, and racing inheritance in one silhouette.',
    image: img('photo-1632157256334-518122d788bd', 'Ducati superbike journal plate', 'editorial', 1200, 750),
  },
  {
    id: 'essay-chronograph',
    type: 'Design Study',
    title: 'Chronographs that traveled',
    excerpt: 'Secondary domain notes on watches that earned archival attention.',
    image: img('photo-1523170335258-f5ed11844a49', 'Watch editorial demonstration plate', 'editorial', 1200, 750),
  },
];

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Discover', href: '/discover' },
  { label: 'Brands', href: '/brands' },
  { label: 'Categories', href: '/categories' },
  { label: 'Journal', href: '/journal' },
  { label: 'Collections', href: '/collections' },
];

export function getObjectById(id) {
  return objects.find((item) => item.id === id);
}

export function getObjectBySlug(slug) {
  return objects.find((item) => item.slug === slug);
}

export function getObjectsByIds(ids) {
  return ids.map((id) => getObjectById(id)).filter(Boolean);
}

export { getPrimaryImage, getSecondaryImage, getPublisher } from '../utils/archiveObject.js';

function shuffleArray(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

/**
 * Discover feed: cars + motorcycles lead; watches are woven in as secondary.
 * `shuffleKey` only forces a fresh shuffle when the user reshuffles.
 */
export function getShuffledDiscoverFeed(shuffleKey = 0) {
  void shuffleKey;
  const primary = shuffleArray(
    objects.filter((item) => item.productType === 'car' || item.productType === 'motorcycle')
  );
  const secondary = shuffleArray(objects.filter((item) => item.productType === 'watch'));
  const feed = [];
  let watchIndex = 0;

  primary.forEach((item, index) => {
    feed.push(item);
    if ((index + 1) % 3 === 0 && secondary[watchIndex]) {
      feed.push(secondary[watchIndex]);
      watchIndex += 1;
    }
  });

  while (watchIndex < secondary.length) {
    feed.push(secondary[watchIndex]);
    watchIndex += 1;
  }

  return feed;
}
