import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

/**
 * GET /api/users/profile
 * Return the authenticated user's full profile.
 */
export const getMyProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        playerProfile: true,
        vendorProfile: {
          include: { venues: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const { password: _, ...userData } = user;

    res.json({
      success: true,
      message: 'Profile retrieved successfully.',
      data: userData,
    });
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * PUT /api/users/profile
 * Update the authenticated user's profile.
 */
export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const {
      name,
      phone,
      avatar,
      bio,
      location,
      sportsPreferences,
      skillLevel,
      businessName,
      businessLicense,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
    } = req.body;

    // Update core user fields
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
      },
    });

    // Update player profile if exists
    if (sportsPreferences !== undefined || skillLevel !== undefined) {
      await prisma.playerProfile.upsert({
        where: { userId: req.user.userId },
        create: {
          userId: req.user.userId,
          sportsPreferences: sportsPreferences || [],
          skillLevel: skillLevel || 'BEGINNER',
        },
        update: {
          ...(sportsPreferences !== undefined && { sportsPreferences }),
          ...(skillLevel !== undefined && { skillLevel }),
        },
      });
    }

    // Update vendor profile if applicable
    if (updatedUser.role === 'VENDOR') {
      const vendorData: Record<string, any> = {};
      if (businessName !== undefined) vendorData.businessName = businessName;
      if (businessLicense !== undefined) vendorData.businessLicense = businessLicense;
      if (address !== undefined) vendorData.address = address;
      if (city !== undefined) vendorData.city = city;
      if (state !== undefined) vendorData.state = state;
      if (zipCode !== undefined) vendorData.zipCode = zipCode;
      if (latitude !== undefined) vendorData.latitude = parseFloat(latitude);
      if (longitude !== undefined) vendorData.longitude = parseFloat(longitude);

      if (Object.keys(vendorData).length > 0) {
        await prisma.vendorProfile.upsert({
          where: { userId: req.user.userId },
          create: {
            userId: req.user.userId,
            businessName: businessName || updatedUser.name,
            address: address || '',
            city: city || '',
            state: state || '',
            ...vendorData,
          },
          update: vendorData,
        });
      }
    }

    // Refetch the full profile
    const fullUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        playerProfile: true,
        vendorProfile: true,
      },
    });

    if (!fullUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const { password: _, ...userData } = fullUser;

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: userData,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/users/profile/:id
 * Return a public user profile.
 */
export const getPublicProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        playerProfile: true,
        vendorProfile: {
          include: {
            venues: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                sportType: true,
                city: true,
                rating: true,
                images: true,
              },
            },
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            venue: { select: { id: true, name: true } },
            game: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Return only public information
    res.json({
      success: true,
      message: 'Profile retrieved successfully.',
      data: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        bio: user.bio,
        location: user.location,
        isVerified: user.isVerified,
        playerProfile: user.playerProfile,
        vendorProfile: user.vendorProfile,
        reviews: user.reviews,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/users/game-history
 * Return the authenticated user's game history.
 */
export const getGameHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Games hosted by user
    const hostedGames = await prisma.game.findMany({
      where: { hostId: req.user.userId },
      include: {
        venue: { select: { id: true, name: true, city: true } },
        slot: { select: { date: true, startTime: true, endTime: true } },
        _count: { select: { participants: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Games joined as participant
    const participatedGames = await prisma.gameParticipant.findMany({
      where: {
        userId: req.user.userId,
        status: { in: ['ACCEPTED', 'JOINED'] },
      },
      include: {
        game: {
          include: {
            venue: { select: { id: true, name: true, city: true } },
            slot: { select: { date: true, startTime: true, endTime: true } },
            host: { select: { id: true, name: true, avatar: true } },
            _count: { select: { participants: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
      skip,
      take: limit,
    });

    // User bookings
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.userId },
      include: {
        venue: { select: { id: true, name: true, city: true } },
        slot: { select: { date: true, startTime: true, endTime: true, price: true } },
      },
      orderBy: { bookedAt: 'desc' },
      skip,
      take: limit,
    });

    const totalHosted = await prisma.game.count({
      where: { hostId: req.user.userId },
    });
    const totalParticipated = await prisma.gameParticipant.count({
      where: {
        userId: req.user.userId,
        status: { in: ['ACCEPTED', 'JOINED'] },
      },
    });

    res.json({
      success: true,
      message: 'Game history retrieved successfully.',
      data: {
        hostedGames,
        participatedGames: participatedGames.map((p) => p.game),
        bookings,
        stats: {
          totalHosted,
          totalParticipated,
          totalBookings: bookings.length,
        },
      },
      pagination: {
        page,
        limit,
        total: totalHosted + totalParticipated,
        totalPages: Math.ceil((totalHosted + totalParticipated) / limit),
      },
    });
  } catch (error) {
    console.error('Get game history error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
