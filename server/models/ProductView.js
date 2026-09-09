import mongoose from 'mongoose';

/**
 * Lightweight view events for product detail intelligence.
 * Anonymous guests are tracked by sessionKey; authenticated users may pass userId later.
 */
const productViewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sessionKey: { type: String, default: null, maxlength: 120 },
    source: {
      type: String,
      enum: ['detail', 'modal', 'discover', 'home', 'other'],
      default: 'detail',
    },
    userAgent: { type: String, default: '', maxlength: 400 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

productViewSchema.index({ product: 1, createdAt: -1 });
productViewSchema.index({ sessionKey: 1, product: 1, createdAt: -1 });

export const ProductView =
  mongoose.models.ProductView || mongoose.model('ProductView', productViewSchema);
export default ProductView;
