import mongoose from 'mongoose';
import { ALL_PRODUCT_TYPES, CATALOG_STATUSES, IMAGE_TYPES } from '../config/constants.js';

const brandImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    type: { type: String, enum: IMAGE_TYPES, default: 'other' },
    sortOrder: { type: Number, default: 0 },
    width: Number,
    height: Number,
  },
  { _id: false }
);

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '', maxlength: 4000 },
    foundedYear: { type: Number, min: 1200, max: 3000 },
    country: { type: String, trim: true, maxlength: 120 },
    primaryDomains: {
      type: [{ type: String, enum: ALL_PRODUCT_TYPES }],
      default: [],
    },
    logo: brandImageSchema,
    /** First product hero plate — denormalized at seed for fast Brands index. */
    coverImage: brandImageSchema,
    status: { type: String, enum: CATALOG_STATUSES, default: 'active', index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

brandSchema.index({ name: 1 });

export const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);
export default Brand;
