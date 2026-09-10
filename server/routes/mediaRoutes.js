import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { openMediaReadStream } from '../services/mediaService.js';

const router = Router();

/** Public image stream from Atlas GridFS — used by <img src>. */
router.get(
  '/files/:id',
  asyncHandler(async (req, res) => {
    const { stream, contentType, filename, size } = await openMediaReadStream(req.params.id);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    if (filename) res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    if (size) res.setHeader('Content-Length', String(size));
    stream.on('error', (error) => {
      if (!res.headersSent) {
        res.status(404).end();
      } else {
        res.destroy(error);
      }
    });
    stream.pipe(res);
  })
);

export default router;
