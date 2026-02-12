import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
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
import VenueCard from '../../components/venue/VenueCard';
import AdBanner from '../../components/venue/AdBanner';
import { COLORS } from '../../constants/colors';
import { SPORTS, SportItem } from '../../constants/sports';
import { AppDispatch, RootState } from '../../store';
import { fetchNearbyVenues } from '../../store/slices/venueSlice';
import { fetchUpcomingGames } from '../../store/slices/gameSlice';
import { HomeStackParamList, Game, SportType } from '../../types';
import { formatDate, formatTime, getSportName } from '../../utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeScreen'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { nearbyVenues, featuredVenues, loading: venuesLoading } = useSelector(
    (state: RootState) => state.venues
  );
  const { upcomingGames, loading: gamesLoading } = useSelector(
    (state: RootState) => state.games
  );

  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState<SportType | null>(null);

  const loadData = useCallback(() => {
    dispatch(
      fetchNearbyVenues({ latitude: 12.9716, longitude: 77.5946, radius: 10 })
    );
    dispatch(fetchUpcomingGames());
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(
        fetchNearbyVenues({
          latitude: 12.9716,
          longitude: 77.5946,
          radius: 10,
        })
      ),
      dispatch(fetchUpcomingGames()),
    ]);
    setRefreshing(false);
  }, [dispatch]);

  const handleVenuePress = (venueId: string) => {
    navigation.navigate('VenueDetail', { venueId });
  };

  const handleGamePress = (gameId: string) => {
    navigation.navigate('GameDetail', { gameId });
  };

  const handleSportFilter = (sportId: SportType) => {
    setSelectedSport(selectedSport === sportId ? null : sportId);
  };

  const adVenues = featuredVenues.filter(
    (v) => v.adBanner && v.adBanner.isActive
  );

  const filteredVenues = selectedSport
    ? nearbyVenues.filter((v) => v.sportType === selectedSport)
    : nearbyVenues;

  const filteredGames = selectedSport
    ? upcomingGames.filter((g) => g.sportType === selectedSport)
    : upcomingGames;

  const renderGameCard = (game: Game) => (
    <Card
      key={game.id}
      style={styles.gameCard}
      onPress={() => handleGamePress(game.id)}
    >
      <View style={styles.gameCardHeader}>
        <View style={styles.gameCardTitleRow}>
          <Text style={styles.gameTitle} numberOfLines={1}>
            {game.title}
          </Text>
          <Badge status={game.status} type="game" size="small" />
        </View>
        <Text style={styles.gameSport}>{getSportName(game.sportType)}</Text>
      </View>
      <View style={styles.gameCardDetails}>
        <View style={styles.gameDetailRow}>
          <Icon name="calendar" size={14} color={COLORS.textSecondary} />
          <Text style={styles.gameDetailText}>
            {game.slot ? formatDate(game.slot.date) : 'TBD'}
          </Text>
        </View>
        <View style={styles.gameDetailRow}>
          <Icon name="clock-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.gameDetailText}>
            {game.slot
              ? `${formatTime(game.slot.startTime)} - ${formatTime(game.slot.endTime)}`
              : 'TBD'}
          </Text>
        </View>
        <View style={styles.gameDetailRow}>
          <Icon name="map-marker-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.gameDetailText} numberOfLines={1}>
            {game.venue?.name || 'Venue TBD'}
          </Text>
        </View>
      </View>
      <View style={styles.gameCardFooter}>
        <View style={styles.playersInfo}>
          <Icon name="account-group" size={16} color={COLORS.primary} />
          <Text style={styles.playersText}>
            {game.currentPlayers}/{game.maxPlayers} players
          </Text>
        </View>
        {game.currentPlayers < game.maxPlayers && (
          <Text style={styles.joinText}>Join</Text>
        )}
      </View>
    </Card>
  );

  const isLoading = venuesLoading && gamesLoading && !refreshing;

  if (isLoading && nearbyVenues.length === 0 && upcomingGames.length === 0) {
    return <LoadingSpinner fullScreen message="Loading your dashboard..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Welcome Header */}
      <View style={styles.welcomeHeader}>
        <View style={styles.welcomeLeft}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name || 'Player'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('PublicProfile', { userId: user?.id || '' })}
        >
          <Avatar
            uri={user?.avatar}
            name={user?.name || 'User'}
            size="large"
          />
        </TouchableOpacity>
      </View>

      {/* Ad Banners */}
      {adVenues.length > 0 && (
        <AdBanner
          venues={adVenues}
          onPress={(venue) => handleVenuePress(venue.id)}
        />
      )}

      {/* Sport Category Filter Chips */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Sports</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScrollContent}
        >
          {SPORTS.map((sport: SportItem) => (
            <TouchableOpacity
              key={sport.id}
              style={[
                styles.sportChip,
                selectedSport === sport.id && styles.sportChipActive,
                { borderColor: sport.color },
              ]}
              onPress={() => handleSportFilter(sport.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.sportEmoji}>{sport.emoji}</Text>
              <Text
                style={[
                  styles.sportChipText,
                  selectedSport === sport.id && styles.sportChipTextActive,
                  selectedSport === sport.id && { color: COLORS.white },
                ]}
              >
                {sport.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Nearby Venues Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Venues</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.getParent()?.navigate('Explore', { screen: 'ExploreScreen' })
            }
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {filteredVenues.length > 0 ? (
          <FlatList
            data={filteredVenues.slice(0, 10)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.venueListContent}
            renderItem={({ item }) => (
              <VenueCard
                venue={item}
                onPress={() => handleVenuePress(item.id)}
                compact
              />
            )}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <EmptyState
              icon="map-marker-off-outline"
              title="No Venues Found"
              message={
                selectedSport
                  ? 'No nearby venues for this sport. Try a different sport.'
                  : 'No nearby venues found. Pull down to refresh.'
              }
              style={styles.inlineEmpty}
            />
          </Card>
        )}
      </View>

      {/* Upcoming Games Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Games</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.getParent()?.navigate('Host', { screen: 'UpcomingGames' })
            }
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {filteredGames.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gamesScrollContent}
          >
            {filteredGames.slice(0, 6).map(renderGameCard)}
          </ScrollView>
        ) : (
          <Card style={styles.emptyCard}>
            <EmptyState
              icon="gamepad-variant-outline"
              title="No Upcoming Games"
              message={
                selectedSport
                  ? 'No upcoming games for this sport.'
                  : 'No games available right now. Host one!'
              }
              style={styles.inlineEmpty}
            />
          </Card>
        )}
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() =>
              navigation.getParent()?.navigate('Explore', { screen: 'ExploreScreen' })
            }
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: COLORS.primaryLight },
              ]}
            >
              <Icon name="calendar-check" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>Book Venue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() =>
              navigation.getParent()?.navigate('Host', { screen: 'HostGame' })
            }
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: COLORS.secondaryLight },
              ]}
            >
              <Icon name="trophy-outline" size={28} color={COLORS.secondary} />
            </View>
            <Text style={styles.quickActionText}>Host Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() =>
              navigation
                .getParent()
                ?.navigate('Communities', { screen: 'CommunitiesScreen' })
            }
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: COLORS.accentLight },
              ]}
            >
              <Icon name="account-group-outline" size={28} color={COLORS.accent} />
            </View>
            <Text style={styles.quickActionText}>My Communities</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  welcomeLeft: {
    flex: 1,
    marginRight: 16,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  chipScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    marginRight: 8,
  },
  sportChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sportEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  sportChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  sportChipTextActive: {
    color: COLORS.white,
  },
  venueListContent: {
    paddingHorizontal: 16,
  },
  emptyCard: {
    marginHorizontal: 16,
  },
  inlineEmpty: {
    flex: 0,
    paddingVertical: 24,
  },
  gamesScrollContent: {
    paddingHorizontal: 16,
  },
  gameCard: {
    width: SCREEN_WIDTH * 0.75,
    marginRight: 12,
    padding: 16,
  },
  gameCardHeader: {
    marginBottom: 12,
  },
  gameCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  gameSport: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  gameCardDetails: {
    marginBottom: 12,
  },
  gameDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  gameDetailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  gameCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  playersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playersText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  joinText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 24,
  },
});

export default HomeScreen;
