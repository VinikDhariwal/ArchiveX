import { Router } from 'express';
import { listBrands, getBrandBySlug } from '../controllers/brandController.js';

const router = Router();

router.get('/', listBrands);
router.get('/:slug', getBrandBySlug);

export default router;
