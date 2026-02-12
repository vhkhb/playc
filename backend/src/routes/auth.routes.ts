import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as authController from '../controllers/auth.controller';

const router = Router();

/**
 * POST /api/auth/register
 */
router.post(
  '/register',
  validate([
    body('email').isEmail().withMessage('A valid email is required.'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters.'),
    body('name').notEmpty().withMessage('Name is required.'),
    body('role')
      .optional()
      .isIn(['PLAYER', 'HOST', 'VENDOR', 'ADMIN'])
      .withMessage('Role must be PLAYER, HOST, VENDOR, or ADMIN.'),
  ]),
  authController.register
);

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('A valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ]),
  authController.login
);

/**
 * POST /api/auth/forgot-password
 */
router.post(
  '/forgot-password',
  validate([
    body('email').isEmail().withMessage('A valid email is required.'),
  ]),
  authController.forgotPassword
);

/**
 * GET /api/auth/profile
 */
router.get('/profile', authenticate, authController.getProfile);

export default router;
