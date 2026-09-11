/** Seed defaults for HomePageConfig — mirrors client demoData museum copy. */

const unsplash = (id, alt, width = 1600, height = 1200) => ({
  url: `https://images.unsplash.com/${id}?auto=format&fit=max&w=${width}&q=80`,
  alt,
  width,
  height,
  objectPosition: 'center',
});

export function buildHomeDefaults() {
  return {
    key: 'home',
    hero: {
      enabled: true,
      brand: 'ArchiveX',
      headlineLine1: 'Objects',
      headlineLine2: 'worth remembering.',
      lede: 'A digital museum for extraordinary cars and motorcycles.',
      primaryCta: { label: 'Explore the archive', href: '/discover' },
      plateProductIds: [],
      fallbackPlates: [
        {
          slug: 'mercedes-benz-300-sl',
          name: 'Mercedes-Benz 300 SL',
          brand: 'Mercedes-Benz',
          year: 1955,
          productType: 'car',
          rarity: 'ICONIC',
          image: unsplash(
            'photo-1772550327967-4d9123809a65',
            'Silver Mercedes-Benz 300 SL Gullwing coupe'
          ),
        },
        {
          slug: 'suzuki-cafe-racer',
          name: 'Suzuki Café Racer',
          brand: 'Suzuki',
          year: 1975,
          productType: 'motorcycle',
          rarity: 'COLLECTIBLE',
          image: unsplash(
            'photo-1508349661974-9927dbd8399c',
            'Custom Suzuki café racer motorcycle profile'
          ),
        },
        {
          slug: 'bugatti-chiron',
          name: 'Bugatti Chiron',
          brand: 'Bugatti',
          year: 2016,
          productType: 'car',
          rarity: 'ICONIC',
          image: unsplash(
            'photo-1544636331-e26879cd4d9b',
            'White Bugatti Chiron front study at night'
          ),
        },
        {
          slug: 'harley-davidson-heritage',
          name: 'Harley-Davidson Heritage',
          brand: 'Harley-Davidson',
          year: 1948,
          productType: 'motorcycle',
          rarity: 'COLLECTIBLE',
          image: unsplash(
            'photo-1459372537964-e38c57a5e86f',
            'Vintage Harley-Davidson motorcycle study'
          ),
        },
      ],
    },
    brands: {
      enabled: true,
      label: 'The brands',
      ctaLabel: 'View all brands',
      ctaHref: '/brands',
    },
    promise: {
      enabled: true,
      eyebrow: 'What is ArchiveX?',
      title: 'A chamber for objects with a tale.',
      body: 'Every extraordinary machine carries origin, craft, performance, and provenance. ArchiveX studies those stories — not as merchandise, but as design, engineering, and collector memory.',
      quote:
        'ArchiveX is a place of discovery, of comparison, of quiet study, and of lasting attention. Let the archive begin…',
      quoteCredit: 'The ArchiveX promise',
    },
    domains: {
      enabled: true,
      meta: 'The chambers',
      title: 'Explore domain by domain.',
      lede: 'Cars and motorcycles lead the archive. Watches remain a fully supported second chamber.',
      feedCtaLabel: 'View the full feed',
      feedCtaHref: '/discover',
      chambers: [
        {
          id: 'car',
          label: 'Cars',
          title: 'Automotive icons',
          summary: 'Scarce silhouettes, engineering lore, and the machines collectors keep.',
          href: '/discover?domain=car',
          imageProductId: '',
          image: unsplash(
            'photo-1772550327967-4d9123809a65',
            'Silver Mercedes-Benz 300 SL in the automotive chamber',
            1800,
            1200
          ),
        },
        {
          id: 'motorcycle',
          label: 'Motorcycles',
          title: 'Two-wheel craft',
          summary: 'Superbikes and heritage roadsters with sculptural presence.',
          href: '/discover?domain=motorcycle',
          imageProductId: '',
          image: unsplash(
            'photo-1459372537964-e38c57a5e86f',
            'Vintage Harley-Davidson in the two-wheel chamber',
            1800,
            1200
          ),
        },
        {
          id: 'watch',
          label: 'Watches',
          title: 'Secondary chamber',
          summary: 'Luxury timepieces kept in the archive — important, never dominant.',
          href: '/discover?domain=watch',
          imageProductId: '',
          image: unsplash(
            'photo-1509048191080-d2984bad6ae5',
            'Antique pocket watch in the secondary chamber',
            1800,
            1200
          ),
        },
      ],
    },
    signatures: {
      enabled: true,
      meta: 'Catalogue plates',
      title: 'Objects with a story to tell.',
      lede: 'Automotive first, then two wheels — plates from the public archive.',
    },
    featured: {
      enabled: true,
      slots: [
        {
          productId: '',
          productType: 'car',
          eyebrow: 'Plate · Automotive',
          flipped: false,
        },
        {
          productId: '',
          productType: 'motorcycle',
          eyebrow: 'Plate · Motorcycle',
          flipped: true,
        },
      ],
    },
    editorial: {
      enabled: true,
      articleId: '',
      cta: 'Continue reading',
      type: 'The chamber',
      title: 'Where machines still matter',
      excerpt:
        'Step into a quieter room of asphalt memory and workshop craft — designed so every object feels like an occasion for attention, not a listing.',
      href: '/journal',
      image: unsplash(
        'photo-1486262715619-67b85e0b08d3',
        'Workshop tools and mechanical craft demonstration photograph',
        1400,
        1750
      ),
    },
    close: {
      enabled: true,
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
    },
  };
}
