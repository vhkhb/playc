import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import config from '../config';
import { AuthRequest, JwtPayload, UserRole } from '../types';

const prisma = new PrismaClient();

/**
 * POST /api/auth/register
 * Register a new user account.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone, role, bio, location } = req.body;

    // Check for existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already registered.' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine role – default to PLAYER
    const userRole: UserRole =
      role && Object.values(UserRole).includes(role) ? role : UserRole.PLAYER;

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: userRole,
        bio: bio || null,
        location: location || null,
      },
    });

    // Create associated profile based on role
    if (userRole === UserRole.PLAYER || userRole === UserRole.HOST) {
      await prisma.playerProfile.create({
        data: { userId: user.id },
      });
    }

    if (userRole === UserRole.VENDOR) {
      const { businessName, address, city, state, zipCode, latitude, longitude } =
        req.body;

      await prisma.vendorProfile.create({
        data: {
          userId: user.id,
          businessName: businessName || name,
          address: address || '',
          city: city || '',
          state: state || '',
          zipCode: zipCode || null,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
        },
      });
    }

    // Generate JWT
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return JWT.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        playerProfile: true,
        vendorProfile: true,
      },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          bio: user.bio,
          location: user.location,
          isVerified: user.isVerified,
          playerProfile: user.playerProfile,
          vendorProfile: user.vendorProfile,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/auth/forgot-password
 * Initiate password reset (stub – would normally send an email).
 */
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // For security, always return success even if user not found
      res.json({
        success: true,
        message:
          'If an account with that email exists, a password reset link has been sent.',
      });
      return;
    }

    // In a production app you would:
    // 1. Generate a reset token
    // 2. Store it in the database with an expiry
    // 3. Send an email with the reset link
    // For now we create a notification as a placeholder.
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Password Reset Requested',
        body: 'A password reset was requested for your account.',
        type: 'PASSWORD_RESET',
        data: {},
      },
    });

    res.json({
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/auth/profile
 * Return the authenticated user's full profile.
 */
export const getProfile = async (
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

    // Strip password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Profile retrieved successfully.',
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
