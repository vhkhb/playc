// Shared types between backend and mobile app

// ============ Enums ============

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

export enum SlotRecurrence {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export enum CommissionType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export enum NotificationType {
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  GAME_INVITATION = 'GAME_INVITATION',
  GAME_REMINDER = 'GAME_REMINDER',
  COMMUNITY_INVITE = 'COMMUNITY_INVITE',
  NEW_POST = 'NEW_POST',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
}

// ============ Sport Types ============

export const SPORT_TYPES = [
  'Cricket',
  'Football',
  'Badminton',
  'Tennis',
  'Basketball',
  'Swimming',
  'Table Tennis',
  'Volleyball',
  'Hockey',
  'Squash',
  'Pickle Ball',
  'Boxing',
  'Gym',
] as const;

export type SportType = (typeof SPORT_TYPES)[number];

// ============ API Types ============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
}

export interface NearbySearchParams {
  latitude: number;
  longitude: number;
  radius?: number; // in km, default 10
  sportType?: SportType;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface CreateBookingRequest {
  slotId: string;
  venueId: string;
  extraServiceIds?: string[];
}

export interface HostGameRequest {
  venueId: string;
  slotId: string;
  bookingId: string;
  title: string;
  sportType: SportType;
  description?: string;
  maxPlayers: number;
  isPublic: boolean;
  extraServices?: string[];
}

export interface CreateCommunityRequest {
  name: string;
  description?: string;
  sportType?: SportType;
  isPublic: boolean;
}

export interface CreatePostRequest {
  content: string;
  images?: string[];
}

export interface CreateVenueRequest {
  name: string;
  description?: string;
  sportType: SportType;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  amenities?: string[];
}

export interface CreateSlotRequest {
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  currency?: string;
  maxPlayers: number;
  recurrence: SlotRecurrence;
}

export interface CommissionConfig {
  type: CommissionType;
  value: number;
}
