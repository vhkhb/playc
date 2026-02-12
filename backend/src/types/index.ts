import { Request } from 'express';

// ─────────────────────────────────────────────
// Enums (mirror Prisma enums for use in app code)
// ─────────────────────────────────────────────

export enum UserRole {
  PLAYER = 'PLAYER',
  HOST = 'HOST',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export enum GameStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ParticipantStatus {
  INVITED = 'INVITED',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  JOINED = 'JOINED',
}

export enum CommunityMemberRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER',
}

export enum Recurrence {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export enum CommissionType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

// ─────────────────────────────────────────────
// Request interfaces
// ─────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ─────────────────────────────────────────────
// User & Profile interfaces
// ─────────────────────────────────────────────

export interface IUser {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  role: UserRole;
  bio?: string | null;
  location?: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlayerProfile {
  id: string;
  userId: string;
  sportsPreferences: any;
  skillLevel?: string | null;
  totalGamesPlayed: number;
  rating: number;
  reviews: any;
}

export interface IVendorProfile {
  id: string;
  userId: string;
  businessName: string;
  businessLicense?: string | null;
  address: string;
  city: string;
  state: string;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isApproved: boolean;
}

// ─────────────────────────────────────────────
// Venue & Slot interfaces
// ─────────────────────────────────────────────

export interface IVenue {
  id: string;
  vendorProfileId: string;
  name: string;
  description?: string | null;
  sportType: string;
  address: string;
  city: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  images: any;
  amenities: any;
  rating: number;
  isActive: boolean;
  adBanner?: string | null;
  isAdActive: boolean;
}

export interface ISlot {
  id: string;
  venueId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  price: number;
  currency: string;
  isAvailable: boolean;
  maxPlayers: number;
  recurrence: Recurrence;
}

// ─────────────────────────────────────────────
// Booking interface
// ─────────────────────────────────────────────

export interface IBooking {
  id: string;
  slotId: string;
  userId: string;
  venueId: string;
  status: BookingStatus;
  totalAmount: number;
  commissionAmount: number;
  commissionType: CommissionType;
  paymentStatus: PaymentStatus;
  paymentId?: string | null;
  bookedAt: Date;
}

// ─────────────────────────────────────────────
// Game interfaces
// ─────────────────────────────────────────────

export interface IGame {
  id: string;
  hostId: string;
  venueId: string;
  slotId: string;
  bookingId: string;
  title: string;
  sportType: string;
  description?: string | null;
  maxPlayers: number;
  currentPlayers: number;
  status: GameStatus;
  isPublic: boolean;
  extraServices: any;
  createdAt: Date;
}

export interface IGameParticipant {
  id: string;
  gameId: string;
  userId: string;
  status: ParticipantStatus;
  joinedAt?: Date | null;
}

// ─────────────────────────────────────────────
// Community interfaces
// ─────────────────────────────────────────────

export interface ICommunity {
  id: string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  createdById: string;
  sportType?: string | null;
  isAutoCreated: boolean;
  isPublic: boolean;
  memberCount: number;
  createdAt: Date;
}

export interface ICommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: CommunityMemberRole;
  joinedAt: Date;
}

export interface ICommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  content: string;
  images: any;
  likesCount: number;
  createdAt: Date;
}

// ─────────────────────────────────────────────
// Extra Service interface
// ─────────────────────────────────────────────

export interface IExtraService {
  id: string;
  venueId: string;
  name: string;
  description?: string | null;
  price: number;
  isAvailable: boolean;
}

// ─────────────────────────────────────────────
// Review interface
// ─────────────────────────────────────────────

export interface IReview {
  id: string;
  userId: string;
  venueId?: string | null;
  gameId?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: Date;
}

// ─────────────────────────────────────────────
// Notification interface
// ─────────────────────────────────────────────

export interface INotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data: any;
  isRead: boolean;
  createdAt: Date;
}

// ─────────────────────────────────────────────
// AppConfig interface
// ─────────────────────────────────────────────

export interface IAppConfig {
  id: string;
  key: string;
  value: string;
  description?: string | null;
}

// ─────────────────────────────────────────────
// API Response types
// ─────────────────────────────────────────────

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─────────────────────────────────────────────
// Commission calculation types
// ─────────────────────────────────────────────

export interface CommissionConfig {
  type: CommissionType;
  value: number;
}

export interface CommissionResult {
  commissionAmount: number;
  commissionType: CommissionType;
  totalAmount: number;
  vendorAmount: number;
}

// ─────────────────────────────────────────────
// Nearby venue query
// ─────────────────────────────────────────────

export interface NearbyQuery {
  latitude: number;
  longitude: number;
  radiusKm?: number;
}
