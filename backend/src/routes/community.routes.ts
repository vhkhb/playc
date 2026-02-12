import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as communityController from '../controllers/community.controller';

const router = Router();

/**
 * GET /api/communities/my-communities
 * Communities the authenticated user belongs to.
 */
router.get('/my-communities', authenticate, communityController.getMyCommunities);

/**
 * POST /api/communities
 * Create a new community.
 */
router.post(
  '/',
  authenticate,
  validate([
    body('name').notEmpty().withMessage('Community name is required.'),
  ]),
  communityController.createCommunity
);

/**
 * POST /api/communities/:id/join
 */
router.post('/:id/join', authenticate, communityController.joinCommunity);

/**
 * POST /api/communities/:id/post
 * Create a post in a community.
 */
router.post(
  '/:id/post',
  authenticate,
  validate([
    body('content').notEmpty().withMessage('Post content is required.'),
  ]),
  communityController.createPost
);

/**
 * GET /api/communities/:id/posts
 */
router.get('/:id/posts', optionalAuth, communityController.getCommunityPosts);

/**
 * GET /api/communities/:id/members
 */
router.get('/:id/members', optionalAuth, communityController.getCommunityMembers);

/**
 * PUT /api/communities/:id
 * Update community (admin/moderator).
 */
router.put('/:id', authenticate, communityController.updateCommunity);

/**
 * POST /api/communities/:id/invite
 * Invite a user (admin/moderator).
 */
router.post(
  '/:id/invite',
  authenticate,
  validate([
    body('userId').notEmpty().withMessage('User ID is required.'),
  ]),
  communityController.inviteToCommunity
);

export default router;
