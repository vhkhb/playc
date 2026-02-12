import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as gameController from '../controllers/game.controller';

const router = Router();

/**
 * GET /api/games/upcoming
 * Public list of upcoming games.
 */
router.get('/upcoming', optionalAuth, gameController.getUpcomingGames);

/**
 * POST /api/games
 * Host a new game (authenticated).
 */
router.post(
  '/',
  authenticate,
  validate([
    body('bookingId').notEmpty().withMessage('Booking ID is required.'),
    body('title').notEmpty().withMessage('Game title is required.'),
  ]),
  gameController.createGame
);

/**
 * GET /api/games/:id
 */
router.get('/:id', optionalAuth, gameController.getGameById);

/**
 * PUT /api/games/:id
 * Update game (host only).
 */
router.put('/:id', authenticate, gameController.updateGame);

/**
 * POST /api/games/:id/invite
 * Invite a user to the game (host only).
 */
router.post(
  '/:id/invite',
  authenticate,
  validate([
    body('userId').notEmpty().withMessage('User ID is required.'),
  ]),
  gameController.inviteToGame
);

/**
 * POST /api/games/:id/join
 * Join a public game or accept an invitation.
 */
router.post('/:id/join', authenticate, gameController.joinGame);

/**
 * GET /api/games/:id/participants
 */
router.get('/:id/participants', optionalAuth, gameController.getGameParticipants);

export default router;
