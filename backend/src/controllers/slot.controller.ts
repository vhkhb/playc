import { Response } from 'express';
import { PrismaClient, Recurrence } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

/**
 * POST /api/slots
 * Create a new slot for a venue (vendor only).
 * Supports recurrence: if recurrence is DAILY or WEEKLY the slot is
 * automatically duplicated for the configured number of occurrences.
 */
export const createSlot = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const {
      venueId,
      date,
      startTime,
      endTime,
      price,
      currency,
      maxPlayers,
      recurrence,
      recurrenceCount,
    } = req.body;

    // Verify the venue belongs to the authenticated vendor
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!vendorProfile) {
      res.status(403).json({ success: false, message: 'Vendor profile not found.' });
      return;
    }

    const venue = await prisma.venue.findFirst({
      where: { id: venueId, vendorProfileId: vendorProfile.id },
    });

    if (!venue) {
      res.status(404).json({
        success: false,
        message: 'Venue not found or you do not own it.',
      });
      return;
    }

    const recurrenceType: Recurrence = recurrence || 'NONE';
    const count = recurrenceCount ? parseInt(recurrenceCount, 10) : 1;

    const slotsToCreate: Array<{
      venueId: string;
      date: Date;
      startTime: Date;
      endTime: Date;
      price: number;
      currency: string;
      maxPlayers: number;
      recurrence: Recurrence;
    }> = [];

    const baseDate = new Date(date);
    const baseStart = new Date(startTime);
    const baseEnd = new Date(endTime);

    for (let i = 0; i < count; i++) {
      const offsetDays =
        recurrenceType === 'DAILY' ? i : recurrenceType === 'WEEKLY' ? i * 7 : 0;

      const slotDate = new Date(baseDate);
      slotDate.setDate(slotDate.getDate() + offsetDays);

      const slotStart = new Date(baseStart);
      slotStart.setDate(slotStart.getDate() + offsetDays);

      const slotEnd = new Date(baseEnd);
      slotEnd.setDate(slotEnd.getDate() + offsetDays);

      slotsToCreate.push({
        venueId,
        date: slotDate,
        startTime: slotStart,
        endTime: slotEnd,
        price: parseFloat(price),
        currency: currency || 'INR',
        maxPlayers: maxPlayers ? parseInt(maxPlayers, 10) : 10,
        recurrence: recurrenceType,
      });
    }

    // Use createMany for efficiency
    const result = await prisma.slot.createMany({ data: slotsToCreate });

    // Fetch created slots for the response
    const createdSlots = await prisma.slot.findMany({
      where: {
        venueId,
        date: { gte: baseDate },
      },
      orderBy: { date: 'asc' },
      take: count,
    });

    res.status(201).json({
      success: true,
      message: `${result.count} slot(s) created successfully.`,
      data: createdSlots,
    });
  } catch (error) {
    console.error('Create slot error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/slots/venue/:venueId/available
 * Return available (future) slots for a specific venue.
 */
export const getAvailableSlots = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { venueId } = req.params;
    const dateFilter = req.query.date as string | undefined;

    const where: any = {
      venueId,
      isAvailable: true,
      date: { gte: new Date() },
    };

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: filterDate, lt: nextDay };
    }

    const slots = await prisma.slot.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      include: {
        venue: { select: { id: true, name: true, sportType: true } },
        _count: { select: { bookings: true } },
      },
    });

    res.json({
      success: true,
      message: 'Available slots retrieved.',
      data: slots,
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/slots/:id
 * Return a single slot by id.
 */
export const getSlotById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const slot = await prisma.slot.findUnique({
      where: { id },
      include: {
        venue: {
          select: { id: true, name: true, sportType: true, city: true },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            userId: true,
            totalAmount: true,
          },
        },
      },
    });

    if (!slot) {
      res.status(404).json({ success: false, message: 'Slot not found.' });
      return;
    }

    res.json({ success: true, message: 'Slot retrieved.', data: slot });
  } catch (error) {
    console.error('Get slot by id error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * PUT /api/slots/:id
 * Update a slot (vendor only).
 */
export const updateSlot = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;

    // Fetch the slot and verify vendor ownership
    const slot = await prisma.slot.findUnique({
      where: { id },
      include: { venue: { include: { vendorProfile: true } } },
    });

    if (!slot) {
      res.status(404).json({ success: false, message: 'Slot not found.' });
      return;
    }

    if (slot.venue.vendorProfile.userId !== req.user.userId) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to update this slot.',
      });
      return;
    }

    const { date, startTime, endTime, price, currency, isAvailable, maxPlayers } =
      req.body;

    const updated = await prisma.slot.update({
      where: { id },
      data: {
        ...(date !== undefined && { date: new Date(date) }),
        ...(startTime !== undefined && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && { endTime: new Date(endTime) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(currency !== undefined && { currency }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(maxPlayers !== undefined && { maxPlayers: parseInt(maxPlayers, 10) }),
      },
    });

    res.json({ success: true, message: 'Slot updated successfully.', data: updated });
  } catch (error) {
    console.error('Update slot error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * DELETE /api/slots/:id
 * Delete a slot (vendor only, only if no confirmed bookings exist).
 */
export const deleteSlot = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;

    const slot = await prisma.slot.findUnique({
      where: { id },
      include: {
        venue: { include: { vendorProfile: true } },
        bookings: { where: { status: 'CONFIRMED' } },
      },
    });

    if (!slot) {
      res.status(404).json({ success: false, message: 'Slot not found.' });
      return;
    }

    if (slot.venue.vendorProfile.userId !== req.user.userId) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this slot.',
      });
      return;
    }

    if (slot.bookings.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Cannot delete a slot with confirmed bookings.',
      });
      return;
    }

    await prisma.slot.delete({ where: { id } });

    res.json({ success: true, message: 'Slot deleted successfully.' });
  } catch (error) {
    console.error('Delete slot error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
