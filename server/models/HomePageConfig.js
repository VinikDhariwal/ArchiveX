import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    alt: { type: String, default: '' },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    objectPosition: { type: String, default: 'center' },
  },
  { _id: false }
);

const ctaSchema = new mongoose.Schema(
  {
    label: { type: String, default: '' },
    href: { type: String, default: '/' },
  },
  { _id: false }
);

const domainChamberSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, default: '' },
    title: { type: String, default: '' },
    summary: { type: String, default: '' },
    href: { type: String, default: '/discover' },
    imageProductId: { type: String, default: '' },
    image: { type: imageSchema, default: () => ({}) },
  },
  { _id: false }
);

const featuredSlotSchema = new mongoose.Schema(
  {
    productId: { type: String, default: '' },
    productType: { type: String, default: '' },
    eyebrow: { type: String, default: '' },
    flipped: { type: Boolean, default: false },
  },
  { _id: false }
);

const closePathSchema = new mongoose.Schema(
  {
    label: { type: String, default: '' },
    title: { type: String, default: '' },
    summary: { type: String, default: '' },
    href: { type: String, default: '/' },
    cta: { type: String, default: '' },
  },
  { _id: false }
);

const homePageConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'home', index: true },
    hero: {
      enabled: { type: Boolean, default: true },
      brand: { type: String, default: 'ArchiveX' },
      headlineLine1: { type: String, default: '' },
      headlineLine2: { type: String, default: '' },
      lede: { type: String, default: '' },
      primaryCta: { type: ctaSchema, default: () => ({}) },
      plateProductIds: { type: [String], default: [] },
      fallbackPlates: { type: [mongoose.Schema.Types.Mixed], default: [] },
    },
    brands: {
      enabled: { type: Boolean, default: true },
      label: { type: String, default: 'The brands' },
      ctaLabel: { type: String, default: 'View all brands' },
      ctaHref: { type: String, default: '/brands' },
    },
    promise: {
      enabled: { type: Boolean, default: true },
      eyebrow: { type: String, default: '' },
      title: { type: String, default: '' },
      body: { type: String, default: '' },
      quote: { type: String, default: '' },
      quoteCredit: { type: String, default: '' },
    },
    domains: {
      enabled: { type: Boolean, default: true },
      meta: { type: String, default: 'The chambers' },
      title: { type: String, default: 'Explore domain by domain.' },
      lede: { type: String, default: '' },
      feedCtaLabel: { type: String, default: 'View the full feed' },
      feedCtaHref: { type: String, default: '/discover' },
      chambers: { type: [domainChamberSchema], default: [] },
    },
    signatures: {
      enabled: { type: Boolean, default: true },
      meta: { type: String, default: 'Catalogue plates' },
      title: { type: String, default: 'Objects with a story to tell.' },
      lede: { type: String, default: '' },
    },
    featured: {
      enabled: { type: Boolean, default: true },
      slots: { type: [featuredSlotSchema], default: [] },
    },
    editorial: {
      enabled: { type: Boolean, default: true },
      articleId: { type: String, default: '' },
      cta: { type: String, default: 'Continue reading' },
      type: { type: String, default: '' },
      title: { type: String, default: '' },
      excerpt: { type: String, default: '' },
      href: { type: String, default: '/journal' },
      image: { type: imageSchema, default: () => ({}) },
    },
    close: {
      enabled: { type: Boolean, default: true },
      eyebrow: { type: String, default: '' },
      title: { type: String, default: '' },
      paths: { type: [closePathSchema], default: [] },
    },
  },
  { timestamps: true }
);

export const HomePageConfig = mongoose.model('HomePageConfig', homePageConfigSchema);
