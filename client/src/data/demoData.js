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

export const archiveStats = {
  archiveId: 'ARCHIVE 001',
  objectCount: '1,284',
  brandCount: '220',
  lastUpdated: '08.09.2026',
};

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
    url: 'https://images.unsplash.com/photo-1518998053901-536d6e6040ff?auto=format&fit=crop&w=1800&q=80',
    alt: 'Soft museum gallery architecture wash',
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
      img('photo-1760716801761-a2b7bd687979', 'Red Ducati motorcycle parked', 'gallery'),
      img('photo-1558981806-ec527fa84c39', 'Sport motorcycle side study', 'side'),
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
      img('photo-1558981403-c5f9899a28bc', 'Classic motorcycle demonstration plate', 'hero'),
      img('photo-1449426468159-d96dbf08f19f', 'Motorcycle side profile', 'side'),
      img('photo-1558981359-219d6364c9c8', 'Motorcycle cockpit detail', 'detail'),
    ],
  },
  {
    id: 'demo-mv-agusta-f4',
    slug: 'mv-agusta-f4',
    name: 'MV Agusta F4',
    brand: 'MV Agusta',
    productType: 'motorcycle',
    year: 1999,
    rarity: 'VERY RARE',
    shortDescription: 'Sculptural superbike craftsmanship with archival presence.',
    images: [
      img('photo-1571068316344-75bc76f77890', 'Red sport motorcycle plate', 'hero'),
      img('photo-1609630875171-b1321377ee65', 'Motorcycle mechanical detail', 'detail'),
      img('photo-1568772585407-9361f9bf3a87', 'Motorcycle archival atmosphere', 'gallery'),
    ],
  },
  {
    id: 'demo-bmw-r-ninet',
    slug: 'bmw-r-ninet',
    name: 'BMW R nineT',
    brand: 'BMW Motorrad',
    productType: 'motorcycle',
    year: 2014,
    rarity: 'COLLECTIBLE',
    shortDescription: 'Modern heritage roadster shaped for contemporary collectors.',
    images: [
      img('photo-1525160357955-59457d5d0f66', 'Heritage motorcycle wheel and tank', 'hero'),
      img('photo-1558981359-219d6364c9c8', 'Motorcycle cockpit study', 'detail'),
      img('photo-1558981403-c5f9899a28bc', 'Roadster motorcycle atmosphere', 'gallery'),
    ],
  },
  {
    id: 'demo-rolex-gmt-master-ii',
    slug: 'rolex-gmt-master-ii',
    name: 'Rolex GMT-Master II',
    brand: 'Rolex',
    productType: 'watch',
    year: 1983,
    rarity: 'RARE',
    shortDescription: 'Travel chronometer language preserved for collector study.',
    images: [
      img('photo-1523170335258-f5ed11844a49', 'Steel sports watch hero plate', 'hero'),
      img('photo-1547996160-81dfa63595aa', 'Watch dial close study', 'dial'),
      img('photo-1587836374828-4eba366e0c3d', 'Watch on surface editorial', 'editorial'),
    ],
  },
  {
    id: 'demo-omega-speedmaster',
    slug: 'omega-speedmaster',
    name: 'Omega Speedmaster',
    brand: 'Omega',
    productType: 'watch',
    year: 1957,
    rarity: 'ICONIC',
    shortDescription: 'Chronograph history with enduring archival significance.',
    images: [
      img('photo-1614164185128-c4f587235c8c', 'Chronograph watch hero plate', 'hero'),
      img('photo-1587836374828-4eba366e0c3d', 'Watch editorial surface study', 'editorial'),
      img('photo-1523170335258-f5ed11844a49', 'Sports watch atmosphere', 'gallery'),
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
      img('photo-1547996160-81dfa63595aa', 'Watch dial study', 'dial'),
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
  'demo-mv-agusta-f4',
  'demo-bmw-r-ninet',
  'demo-omega-speedmaster',
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
  { id: 'bmw-motorrad', name: 'BMW Motorrad', domain: 'motorcycle', country: 'Germany' },
  { id: 'mclaren', name: 'McLaren', domain: 'car', country: 'United Kingdom' },
  { id: 'rolex', name: 'Rolex', domain: 'watch', country: 'Switzerland' },
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
