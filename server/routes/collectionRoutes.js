import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  listCollections,
  createCollection,
  getCollection,
  updateCollection,
  deleteCollection,
  addProductToCollection,
  removeProductFromCollection,
} from '../controllers/collectionController.js';

const router = Router();

router.use(requireAuth);
router.get('/', listCollections);
router.post('/', createCollection);
router.get('/:id', getCollection);
router.patch('/:id', updateCollection);
router.delete('/:id', deleteCollection);
router.post('/:id/products/:productId', addProductToCollection);
router.delete('/:id/products/:productId', removeProductFromCollection);

export default router;
