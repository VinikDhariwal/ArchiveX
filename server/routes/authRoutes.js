import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/authController.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', optionalAuth, logout);
router.get('/me', requireAuth, me);

export default router;
