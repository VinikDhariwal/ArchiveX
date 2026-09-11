import { Router } from 'express';
import { register, login, refresh, logout, me, updateMe, changeEmail, changePassword, deleteMe } from '../controllers/authController.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

/** Public collector signup — always role `user`. Staff accounts are created in /admin/users. */
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/refresh', authRateLimiter, refresh);
router.post('/logout', optionalAuth, logout);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateMe);
router.patch('/me/email', requireAuth, changeEmail);
router.patch('/me/password', requireAuth, changePassword);
router.delete('/me', requireAuth, deleteMe);

export default router;
