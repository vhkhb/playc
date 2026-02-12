import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '../types';
import * as slotController from '../controllers/slot.controller';

const router = Router();

/**
 * GET /api/slots/venue/:venueId/available
 * Available slots for a venue.
 */
router.get('/venue/:venueId/available', slotController.getAvailableSlots);

/**
 * POST /api/slots
 * Create slot(s) for a venue (vendor only).
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  validate([
    body('venueId').notEmpty().withMessage('Venue ID is required.'),
    body('date').notEmpty().withMessage('Date is required.'),
    body('startTime').notEmpty().withMessage('Start time is required.'),
    body('endTime').notEmpty().withMessage('End time is required.'),
    body('price').isNumeric().withMessage('Price must be a number.'),
  ]),
  slotController.createSlot
);

/**
 * GET /api/slots/:id
 */
router.get('/:id', slotController.getSlotById);

/**
 * PUT /api/slots/:id
 * Update a slot (vendor only).
 */
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  slotController.updateSlot
);

/**
 * DELETE /api/slots/:id
 * Delete a slot (vendor only).
 */
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.VENDOR, UserRole.ADMIN),
  slotController.deleteSlot
);

export default router;
