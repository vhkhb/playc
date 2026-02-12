import { NavigatorScreenParams } from '@react-navigation/native';

// ==================== User & Profile Types ====================

export type UserRole = 'player' | 'vendor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerProfile {
  id: string;
  userId: string;
  user?: User;
  sportsPreferences: SportType[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  gamesPlayed: number;
  rating: number;
  reviewCount: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
  };
}

export interface VendorProfile {
  id: string;
  userId: string;
  user?: User;
  businessName: string;
  businessAddress: string;
  gstNumber?: string;
  panNumber?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  isApproved: boolean;
  totalRevenue: number;
  totalBookings: number;
}

// ==================== Venue Types ====================

export interface Venue {
  id: string;
  vendorId: string;
  vendor?: VendorProfile;
  name: string;
  description: string;
  sportType: SportType;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  images: string[];
  amenities: Amenity[];
  rating: number;
  reviewCount: number;
  priceRange: {
    min: number;
    max: number;
  };
  isActive: boolean;
  adBanner?: {
    imageUrl: string;
    isActive: boolean;
    priority: number;
    expiresAt: string;
  };
  operatingHours: {
    day: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }[];
  extraServices: ExtraService[];
  distance?: number;
  createdAt: string;
  updatedAt: string;
}

export type Amenity =
  | 'parking'
  | 'changing_room'
  | 'shower'
  | 'drinking_water'
  | 'first_aid'
  | 'equipment_rental'
  | 'floodlights'
  | 'seating'
  | 'cafeteria'
  | 'wifi'
  | 'restroom'
  | 'locker';

export interface Slot {
  id: string;
  venueId: string;
  venue?: Venue;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  maxPlayers: number;
  bookedPlayers: number;
  isAvailable: boolean;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'weekdays' | 'weekends';
  createdAt: string;
}

// ==================== Booking Types ====================

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface Booking {
  id: string;
  userId: string;
  user?: User;
  venueId: string;
  venue?: Venue;
  slotId: string;
  slot?: Slot;
  gameId?: string;
  game?: Game;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  commissionAmount: number;
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
  extraServicesTotal: number;
  totalAmount: number;
  selectedExtraServices: SelectedExtraService[];
  notes?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SelectedExtraService {
  serviceId: string;
  serviceName: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

// ==================== Game Types ====================

export type GameStatus =
  | 'upcoming'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type ParticipantStatus =
  | 'invited'
  | 'accepted'
  | 'declined'
  | 'waitlisted';

export interface Game {
  id: string;
  hostId: string;
  host?: User;
  venueId: string;
  venue?: Venue;
  slotId: string;
  slot?: Slot;
  bookingId?: string;
  title: string;
  description: string;
  sportType: SportType;
  maxPlayers: number;
  currentPlayers: number;
  isPublic: boolean;
  status: GameStatus;
  participants: GameParticipant[];
  communityId?: string;
  extraServices: SelectedExtraService[];
  createdAt: string;
  updatedAt: string;
}

export interface GameParticipant {
  id: string;
  gameId: string;
  userId: string;
  user?: User;
  status: ParticipantStatus;
  invitedAt: string;
  respondedAt?: string;
}

// ==================== Community Types ====================

export type CommunityRole = 'admin' | 'moderator' | 'member';

export interface Community {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  sportType: SportType;
  isPublic: boolean;
  isAutoCreated: boolean;
  linkedGameId?: string;
  creatorId: string;
  creator?: User;
  memberCount: number;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  user?: User;
  role: CommunityRole;
  joinedAt: string;
  canViewContact: boolean;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  author?: User;
  content: string;
  images: string[];
  likeCount: number;
  isLikedByMe: boolean;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== Extra Service Types ====================

export interface ExtraService {
  id: string;
  venueId: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  isAvailable: boolean;
  category: 'equipment' | 'coaching' | 'refreshments' | 'other';
}

// ==================== Review Types ====================

export interface Review {
  id: string;
  userId: string;
  user?: User;
  venueId: string;
  bookingId: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

// ==================== Notification Types ====================

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'game_invite'
  | 'game_update'
  | 'community_invite'
  | 'community_post'
  | 'payment_received'
  | 'review_received'
  | 'slot_reminder'
  | 'general';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

// ==================== App Config Types ====================

export interface AppConfig {
  commissionPercentage: number;
  commissionFixed: number;
  commissionType: 'percentage' | 'fixed';
  minBookingAmount: number;
  maxBookingAdvanceDays: number;
  cancellationPolicyHours: number;
  supportEmail: string;
  supportPhone: string;
  termsUrl: string;
  privacyUrl: string;
}

// ==================== Sport Types ====================

export type SportType =
  | 'cricket'
  | 'football'
  | 'badminton'
  | 'tennis'
  | 'basketball'
  | 'swimming'
  | 'table_tennis'
  | 'volleyball'
  | 'hockey'
  | 'squash';

// ==================== Navigation Param Types ====================

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Host: undefined;
  Communities: undefined;
  Profile: undefined;
  Vendor: NavigatorScreenParams<VendorStackParamList>;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  VenueDetail: { venueId: string };
  GameDetail: { gameId: string };
  SlotSelection: { venueId: string };
  BookingConfirmation: { bookingId: string };
  MyBookings: undefined;
  PublicProfile: { userId: string };
};

export type ExploreStackParamList = {
  ExploreScreen: undefined;
  VenueDetail: { venueId: string };
  MapView: undefined;
  SlotSelection: { venueId: string };
  BookingConfirmation: { bookingId: string };
};

export type HostStackParamList = {
  HostGame: undefined;
  GameDetail: { gameId: string };
  InvitePlayers: { gameId: string };
  UpcomingGames: undefined;
};

export type CommunityStackParamList = {
  CommunitiesScreen: undefined;
  CommunityDetail: { communityId: string };
  CreateCommunity: undefined;
  MemberList: { communityId: string };
  PublicProfile: { userId: string };
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  MyBookings: undefined;
  PublicProfile: { userId: string };
};

export type VendorStackParamList = {
  VendorDashboard: undefined;
  ManageVenue: { venueId?: string };
  ManageSlots: { venueId: string };
  VendorBookings: undefined;
  ManageServices: { venueId: string };
  PaymentSettings: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SearchVenuesPayload {
  query?: string;
  sportType?: SportType;
  latitude?: number;
  longitude?: number;
  radius?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface CreateBookingPayload {
  venueId: string;
  slotId: string;
  gameId?: string;
  selectedExtraServices: { serviceId: string; quantity: number }[];
  notes?: string;
}

export interface HostGamePayload {
  venueId: string;
  slotId: string;
  title: string;
  description: string;
  sportType: SportType;
  maxPlayers: number;
  isPublic: boolean;
  extraServices: { serviceId: string; quantity: number }[];
}

export interface CreateCommunityPayload {
  name: string;
  description: string;
  sportType: SportType;
  avatar?: string;
  isPublic: boolean;
}

export interface CreatePostPayload {
  communityId: string;
  content: string;
  images?: string[];
}

export interface CreateVenuePayload {
  name: string;
  description: string;
  sportType: SportType;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  images: string[];
  amenities: Amenity[];
  operatingHours: {
    day: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }[];
}

export interface CreateSlotPayload {
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  maxPlayers: number;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'weekdays' | 'weekends';
}

export interface CreateExtraServicePayload {
  venueId: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: 'equipment' | 'coaching' | 'refreshments' | 'other';
}
