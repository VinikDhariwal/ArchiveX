import mongoose from 'mongoose';
import {
  ALL_PRODUCT_TYPES,
  ARTICLE_STATUSES,
  ARTICLE_TYPES,
  IMAGE_TYPES,
} from '../config/constants.js';

const articleImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    type: { type: String, enum: IMAGE_TYPES, default: 'editorial' },
    sortOrder: { type: Number, default: 0 },
    width: Number,
    height: Number,
  },
  { _id: false }
);

const articleSectionSchema = new mongoose.Schema(
  {
    heading: { type: String, default: '', maxlength: 220 },
    body: { type: String, required: true, maxlength: 20000 },
  },
  { _id: false }
);

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 220 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    articleType: {
      type: String,
      enum: ARTICLE_TYPES,
      default: 'Archive Essay',
      index: true,
    },
    excerpt: { type: String, default: '', maxlength: 600 },
    heroImage: { type: articleImageSchema, default: undefined },
    sections: { type: [articleSectionSchema], default: [] },
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true }],
    domains: [{ type: String, enum: ALL_PRODUCT_TYPES }],
    status: { type: String, enum: ARTICLE_STATUSES, default: 'draft', index: true },
    publisher: { type: String, default: 'ArchiveX', maxlength: 120 },
    byline: { type: String, default: 'ArchiveX Editorial', maxlength: 120 },
    publishedAt: { type: Date, default: null, index: true },
    featured: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

articleSchema.index({ status: 1, deletedAt: 1, featured: -1, publishedAt: -1 });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ articleType: 1, status: 1 });
articleSchema.index({
  title: 'text',
  excerpt: 'text',
});

export const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);
export default Article;
