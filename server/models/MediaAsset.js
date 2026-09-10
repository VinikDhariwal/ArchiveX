import mongoose from 'mongoose';
import { IMAGE_TYPES } from '../config/constants.js';

const mediaAssetSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    filename: { type: String, required: true, trim: true },
    originalName: { type: String, default: '', trim: true },
    mimeType: { type: String, default: '', trim: true },
    size: { type: Number, default: 0 },
    alt: { type: String, default: '', maxlength: 240 },
    type: { type: String, enum: IMAGE_TYPES, default: 'gallery', index: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    storageKey: { type: String, required: true, trim: true },
    gridFsId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

mediaAssetSchema.index({ createdAt: -1 });

export const MediaAsset =
  mongoose.models.MediaAsset || mongoose.model('MediaAsset', mediaAssetSchema);
export default MediaAsset;
