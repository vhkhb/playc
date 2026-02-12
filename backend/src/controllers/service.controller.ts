import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

/**
 * POST /api/services
 * Create an extra service for a venue (vendor only).
 */
export const createService = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { venueId, name, description, price, isAvailable } = req.body;

    // Verify venue ownership
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

    const service = await prisma.extraService.create({
      data: {
        venueId,
        name,
        description: description || null,
        price: parseFloat(price),
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Extra service created successfully.',
      data: service,
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/services/venue/:venueId
 * List available extra services for a venue.
 */
export const getServicesByVenue = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { venueId } = req.params;

    const services = await prisma.extraService.findMany({
      where: { venueId, isAvailable: true },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      message: 'Services retrieved.',
      data: services,
    });
  } catch (error) {
    console.error('Get services by venue error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/services/:id
 * Get a single extra service by id.
 */
export const getServiceById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const service = await prisma.extraService.findUnique({
      where: { id },
      include: {
        venue: { select: { id: true, name: true } },
      },
    });

    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Service retrieved.',
      data: service,
    });
  } catch (error) {
    console.error('Get service by id error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * PUT /api/services/:id
 * Update an extra service (vendor only).
 */
export const updateService = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;

    // Fetch service and verify ownership via venue -> vendorProfile
    const service = await prisma.extraService.findUnique({
      where: { id },
      include: {
        venue: { include: { vendorProfile: true } },
      },
    });

    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found.' });
      return;
    }

    if (service.venue.vendorProfile.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to update this service.',
      });
      return;
    }

    const { name, description, price, isAvailable } = req.body;

    const updated = await prisma.extraService.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });

    res.json({
      success: true,
      message: 'Service updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * DELETE /api/services/:id
 * Delete an extra service (vendor only).
 */
export const deleteService = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;

    const service = await prisma.extraService.findUnique({
      where: { id },
      include: {
        venue: { include: { vendorProfile: true } },
      },
    });

    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found.' });
      return;
    }

    if (service.venue.vendorProfile.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this service.',
      });
      return;
    }

    await prisma.extraService.delete({ where: { id } });

    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
