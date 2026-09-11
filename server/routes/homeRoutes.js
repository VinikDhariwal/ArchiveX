import { Router } from 'express';
import { publicCache } from '../middleware/cacheControlMiddleware.js';
import * as home from '../controllers/homeController.js';

const router = Router();

router.get('/', publicCache(60), home.getPublicHome);

export default router;
