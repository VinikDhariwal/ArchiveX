import { Router } from 'express';
import { publicCache } from '../middleware/cacheControlMiddleware.js';
import { listCategories, getCategoryBySlug } from '../controllers/categoryController.js';

const router = Router();

router.get('/', publicCache(120), listCategories);
router.get('/:slug', publicCache(90), getCategoryBySlug);

export default router;
