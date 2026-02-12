import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as userController from '../controllers/user.controller';

const router = Router();

/**
 * GET /api/users/profile
 * Authenticated user's profile.
 */
router.get('/profile', authenticate, userController.getMyProfile);

/**
 * PUT /api/users/profile
 * Update authenticated user's profile.
 */
router.put('/profile', authenticate, userController.updateProfile);

/**
 * GET /api/users/profile/:id
 * Public profile for any user.
 */
router.get('/profile/:id', userController.getPublicProfile);

/**
 * GET /api/users/game-history
 * Authenticated user's game history (hosted + participated).
 */
router.get('/game-history', authenticate, userController.getGameHistory);

export default router;
