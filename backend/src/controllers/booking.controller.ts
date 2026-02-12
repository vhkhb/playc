import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, CommissionType } from '../types';
import {
  calculateCommission,
  parseCommissionType,
} from '../utils/commission';
import config from '../config';

const prisma = new PrismaClient();

/**
 * Read commission configuration from the AppConfig table.
 * Falls back to env / config defaults if rows are missing.
 */
async function getCommissionConfig(): Promise<{
  type: CommissionType;
  value: number;
}> {
  const typeRow = await prisma.appConfig.findUnique({
    where: { key: 'COMMISSION_TYPE' },
  });
  const valueRow = await prisma.appConfig.findUnique({
    where: { key: 'COMMISSION_VALUE' },
  });

  const type = typeRow
    ? parseCommissionType(typeRow.value)
    : parseCommissionType(config.commissionType);

  const value = valueRow ? parseFloat(valueRow.value) : config.commissionValue;

  return { type, value };
}

/**
 * POST /api/bookings
 * Create a booking for a slot, computing commission automatically.
 */
export const createBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { slotId } = req.body;

    // Fetch slot details
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { venue: true },
    });

    if (!slot) {
      res.status(404).json({ success: false, message: 'Slot not found.' });
      return;
    }

    if (!slot.isAvailable) {
      res.status(409).json({ success: false, message: 'Slot is no longer available.' });
      return;
    }

    // Check if user already has a booking for this slot
    const existingBooking = await prisma.booking.findFirst({
      where: {
        slotId,
        userId: req.user.userId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (existingBooking) {
      res.status(409).json({
        success: false,
        message: 'You already have an active booking for this slot.',
      });
      return;
    }

    // Calculate commission
    const commissionConfig = await getCommissionConfig();
    const commission = calculateCommission(slot.price, commissionConfig);

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        slotId: slot.id,
        userId: req.user.userId,
        venueId: slot.venueId,
        status: 'PENDING',
        totalAmount: commission.totalAmount,
        commissionAmount: commission.commissionAmount,
        commissionType: commission.commissionType,
        paymentStatus: 'PENDING',
      },
      include: {
        slot: true,
        venue: { select: { id: true, name: true, city: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Create a notification for the venue vendor
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { id: slot.venue.vendorProfileId },
    });

    if (vendorProfile) {
      await prisma.notification.create({
        data: {
          userId: vendorProfile.userId,
          title: 'New Booking',
          body: `${req.user.email} booked a slot at ${slot.venue.name}.`,
          type: 'BOOKING_CREATED',
          data: { bookingId: booking.id, venueId: slot.venueId },
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: {
        ...booking,
        commissionDetails: {
          commissionAmount: commission.commissionAmount,
          commissionType: commission.commissionType,
          vendorAmount: commission.vendorAmount,
        },
      },
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/bookings/my-bookings
 * List authenticated user's bookings.
 */
export const getMyBookings = async (
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
    const status = req.query.status as string | undefined;

    const where: any = { userId: req.user.userId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          venue: { select: { id: true, name: true, city: true, sportType: true } },
          slot: {
            select: {
              id: true,
              date: true,
              startTime: true,
              endTime: true,
              price: true,
            },
          },
          game: { select: { id: true, title: true, status: true } },
        },
        orderBy: { bookedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      success: true,
      message: 'Bookings retrieved.',
      data: bookings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/bookings/vendor-bookings
 * List bookings for all venues owned by the authenticated vendor.
 */
export const getVendorBookings = async (
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
      res.status(403).json({ success: false, message: 'Vendor profile not found.' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    // Get all venue IDs for this vendor
    const venues = await prisma.venue.findMany({
      where: { vendorProfileId: vendorProfile.id },
      select: { id: true },
    });

    const venueIds = venues.map((v) => v.id);

    const where: any = { venueId: { in: venueIds } };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          venue: { select: { id: true, name: true } },
          slot: {
            select: {
              date: true,
              startTime: true,
              endTime: true,
              price: true,
            },
          },
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
        orderBy: { bookedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      success: true,
      message: 'Vendor bookings retrieved.',
      data: bookings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get vendor bookings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * PUT /api/bookings/:id/status
 * Update booking status (vendor confirms/cancels, or user cancels).
 */
export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        venue: { include: { vendorProfile: true } },
        user: true,
      },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    // Authorization: the booking user or the venue vendor can update
    const isBookingOwner = booking.userId === req.user.userId;
    const isVenueVendor =
      booking.venue.vendorProfile.userId === req.user.userId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isBookingOwner && !isVenueVendor && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to update this booking.',
      });
      return;
    }

    // Booking owner can only cancel
    if (isBookingOwner && !isVenueVendor && !isAdmin && status !== 'CANCELLED') {
      res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings.',
      });
      return;
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        venue: { select: { id: true, name: true } },
        slot: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // If confirmed, mark slot as unavailable (optionally)
    if (status === 'CONFIRMED') {
      // Check total confirmed bookings for this slot
      const confirmedCount = await prisma.booking.count({
        where: { slotId: booking.slotId, status: 'CONFIRMED' },
      });

      const slot = await prisma.slot.findUnique({
        where: { id: booking.slotId },
      });

      if (slot && confirmedCount >= slot.maxPlayers) {
        await prisma.slot.update({
          where: { id: booking.slotId },
          data: { isAvailable: false },
        });
      }
    }

    // Notify the booking user about the status change
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        title: 'Booking Status Updated',
        body: `Your booking at ${booking.venue.name} has been ${status?.toLowerCase() || 'updated'}.`,
        type: 'BOOKING_STATUS_UPDATE',
        data: { bookingId: booking.id, newStatus: status },
      },
    });

    res.json({
      success: true,
      message: 'Booking status updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/bookings/:id
 * Return a single booking by id.
 */
export const getBookingById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            sportType: true,
            address: true,
          },
        },
        slot: true,
        user: { select: { id: true, name: true, email: true } },
        game: true,
      },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    // Only the booking owner, venue vendor, or admin can view
    const vendorProfile = await prisma.vendorProfile.findFirst({
      where: { venues: { some: { id: booking.venueId } } },
    });

    const isAuthorised =
      booking.userId === req.user.userId ||
      vendorProfile?.userId === req.user.userId ||
      req.user.role === 'ADMIN';

    if (!isAuthorised) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view this booking.',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Booking retrieved.',
      data: booking,
    });
  } catch (error) {
    console.error('Get booking by id error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
