import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Colors from '../../constants/colors';
import { AppDispatch, RootState } from '../../store';
import { getBookingById } from '../../store/slices/bookingSlice';
import { HomeStackParamList } from '../../types';
import { formatCurrency, formatDate, formatTime } from '../../utils/helpers';

type Props = NativeStackScreenProps<HomeStackParamList, 'BookingConfirmation'>;

const BookingConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const { selectedBooking, loading } = useSelector(
    (state: RootState) => state.bookings
  );

  useEffect(() => {
    if (!selectedBooking || selectedBooking.id !== bookingId) {
      dispatch(getBookingById(bookingId));
    }
  }, [dispatch, bookingId, selectedBooking]);

  const handleViewBookings = () => {
    navigation.navigate('MyBookings');
  };

  const handleHostGame = () => {
    navigation.getParent()?.navigate('Host', { screen: 'HostGame' });
  };

  const handleBackToHome = () => {
    navigation.popToTop();
  };

  if (loading || !selectedBooking) {
    return <LoadingSpinner fullScreen message="Loading booking details..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.successSection}>
          <View style={styles.checkmarkCircle}>
            <Icon name="check" size={48} color={Colors.white} />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your booking has been successfully placed.
          </Text>
        </View>

        {/* Booking Details Card */}
        <Card style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Booking Details</Text>
            <Badge status={selectedBooking.status} type="booking" />
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIconRow}>
              <Icon
                name="office-building"
                size={18}
                color={Colors.textSecondary}
              />
              <Text style={styles.detailLabel}>Venue</Text>
            </View>
            <Text style={styles.detailValue}>
              {selectedBooking.venue?.name || 'Venue'}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailItem}>
            <View style={styles.detailIconRow}>
              <Icon
                name="calendar-outline"
                size={18}
                color={Colors.textSecondary}
              />
              <Text style={styles.detailLabel}>Date</Text>
            </View>
            <Text style={styles.detailValue}>
              {selectedBooking.slot
                ? formatDate(selectedBooking.slot.date, 'dddd, DD MMMM YYYY')
                : 'N/A'}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailItem}>
            <View style={styles.detailIconRow}>
              <Icon
                name="clock-outline"
                size={18}
                color={Colors.textSecondary}
              />
              <Text style={styles.detailLabel}>Time</Text>
            </View>
            <Text style={styles.detailValue}>
              {selectedBooking.slot
                ? `${formatTime(selectedBooking.slot.startTime)} - ${formatTime(
                    selectedBooking.slot.endTime
                  )}`
                : 'N/A'}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailItem}>
            <View style={styles.detailIconRow}>
              <Icon
                name="currency-inr"
                size={18}
                color={Colors.textSecondary}
              />
              <Text style={styles.detailLabel}>Amount Paid</Text>
            </View>
            <Text style={styles.amountValue}>
              {formatCurrency(selectedBooking.totalAmount)}
            </Text>
          </View>
        </Card>

        {/* Booking Reference */}
        <Card style={styles.referenceCard}>
          <View style={styles.referenceHeader}>
            <Icon name="ticket-confirmation-outline" size={20} color={Colors.secondary} />
            <Text style={styles.referenceTitle}>Booking Reference</Text>
          </View>
          <View style={styles.referenceIdContainer}>
            <Text style={styles.referenceId}>
              {selectedBooking.id.toUpperCase()}
            </Text>
            <TouchableOpacity style={styles.copyButton} activeOpacity={0.7}>
              <Icon name="content-copy" size={18} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.referenceNote}>
            Save this reference number for your records. You can use it to look
            up your booking details.
          </Text>
        </Card>

        {/* Extra Services Summary */}
        {selectedBooking.selectedExtraServices.length > 0 && (
          <Card style={styles.servicesCard}>
            <Text style={styles.servicesTitle}>Extra Services</Text>
            {selectedBooking.selectedExtraServices.map((service, index) => (
              <View key={index} style={styles.serviceRow}>
                <View style={styles.serviceNameRow}>
                  <Icon
                    name="check-circle"
                    size={16}
                    color={Colors.success}
                  />
                  <Text style={styles.serviceNameText}>
                    {service.serviceName} x{service.quantity}
                  </Text>
                </View>
                <Text style={styles.servicePriceText}>
                  {formatCurrency(service.total)}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Button
            title="View My Bookings"
            onPress={handleViewBookings}
            variant="primary"
            fullWidth
            size="large"
            icon={
              <Icon name="calendar-check" size={20} color={Colors.white} />
            }
          />

          <Button
            title="Host a Game"
            onPress={handleHostGame}
            variant="outline"
            fullWidth
            size="large"
            style={styles.hostButton}
            icon={
              <Icon name="gamepad-variant-outline" size={20} color={Colors.primary} />
            }
          />

          <TouchableOpacity
            style={styles.backToHomeLink}
            onPress={handleBackToHome}
            activeOpacity={0.7}
          >
            <Text style={styles.backToHomeText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: Colors.white,
  },
  checkmarkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  detailsCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  detailItem: {
    paddingVertical: 8,
  },
  detailIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 26,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 26,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
  referenceCard: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  referenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  referenceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.secondary,
    marginLeft: 8,
  },
  referenceIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  referenceId: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 4,
  },
  referenceNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  servicesCard: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  servicesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceNameText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  servicePriceText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  actionsSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  hostButton: {
    marginTop: 12,
  },
  backToHomeLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  backToHomeText: {
    fontSize: 15,
    color: Colors.textLink,
    fontWeight: '600',
  },
});

export default BookingConfirmationScreen;
