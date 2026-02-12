import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS } from '../../constants/colors';

type Props = NativeStackScreenProps<any, 'VendorBookings'>;

const STATUS_FILTERS = ['All', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
const statusVariant: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'error',
  COMPLETED: 'default',
};

const VendorBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { vendorBookings, loading } = useSelector((state: RootState) => state.vendor);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // dispatch fetch vendor bookings
    setRefreshing(false);
  }, [dispatch]);

  const filteredBookings = selectedStatus === 'All'
    ? vendorBookings
    : vendorBookings.filter((b: any) => b.status === selectedStatus);

  const stats = {
    total: vendorBookings.length,
    pending: vendorBookings.filter((b: any) => b.status === 'PENDING').length,
    revenue: vendorBookings
      .filter((b: any) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0),
  };

  const handleConfirmBooking = (bookingId: string) => {
    Alert.alert('Confirm Booking', 'Are you sure you want to confirm this booking?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => { /* dispatch confirm */ } },
    ]);
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => { /* dispatch cancel */ } },
    ]);
  };

  const renderBookingItem = ({ item }: { item: any }) => {
    const isExpanded = expandedBookingId === item.id;
    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => setExpandedBookingId(isExpanded ? null : item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.bookingHeader}>
          <View style={styles.bookingInfo}>
            <View style={styles.playerRow}>
              <Avatar name={item.user?.name || 'Player'} size={36} />
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{item.user?.name || 'Player'}</Text>
                <Text style={styles.venueName}>{item.venue?.name || 'Venue'}</Text>
              </View>
            </View>
          </View>
          <Badge label={item.status} variant={statusVariant[item.status] || 'default'} />
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{item.slot?.date || 'N/A'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{item.slot?.startTime} - {item.slot?.endTime}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.amountValue}>${(item.totalAmount || 0).toFixed(2)}</Text>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.expandedRow}>
              <Text style={styles.expandedLabel}>Commission:</Text>
              <Text style={styles.expandedValue}>${(item.commissionAmount || 0).toFixed(2)}</Text>
            </View>
            {item.user?.phone && (
              <View style={styles.expandedRow}>
                <Text style={styles.expandedLabel}>Phone:</Text>
                <Text style={styles.expandedValue}>{item.user.phone}</Text>
              </View>
            )}
            {item.user?.email && (
              <View style={styles.expandedRow}>
                <Text style={styles.expandedLabel}>Email:</Text>
                <Text style={styles.expandedValue}>{item.user.email}</Text>
              </View>
            )}
            <View style={styles.expandedRow}>
              <Text style={styles.expandedLabel}>Booked:</Text>
              <Text style={styles.expandedValue}>{new Date(item.bookedAt).toLocaleString()}</Text>
            </View>

            {item.status === 'PENDING' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={() => handleConfirmBooking(item.id)}
                >
                  <Text style={styles.confirmBtnText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => handleCancelBooking(item.id)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && vendorBookings.length === 0) {
    return <LoadingSpinner message="Loading bookings..." />;
  }

  return (
    <View style={styles.container}>
      {/* Summary Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>${stats.revenue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {STATUS_FILTERS.map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, selectedStatus === status && styles.filterChipActive]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[styles.filterChipText, selectedStatus === status && styles.filterChipTextActive]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item: any) => item.id}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title="No Bookings"
            message={selectedStatus !== 'All' ? `No ${selectedStatus.toLowerCase()} bookings found.` : 'No bookings yet for your venues.'}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  statsRow: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  filterScroll: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  filterChipTextActive: { color: COLORS.white },
  listContent: { padding: 16 },
  bookingCard: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  bookingInfo: { flex: 1, marginRight: 8 },
  playerRow: { flexDirection: 'row', alignItems: 'center' },
  playerInfo: { marginLeft: 10 },
  playerName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  venueName: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  bookingDetails: {
    flexDirection: 'row', backgroundColor: COLORS.background, borderRadius: 8, padding: 10,
  },
  detailItem: { flex: 1, alignItems: 'center' },
  detailLabel: { fontSize: 11, color: COLORS.textSecondary },
  detailValue: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginTop: 2 },
  amountValue: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginTop: 2 },
  expandedSection: {
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  expandedRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  expandedLabel: { fontSize: 13, color: COLORS.textSecondary },
  expandedValue: { fontSize: 13, fontWeight: '500', color: COLORS.text },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  confirmBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: 'center',
  },
  confirmBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  cancelBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.error, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.error },
});

export default VendorBookingsScreen;
