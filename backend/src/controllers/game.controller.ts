import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

/**
 * POST /api/games
 * Host a new game. Requires an existing confirmed booking.
 * Automatically creates a community for the game.
 */
export const createGame = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const {
      bookingId,
      title,
      sportType,
      description,
      maxPlayers,
      isPublic,
      extraServices,
    } = req.body;

    // Verify booking exists and belongs to this user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { slot: true, venue: true },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    if (booking.userId !== req.user.userId) {
      res.status(403).json({
        success: false,
        message: 'You can only host a game for your own bookings.',
      });
      return;
    }

    // Check if a game already exists for this booking
    const existingGame = await prisma.game.findUnique({
      where: { bookingId },
    });

    if (existingGame) {
      res.status(409).json({
        success: false,
        message: 'A game has already been created for this booking.',
      });
      return;
    }

    // Create the game
    const game = await prisma.game.create({
      data: {
        hostId: req.user.userId,
        venueId: booking.venueId,
        slotId: booking.slotId,
        bookingId: booking.id,
        title,
        sportType: sportType || booking.venue.sportType,
        description: description || null,
        maxPlayers: maxPlayers ? parseInt(maxPlayers, 10) : booking.slot.maxPlayers,
        currentPlayers: 1, // the host counts
        status: 'UPCOMING',
        isPublic: isPublic !== undefined ? isPublic : true,
        extraServices: extraServices || [],
      },
      include: {
        venue: { select: { id: true, name: true, city: true } },
        slot: { select: { date: true, startTime: true, endTime: true } },
        host: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Add host as a participant
    await prisma.gameParticipant.create({
      data: {
        gameId: game.id,
        userId: req.user.userId,
        status: 'JOINED',
        joinedAt: new Date(),
      },
    });

    // Update user role to HOST if currently PLAYER
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });
    if (user && user.role === 'PLAYER') {
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { role: 'HOST' },
      });
    }

    // Auto-create a community for this game
    const community = await prisma.community.create({
      data: {
        name: `${title} Community`,
        description: `Community auto-created for the game "${title}" at ${game.venue.name}.`,
        createdById: req.user.userId,
        sportType: game.sportType,
        isAutoCreated: true,
        isPublic: game.isPublic,
        memberCount: 1,
      },
    });

    // Add the host as community admin
    await prisma.communityMember.create({
      data: {
        communityId: community.id,
        userId: req.user.userId,
        role: 'ADMIN',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Game hosted successfully.',
      data: {
        game,
        community: {
          id: community.id,
          name: community.name,
        },
      },
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * PUT /api/games/:id
 * Update game details (host only).
 */
export const updateGame = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;

    const game = await prisma.game.findUnique({ where: { id } });

    if (!game) {
      res.status(404).json({ success: false, message: 'Game not found.' });
      return;
    }

    if (game.hostId !== req.user.userId && req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Only the host can update this game.',
      });
      return;
    }

    const {
      title,
      description,
      maxPlayers,
      status,
      isPublic,
      extraServices,
    } = req.body;

    const updated = await prisma.game.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(maxPlayers !== undefined && { maxPlayers: parseInt(maxPlayers, 10) }),
        ...(status !== undefined && { status }),
        ...(isPublic !== undefined && { isPublic }),
        ...(extraServices !== undefined && { extraServices }),
      },
      include: {
        venue: { select: { id: true, name: true, city: true } },
        slot: { select: { date: true, startTime: true, endTime: true } },
        host: { select: { id: true, name: true, avatar: true } },
        _count: { select: { participants: true } },
      },
    });

    res.json({
      success: true,
      message: 'Game updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/games/:id/invite
 * Invite a user to a game (host only).
 * Body: { userId }
 */
export const inviteToGame = async (
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

    const game = await prisma.game.findUnique({ where: { id } });

    if (!game) {
      res.status(404).json({ success: false, message: 'Game not found.' });
      return;
    }

    if (game.hostId !== req.user.userId && req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Only the host can invite players.',
      });
      return;
    }

    // Check if user exists
    const invitee = await prisma.user.findUnique({ where: { id: userId } });
    if (!invitee) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Check if already a participant
    const existing = await prisma.gameParticipant.findUnique({
      where: { gameId_userId: { gameId: id, userId } },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: 'User is already a participant or has been invited.',
      });
      return;
    }

    const participant = await prisma.gameParticipant.create({
      data: {
        gameId: id,
        userId,
        status: 'INVITED',
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Notify the invited user
    await prisma.notification.create({
      data: {
        userId,
        title: 'Game Invitation',
        body: `You have been invited to join "${game.title}".`,
        type: 'GAME_INVITATION',
        data: { gameId: game.id },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully.',
      data: participant,
    });
  } catch (error) {
    console.error('Invite to game error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/games/:id/join
 * Join a public game (or accept invitation).
 */
export const joinGame = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;

    const game = await prisma.game.findUnique({ where: { id } });

    if (!game) {
      res.status(404).json({ success: false, message: 'Game not found.' });
      return;
    }

    if (game.status !== 'UPCOMING') {
      res.status(409).json({
        success: false,
        message: 'This game is no longer accepting new players.',
      });
      return;
    }

    if (game.currentPlayers >= game.maxPlayers) {
      res.status(409).json({ success: false, message: 'Game is full.' });
      return;
    }

    // Check for existing participation
    const existing = await prisma.gameParticipant.findUnique({
      where: {
        gameId_userId: { gameId: id, userId: req.user.userId },
      },
    });

    if (existing) {
      if (existing.status === 'JOINED' || existing.status === 'ACCEPTED') {
        res.status(409).json({
          success: false,
          message: 'You have already joined this game.',
        });
        return;
      }

      // Accept invitation
      await prisma.gameParticipant.update({
        where: { id: existing.id },
        data: { status: 'JOINED', joinedAt: new Date() },
      });
    } else {
      // Public game join
      if (!game.isPublic) {
        res.status(403).json({
          success: false,
          message: 'This is a private game. You need an invitation.',
        });
        return;
      }

      await prisma.gameParticipant.create({
        data: {
          gameId: id,
          userId: req.user.userId,
          status: 'JOINED',
          joinedAt: new Date(),
        },
      });
    }

    // Increment current players count
    const updatedGame = await prisma.game.update({
      where: { id },
      data: { currentPlayers: { increment: 1 } },
      include: {
        venue: { select: { id: true, name: true } },
        slot: { select: { date: true, startTime: true, endTime: true } },
        host: { select: { id: true, name: true } },
        _count: { select: { participants: true } },
      },
    });

    // Notify the host
    await prisma.notification.create({
      data: {
        userId: game.hostId,
        title: 'Player Joined',
        body: `A player joined your game "${game.title}".`,
        type: 'GAME_PLAYER_JOINED',
        data: { gameId: game.id, userId: req.user.userId },
      },
    });

    // Also add user to the auto-created community if one exists
    const autoCommunity = await prisma.community.findFirst({
      where: {
        isAutoCreated: true,
        createdById: game.hostId,
        name: { contains: game.title },
      },
    });

    if (autoCommunity) {
      const existingMember = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: autoCommunity.id,
            userId: req.user.userId,
          },
        },
      });

      if (!existingMember) {
        await prisma.communityMember.create({
          data: {
            communityId: autoCommunity.id,
            userId: req.user.userId,
            role: 'MEMBER',
          },
        });
        await prisma.community.update({
          where: { id: autoCommunity.id },
          data: { memberCount: { increment: 1 } },
        });
      }
    }

    res.json({
      success: true,
      message: 'Successfully joined the game.',
      data: updatedGame,
    });
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/games/upcoming
 * Return upcoming public games with optional filters.
 */
export const getUpcomingGames = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const sportType = req.query.sportType as string | undefined;
    const city = req.query.city as string | undefined;

    const where: any = {
      status: 'UPCOMING',
      isPublic: true,
    };

    if (sportType) where.sportType = sportType;
    if (city) where.venue = { city: { contains: city, mode: 'insensitive' } };

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          venue: { select: { id: true, name: true, city: true, sportType: true } },
          slot: { select: { date: true, startTime: true, endTime: true } },
          host: { select: { id: true, name: true, avatar: true } },
          _count: { select: { participants: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.game.count({ where }),
    ]);

    res.json({
      success: true,
      message: 'Upcoming games retrieved.',
      data: games,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get upcoming games error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/games/:id
 * Return a single game with full details.
 */
export const getGameById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            address: true,
            sportType: true,
            latitude: true,
            longitude: true,
            images: true,
          },
        },
        slot: true,
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            phone: true,
          },
        },
        booking: {
          select: { id: true, status: true, totalAmount: true },
        },
        participants: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { joinedAt: 'asc' },
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!game) {
      res.status(404).json({ success: false, message: 'Game not found.' });
      return;
    }

    // If the game is private, only participants / host / admin can view
    if (!game.isPublic) {
      const userId = req.user?.userId;
      const isParticipant = game.participants.some((p) => p.userId === userId);
      const isHost = game.hostId === userId;
      const isAdmin = req.user?.role === 'ADMIN';

      if (!isParticipant && !isHost && !isAdmin) {
        res.status(403).json({
          success: false,
          message: 'This is a private game.',
        });
        return;
      }
    }

    res.json({
      success: true,
      message: 'Game retrieved successfully.',
      data: game,
    });
  } catch (error) {
    console.error('Get game by id error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/games/:id/participants
 * Return participants for a game.
 */
export const getGameParticipants = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const game = await prisma.game.findUnique({ where: { id } });

    if (!game) {
      res.status(404).json({ success: false, message: 'Game not found.' });
      return;
    }

    const participants = await prisma.gameParticipant.findMany({
      where: { gameId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    res.json({
      success: true,
      message: 'Participants retrieved.',
      data: participants,
    });
  } catch (error) {
    console.error('Get game participants error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
