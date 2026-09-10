import path from 'node:path';
import mongoose from 'mongoose';
import multer from 'multer';
import { Readable } from 'node:stream';
import env from '../config/env.js';
import { IMAGE_TYPES } from '../config/constants.js';
import { MediaAsset } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { recordAudit } from './auditService.js';

const BUCKET = 'archivex_media';

function getBucket() {
  if (mongoose.connection.readyState !== 1) {
    throw new ApiError('Database unavailable for media storage', 503, 'DB_UNAVAILABLE');
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKET });
}

function publicUrlFor(assetId) {
  return `${env.publicOrigin}/api/${env.apiVersion}/media/files/${assetId}`;
}

function serializeMedia(doc) {
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: String(plain._id),
    url: plain.url,
    filename: plain.filename,
    originalName: plain.originalName || '',
    mimeType: plain.mimeType || '',
    size: plain.size || 0,
    alt: plain.alt || '',
    type: plain.type || 'gallery',
    width: plain.width ?? null,
    height: plain.height ?? null,
    storage: String(plain.storageKey || '').startsWith('remote:') ? 'remote' : 'atlas',
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

function fileFilter(_req, file, cb) {
  if (!file.mimetype?.startsWith('image/')) {
    cb(new ApiError('Only image uploads are allowed', 400, 'INVALID_MEDIA_TYPE'));
    return;
  }
  cb(null, true);
}

/** Memory upload — bytes are written to Atlas GridFS, not local disk. */
export const mediaUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: env.mediaMaxBytes, files: 1 },
});

async function writeBufferToGridFs({ buffer, filename, contentType, metadata = {} }) {
  const bucket = getBucket();
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata,
    });
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => resolve(uploadStream.id));
    Readable.from(buffer).pipe(uploadStream);
  });
}

async function deleteGridFsFile(fileId) {
  if (!fileId || !mongoose.isValidObjectId(fileId)) return;
  try {
    await getBucket().delete(new mongoose.Types.ObjectId(String(fileId)));
  } catch {
    /* already gone */
  }
}

export async function listMediaAssets({ limit = 60, type } = {}) {
  const filter = { deletedAt: null };
  if (type && IMAGE_TYPES.includes(type)) filter.type = type;
  const capped = Math.min(Math.max(Number(limit) || 60, 1), 120);
  const rows = await MediaAsset.find(filter).sort({ createdAt: -1 }).limit(capped).lean();
  return rows.map(serializeMedia);
}

export async function createMediaFromUpload(actorId, file, meta = {}) {
  if (!file?.buffer?.length) throw new ApiError('Image file is required', 400, 'MEDIA_REQUIRED');

  const type = IMAGE_TYPES.includes(meta.type) ? meta.type : 'gallery';
  const alt = String(meta.alt || '').trim();
  const ext = path.extname(file.originalname || '').toLowerCase().slice(0, 12);
  const safeExt = /^\.(jpe?g|png|webp|gif)$/i.test(ext) ? ext.toLowerCase() : '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;

  const gridFsId = await writeBufferToGridFs({
    buffer: file.buffer,
    filename,
    contentType: file.mimetype || 'application/octet-stream',
    metadata: { alt, type, uploadedBy: actorId ? String(actorId) : null },
  });

  const asset = await MediaAsset.create({
    url: 'pending',
    filename,
    originalName: file.originalname || '',
    mimeType: file.mimetype || '',
    size: file.size || file.buffer.length || 0,
    alt,
    type,
    storageKey: `gridfs:${gridFsId}`,
    gridFsId,
    uploadedBy: actorId || undefined,
  });

  asset.url = publicUrlFor(asset._id);
  await asset.save();

  await recordAudit({
    actorId,
    action: 'media.upload',
    entityType: 'media',
    entityId: asset._id,
    summary: `Uploaded ${asset.originalName || asset.filename} to Atlas GridFS`,
  });

  return serializeMedia(asset);
}

export async function createMediaFromUrl(actorId, payload = {}) {
  const url = String(payload.url || '').trim();
  if (!url) throw new ApiError('URL is required', 400, 'URL_REQUIRED');
  try {
    // eslint-disable-next-line no-new
    new URL(url);
  } catch {
    throw new ApiError('A valid absolute URL is required', 400, 'INVALID_URL');
  }

  const type = IMAGE_TYPES.includes(payload.type) ? payload.type : 'gallery';
  const alt = String(payload.alt || '').trim();
  const filename = path.basename(new URL(url).pathname) || `remote-${Date.now()}`;

  const asset = await MediaAsset.create({
    url,
    filename,
    originalName: filename,
    mimeType: '',
    size: 0,
    alt,
    type,
    storageKey: `remote:${url}`,
    uploadedBy: actorId || undefined,
  });

  await recordAudit({
    actorId,
    action: 'media.register',
    entityType: 'media',
    entityId: asset._id,
    summary: `Registered remote media ${url}`,
  });

  return serializeMedia(asset);
}

export async function deleteMediaAsset(actorId, id) {
  const asset = await MediaAsset.findOne({ _id: id, deletedAt: null });
  if (!asset) throw new ApiError('Media not found', 404, 'MEDIA_NOT_FOUND');

  asset.deletedAt = new Date();
  await asset.save();

  if (asset.gridFsId) {
    await deleteGridFsFile(asset.gridFsId);
  }

  await recordAudit({
    actorId,
    action: 'media.delete',
    entityType: 'media',
    entityId: asset._id,
    summary: `Deleted media ${asset.originalName || asset.filename}`,
  });

  return { id: String(asset._id), deleted: true };
}

/** Stream an Atlas-stored image for public <img> tags. */
export async function openMediaReadStream(assetId) {
  if (!mongoose.isValidObjectId(assetId)) {
    throw new ApiError('Invalid media id', 400, 'INVALID_ID');
  }
  const asset = await MediaAsset.findOne({ _id: assetId, deletedAt: null }).lean();
  if (!asset || !asset.gridFsId) {
    throw new ApiError('Media not found', 404, 'MEDIA_NOT_FOUND');
  }

  const bucket = getBucket();
  const files = await bucket.find({ _id: new mongoose.Types.ObjectId(String(asset.gridFsId)) }).toArray();
  if (!files.length) {
    throw new ApiError('Media file missing in Atlas', 404, 'MEDIA_BLOB_MISSING');
  }

  return {
    stream: bucket.openDownloadStream(files[0]._id),
    contentType: asset.mimeType || files[0].contentType || 'application/octet-stream',
    filename: asset.filename,
    size: asset.size || files[0].length || undefined,
  };
}
