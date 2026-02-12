import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Venue } from '../../types';
import Colors from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;
const BANNER_HEIGHT = 160;

interface AdBannerProps {
  venues: Venue[];
  onPress: (venue: Venue) => void;
}

const AdBanner: React.FC<AdBannerProps> = ({ venues, onPress }) => {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (venues.length <= 1) return;
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % venues.length;
      scrollRef.current?.scrollTo({
        x: nextIndex * BANNER_WIDTH,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeIndex, venues.length]);

  const handleScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / BANNER_WIDTH);
    setActiveIndex(index);
  };

  if (venues.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH}
        contentContainerStyle={styles.scrollContent}
      >
        {venues.map((venue) => (
          <TouchableOpacity
            key={venue.id}
            onPress={() => onPress(venue)}
            activeOpacity={0.9}
            style={styles.bannerItem}
          >
            <Image
              source={
                venue.adBanner?.imageUrl
                  ? { uri: venue.adBanner.imageUrl }
                  : venue.images.length > 0
                  ? { uri: venue.images[0] }
                  : require('../../assets/venue-placeholder.png')
              }
              style={styles.bannerImage}
            />
            <View style={styles.overlay}>
              <View style={styles.adTag}>
                <Text style={styles.adTagText}>AD</Text>
              </View>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle} numberOfLines={1}>
                  {venue.name}
                </Text>
                <Text style={styles.bannerSubtitle} numberOfLines={1}>
                  {venue.address}, {venue.city}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {venues.length > 1 && (
        <View style={styles.dotsContainer}>
          {venues.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  bannerItem: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 12,
  },
  adTag: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adTagText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  bannerContent: {
    marginTop: 'auto',
  },
  bannerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  bannerSubtitle: {
    color: Colors.white,
    fontSize: 13,
    marginTop: 2,
    opacity: 0.9,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 20,
  },
});

export default AdBanner;
