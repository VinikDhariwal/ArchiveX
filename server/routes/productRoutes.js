import { Router } from 'express';
import {
  listProducts,
  getProductBySlug,
  getProductFilters,
  recordProductView,
  getRelatedProducts,
  getProductJournal,
} from '../controllers/productController.js';

const router = Router();

router.get('/', listProducts);
router.get('/filters/schema', getProductFilters);
router.post('/:id/view', recordProductView);
router.get('/:id/related', getRelatedProducts);
router.get('/:id/journal', getProductJournal);
router.get('/:slug', getProductBySlug);

export default router;
