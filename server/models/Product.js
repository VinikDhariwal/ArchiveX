import mongoose from 'mongoose';
import {
  ALL_PRODUCT_TYPES,
  AVAILABILITY_VALUES,
  IMAGE_TYPES,
  PRODUCT_STATUSES,
  RARITY_VALUES,
  SPEC_DOMAINS,
} from '../config/constants.js';
import { assertValidSpecifications } from './shared/productSubdocuments.js';

const productImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    type: { type: String, enum: IMAGE_TYPES, default: 'gallery' },
    sortOrder: { type: Number, default: 0 },
    width: Number,
    height: Number,
  },
  { _id: false }
);

const specificationsSchema = new mongoose.Schema(
  {
    domain: { type: String, enum: Object.values(SPEC_DOMAINS) },
    productType: { type: String, enum: ALL_PRODUCT_TYPES },
    fields: { type: Map, of: String, default: {} },
  },
  { _id: false }
);

const rarityProfileSchema = new mongoose.Schema(
  {
    productionHistory: { type: String, default: '' },
    collectorInterest: { type: String, default: '' },
    historicalSignificance: { type: String, default: '' },
  },
  { _id: false }
);

const marketSignalsSchema = new mongoose.Schema(
  {
    archiveEstimate: { type: String, default: '' },
    marketRange: { type: String, default: '' },
    collectorInterest: { type: String, default: '' },
    availabilitySignal: { type: String, default: '' },
    priceMovement: { type: String, default: '' },
    lastUpdated: { type: Date, default: null },
    disclaimer: {
      type: String,
      default:
        'Informational archive signals only — not a guarantee of price, availability, or investment outcome.',
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 220 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    reference: { type: String, trim: true, maxlength: 80 },
    productType: { type: String, enum: ALL_PRODUCT_TYPES, required: true, index: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    shortDescription: { type: String, default: '', maxlength: 500 },
    description: { type: String, default: '', maxlength: 20000 },
    whyItMatters: { type: String, default: '', maxlength: 8000 },
    releaseYear: { type: Number, min: 1200, max: 3000 },
    productionPeriod: { type: String, maxlength: 120 },
    rarity: { type: String, enum: RARITY_VALUES, default: 'COLLECTIBLE', index: true },
    availability: { type: String, enum: AVAILABILITY_VALUES, default: 'unknown' },
    featured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: PRODUCT_STATUSES, default: 'pending', index: true },
    publisher: { type: String, default: 'ArchiveX', maxlength: 120 },
    materials: [{ type: String, maxlength: 80 }],
    colors: [{ type: String, maxlength: 80 }],
    images: { type: [productImageSchema], default: [] },
    specifications: { type: specificationsSchema, default: undefined },
    rarityProfile: { type: rarityProfileSchema, default: undefined },
    marketSignals: { type: marketSignalsSchema, default: undefined },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

productSchema.index({ productType: 1, status: 1, featured: -1 });
productSchema.index({ brand: 1, status: 1 });
productSchema.index({ rarity: 1, status: 1 });
productSchema.index({ releaseYear: -1, status: 1 });
productSchema.index({ submittedBy: 1, status: 1 });
productSchema.index({
  name: 'text',
  reference: 'text',
  shortDescription: 'text',
  description: 'text',
});

productSchema.pre('validate', function validateSpecs() {
  if (!this.specifications) return;
  let fields = this.specifications.fields;
  if (fields instanceof Map) fields = Object.fromEntries(fields);
  assertValidSpecifications(this.productType, {
    domain: this.specifications.domain,
    productType: this.specifications.productType,
    fields: fields || {},
  });
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
