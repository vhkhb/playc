import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '../types';
import * as bookingController from '../controllers/booking.controller';

const router = Router();

/**
 * GET /api/bookings/my-bookings
 * Authenticated user's bookings.
 */
router.get('/my-bookings', authenticate, bookingController.getMyBookings);

/**
 * GET /api/bookings/vendor-bookings
 * Bookings across all venues for the authenticated vendor.
 */
router.get(
  '/vendor-bookings',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  bookingController.getVendorBookings
);

/**
 * POST /api/bookings
 * Create a booking.
 */
router.post(
  '/',
  authenticate,
  validate([
    body('slotId').notEmpty().withMessage('Slot ID is required.'),
  ]),
  bookingController.createBooking
);

/**
 * GET /api/bookings/:id
 */
router.get('/:id', authenticate, bookingController.getBookingById);

/**
 * PUT /api/bookings/:id/status
 * Update booking status.
 */
router.put(
  '/:id/status',
  authenticate,
  validate([
    body('status')
      .optional()
      .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
      .withMessage('Invalid booking status.'),
    body('paymentStatus')
      .optional()
      .isIn(['PENDING', 'PAID', 'REFUNDED'])
      .withMessage('Invalid payment status.'),
  ]),
  bookingController.updateBookingStatus
);

export default router;
