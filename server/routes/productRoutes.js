import { Router } from 'express';
import { optionalAuth } from '../middleware/authMiddleware.js';
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

router.get('/', listProducts);
router.get('/filters/schema', getProductFilters);
router.get('/recommended', getRecommendedProducts);
router.get('/recently-viewed', optionalAuth, getRecentlyViewed);
router.post('/:id/view', optionalAuth, recordProductView);
router.get('/:id/related', getRelatedProducts);
router.get('/:id/journal', getProductJournal);
router.get('/:slug', getProductBySlug);

export default router;
