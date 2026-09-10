import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import env from '../config/env.js';
import { IMAGE_TYPES } from '../config/constants.js';
import { MediaAsset } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { recordAudit } from './auditService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.resolve(__dirname, '..', env.mediaUploadDir);

function ensureUploadRoot() {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

function publicUrlFor(filename) {
  return `${env.publicOrigin}${env.mediaPublicPath}/${filename}`;
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
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    try {
      ensureUploadRoot();
      cb(null, uploadRoot);
    } catch (error) {
      cb(error);
    }
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase().slice(0, 12);
    const safeExt = /^\.(jpe?g|png|webp|gif)$/i.test(ext) ? ext.toLowerCase() : '.jpg';
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    cb(null, `${stamp}${safeExt}`);
  },
});

function fileFilter(_req, file, cb) {
  if (!file.mimetype?.startsWith('image/')) {
    cb(new ApiError('Only image uploads are allowed', 400, 'INVALID_MEDIA_TYPE'));
    return;
  }
  cb(null, true);
}

export const mediaUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.mediaMaxBytes, files: 1 },
});

export function getUploadRoot() {
  ensureUploadRoot();
  return uploadRoot;
}

export async function listMediaAssets({ limit = 60, type } = {}) {
  const filter = { deletedAt: null };
  if (type && IMAGE_TYPES.includes(type)) filter.type = type;
  const capped = Math.min(Math.max(Number(limit) || 60, 1), 120);
  const rows = await MediaAsset.find(filter).sort({ createdAt: -1 }).limit(capped).lean();
  return rows.map(serializeMedia);
}

export async function createMediaFromUpload(actorId, file, meta = {}) {
  if (!file) throw new ApiError('Image file is required', 400, 'MEDIA_REQUIRED');

  const type = IMAGE_TYPES.includes(meta.type) ? meta.type : 'gallery';
  const alt = String(meta.alt || '').trim();
  const url = publicUrlFor(file.filename);

  const asset = await MediaAsset.create({
    url,
    filename: file.filename,
    originalName: file.originalname || '',
    mimeType: file.mimetype || '',
    size: file.size || 0,
    alt,
    type,
    storageKey: file.filename,
    uploadedBy: actorId || undefined,
  });

  await recordAudit({
    actorId,
    action: 'media.upload',
    entityType: 'media',
    entityId: asset._id,
    summary: `Uploaded ${asset.originalName || asset.filename}`,
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

  if (!String(asset.storageKey || '').startsWith('remote:')) {
    const diskPath = path.join(uploadRoot, asset.storageKey);
    try {
      await fs.promises.unlink(diskPath);
    } catch {
      /* file may already be gone */
    }
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
