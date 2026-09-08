/**
 * Phase 2 local demonstration content.
 * Product titles are aligned to brand-correct photography available for demo.
 * Each object has a multi-image gallery for detail viewing.
 * Not factual market claims.
 */
export const DEMO_DISCLAIMER =
  'Demonstration content for layout and discovery. Not a market valuation or current inventory claim.';

const img = (id, alt, type = 'gallery', width = 1400, height = 933, options = {}) => {
  const fit = options.fit || 'crop';
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
  lede:
    'Celebrating extraordinary cars and motorcycles — with luxury watches as a quieter second chamber — and the stories collectors return to.',
  primaryCta: { label: 'Begin the archive', href: '#promise' },
  secondaryCta: { label: 'Explore discover', href: '/discover' },
  tertiaryCta: { label: 'Read the journal', href: '/journal' },
  featuredSlug: 'mercedes-benz-300-slr-uhlenhaut-coupe',
  /** Hero stage: five ultra-rare archive objects only */
  plates: [
    {
      slug: 'mercedes-benz-300-slr-uhlenhaut-coupe',
      name: 'Mercedes-Benz 300 SLR Uhlenhaut Coupé',
      brand: 'Mercedes-Benz',
      year: 1955,
      rarity: 'ULTRA-RARE',
      image: heroImg(
        'photo-1772550327967-4d9123809a65',
        'Silver Mercedes-Benz 300-series coupe — demonstration stand-in for the Uhlenhaut Coupé',
        'center'
      ),
    },
    {
      slug: '1919-traub-motorcycle',
      name: '1919 Traub Motorcycle',
      brand: 'Traub',
      year: 1919,
      rarity: 'UNIQUE',
      image: heroImg(
        'photo-1508349661974-9927dbd8399c',
        'Vintage motorcycle profile — demonstration stand-in for the 1919 Traub',
        'center'
      ),
    },
    {
      slug: 'patek-philippe-henry-graves-supercomplication',
      name: 'Patek Philippe Henry Graves Supercomplication',
      brand: 'Patek Philippe',
      year: 1933,
      rarity: 'UNIQUE',
      image: heroImg(
        'photo-1509048191080-d2984bad6ae5',
        'Antique pocket watch — demonstration stand-in for the Henry Graves Supercomplication',
        'center'
      ),
    },
    {
      slug: 'bugatti-type-57sc-atlantic',
      name: 'Bugatti Type 57SC Atlantic',
      brand: 'Bugatti',
      year: 1936,
      rarity: 'ULTRA-RARE',
      image: heroImg(
        'photo-1707483413144-2db108cefb61',
        'Vintage Bugatti grille study — demonstration stand-in for the Type 57SC Atlantic',
        'center top'
      ),
    },
    {
      slug: '1916-cyclone-board-track-racer',
      name: '1916 Cyclone Board Track Racer',
      brand: 'Cyclone',
      year: 1916,
      rarity: 'ULTRA-RARE',
      image: heroImg(
        'photo-1459372537964-e38c57a5e86f',
        'Antique motorcycle study — demonstration stand-in for the 1916 Cyclone board tracker',
        'center'
      ),
    },
  ],
  image: heroImg(
    'photo-1772550327967-4d9123809a65',
    'Mercedes-Benz 300 SLR Uhlenhaut Coupé — rare archival hero object'
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
      'Silver Mercedes coupe in the automotive chamber',
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
      'Antique motorcycle in the two-wheel chamber',
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
    id: 'demo-mercedes-uhlenhaut',
    slug: 'mercedes-benz-300-slr-uhlenhaut-coupe',
    name: 'Mercedes-Benz 300 SLR Uhlenhaut Coupé',
    brand: 'Mercedes-Benz',
    productType: 'car',
    year: 1955,
    rarity: 'ULTRA-RARE',
    shortDescription:
      'Only two road-going coupés were built from the legendary 1950s racer — both survive. One set a public auction record near $142 million.',
    images: [
      heroImg(
        'photo-1772550327967-4d9123809a65',
        'Silver Mercedes-Benz 300-series coupe — demonstration stand-in for the Uhlenhaut Coupé'
      ),
      img('photo-1767023019012-30f747a1c87a', 'Classic silver Mercedes-Benz exhibition study', 'gallery'),
    ],
  },
  {
    id: 'demo-traub-1919',
    slug: '1919-traub-motorcycle',
    name: '1919 Traub Motorcycle',
    brand: 'Traub',
    productType: 'motorcycle',
    year: 1919,
    rarity: 'UNIQUE',
    shortDescription:
      'Exactly one known unit — discovered bricked inside a Chicago wall, with mechanical ideas years ahead of its time, and still running.',
    images: [
      heroImg(
        'photo-1508349661974-9927dbd8399c',
        'Vintage motorcycle profile — demonstration stand-in for the 1919 Traub'
      ),
      img('photo-1554975461-777d5f4c3c2f', 'Weathered vintage motorcycle tank detail', 'detail'),
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
    id: 'demo-bugatti-atlantic',
    slug: 'bugatti-type-57sc-atlantic',
    name: 'Bugatti Type 57SC Atlantic',
    brand: 'Bugatti',
    productType: 'car',
    year: 1936,
    rarity: 'ULTRA-RARE',
    shortDescription:
      'Jean Bugatti’s Art Deco masterpiece in riveted lightweight aluminium — four built, three accounted for; a holy grail among collectors.',
    images: [
      heroImg(
        'photo-1707483413144-2db108cefb61',
        'Vintage Bugatti grille study — demonstration stand-in for the Type 57SC Atlantic',
        'center top'
      ),
      img('photo-1519245659620-e859806a8d3b', 'Classic sports-car silhouette study', 'gallery'),
    ],
  },
  {
    id: 'demo-cyclone-1916',
    slug: '1916-cyclone-board-track-racer',
    name: '1916 Cyclone Board Track Racer',
    brand: 'Cyclone',
    productType: 'motorcycle',
    year: 1916,
    rarity: 'ULTRA-RARE',
    shortDescription:
      'Fewer than fourteen survivors worldwide — built for wooden board-track racing, with an overhead-cam V-twin at the peak of early American race engineering.',
    images: [
      heroImg(
        'photo-1459372537964-e38c57a5e86f',
        'Antique motorcycle study — demonstration stand-in for the 1916 Cyclone board tracker'
      ),
      img('photo-1558980664-769d59546b3d', 'Motorcycle motion study', 'gallery'),
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
      img('photo-1762111215490-0afdb55466c2', 'White Ferrari F40 on the street', 'hero'),
      img('photo-1750712344309-b62744ffae18', 'Black Ferrari F40 on display', 'gallery'),
      img('photo-1726739569681-14cc0392b4bc', 'Red Ferrari F40 in garage light', 'gallery'),
    ],
  },
  {
    id: 'demo-porsche-911',
    slug: 'porsche-911-carrera',
    name: 'Porsche 911 Carrera',
    brand: 'Porsche',
    productType: 'car',
    year: 2019,
    rarity: 'COLLECTIBLE',
    shortDescription: 'The enduring 911 silhouette — precision, balance, and collector continuity.',
    images: [
      img('photo-1578911717720-4272f961231b', 'Porsche 911 Carrera rear three-quarter', 'hero'),
      img('photo-1503376780353-7e6692767b70', 'Black Porsche 911 profile', 'gallery'),
    ],
  },
  {
    id: 'demo-lamborghini-aventador',
    slug: 'lamborghini-aventador',
    name: 'Lamborghini Aventador',
    brand: 'Lamborghini',
    productType: 'car',
    year: 2011,
    rarity: 'RARE',
    shortDescription: 'V12 wedge geometry that carried Sant’Agata into the modern era.',
    images: [
      img('photo-1617654114261-45f3cd39ce87', 'Lamborghini Aventador exterior', 'hero'),
      img('photo-1618264362598-b7e844dd037f', 'Lamborghini Aventador parked study', 'gallery'),
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
      img('photo-1748091677506-6d7147d3b688', 'McLaren with dihedral doors open', 'gallery'),
      img('photo-1748028265529-0be0aee7f674', 'McLaren P1 detail crop study', 'detail'),
    ],
  },
  {
    id: 'demo-ducati-panigale',
    slug: 'ducati-panigale',
    name: 'Ducati Panigale',
    brand: 'Ducati',
    productType: 'motorcycle',
    year: 2011,
    rarity: 'COLLECTIBLE',
    shortDescription: 'Italian superbike form — successor spirit to the 916 lineage.',
    images: [
      img('photo-1632157256334-518122d788bd', 'Ducati superbike on mountain road', 'hero'),
      img('photo-1760716801761-a2b7bd687979', 'Red Ducati Monster parked', 'gallery'),
      img('photo-1568772585407-9361f9bf3a87', 'Red Ducati in garage light', 'side'),
    ],
  },
  {
    id: 'demo-honda-cb750',
    slug: 'honda-cb750',
    name: 'Honda CB750',
    brand: 'Honda',
    productType: 'motorcycle',
    year: 1969,
    rarity: 'COLLECTIBLE',
    shortDescription: 'The four-cylinder machine that opened modern motorcycle ambition.',
    images: [
      img('photo-1502744688674-c619d1586c9e', 'Honda motorcycle on forest trail', 'hero'),
      img('photo-1558981359-219d6364c9c8', 'Motorcycle cockpit detail', 'detail'),
      img('photo-1558981806-ec527fa84c39', 'Motorcycle on open road', 'gallery'),
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
      img('photo-1558981359-219d6364c9c8', 'Motorcycle cockpit detail', 'detail'),
      img('photo-1558981806-ec527fa84c39', 'Sport motorcycle on open road', 'gallery'),
    ],
  },
  {
    id: 'demo-ktm-rc',
    slug: 'ktm-rc',
    name: 'KTM RC',
    brand: 'KTM',
    productType: 'motorcycle',
    year: 2014,
    rarity: 'COLLECTIBLE',
    shortDescription: 'Sharp orange-framed roadster energy shaped for contemporary collectors.',
    images: [
      img('photo-1449426468159-d96dbf08f19f', 'KTM RC sport motorcycle parked outdoors', 'hero'),
      img('photo-1558981403-c5f9899a28bc', 'Modern motorcycle street study', 'gallery'),
      img('photo-1558981359-219d6364c9c8', 'Motorcycle cockpit study', 'detail'),
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
      img('photo-1594534475808-b18fc33b045e', 'Square luxury watch hero plate', 'hero'),
      img('photo-1622434641406-a158123450f9', 'Watch bracelet detail', 'detail'),
      img('photo-1611930022073-b7a4ba5fcccd', 'Watch dial editorial study', 'dial'),
    ],
  },
];

export const featuredCarId = 'demo-mercedes-uhlenhaut';
export const featuredMotorcycleId = 'demo-traub-1919';

export const curatedObjectIds = [
  'demo-mercedes-uhlenhaut',
  'demo-bugatti-atlantic',
  'demo-traub-1919',
  'demo-cyclone-1916',
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
      summary: 'Cars and motorcycles lead; watches follow. Shuffle, filter, compare.',
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
  { id: 'traub', name: 'Traub', domain: 'motorcycle', country: 'United States' },
  { id: 'cyclone', name: 'Cyclone', domain: 'motorcycle', country: 'United States' },
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

export function getPrimaryImage(object) {
  if (!object?.images?.length) return null;
  return object.images.find((item) => item.type === 'hero') || object.images[0];
}

export function getSecondaryImage(object) {
  if (!object?.images?.length || object.images.length < 2) return null;
  return object.images.find((item) => item.type !== 'hero') || object.images[1];
}

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
