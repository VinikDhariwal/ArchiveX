import mongoose from 'mongoose';

const COLLECTION_VISIBILITY = Object.freeze(['private', 'shared', 'public']);

const collectionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 140 },
    description: { type: String, default: '', maxlength: 2000 },
    coverImage: { type: String, default: '' },
    visibility: {
      type: String,
      enum: COLLECTION_VISIBILITY,
      default: 'private',
      index: true,
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    objectCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

collectionSchema.index({ owner: 1, slug: 1 }, { unique: true });
collectionSchema.index({ owner: 1, updatedAt: -1 });

export { COLLECTION_VISIBILITY };
export const Collection =
  mongoose.models.Collection || mongoose.model('Collection', collectionSchema);
export default Collection;
