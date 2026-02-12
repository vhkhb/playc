import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Venue } from '../../types';
import Colors from '../../constants/colors';
import { formatCurrency, getDistanceText } from '../../utils/helpers';
import { getSportName } from '../../constants/sports';

interface VenueCardProps {
  venue: Venue;
  onPress: () => void;
  compact?: boolean;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onPress, compact = false }) => {
  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={
          venue.images.length > 0
            ? { uri: venue.images[0] }
            : require('../../assets/venue-placeholder.png')
        }
        style={[styles.image, compact && styles.imageCompact]}
        defaultSource={require('../../assets/venue-placeholder.png')}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {venue.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color={Colors.rating} />
            <Text style={styles.rating}>{venue.rating.toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.sportRow}>
          <Text style={styles.sportTag}>{getSportName(venue.sportType)}</Text>
          {venue.distance !== undefined && (
            <Text style={styles.distance}>
              {getDistanceText(venue.distance)}
            </Text>
          )}
        </View>
        <View style={styles.footer}>
          <View style={styles.locationRow}>
            <Icon name="map-marker-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.location} numberOfLines={1}>
              {venue.address}, {venue.city}
            </Text>
          </View>
          <Text style={styles.price}>
            {formatCurrency(venue.priceRange.min)}
            {venue.priceRange.min !== venue.priceRange.max &&
              ` - ${formatCurrency(venue.priceRange.max)}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  cardCompact: {
    width: 260,
    marginRight: 12,
    marginBottom: 0,
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  imageCompact: {
    height: 130,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 3,
  },
  sportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sportTag: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  distance: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  location: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});

export default VenueCard;
