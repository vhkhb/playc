import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, UserRole } from '../types';
import { filterByDistance } from '../utils/distance';
import config from '../config';

const prisma = new PrismaClient();

/**
 * POST /api/venues
 * Create a new venue (vendor only).
 */
export const createVenue = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!vendorProfile) {
      res.status(403).json({
        success: false,
        message: 'Vendor profile not found. Please complete your vendor registration.',
      });
      return;
    }

    const {
      name,
      description,
      sportType,
      address,
      city,
      state,
      latitude,
      longitude,
      images,
      amenities,
      adBanner,
      isAdActive,
    } = req.body;

    const venue = await prisma.venue.create({
      data: {
        vendorProfileId: vendorProfile.id,
        name,
        description: description || null,
        sportType,
        address,
        city,
        state,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        images: images || [],
        amenities: amenities || [],
        adBanner: adBanner || null,
        isAdActive: isAdActive || false,
      },
      include: {
        vendorProfile: {
          select: { businessName: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Venue created successfully.',
      data: venue,
    });
  } catch (error) {
    console.error('Create venue error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/venues
 * List all active venues with optional filters.
 */
export const getVenues = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const sportType = req.query.sportType as string | undefined;
    const city = req.query.city as string | undefined;

    const where: any = { isActive: true };
    if (sportType) where.sportType = sportType;
    if (city) where.city = { contains: city, mode: 'insensitive' };

    const [venues, total] = await Promise.all([
      prisma.venue.findMany({
        where,
        include: {
          vendorProfile: { select: { businessName: true, city: true } },
          _count: { select: { reviews: true, slots: true } },
        },
        orderBy: { rating: 'desc' },
        skip,
        take: limit,
      }),
      prisma.venue.count({ where }),
    ]);

    res.json({
      success: true,
      message: 'Venues retrieved successfully.',
      data: venues,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/venues/nearby?lat=...&lng=...&radius=...
 * Return active venues within the given radius (km) of the coordinates.
 */
export const getNearbyVenues = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || config.defaultSearchRadiusKm;

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({
        success: false,
        message: 'lat and lng query parameters are required.',
      });
      return;
    }

    // Fetch all active venues that have coordinates
    const venues = await prisma.venue.findMany({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        vendorProfile: { select: { businessName: true } },
        _count: { select: { reviews: true } },
      },
    });

    const nearbyVenues = filterByDistance(venues, lat, lng, radius);

    res.json({
      success: true,
      message: 'Nearby venues retrieved successfully.',
      data: nearbyVenues,
    });
  } catch (error) {
    console.error('Get nearby venues error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/venues/search?q=...
 * Full-text style search across venue name, sportType, city, description.
 */
export const searchVenues = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const q = (req.query.q as string) || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!q.trim()) {
      res.status(400).json({ success: false, message: 'Search query (q) is required.' });
      return;
    }

    const where = {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { sportType: { contains: q, mode: 'insensitive' as const } },
        { city: { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } },
      ],
    };

    const [venues, total] = await Promise.all([
      prisma.venue.findMany({
        where,
        include: {
          vendorProfile: { select: { businessName: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: { rating: 'desc' },
        skip,
        take: limit,
      }),
      prisma.venue.count({ where }),
    ]);

    res.json({
      success: true,
      message: 'Search results retrieved.',
      data: venues,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Search venues error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/venues/ads
 * Return venues with active ad banners (for homepage display).
 */
export const getAdVenues = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const venues = await prisma.venue.findMany({
      where: {
        isActive: true,
        isAdActive: true,
        adBanner: { not: null },
      },
      select: {
        id: true,
        name: true,
        sportType: true,
        city: true,
        adBanner: true,
        rating: true,
        images: true,
        vendorProfile: { select: { businessName: true } },
      },
      orderBy: { rating: 'desc' },
    });

    res.json({
      success: true,
      message: 'Ad venues retrieved successfully.',
      data: venues,
    });
  } catch (error) {
    console.error('Get ad venues error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/venues/:id
 * Return a single venue with full details.
 */
export const getVenueById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        vendorProfile: {
          select: {
            id: true,
            businessName: true,
            city: true,
            state: true,
            userId: true,
          },
        },
        slots: {
          where: {
            isAvailable: true,
            date: { gte: new Date() },
          },
          orderBy: { date: 'asc' },
          take: 50,
        },
        extraServices: {
          where: { isAvailable: true },
        },
        reviews: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        _count: {
          select: { reviews: true, bookings: true, games: true },
        },
      },
    });

    if (!venue) {
      res.status(404).json({ success: false, message: 'Venue not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Venue retrieved successfully.',
      data: venue,
    });
  } catch (error) {
    console.error('Get venue by id error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * PUT /api/venues/:id
 * Update a venue (vendor only, must own the venue).
 */
export const updateVenue = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;

    // Verify ownership
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!vendorProfile) {
      res.status(403).json({ success: false, message: 'Vendor profile not found.' });
      return;
    }

    const venue = await prisma.venue.findFirst({
      where: { id, vendorProfileId: vendorProfile.id },
    });

    if (!venue) {
      res.status(404).json({
        success: false,
        message: 'Venue not found or you do not own it.',
      });
      return;
    }

    const {
      name,
      description,
      sportType,
      address,
      city,
      state,
      latitude,
      longitude,
      images,
      amenities,
      isActive,
      adBanner,
      isAdActive,
    } = req.body;

    const updated = await prisma.venue.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(sportType !== undefined && { sportType }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(images !== undefined && { images }),
        ...(amenities !== undefined && { amenities }),
        ...(isActive !== undefined && { isActive }),
        ...(adBanner !== undefined && { adBanner }),
        ...(isAdActive !== undefined && { isAdActive }),
      },
    });

    res.json({
      success: true,
      message: 'Venue updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('Update venue error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * DELETE /api/venues/:id
 * Soft-delete (deactivate) a venue.
 */
export const deleteVenue = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!vendorProfile) {
      res.status(403).json({ success: false, message: 'Vendor profile not found.' });
      return;
    }

    const venue = await prisma.venue.findFirst({
      where: { id, vendorProfileId: vendorProfile.id },
    });

    if (!venue) {
      res.status(404).json({
        success: false,
        message: 'Venue not found or you do not own it.',
      });
      return;
    }

    await prisma.venue.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ success: true, message: 'Venue deactivated successfully.' });
  } catch (error) {
    console.error('Delete venue error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
