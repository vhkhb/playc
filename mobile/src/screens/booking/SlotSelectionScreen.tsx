import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import SlotCard from '../../components/venue/SlotCard';
import Colors from '../../constants/colors';
import { AppDispatch, RootState } from '../../store';
import { fetchVenueSlots, getVenueById } from '../../store/slices/venueSlice';
import { createBooking, clearBookingError } from '../../store/slices/bookingSlice';
import {
  HomeStackParamList,
  Slot,
  ExtraService,
  CreateBookingPayload,
} from '../../types';
import { formatCurrency, formatTime, formatDate, calculateCommission } from '../../utils/helpers';

type Props = NativeStackScreenProps<HomeStackParamList, 'SlotSelection'>;

interface DateItem {
  date: string;
  day: string;
  dayOfWeek: string;
  isToday: boolean;
}

interface SelectedService {
  serviceId: string;
  quantity: number;
}

const COMMISSION_TYPE: 'percentage' | 'fixed' = 'percentage';
const COMMISSION_VALUE = 10;

const SlotSelectionScreen: React.FC<Props> = ({ route, navigation }) => {
  const { venueId } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const { selectedVenue, venueSlots, slotsLoading } = useSelector(
    (state: RootState) => state.venues
  );
  const { createLoading, error: bookingError } = useSelector(
    (state: RootState) => state.bookings
  );

  const [selectedDate, setSelectedDate] = useState<string>(
    moment().format('YYYY-MM-DD')
  );
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  const dates: DateItem[] = useMemo(() => {
    const result: DateItem[] = [];
    for (let i = 0; i < 14; i++) {
      const date = moment().add(i, 'days');
      result.push({
        date: date.format('YYYY-MM-DD'),
        day: date.format('DD'),
        dayOfWeek: date.format('ddd'),
        isToday: i === 0,
      });
    }
    return result;
  }, []);

  useEffect(() => {
    if (!selectedVenue) {
      dispatch(getVenueById(venueId));
    }
  }, [dispatch, venueId, selectedVenue]);

  useEffect(() => {
    dispatch(fetchVenueSlots({ venueId, date: selectedDate }));
    setSelectedSlot(null);
  }, [dispatch, venueId, selectedDate]);

  useEffect(() => {
    if (bookingError) {
      Alert.alert('Booking Error', bookingError);
      dispatch(clearBookingError());
    }
  }, [bookingError, dispatch]);

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleSlotSelect = useCallback((slot: Slot) => {
    setSelectedSlot(slot);
  }, []);

  const handleServiceToggle = useCallback(
    (service: ExtraService) => {
      setSelectedServices((prev) => {
        const exists = prev.find((s) => s.serviceId === service.id);
        if (exists) {
          return prev.filter((s) => s.serviceId !== service.id);
        }
        return [...prev, { serviceId: service.id, quantity: 1 }];
      });
    },
    []
  );

  const extraServicesTotal = useMemo(() => {
    if (!selectedVenue) return 0;
    return selectedServices.reduce((total, selected) => {
      const service = selectedVenue.extraServices.find(
        (s) => s.id === selected.serviceId
      );
      return total + (service ? service.price * selected.quantity : 0);
    }, 0);
  }, [selectedServices, selectedVenue]);

  const subtotal = useMemo(() => {
    return (selectedSlot?.price || 0) + extraServicesTotal;
  }, [selectedSlot, extraServicesTotal]);

  const commission = useMemo(() => {
    return calculateCommission(subtotal, COMMISSION_TYPE, COMMISSION_VALUE);
  }, [subtotal]);

  const totalAmount = useMemo(() => {
    return subtotal + commission;
  }, [subtotal, commission]);

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      Alert.alert('Select Slot', 'Please select a time slot to continue.');
      return;
    }

    const payload: CreateBookingPayload = {
      venueId,
      slotId: selectedSlot.id,
      selectedExtraServices: selectedServices,
    };

    try {
      const result = await dispatch(createBooking(payload)).unwrap();
      navigation.replace('BookingConfirmation', { bookingId: result.id });
    } catch {
      // Error handled via bookingError state
    }
  };

  const renderDateItem = ({ item }: { item: DateItem }) => {
    const isSelected = item.date === selectedDate;
    return (
      <TouchableOpacity
        style={[styles.dateItem, isSelected && styles.dateItemSelected]}
        onPress={() => handleDateSelect(item.date)}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.dateDayOfWeek, isSelected && styles.dateTextSelected]}
        >
          {item.dayOfWeek}
        </Text>
        <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>
          {item.day}
        </Text>
        {item.isToday && (
          <View
            style={[
              styles.todayDot,
              isSelected && styles.todayDotSelected,
            ]}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderSlotItem = ({ item }: { item: Slot }) => (
    <SlotCard
      slot={item}
      selected={selectedSlot?.id === item.id}
      onPress={() => handleSlotSelect(item)}
    />
  );

  const renderServiceItem = (service: ExtraService) => {
    const isSelected = selectedServices.some(
      (s) => s.serviceId === service.id
    );
    return (
      <TouchableOpacity
        key={service.id}
        style={[styles.serviceItem, isSelected && styles.serviceItemSelected]}
        onPress={() => handleServiceToggle(service)}
        activeOpacity={0.7}
      >
        <View style={styles.serviceCheckbox}>
          <Icon
            name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={22}
            color={isSelected ? Colors.primary : Colors.textLight}
          />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceDescription}>{service.description}</Text>
        </View>
        <Text style={styles.servicePrice}>
          {formatCurrency(service.price)}/{service.unit}
        </Text>
      </TouchableOpacity>
    );
  };

  if (!selectedVenue && !slotsLoading) {
    return <LoadingSpinner fullScreen message="Loading venue details..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Venue Header */}
        <View style={styles.venueHeader}>
          <Text style={styles.venueName}>{selectedVenue?.name || 'Venue'}</Text>
          <Text style={styles.venueAddress}>
            {selectedVenue?.address}, {selectedVenue?.city}
          </Text>
        </View>

        {/* Calendar Strip */}
        <View style={styles.calendarSection}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <FlatList
            data={dates}
            renderItem={renderDateItem}
            keyExtractor={(item) => item.date}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateListContent}
          />
        </View>

        {/* Time Slots Grid */}
        <View style={styles.slotsSection}>
          <Text style={styles.sectionTitle}>Available Slots</Text>
          <Text style={styles.sectionSubtitle}>
            {formatDate(selectedDate, 'dddd, DD MMMM YYYY')}
          </Text>

          {slotsLoading ? (
            <LoadingSpinner message="Loading slots..." />
          ) : venueSlots.length === 0 ? (
            <EmptyState
              icon="calendar-blank-outline"
              title="No Slots Available"
              message="No time slots are available for the selected date. Try a different date."
              style={styles.emptySlots}
            />
          ) : (
            <FlatList
              data={venueSlots}
              renderItem={renderSlotItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.slotsGrid}
            />
          )}
        </View>

        {/* Selected Slot Details */}
        {selectedSlot && (
          <Card style={styles.selectedSlotCard}>
            <View style={styles.selectedSlotHeader}>
              <Icon name="clock-check-outline" size={20} color={Colors.primary} />
              <Text style={styles.selectedSlotTitle}>Selected Slot</Text>
            </View>
            <View style={styles.selectedSlotDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>
                  {formatTime(selectedSlot.startTime)} -{' '}
                  {formatTime(selectedSlot.endTime)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Price</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(selectedSlot.price)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Max Players</Text>
                <Text style={styles.detailValue}>
                  {selectedSlot.maxPlayers} players
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Extra Services */}
        {selectedVenue?.extraServices &&
          selectedVenue.extraServices.length > 0 && (
            <View style={styles.servicesSection}>
              <Text style={styles.sectionTitle}>Extra Services</Text>
              <Text style={styles.sectionSubtitle}>
                Add optional services to your booking
              </Text>
              {selectedVenue.extraServices
                .filter((s) => s.isAvailable)
                .map(renderServiceItem)}
            </View>
          )}

        {/* Price Breakdown */}
        {selectedSlot && (
          <Card style={styles.priceCard}>
            <Text style={styles.priceTitle}>Price Breakdown</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Slot Price</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(selectedSlot.price)}
              </Text>
            </View>
            {extraServicesTotal > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Extra Services</Text>
                <Text style={styles.priceValue}>
                  {formatCurrency(extraServicesTotal)}
                </Text>
              </View>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Commission ({COMMISSION_VALUE}%)
              </Text>
              <Text style={styles.priceValue}>
                {formatCurrency(commission)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.bottomBar}>
        {selectedSlot && (
          <View style={styles.bottomPriceRow}>
            <Text style={styles.bottomPriceLabel}>Total Amount</Text>
            <Text style={styles.bottomPriceValue}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        )}
        <Button
          title="Confirm Booking"
          onPress={handleConfirmBooking}
          loading={createLoading}
          disabled={!selectedSlot}
          fullWidth
          size="large"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  venueHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  venueName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  calendarSection: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dateListContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 56,
  },
  dateItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dateDayOfWeek: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  dateTextSelected: {
    color: Colors.white,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  todayDotSelected: {
    backgroundColor: Colors.white,
  },
  slotsSection: {
    paddingTop: 16,
  },
  slotsGrid: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  emptySlots: {
    paddingVertical: 32,
  },
  selectedSlotCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  selectedSlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedSlotTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  selectedSlotDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  servicesSection: {
    paddingTop: 20,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.successLight,
  },
  serviceCheckbox: {
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 8,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  priceCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  priceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bottomPriceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bottomPriceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
});

export default SlotSelectionScreen;
