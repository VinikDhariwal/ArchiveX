import { Router } from 'express';
import {
  listProducts,
  getProductBySlug,
  getProductFilters,
} from '../controllers/productController.js';

const router = Router();

router.get('/', listProducts);
router.get('/filters/schema', getProductFilters);
router.get('/:slug', getProductBySlug);

export default router;
