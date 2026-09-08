/**
 * Phase 2 local demonstration content.
 * Product titles are aligned to brand-correct photography available for demo.
 * Each object has a multi-image gallery for detail viewing.
 * Not factual market claims.
 */
export const DEMO_DISCLAIMER =
  'Demonstration content for layout and discovery. Not a market valuation or current inventory claim.';

const img = (id, alt, type = 'gallery', width = 1400, height = 933) => ({
  url: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`,
  alt,
  type,
  width,
  height,
});

export const hero = {
  brand: 'ArchiveX',
  kicker: 'The archive',
  headlineLine1: 'Objects',
  headlineLine2: 'worth remembering.',
  lede:
    'A living archive of extraordinary cars, motorcycles, and watches — and the stories behind the objects collectors keep.',
  primaryCta: { label: 'Explore archive', href: '/discover' },
  secondaryCta: { label: 'Read the journal', href: '/journal' },
  featuredSlug: 'ferrari-f40',
  image: img(
    'photo-1750712344309-b62744ffae18',
    'Ferrari F40 on museum display — rare archival hero object',
    'hero',
    1200,
    1500
  ),
  galleryBackground: {
    url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=70',
    alt: 'Soft architectural wash',
  },
};

export const objects = [
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
      img('photo-1750712344309-b62744ffae18', 'Ferrari F40 on display', 'hero'),
      img('photo-1726739569681-14cc0392b4bc', 'Ferrari F40 in garage light', 'gallery'),
      img('photo-1762111215490-0afdb55466c2', 'Ferrari F40 on the street', 'gallery'),
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

export const featuredCarId = 'demo-ferrari-f40';
export const featuredMotorcycleId = 'demo-ducati-panigale';

export const curatedObjectIds = [
  'demo-porsche-911',
  'demo-lamborghini-aventador',
  'demo-mclaren-p1',
  'demo-honda-cb750',
  'demo-yamaha-yzf-r6',
  'demo-ktm-rc',
  'demo-omega-seamaster',
  'demo-cartier-santos',
];

export const editorialStory = {
  type: 'Archive Essay',
  title: 'Why machines still matter',
  excerpt:
    'Between asphalt memory and workshop craft, ArchiveX studies the objects collectors return to — not as merchandise, but as evidence of design, engineering, and culture.',
  href: '/journal',
  image: img(
    'photo-1486262715619-67b85e0b08d3',
    'Workshop tools and mechanical craft demonstration photograph',
    'editorial',
    1400,
    1750
  ),
};

export const brands = [
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
