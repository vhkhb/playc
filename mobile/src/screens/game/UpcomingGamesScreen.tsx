import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import GameCard from '../../components/game/GameCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { COLORS } from '../../constants/colors';
import { SPORTS } from '../../constants/sports';
import { fetchUpcomingGames } from '../../store/slices/gameSlice';

type Props = NativeStackScreenProps<any, 'UpcomingGames'>;

const UpcomingGamesScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { upcomingGames, loading } = useSelector((state: RootState) => state.games);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchUpcomingGames({}));
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchUpcomingGames({}));
    setRefreshing(false);
  }, [dispatch]);

  const filteredGames = selectedSport
    ? upcomingGames.filter((g: any) => g.sportType === selectedSport)
    : upcomingGames;

  if (loading && upcomingGames.length === 0) {
    return <LoadingSpinner message="Loading games..." />;
  }

  return (
    <View style={styles.container}>
      {/* Sport Filter */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedSport && styles.filterChipActive]}
            onPress={() => setSelectedSport(null)}
          >
            <Text style={[styles.filterChipText, !selectedSport && styles.filterChipTextActive]}>All</Text>
          </TouchableOpacity>
          {SPORTS.map((sport) => (
            <TouchableOpacity
              key={sport.name}
              style={[styles.filterChip, selectedSport === sport.name && styles.filterChipActive]}
              onPress={() => setSelectedSport(selectedSport === sport.name ? null : sport.name)}
            >
              <Text style={styles.filterIcon}>{sport.icon}</Text>
              <Text style={[styles.filterChipText, selectedSport === sport.name && styles.filterChipTextActive]}>
                {sport.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Games List */}
      <FlatList
        data={filteredGames}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <GameCard
            game={item}
            onPress={() => navigation.navigate('GameDetail', { gameId: item.id })}
            onJoin={() => {
              // dispatch join game
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🏟️"
            title="No Upcoming Games"
            message={
              selectedSport
                ? `No ${selectedSport} games found. Try a different sport or check back later.`
                : 'No games available right now. Why not host one?'
            }
            actionLabel="Host a Game"
            onAction={() => navigation.navigate('HostGame')}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  filterSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  filterChipTextActive: { color: COLORS.white },
  filterIcon: { fontSize: 14, marginRight: 4 },
  listContent: { padding: 16 },
});

export default UpcomingGamesScreen;
