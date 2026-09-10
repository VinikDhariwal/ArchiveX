import { Router } from 'express';
import { login, refresh, logout, me } from '../controllers/authController.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';
import ApiError from '../utils/ApiError.js';

const router = Router();

/** Public self-registration is closed — operators create accounts from /admin/users. */
router.post('/register', (_req, _res, next) => {
  next(
    new ApiError(
      'Public registration is closed. Accounts are created by archive operators.',
      403,
      'REGISTRATION_CLOSED'
    )
  );
});
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', optionalAuth, logout);
router.get('/me', requireAuth, me);

export default router;
