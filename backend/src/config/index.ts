import dotenv from 'dotenv';
import path from 'path';

// Load .env from the backend root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  /** Server port */
  port: parseInt(process.env.PORT || '3000', 10),

  /** Database connection URL used by Prisma */
  databaseUrl: process.env.DATABASE_URL || '',

  /** Secret used to sign / verify JWTs */
  jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-change-me',

  /** JWT token expiration */
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  /** Default commission type (FIXED | PERCENTAGE) – used as fallback when
   *  no AppConfig row exists in the database. */
  commissionType: process.env.COMMISSION_TYPE || 'PERCENTAGE',

  /** Default commission value – interpreted as a flat amount or percentage
   *  depending on commissionType. */
  commissionValue: parseFloat(process.env.COMMISSION_VALUE || '10'),

  /** Default radius (km) for nearby venue searches */
  defaultSearchRadiusKm: parseFloat(
    process.env.DEFAULT_SEARCH_RADIUS_KM || '50'
  ),

  /** Upload directory for multer */
  uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),

  /** Environment */
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

export default config;
