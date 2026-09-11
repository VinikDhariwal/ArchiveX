import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import * as contribution from '../controllers/contributionController.js';

const router = Router();

router.use(requireAuth);

router.get('/products', contribution.listMine);
router.post('/products', contribution.createProduct);
router.get('/products/:id', contribution.getMine);
router.patch('/products/:id', contribution.updateMine);
router.delete('/products/:id', contribution.withdrawMine);

export default router;
