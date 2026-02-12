import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import Badge from '../common/Badge';

interface BookingCardProps {
  booking: {
    id: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    totalAmount: number;
    bookedAt: string;
    venue?: { name: string; sportType: string };
    slot?: { date: string; startTime: string; endTime: string };
  };
  onPress?: () => void;
}

const statusVariant: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'error',
  COMPLETED: 'default',
};

const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.venueInfo}>
          <Text style={styles.venueName} numberOfLines={1}>
            {booking.venue?.name || 'Venue'}
          </Text>
          {booking.venue?.sportType && (
            <Text style={styles.sportType}>{booking.venue.sportType}</Text>
          )}
        </View>
        <Badge
          label={booking.status}
          variant={statusVariant[booking.status] || 'default'}
        />
      </View>

      {booking.slot && (
        <View style={styles.slotInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{booking.slot.date}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>
              {booking.slot.startTime} - {booking.slot.endTime}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Amount</Text>
            <Text style={styles.amountValue}>
              ${booking.totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.bookedAt}>
        Booked on {new Date(booking.bookedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  venueInfo: { flex: 1, marginRight: 8 },
  venueName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  sportType: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  slotInfo: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  infoItem: { flex: 1, alignItems: 'center' },
  infoLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  amountValue: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  bookedAt: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});

export default BookingCard;
