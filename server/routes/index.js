import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import docsRoutes from './docsRoutes.js';
import productRoutes from './productRoutes.js';
import brandRoutes from './brandRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import articleRoutes from './articleRoutes.js';
import authRoutes from './authRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import collectionRoutes from './collectionRoutes.js';
import contributionRoutes from './contributionRoutes.js';
import adminRoutes from './adminRoutes.js';
import mediaRoutes from './mediaRoutes.js';

const router = Router();

router.use(healthRoutes);
router.use(docsRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/brands', brandRoutes);
router.use('/categories', categoryRoutes);
router.use('/articles', articleRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/collections', collectionRoutes);
router.use('/contributions', contributionRoutes);
router.use('/media', mediaRoutes);
router.use('/admin', adminRoutes);

export default router;
