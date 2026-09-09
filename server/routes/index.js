import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import productRoutes from './productRoutes.js';
import brandRoutes from './brandRoutes.js';
import categoryRoutes from './categoryRoutes.js';

const router = Router();

router.use(healthRoutes);
router.use('/products', productRoutes);
router.use('/brands', brandRoutes);
router.use('/categories', categoryRoutes);

export default router;
