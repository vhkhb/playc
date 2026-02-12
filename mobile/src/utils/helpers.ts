import moment from 'moment';
import { BookingStatus, GameStatus } from '../types';
import Colors from '../constants/colors';

export const formatDate = (date: string, format: string = 'DD MMM YYYY'): string => {
  return moment(date).format(format);
};

export const formatTime = (time: string): string => {
  return moment(time, 'HH:mm').format('h:mm A');
};

export const formatDateTime = (date: string): string => {
  return moment(date).format('DD MMM YYYY, h:mm A');
};

export const formatRelativeTime = (date: string): string => {
  return moment(date).fromNow();
};

export const formatCurrency = (amount: number): string => {
  return `\u20B9${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const getDistanceText = (distanceKm: number | undefined): string => {
  if (!distanceKm) return '';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m away`;
  }
  return `${distanceKm.toFixed(1)}km away`;
};

export const getBookingStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case 'pending':
      return Colors.statusPending;
    case 'confirmed':
      return Colors.statusConfirmed;
    case 'cancelled':
      return Colors.statusCancelled;
    case 'completed':
      return Colors.statusCompleted;
    case 'no_show':
      return Colors.statusNoShow;
    default:
      return Colors.textSecondary;
  }
};

export const getGameStatusColor = (status: GameStatus): string => {
  switch (status) {
    case 'upcoming':
      return Colors.statusUpcoming;
    case 'in_progress':
      return Colors.statusInProgress;
    case 'completed':
      return Colors.statusGameCompleted;
    case 'cancelled':
      return Colors.statusGameCancelled;
    default:
      return Colors.textSecondary;
  }
};

export const getStatusLabel = (status: string): string => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const getInitials = (name: string): string => {
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const isToday = (date: string): boolean => {
  return moment(date).isSame(moment(), 'day');
};

export const isFutureDate = (date: string): boolean => {
  return moment(date).isAfter(moment(), 'day');
};

export const getDaysDifference = (date: string): number => {
  return moment(date).diff(moment(), 'days');
};

export const calculateCommission = (
  subtotal: number,
  commissionType: 'percentage' | 'fixed',
  commissionValue: number
): number => {
  if (commissionType === 'percentage') {
    return (subtotal * commissionValue) / 100;
  }
  return commissionValue;
};
