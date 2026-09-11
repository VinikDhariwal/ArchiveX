import { Router } from 'express';
import { publicCache } from '../middleware/cacheControlMiddleware.js';
import { listBrands, getBrandBySlug } from '../controllers/brandController.js';

const router = Router();

router.get('/', publicCache(120), listBrands);
router.get('/:slug', publicCache(90), getBrandBySlug);

export default router;
