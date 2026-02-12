import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Colors from '../../constants/colors';
import { AppDispatch, RootState } from '../../store';
import {
  fetchMyBookings,
  categorizeBookings,
} from '../../store/slices/bookingSlice';
import { HomeStackParamList, Booking } from '../../types';
import { formatCurrency, formatDate, formatTime } from '../../utils/helpers';

type Props = NativeStackScreenProps<HomeStackParamList, 'MyBookings'>;

type TabKey = 'upcoming' | 'past' | 'cancelled';

interface Tab {
  key: TabKey;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { key: 'upcoming', label: 'Upcoming', icon: 'calendar-clock' },
  { key: 'past', label: 'Past', icon: 'history' },
  { key: 'cancelled', label: 'Cancelled', icon: 'cancel' },
];

const MyBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    upcomingBookings,
    pastBookings,
    cancelledBookings,
    loading,
  } = useSelector((state: RootState) => state.bookings);

  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchMyBookings());
    dispatch(categorizeBookings());
    setRefreshing(false);
  }, [dispatch]);

  const getBookingsForTab = useCallback((): Booking[] => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingBookings;
      case 'past':
        return pastBookings;
      case 'cancelled':
        return cancelledBookings;
      default:
        return [];
    }
  }, [activeTab, upcomingBookings, pastBookings, cancelledBookings]);

  const getEmptyStateConfig = useCallback(() => {
    switch (activeTab) {
      case 'upcoming':
        return {
          icon: 'calendar-blank-outline',
          title: 'No Upcoming Bookings',
          message:
            'You don\'t have any upcoming bookings. Browse venues and book a slot to get started.',
          actionLabel: 'Browse Venues',
        };
      case 'past':
        return {
          icon: 'history',
          title: 'No Past Bookings',
          message: 'Your completed bookings will appear here.',
        };
      case 'cancelled':
        return {
          icon: 'cancel',
          title: 'No Cancelled Bookings',
          message: 'You don\'t have any cancelled bookings.',
        };
    }
  }, [activeTab]);

  const handleBookingPress = useCallback(
    (booking: Booking) => {
      navigation.navigate('BookingConfirmation', { bookingId: booking.id });
    },
    [navigation]
  );

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <Card
      style={styles.bookingCard}
      onPress={() => handleBookingPress(item)}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.venueInfo}>
          <Text style={styles.venueName} numberOfLines={1}>
            {item.venue?.name || 'Venue'}
          </Text>
          <View style={styles.sportRow}>
            <Icon
              name="map-marker-outline"
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.venueLocation} numberOfLines={1}>
              {item.venue?.address}, {item.venue?.city}
            </Text>
          </View>
        </View>
        <Badge status={item.status} type="booking" size="small" />
      </View>

      {/* Date and Time */}
      <View style={styles.dateTimeSection}>
        <View style={styles.dateTimeItem}>
          <Icon name="calendar-outline" size={16} color={Colors.primary} />
          <Text style={styles.dateTimeText}>
            {item.slot
              ? formatDate(item.slot.date, 'ddd, DD MMM YYYY')
              : 'N/A'}
          </Text>
        </View>
        <View style={styles.dateTimeItem}>
          <Icon name="clock-outline" size={16} color={Colors.primary} />
          <Text style={styles.dateTimeText}>
            {item.slot
              ? `${formatTime(item.slot.startTime)} - ${formatTime(
                  item.slot.endTime
                )}`
              : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(item.totalAmount)}
          </Text>
        </View>
        <View style={styles.arrowContainer}>
          <Icon name="chevron-right" size={22} color={Colors.textLight} />
        </View>
      </View>
    </Card>
  );

  const bookings = getBookingsForTab();
  const emptyConfig = getEmptyStateConfig();

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count =
            tab.key === 'upcoming'
              ? upcomingBookings.length
              : tab.key === 'past'
              ? pastBookings.length
              : cancelledBookings.length;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Icon
                name={tab.icon}
                size={18}
                color={isActive ? Colors.primary : Colors.textSecondary}
              />
              <Text
                style={[styles.tabLabel, isActive && styles.activeTabLabel]}
              >
                {tab.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.tabBadge,
                    isActive && styles.activeTabBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      isActive && styles.activeTabBadgeText,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <LoadingSpinner fullScreen message="Loading bookings..." />
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            bookings.length === 0 && styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={emptyConfig.icon}
              title={emptyConfig.title}
              message={emptyConfig.message}
              actionLabel={emptyConfig.actionLabel}
              onAction={
                emptyConfig.actionLabel
                  ? () => navigation.popToTop()
                  : undefined
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: Colors.successLight,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: Colors.border,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  activeTabBadge: {
    backgroundColor: Colors.primary,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabBadgeText: {
    color: Colors.white,
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flex: 1,
  },
  bookingCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  venueInfo: {
    flex: 1,
    marginRight: 12,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  sportRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  dateTimeSection: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 16,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  arrowContainer: {
    padding: 4,
  },
});

export default MyBookingsScreen;
