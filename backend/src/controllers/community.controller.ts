import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

/**
 * POST /api/communities
 * Create a new community.
 */
export const createCommunity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { name, description, avatar, sportType, isPublic } = req.body;

    const community = await prisma.community.create({
      data: {
        name,
        description: description || null,
        avatar: avatar || null,
        createdById: req.user.userId,
        sportType: sportType || null,
        isAutoCreated: false,
        isPublic: isPublic !== undefined ? isPublic : true,
        memberCount: 1,
      },
    });

    // Add creator as admin member
    await prisma.communityMember.create({
      data: {
        communityId: community.id,
        userId: req.user.userId,
        role: 'ADMIN',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Community created successfully.',
      data: community,
    });
  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/communities/my-communities
 * List communities the authenticated user is a member of.
 */
export const getMyCommunities = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const memberships = await prisma.communityMember.findMany({
      where: { userId: req.user.userId },
      include: {
        community: {
          include: {
            createdBy: { select: { id: true, name: true, avatar: true } },
            _count: { select: { members: true, posts: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const communities = memberships.map((m) => ({
      ...m.community,
      myRole: m.role,
    }));

    res.json({
      success: true,
      message: 'Communities retrieved.',
      data: communities,
    });
  } catch (error) {
    console.error('Get my communities error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/communities/:id/join
 * Join a public community.
 */
export const joinCommunity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;

    const community = await prisma.community.findUnique({ where: { id } });

    if (!community) {
      res.status(404).json({ success: false, message: 'Community not found.' });
      return;
    }

    if (!community.isPublic) {
      res.status(403).json({
        success: false,
        message: 'This is a private community. You need an invitation.',
      });
      return;
    }

    // Check if already a member
    const existing = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: { communityId: id, userId: req.user.userId },
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: 'You are already a member of this community.',
      });
      return;
    }

    await prisma.communityMember.create({
      data: {
        communityId: id,
        userId: req.user.userId,
        role: 'MEMBER',
      },
    });

    await prisma.community.update({
      where: { id },
      data: { memberCount: { increment: 1 } },
    });

    res.json({
      success: true,
      message: 'Joined community successfully.',
    });
  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/communities/:id/post
 * Create a post in a community (must be a member).
 */
export const createPost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const { content, images } = req.body;

    // Verify membership
    const membership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: { communityId: id, userId: req.user.userId },
      },
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        message: 'You must be a community member to post.',
      });
      return;
    }

    const post = await prisma.communityPost.create({
      data: {
        communityId: id,
        authorId: req.user.userId,
        content,
        images: images || [],
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully.',
      data: post,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/communities/:id/posts
 * List posts in a community.
 */
export const getCommunityPosts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const community = await prisma.community.findUnique({ where: { id } });

    if (!community) {
      res.status(404).json({ success: false, message: 'Community not found.' });
      return;
    }

    // If private, check membership
    if (!community.isPublic && req.user) {
      const membership = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: { communityId: id, userId: req.user.userId },
        },
      });

      if (!membership) {
        res.status(403).json({
          success: false,
          message: 'This is a private community.',
        });
        return;
      }
    } else if (!community.isPublic) {
      res.status(403).json({
        success: false,
        message: 'This is a private community.',
      });
      return;
    }

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where: { communityId: id },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.communityPost.count({ where: { communityId: id } }),
    ]);

    res.json({
      success: true,
      message: 'Posts retrieved.',
      data: posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get community posts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/communities/:id/members
 * List members of a community.
 * Host contact info is visible to other members.
 */
export const getCommunityMembers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const community = await prisma.community.findUnique({ where: { id } });

    if (!community) {
      res.status(404).json({ success: false, message: 'Community not found.' });
      return;
    }

    const isLoggedIn = !!req.user;
    let isMember = false;

    if (isLoggedIn) {
      const membership = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: { communityId: id, userId: req.user!.userId },
        },
      });
      isMember = !!membership;
    }

    // If private community and not a member, deny access
    if (!community.isPublic && !isMember) {
      res.status(403).json({
        success: false,
        message: 'This is a private community.',
      });
      return;
    }

    const members = await prisma.communityMember.findMany({
      where: { communityId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            role: true,
            // Show contact info (phone, email) only for hosts, and only to other members
            ...(isMember
              ? { phone: true, email: true }
              : {}),
          },
        },
      },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    });

    res.json({
      success: true,
      message: 'Members retrieved.',
      data: members,
    });
  } catch (error) {
    console.error('Get community members error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * PUT /api/communities/:id
 * Update community details (admin / moderator only).
 */
export const updateCommunity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;

    // Check admin/mod role
    const membership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: { communityId: id, userId: req.user.userId },
      },
    });

    if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'MODERATOR')) {
      res.status(403).json({
        success: false,
        message: 'You must be an admin or moderator to update this community.',
      });
      return;
    }

    const { name, description, avatar, sportType, isPublic } = req.body;

    const updated = await prisma.community.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(avatar !== undefined && { avatar }),
        ...(sportType !== undefined && { sportType }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    res.json({
      success: true,
      message: 'Community updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('Update community error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/communities/:id/invite
 * Invite a user to a community (admin / moderator only).
 * Body: { userId }
 */
export const inviteToCommunity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const { userId } = req.body;

    // Check admin/mod role
    const membership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: { communityId: id, userId: req.user.userId },
      },
    });

    if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'MODERATOR')) {
      res.status(403).json({
        success: false,
        message: 'You must be an admin or moderator to invite users.',
      });
      return;
    }

    // Verify the target user exists
    const invitee = await prisma.user.findUnique({ where: { id: userId } });
    if (!invitee) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Check if already a member
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: { communityId: id, userId },
      },
    });

    if (existingMember) {
      res.status(409).json({
        success: false,
        message: 'User is already a member of this community.',
      });
      return;
    }

    // Add as member
    await prisma.communityMember.create({
      data: {
        communityId: id,
        userId,
        role: 'MEMBER',
      },
    });

    await prisma.community.update({
      where: { id },
      data: { memberCount: { increment: 1 } },
    });

    // Notify the invited user
    const community = await prisma.community.findUnique({ where: { id } });

    await prisma.notification.create({
      data: {
        userId,
        title: 'Community Invitation',
        body: `You have been added to the community "${community?.name}".`,
        type: 'COMMUNITY_INVITATION',
        data: { communityId: id },
      },
    });

    res.json({
      success: true,
      message: 'User invited and added to the community.',
    });
  } catch (error) {
    console.error('Invite to community error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
