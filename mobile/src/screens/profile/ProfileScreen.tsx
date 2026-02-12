import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Colors from '../../constants/colors';
import { logout } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import { ProfileStackParamList, Game, Review } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileScreen'>;

interface GameHistoryItem {
  id: string;
  title: string;
  sportType: string;
  date: string;
  result: 'won' | 'lost' | 'draw' | 'completed';
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for demonstration - replace with actual state/API data
  const [stats] = useState({
    gamesPlayed: 24,
    rating: 4.5,
    reviewCount: 12,
  });

  const [recentGames] = useState<GameHistoryItem[]>([
    {
      id: '1',
      title: 'Weekend Cricket Match',
      sportType: 'cricket',
      date: '2025-01-15',
      result: 'won',
    },
    {
      id: '2',
      title: 'Badminton Doubles',
      sportType: 'badminton',
      date: '2025-01-12',
      result: 'lost',
    },
    {
      id: '3',
      title: 'Football 5v5',
      sportType: 'football',
      date: '2025-01-10',
      result: 'draw',
    },
  ]);

  const [reviews] = useState<{ id: string; reviewer: string; rating: number; comment: string; date: string }[]>([
    {
      id: '1',
      reviewer: 'Rahul S.',
      rating: 5,
      comment: 'Great team player, very punctual!',
      date: '2025-01-14',
    },
    {
      id: '2',
      reviewer: 'Priya K.',
      rating: 4,
      comment: 'Good sportsmanship and skill.',
      date: '2025-01-11',
    },
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh - replace with actual data fetch
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getResultColor = (result: string): string => {
    switch (result) {
      case 'won':
        return Colors.success;
      case 'lost':
        return Colors.error;
      case 'draw':
        return Colors.warning;
      default:
        return Colors.textSecondary;
    }
  };

  const getResultLabel = (result: string): string => {
    switch (result) {
      case 'won':
        return 'Won';
      case 'lost':
        return 'Lost';
      case 'draw':
        return 'Draw';
      default:
        return 'Completed';
    }
  };

  const renderStars = (rating: number) => {
    const stars: React.ReactNode[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Icon key={i} name="star" size={16} color={Colors.rating} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Icon key={i} name="star-half-full" size={16} color={Colors.rating} />
        );
      } else {
        stars.push(
          <Icon key={i} name="star-outline" size={16} color={Colors.rating} />
        );
      }
    }
    return stars;
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

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
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Avatar
            uri={user?.avatar}
            name={user?.name || 'User'}
            size="xlarge"
          />
          <TouchableOpacity
            style={styles.cameraIconOverlay}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.7}
          >
            <Icon name="camera" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
        <Text style={styles.userBio}>
          {user?.bio || 'No bio added yet. Tap Edit Profile to add one.'}
        </Text>
      </View>

      {/* Stats Row */}
      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.ratingContainer}>
              <Text style={styles.statValue}>{stats.rating}</Text>
              <View style={styles.starsRow}>{renderStars(stats.rating)}</View>
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.reviewCount}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>
      </Card>

      {/* Edit Profile Button */}
      <Button
        title="Edit Profile"
        onPress={() => navigation.navigate('EditProfile')}
        variant="outline"
        fullWidth
        icon={<Icon name="account-edit-outline" size={20} color={Colors.primary} />}
        style={styles.editProfileButton}
      />

      {/* Game History Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Game History</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyBookings')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentGames.length === 0 ? (
          <EmptyState
            icon="gamepad-variant-outline"
            title="No Games Yet"
            message="Join or host a game to see your history here."
            style={styles.emptyState}
          />
        ) : (
          recentGames.map((game) => (
            <Card key={game.id} style={styles.gameCard}>
              <View style={styles.gameCardContent}>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <View style={styles.gameMetaRow}>
                    <Icon
                      name="calendar-outline"
                      size={14}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.gameMeta}>
                      {new Date(game.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.gameMetaRow}>
                    <Icon
                      name="run"
                      size={14}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.gameMeta}>
                      {game.sportType.charAt(0).toUpperCase() + game.sportType.slice(1).replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.resultBadge,
                    { backgroundColor: `${getResultColor(game.result)}15` },
                  ]}
                >
                  <Text
                    style={[
                      styles.resultText,
                      { color: getResultColor(game.result) },
                    ]}
                  >
                    {getResultLabel(game.result)}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>

      {/* My Reviews Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Reviews</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {reviews.length === 0 ? (
          <EmptyState
            icon="comment-text-outline"
            title="No Reviews Yet"
            message="Reviews from other players will appear here."
            style={styles.emptyState}
          />
        ) : (
          reviews.map((review) => (
            <Card key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.reviewer}</Text>
                <View style={styles.reviewStars}>
                  {renderStars(review.rating)}
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewDate}>
                {new Date(review.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </Card>
          ))
        )}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <Card style={styles.settingsCard}>
          {/* Notifications Toggle */}
          <View style={styles.settingsRow}>
            <View style={styles.settingsLeft}>
              <Icon name="bell-outline" size={22} color={Colors.text} />
              <Text style={styles.settingsLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={notificationsEnabled ? Colors.primary : Colors.disabled}
            />
          </View>

          <View style={styles.settingsDivider} />

          {/* Privacy */}
          <TouchableOpacity style={styles.settingsRow} activeOpacity={0.6}>
            <View style={styles.settingsLeft}>
              <Icon name="shield-lock-outline" size={22} color={Colors.text} />
              <Text style={styles.settingsLabel}>Privacy</Text>
            </View>
            <Icon name="chevron-right" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.settingsDivider} />

          {/* Help */}
          <TouchableOpacity style={styles.settingsRow} activeOpacity={0.6}>
            <View style={styles.settingsLeft}>
              <Icon
                name="help-circle-outline"
                size={22}
                color={Colors.text}
              />
              <Text style={styles.settingsLabel}>Help & Support</Text>
            </View>
            <Icon name="chevron-right" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          fullWidth
          icon={<Icon name="logout" size={20} color={Colors.white} />}
          style={styles.logoutButton}
        />
      </View>

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
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  editProfileButton: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  gameCard: {
    marginBottom: 10,
  },
  gameCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameInfo: {
    flex: 1,
    marginRight: 12,
  },
  gameTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  gameMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  gameMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resultText: {
    fontSize: 13,
    fontWeight: '700',
  },
  reviewCard: {
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  settingsCard: {
    marginTop: 12,
    marginBottom: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: 15,
    color: Colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  logoutButton: {
    marginTop: 4,
  },
  emptyState: {
    paddingVertical: 24,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default ProfileScreen;
