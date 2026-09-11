import { Router } from 'express';
import { publicCache } from '../middleware/cacheControlMiddleware.js';
import { listArticles, getArticleBySlug } from '../controllers/articleController.js';

const router = Router();

router.get('/', publicCache(90), listArticles);
router.get('/:slug', publicCache(90), getArticleBySlug);

export default router;
