import { Router } from 'express';
import { optionalAuth } from '../middleware/authMiddleware.js';
import { publicCache } from '../middleware/cacheControlMiddleware.js';
import {
  listProducts,
  getProductBySlug,
  getProductFilters,
  recordProductView,
  getRelatedProducts,
  getRecommendedProducts,
  getProductJournal,
  getRecentlyViewed,
} from '../controllers/productController.js';

const router = Router();

router.get('/', publicCache(45), listProducts);
router.get('/filters/schema', publicCache(300), getProductFilters);
router.get('/recommended', publicCache(60), getRecommendedProducts);
router.get('/recently-viewed', optionalAuth, getRecentlyViewed);
router.post('/:id/view', optionalAuth, recordProductView);
router.get('/:id/related', publicCache(60), getRelatedProducts);
router.get('/:id/journal', publicCache(60), getProductJournal);
router.get('/:slug', publicCache(60), getProductBySlug);

export default router;
