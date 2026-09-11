import mongoose from 'mongoose';
import { ALL_PRODUCT_TYPES, CATALOG_STATUSES } from '../config/constants.js';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '', maxlength: 2000 },
    productType: { type: String, enum: ALL_PRODUCT_TYPES, required: true, index: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    status: { type: String, enum: CATALOG_STATUSES, default: 'active', index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

categorySchema.index({ status: 1, deletedAt: 1, productType: 1, name: 1 });
categorySchema.index({ productType: 1, status: 1 });

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;
