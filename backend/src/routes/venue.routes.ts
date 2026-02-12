import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '../types';
import * as venueController from '../controllers/venue.controller';

const router = Router();

/**
 * GET /api/venues/nearby?lat=...&lng=...&radius=...
 * Must be defined BEFORE /:id to avoid route collision.
 */
router.get('/nearby', venueController.getNearbyVenues);

/**
 * GET /api/venues/search?q=...
 */
router.get('/search', venueController.searchVenues);

/**
 * GET /api/venues/ads
 * Active ad venues for homepage.
 */
router.get('/ads', venueController.getAdVenues);

/**
 * GET /api/venues
 * List all active venues with optional filters.
 */
router.get('/', venueController.getVenues);

/**
 * POST /api/venues
 * Create a venue (vendor only).
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  validate([
    body('name').notEmpty().withMessage('Venue name is required.'),
    body('sportType').notEmpty().withMessage('Sport type is required.'),
    body('address').notEmpty().withMessage('Address is required.'),
    body('city').notEmpty().withMessage('City is required.'),
    body('state').notEmpty().withMessage('State is required.'),
  ]),
  venueController.createVenue
);

/**
 * GET /api/venues/:id
 */
router.get('/:id', venueController.getVenueById);

/**
 * PUT /api/venues/:id
 * Update a venue (vendor only).
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  venueController.updateVenue
);

/**
 * DELETE /api/venues/:id
 * Deactivate a venue (vendor only).
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  venueController.deleteVenue
);

export default router;
