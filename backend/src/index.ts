import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import config from './config';

// ─── Route imports ────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import venueRoutes from './routes/venue.routes';
import slotRoutes from './routes/slot.routes';
import bookingRoutes from './routes/booking.routes';
import gameRoutes from './routes/game.routes';
import communityRoutes from './routes/community.routes';
import serviceRoutes from './routes/service.routes';

// ─── App initialisation ──────────────────────────────────────────────────────
const app = express();

// ─── Global middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'PlayC API is running.',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ─── API routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/services', serviceRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);

  // Prisma known-error check
  const isPrismaError =
    err.constructor?.name === 'PrismaClientKnownRequestError';

  if (isPrismaError) {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'A record with that unique field already exists.',
        errors: [{ field: prismaErr.meta?.target, code: prismaErr.code }],
      });
      return;
    }
    if (prismaErr.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
      return;
    }
  }

  res.status(500).json({
    success: false,
    message:
      config.nodeEnv === 'development'
        ? err.message
        : 'Internal server error.',
  });
});

// ─── Start server ────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(
    `[PlayC API] Server running on port ${config.port} in ${config.nodeEnv} mode`
  );
});

export default app;
