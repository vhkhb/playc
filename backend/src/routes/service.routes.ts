import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '../types';
import * as serviceController from '../controllers/service.controller';

const router = Router();

/**
 * GET /api/services/venue/:venueId
 * List available extra services for a venue.
 */
router.get('/venue/:venueId', serviceController.getServicesByVenue);

/**
 * POST /api/services
 * Create an extra service (vendor only).
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  validate([
    body('venueId').notEmpty().withMessage('Venue ID is required.'),
    body('name').notEmpty().withMessage('Service name is required.'),
    body('price').isNumeric().withMessage('Price must be a number.'),
  ]),
  serviceController.createService
);

/**
 * GET /api/services/:id
 */
router.get('/:id', serviceController.getServiceById);

/**
 * PUT /api/services/:id
 * Update a service (vendor only).
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  serviceController.updateService
);

/**
 * DELETE /api/services/:id
 * Delete a service (vendor only).
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  serviceController.deleteService
);

export default router;
