import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import SlotCard from '../../components/venue/SlotCard';
import { COLORS } from '../../constants/colors';
import { AppDispatch, RootState } from '../../store';
import {
  getVenueById,
  fetchVenueSlots,
  fetchVenueReviews,
  clearSelectedVenue,
} from '../../store/slices/venueSlice';
import {
  ExploreStackParamList,
  Venue,
  Slot,
  Review,
  Amenity,
  ExtraService,
} from '../../types';
import {
  formatCurrency,
  formatDate,
  formatTime,
  formatRelativeTime,
  getSportName,
} from '../../utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 260;

type Props = NativeStackScreenProps<ExploreStackParamList, 'VenueDetail'>;

const AMENITY_ICONS: Record<Amenity, { icon: string; label: string }> = {
  parking: { icon: 'car', label: 'Parking' },
  changing_room: { icon: 'hanger', label: 'Changing Room' },
  shower: { icon: 'shower-head', label: 'Shower' },
  drinking_water: { icon: 'water', label: 'Drinking Water' },
  first_aid: { icon: 'medical-bag', label: 'First Aid' },
  equipment_rental: { icon: 'tennis', label: 'Equipment Rental' },
  floodlights: { icon: 'lightbulb-on', label: 'Floodlights' },
  seating: { icon: 'seat', label: 'Seating' },
  cafeteria: { icon: 'coffee', label: 'Cafeteria' },
  wifi: { icon: 'wifi', label: 'WiFi' },
  restroom: { icon: 'human-male-female', label: 'Restroom' },
  locker: { icon: 'locker', label: 'Locker' },
};

const VenueDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { venueId } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const { selectedVenue, venueSlots, venueReviews, loading, slotsLoading } =
    useSelector((state: RootState) => state.venues);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  useEffect(() => {
    dispatch(getVenueById(venueId));
    dispatch(fetchVenueReviews(venueId));
    return () => {
      dispatch(clearSelectedVenue());
    };
  }, [dispatch, venueId]);

  useEffect(() => {
    if (venueId && selectedDate) {
      dispatch(fetchVenueSlots({ venueId, date: selectedDate }));
    }
  }, [dispatch, venueId, selectedDate]);

  const handleImageScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };

  const handleBookNow = () => {
    navigation.navigate('SlotSelection', { venueId });
  };

  const getDateOptions = (): { date: string; label: string; dayLabel: string }[] => {
    const options = [];
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      options.push({
        date: dateStr,
        label: d.getDate().toString(),
        dayLabel: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : dayNames[d.getDay()],
      });
    }
    return options;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Icon key={i} name="star" size={16} color={COLORS.rating} />
        );
      } else if (i === fullStars && hasHalf) {
        stars.push(
          <Icon key={i} name="star-half-full" size={16} color={COLORS.rating} />
        );
      } else {
        stars.push(
          <Icon key={i} name="star-outline" size={16} color={COLORS.border} />
        );
      }
    }
    return stars;
  };

  const renderReviewItem = (review: Review) => (
    <Card key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Avatar
          uri={review.user?.avatar}
          name={review.user?.name || 'User'}
          size="small"
        />
        <View style={styles.reviewUserInfo}>
          <Text style={styles.reviewUserName}>
            {review.user?.name || 'Anonymous'}
          </Text>
          <Text style={styles.reviewDate}>
            {formatRelativeTime(review.createdAt)}
          </Text>
        </View>
        <View style={styles.reviewRating}>
          {renderStars(review.rating)}
        </View>
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
      {review.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.reviewImages}
        >
          {review.images.map((img, idx) => (
            <Image
              key={idx}
              source={{ uri: img }}
              style={styles.reviewImage}
            />
          ))}
        </ScrollView>
      )}
    </Card>
  );

  if (loading && !selectedVenue) {
    return <LoadingSpinner fullScreen message="Loading venue details..." />;
  }

  if (!selectedVenue) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Venue Not Found"
        message="The venue you're looking for could not be found."
        actionLabel="Go Back"
        onAction={() => navigation.goBack()}
      />
    );
  }

  const venue: Venue = selectedVenue;
  const dateOptions = getDateOptions();
  const availableSlots = venueSlots.filter((s) => s.isAvailable);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleImageScroll}
            decelerationRate="fast"
          >
            {venue.images.length > 0 ? (
              venue.images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={styles.venueImage}
                />
              ))
            ) : (
              <Image
                source={require('../../assets/venue-placeholder.png')}
                style={styles.venueImage}
              />
            )}
          </ScrollView>

          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>

          {/* Image indicators */}
          {venue.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {venue.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === activeImageIndex && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Image count badge */}
          <View style={styles.imageCountBadge}>
            <Icon name="camera" size={14} color={COLORS.white} />
            <Text style={styles.imageCountText}>
              {activeImageIndex + 1}/{venue.images.length || 1}
            </Text>
          </View>
        </View>

        {/* Venue Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <View style={styles.nameLeft}>
              <Text style={styles.venueName}>{venue.name}</Text>
              <Text style={styles.sportType}>
                {getSportName(venue.sportType)}
              </Text>
            </View>
            <View style={styles.ratingBadge}>
              <Icon name="star" size={18} color={COLORS.rating} />
              <Text style={styles.ratingText}>
                {venue.rating.toFixed(1)}
              </Text>
              <Text style={styles.reviewCount}>
                ({venue.reviewCount})
              </Text>
            </View>
          </View>

          <View style={styles.addressRow}>
            <Icon
              name="map-marker-outline"
              size={18}
              color={COLORS.textSecondary}
            />
            <Text style={styles.addressText}>
              {venue.address}, {venue.city}, {venue.state} - {venue.zipCode}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Icon name="tag-outline" size={18} color={COLORS.primary} />
            <Text style={styles.priceText}>
              {formatCurrency(venue.priceRange.min)}
              {venue.priceRange.min !== venue.priceRange.max
                ? ` - ${formatCurrency(venue.priceRange.max)}`
                : ''}
              <Text style={styles.priceUnit}> / slot</Text>
            </Text>
          </View>

          {venue.description && (
            <Text style={styles.description}>{venue.description}</Text>
          )}
        </View>

        {/* Amenities */}
        {venue.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {venue.amenities.map((amenity) => {
                const amenityInfo = AMENITY_ICONS[amenity];
                return (
                  <View key={amenity} style={styles.amenityItem}>
                    <View style={styles.amenityIconWrapper}>
                      <Icon
                        name={amenityInfo.icon}
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>
                    <Text style={styles.amenityLabel}>
                      {amenityInfo.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Available Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Slots</Text>

          {/* Date Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateSelector}
          >
            {dateOptions.map((option) => (
              <TouchableOpacity
                key={option.date}
                style={[
                  styles.dateItem,
                  selectedDate === option.date && styles.dateItemActive,
                ]}
                onPress={() => setSelectedDate(option.date)}
              >
                <Text
                  style={[
                    styles.dateDayLabel,
                    selectedDate === option.date && styles.dateTextActive,
                  ]}
                >
                  {option.dayLabel}
                </Text>
                <Text
                  style={[
                    styles.dateLabel,
                    selectedDate === option.date && styles.dateTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Slots Grid */}
          {slotsLoading ? (
            <LoadingSpinner size="small" message="Loading slots..." />
          ) : availableSlots.length > 0 ? (
            <View style={styles.slotsGrid}>
              {availableSlots.map((slot: Slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  onPress={() =>
                    navigation.navigate('SlotSelection', { venueId })
                  }
                />
              ))}
            </View>
          ) : (
            <Card style={styles.noSlotsCard}>
              <EmptyState
                icon="calendar-remove-outline"
                title="No Available Slots"
                message="No slots available for this date. Try another date."
                style={styles.inlineEmpty}
              />
            </Card>
          )}
        </View>

        {/* Extra Services */}
        {venue.extraServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Extra Services</Text>
            {venue.extraServices.map((service: ExtraService) => (
              <Card key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceRow}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDescription}>
                      {service.description}
                    </Text>
                    <Badge
                      status={service.category}
                      label={service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                      color={COLORS.secondary}
                      size="small"
                    />
                  </View>
                  <View style={styles.servicePrice}>
                    <Text style={styles.servicePriceText}>
                      {formatCurrency(service.price)}
                    </Text>
                    <Text style={styles.servicePriceUnit}>
                      / {service.unit}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.overallRating}>
              {renderStars(venue.rating)}
              <Text style={styles.overallRatingText}>
                {venue.rating.toFixed(1)} ({venue.reviewCount} reviews)
              </Text>
            </View>
          </View>

          {venueReviews.length > 0 ? (
            venueReviews.slice(0, 5).map(renderReviewItem)
          ) : (
            <Card style={styles.noReviewsCard}>
              <EmptyState
                icon="comment-text-outline"
                title="No Reviews Yet"
                message="Be the first to review this venue after your booking."
                style={styles.inlineEmpty}
              />
            </Card>
          )}
        </View>

        {/* Bottom spacer for floating button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Book Now Button */}
      <View style={styles.floatingButtonContainer}>
        <View style={styles.floatingButtonLeft}>
          <Text style={styles.floatingPriceLabel}>Starting from</Text>
          <Text style={styles.floatingPrice}>
            {formatCurrency(venue.priceRange.min)}
          </Text>
        </View>
        <Button
          title="Book Now"
          onPress={handleBookNow}
          variant="primary"
          size="large"
          style={styles.bookNowButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    position: 'relative',
    height: IMAGE_HEIGHT,
  },
  venueImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: COLORS.white,
    width: 20,
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  imageCountText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameLeft: {
    flex: 1,
    marginRight: 12,
  },
  venueName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  sportType: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  priceUnit: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  amenityIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  amenityLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  dateSelector: {
    paddingBottom: 12,
    gap: 8,
  },
  dateItem: {
    width: 56,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  dateItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateDayLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  dateLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '700',
  },
  dateTextActive: {
    color: COLORS.white,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  noSlotsCard: {
    marginTop: 4,
  },
  inlineEmpty: {
    flex: 0,
    paddingVertical: 20,
  },
  serviceCard: {
    marginBottom: 8,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  servicePrice: {
    alignItems: 'flex-end',
  },
  servicePriceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  servicePriceUnit: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overallRatingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  reviewCard: {
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUserInfo: {
    flex: 1,
    marginLeft: 10,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  reviewImages: {
    marginTop: 8,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    resizeMode: 'cover',
  },
  noReviewsCard: {
    marginTop: 4,
  },
  bottomSpacer: {
    height: 100,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  floatingButtonLeft: {
    flex: 1,
    marginRight: 12,
  },
  floatingPriceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  floatingPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bookNowButton: {
    minWidth: 160,
  },
});

export default VenueDetailScreen;
