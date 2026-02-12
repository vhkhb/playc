import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Colors from '../../constants/colors';
import { getSportById, SPORTS } from '../../constants/sports';
import { AppDispatch, RootState } from '../../store';
import {
  ProfileStackParamList,
  User,
  PlayerProfile,
  SportType,
  Game,
} from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'PublicProfile'>;

interface PublicProfileData {
  user: User;
  profile: PlayerProfile;
  games: PublicGameItem[];
  reviews: PublicReviewItem[];
}

interface PublicGameItem {
  id: string;
  title: string;
  sportType: SportType;
  date: string;
  status: string;
  playersCount: number;
  maxPlayers: number;
}

interface PublicReviewItem {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

const PublicProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState<PublicProfileData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration - replace with actual fetchPublicProfile dispatch
  const fetchPublicProfile = useCallback(async () => {
    try {
      setError(null);

      // Dispatch actual action:
      // const result = await dispatch(fetchPublicProfileAction(userId)).unwrap();
      // setProfileData(result);

      // Simulated response
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProfileData({
        user: {
          id: userId,
          name: 'Arjun Sharma',
          email: 'arjun@example.com',
          phone: '9876543210',
          role: 'player',
          avatar: undefined,
          bio: 'Passionate cricket and badminton player. Always up for a friendly match!',
          isVerified: true,
          createdAt: '2024-06-15T00:00:00Z',
          updatedAt: '2025-01-10T00:00:00Z',
        },
        profile: {
          id: 'profile-1',
          userId,
          sportsPreferences: ['cricket', 'badminton', 'football'],
          skillLevel: 'advanced',
          gamesPlayed: 45,
          rating: 4.7,
          reviewCount: 18,
        },
        games: [
          {
            id: 'g1',
            title: 'Sunday Cricket League',
            sportType: 'cricket',
            date: '2025-01-19',
            status: 'completed',
            playersCount: 22,
            maxPlayers: 22,
          },
          {
            id: 'g2',
            title: 'Badminton Doubles Friendly',
            sportType: 'badminton',
            date: '2025-01-17',
            status: 'completed',
            playersCount: 4,
            maxPlayers: 4,
          },
          {
            id: 'g3',
            title: 'Weekend Football 7v7',
            sportType: 'football',
            date: '2025-01-12',
            status: 'completed',
            playersCount: 14,
            maxPlayers: 14,
          },
        ],
        reviews: [
          {
            id: 'r1',
            reviewerName: 'Vikram P.',
            reviewerAvatar: undefined,
            rating: 5,
            comment:
              'Amazing player! Very skilled and always keeps the spirit of the game alive.',
            date: '2025-01-18',
          },
          {
            id: 'r2',
            reviewerName: 'Sneha M.',
            reviewerAvatar: undefined,
            rating: 4,
            comment: 'Good team player, great communication on the field.',
            date: '2025-01-15',
          },
          {
            id: 'r3',
            reviewerName: 'Raj K.',
            reviewerAvatar: undefined,
            rating: 5,
            comment: 'One of the best cricketers I have played with. Highly recommend!',
            date: '2025-01-10',
          },
        ],
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId, dispatch]);

  useEffect(() => {
    fetchPublicProfile();
  }, [fetchPublicProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPublicProfile();
    setRefreshing(false);
  }, [fetchPublicProfile]);

  const handleInviteToGame = () => {
    Alert.alert(
      'Invite to Game',
      `Send a game invitation to ${profileData?.user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Invite',
          onPress: () => {
            // Navigate to game selection or dispatch invite action
            Alert.alert('Invited', 'Game invitation sent successfully!');
          },
        },
      ],
      { cancelable: true }
    );
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

  const getSkillLevelLabel = (level: string): string => {
    switch (level) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      case 'professional':
        return 'Pro';
      default:
        return level;
    }
  };

  const getSkillLevelColor = (level: string): string => {
    switch (level) {
      case 'beginner':
        return Colors.info;
      case 'intermediate':
        return Colors.warning;
      case 'advanced':
        return Colors.primary;
      case 'professional':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  if (error || !profileData) {
    return (
      <View style={styles.errorContainer}>
        <EmptyState
          icon="account-alert-outline"
          title="Could Not Load Profile"
          message={error || 'An unexpected error occurred.'}
          actionLabel="Retry"
          onAction={fetchPublicProfile}
        />
      </View>
    );
  }

  const { user: profileUser, profile, games, reviews } = profileData;
  const isOwnProfile = currentUser?.id === userId;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
          <Avatar
            uri={profileUser.avatar}
            name={profileUser.name}
            size="xlarge"
          />
          <Text style={styles.userName}>{profileUser.name}</Text>
          {profileUser.isVerified && (
            <View style={styles.verifiedBadge}>
              <Icon name="check-decagram" size={16} color={Colors.secondary} />
              <Text style={styles.verifiedText}>Verified Player</Text>
            </View>
          )}
          <Text style={styles.userBio}>
            {profileUser.bio || 'This player has not added a bio yet.'}
          </Text>

          {/* Skill Level Badge */}
          <View
            style={[
              styles.skillBadge,
              {
                backgroundColor: `${getSkillLevelColor(profile.skillLevel)}15`,
                borderColor: getSkillLevelColor(profile.skillLevel),
              },
            ]}
          >
            <Icon
              name="trophy-outline"
              size={14}
              color={getSkillLevelColor(profile.skillLevel)}
            />
            <Text
              style={[
                styles.skillBadgeText,
                { color: getSkillLevelColor(profile.skillLevel) },
              ]}
            >
              {getSkillLevelLabel(profile.skillLevel)}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.gamesPlayed}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.ratingContainer}>
                <Text style={styles.statValue}>{profile.rating}</Text>
                <View style={styles.starsRow}>
                  {renderStars(profile.rating)}
                </View>
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.reviewCount}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </Card>

        {/* Sports Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sports Preferences</Text>
          <View style={styles.sportsTagsContainer}>
            {profile.sportsPreferences.map((sportId) => {
              const sport = getSportById(sportId);
              if (!sport) return null;
              return (
                <View
                  key={sportId}
                  style={[
                    styles.sportTag,
                    { backgroundColor: `${sport.color}15`, borderColor: sport.color },
                  ]}
                >
                  <Text style={styles.sportTagEmoji}>{sport.emoji}</Text>
                  <Text style={[styles.sportTagText, { color: sport.color }]}>
                    {sport.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Game History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Game History</Text>
            <Text style={styles.gameCount}>
              {games.length} {games.length === 1 ? 'game' : 'games'}
            </Text>
          </View>
          {games.length === 0 ? (
            <EmptyState
              icon="gamepad-variant-outline"
              title="No Public Games"
              message="This player hasn't participated in any public games yet."
              style={styles.emptyState}
            />
          ) : (
            games.map((game) => {
              const sport = getSportById(game.sportType);
              return (
                <Card key={game.id} style={styles.gameCard}>
                  <View style={styles.gameCardContent}>
                    <View
                      style={[
                        styles.sportIndicator,
                        { backgroundColor: sport?.color || Colors.primary },
                      ]}
                    />
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
                          name="account-group-outline"
                          size={14}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.gameMeta}>
                          {game.playersCount}/{game.maxPlayers} players
                        </Text>
                      </View>
                    </View>
                    <Badge
                      status={game.status}
                      type="game"
                      size="small"
                    />
                  </View>
                </Card>
              );
            })
          )}
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <Text style={styles.gameCount}>
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </Text>
          </View>
          {reviews.length === 0 ? (
            <EmptyState
              icon="comment-text-outline"
              title="No Reviews Yet"
              message="This player hasn't received any reviews yet."
              style={styles.emptyState}
            />
          ) : (
            reviews.map((review) => (
              <Card key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <Avatar
                      uri={review.reviewerAvatar}
                      name={review.reviewerName}
                      size="small"
                    />
                    <Text style={styles.reviewerName}>
                      {review.reviewerName}
                    </Text>
                  </View>
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

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Invite to Game Button - Fixed at Bottom */}
      {!isOwnProfile && (
        <View style={styles.inviteButtonContainer}>
          <Button
            title="Invite to Game"
            onPress={handleInviteToGame}
            variant="primary"
            fullWidth
            size="large"
            icon={
              <Icon name="account-plus-outline" size={22} color={Colors.white} />
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
    marginLeft: 4,
  },
  userBio: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  skillBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsCard: {
    marginBottom: 20,
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
    marginBottom: 0,
  },
  gameCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sportsTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  sportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  sportTagEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  sportTagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  gameCard: {
    marginBottom: 10,
  },
  gameCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportIndicator: {
    width: 4,
    height: 48,
    borderRadius: 2,
    marginRight: 12,
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
  reviewCard: {
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 10,
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
  emptyState: {
    paddingVertical: 24,
  },
  inviteButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default PublicProfileScreen;
