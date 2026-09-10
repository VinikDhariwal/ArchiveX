import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  listFavorites,
  addFavorite,
  removeFavorite,
} from '../controllers/favoriteController.js';

const router = Router();

router.use(requireAuth);
router.get('/', listFavorites);
router.post('/:productId', addFavorite);
router.delete('/:productId', removeFavorite);

export default router;
