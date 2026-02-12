import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Colors from '../../constants/colors';
import { AppDispatch, RootState } from '../../store';
import {
  fetchVendorDashboard,
  fetchMyVenues,
  fetchVendorBookings,
} from '../../store/slices/vendorSlice';
import { VendorStackParamList, Booking } from '../../types';

type Props = NativeStackScreenProps<VendorStackParamList, 'VendorDashboard'>;

const VendorDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    dashboardStats,
    myVenues,
    vendorBookings,
    loading,
  } = useSelector((state: RootState) => state.vendor);

  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = useCallback(() => {
    dispatch(fetchVendorDashboard());
    dispatch(fetchMyVenues());
    dispatch(fetchVendorBookings({ date: new Date().toISOString().split('T')[0] }));
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchVendorDashboard()),
      dispatch(fetchMyVenues()),
      dispatch(fetchVendorBookings({ date: new Date().toISOString().split('T')[0] })),
    ]);
    setRefreshing(false);
  }, [dispatch]);

  const todayBookings = vendorBookings.filter((b: Booking) => {
    const today = new Date().toISOString().split('T')[0];
    return b.createdAt?.startsWith(today) || b.slot?.date === today;
  });

  const revenueData = [
    { label: 'Jan', value: 0.3 },
    { label: 'Feb', value: 0.5 },
    { label: 'Mar', value: 0.7 },
    { label: 'Apr', value: 0.4 },
    { label: 'May', value: 0.9 },
    { label: 'Jun', value: 0.6 },
  ];

  const maxBarHeight = 100;

  if (loading && !dashboardStats && !refreshing) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return Colors.statusConfirmed;
      case 'pending':
        return Colors.statusPending;
      case 'cancelled':
        return Colors.statusCancelled;
      case 'completed':
        return Colors.statusCompleted;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.businessName}>
            {user?.name || 'Vendor'}
          </Text>
        </View>
        <Avatar
          name={user?.name || 'V'}
          uri={user?.avatar}
          size="large"
        />
      </View>

      {/* Stats Cards Row */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: Colors.infoLight }]}>
            <Icon name="map-marker-outline" size={22} color={Colors.secondary} />
          </View>
          <Text style={styles.statValue}>
            {dashboardStats?.activeVenues ?? myVenues.length}
          </Text>
          <Text style={styles.statLabel}>Total Venues</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: Colors.warningLight }]}>
            <Icon name="calendar-check-outline" size={22} color={Colors.warning} />
          </View>
          <Text style={styles.statValue}>
            {dashboardStats?.todayBookings ?? todayBookings.length}
          </Text>
          <Text style={styles.statLabel}>Today's Bookings</Text>
        </Card>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: Colors.successLight }]}>
            <Icon name="currency-inr" size={22} color={Colors.success} />
          </View>
          <Text style={styles.statValue}>
            {dashboardStats?.monthRevenue
              ? `${(dashboardStats.monthRevenue / 1000).toFixed(1)}k`
              : '0'}
          </Text>
          <Text style={styles.statLabel}>Revenue (Month)</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: Colors.primaryLight }]}>
            <Icon name="clock-outline" size={22} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>
            {myVenues.filter((v) => v.isActive).length}
          </Text>
          <Text style={styles.statLabel}>Active Slots</Text>
        </Card>
      </View>

      {/* Today's Bookings Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Bookings</Text>
        <TouchableOpacity onPress={() => navigation.navigate('VendorBookings')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {todayBookings.length === 0 ? (
        <Card style={styles.emptyBookingsCard}>
          <EmptyState
            icon="calendar-blank-outline"
            title="No bookings today"
            message="You don't have any bookings scheduled for today."
            style={styles.emptyStateInline}
          />
        </Card>
      ) : (
        todayBookings.slice(0, 5).map((booking: Booking) => (
          <Card key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingCardContent}>
              <Avatar
                name={booking.user?.name || 'Player'}
                uri={booking.user?.avatar}
                size="medium"
              />
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingPlayerName}>
                  {booking.user?.name || 'Player'}
                </Text>
                <Text style={styles.bookingTime}>
                  {booking.slot?.startTime || '--:--'} - {booking.slot?.endTime || '--:--'}
                </Text>
                <Text style={styles.bookingVenue} numberOfLines={1}>
                  {booking.venue?.name || 'Venue'}
                </Text>
              </View>
              <Badge status={booking.status} type="booking" size="small" />
            </View>
          </Card>
        ))
      )}

      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>

      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ManageVenue', {})}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: Colors.successLight }]}>
            <Icon name="plus-circle-outline" size={28} color={Colors.success} />
          </View>
          <Text style={styles.actionLabel}>Add Venue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (myVenues.length > 0) {
              navigation.navigate('ManageSlots', { venueId: myVenues[0].id });
            }
          }}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: Colors.infoLight }]}>
            <Icon name="clock-edit-outline" size={28} color={Colors.secondary} />
          </View>
          <Text style={styles.actionLabel}>Manage Slots</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('VendorBookings')}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: Colors.warningLight }]}>
            <Icon name="book-open-variant" size={28} color={Colors.warning} />
          </View>
          <Text style={styles.actionLabel}>View Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (myVenues.length > 0) {
              navigation.navigate('ManageServices', { venueId: myVenues[0].id });
            }
          }}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: Colors.errorLight }]}>
            <Icon name="room-service-outline" size={28} color={Colors.error} />
          </View>
          <Text style={styles.actionLabel}>Services</Text>
        </TouchableOpacity>
      </View>

      {/* Revenue Chart Placeholder */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Revenue Overview</Text>
      </View>

      <Card style={styles.chartCard}>
        <View style={styles.chartContainer}>
          {revenueData.map((item, index) => (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: item.value * maxBarHeight,
                      backgroundColor:
                        index === revenueData.length - 1
                          ? Colors.primary
                          : Colors.primaryLight,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primaryLight }]} />
            <Text style={styles.legendText}>Previous</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Current</Text>
          </View>
        </View>
      </Card>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  businessName: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyBookingsCard: {
    paddingVertical: 8,
  },
  emptyStateInline: {
    flex: 0,
    paddingVertical: 16,
  },
  bookingCard: {
    marginBottom: 10,
  },
  bookingCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookingPlayerName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  bookingTime: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bookingVenue: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  chartCard: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 130,
    paddingBottom: 4,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 100,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 28,
    borderRadius: 6,
    minHeight: 8,
  },
  barLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bottomSpacer: {
    height: 24,
  },
});

export default VendorDashboardScreen;
