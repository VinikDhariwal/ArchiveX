import mongoose from 'mongoose';
import { CATALOG_STATUSES } from '../config/constants.js';

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: CATALOG_STATUSES, default: 'active', index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

tagSchema.index({ status: 1, deletedAt: 1, name: 1 });

export const Tag = mongoose.models.Tag || mongoose.model('Tag', tagSchema);
export default Tag;
