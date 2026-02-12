import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ListRenderItemInfo,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Colors from '../../constants/colors';
import { getSportById } from '../../constants/sports';
import { AppDispatch, RootState } from '../../store';
import {
  fetchMyCommunities,
  fetchDiscoverCommunities,
} from '../../store/slices/communitySlice';
import { Community, CommunityStackParamList } from '../../types';

type Props = NativeStackScreenProps<CommunityStackParamList, 'CommunitiesScreen'>;

interface SectionData {
  type: 'section_header' | 'community' | 'empty';
  title?: string;
  subtitle?: string;
  community?: Community;
  section: 'my' | 'discover';
}

const CommunitiesScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { myCommunities, discoverCommunities, loading } = useSelector(
    (state: RootState) => state.communities
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = useCallback(() => {
    dispatch(fetchMyCommunities());
    dispatch(fetchDiscoverCommunities());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchMyCommunities()),
      dispatch(fetchDiscoverCommunities()),
    ]);
    setRefreshing(false);
  }, [dispatch]);

  const filteredMyCommunities = useMemo(() => {
    if (!searchQuery.trim()) return myCommunities;
    const query = searchQuery.toLowerCase();
    return myCommunities.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.sportType.toLowerCase().includes(query)
    );
  }, [myCommunities, searchQuery]);

  const filteredDiscoverCommunities = useMemo(() => {
    if (!searchQuery.trim()) return discoverCommunities;
    const query = searchQuery.toLowerCase();
    return discoverCommunities.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.sportType.toLowerCase().includes(query)
    );
  }, [discoverCommunities, searchQuery]);

  const listData = useMemo((): SectionData[] => {
    const data: SectionData[] = [];

    // My Communities Section
    data.push({
      type: 'section_header',
      title: 'My Communities',
      subtitle: `${filteredMyCommunities.length} communities`,
      section: 'my',
    });

    if (filteredMyCommunities.length === 0) {
      data.push({ type: 'empty', section: 'my' });
    } else {
      filteredMyCommunities.forEach((community) => {
        data.push({ type: 'community', community, section: 'my' });
      });
    }

    // Discover Communities Section
    data.push({
      type: 'section_header',
      title: 'Discover Communities',
      subtitle: `${filteredDiscoverCommunities.length} communities`,
      section: 'discover',
    });

    if (filteredDiscoverCommunities.length === 0) {
      data.push({ type: 'empty', section: 'discover' });
    } else {
      filteredDiscoverCommunities.forEach((community) => {
        data.push({ type: 'community', community, section: 'discover' });
      });
    }

    return data;
  }, [filteredMyCommunities, filteredDiscoverCommunities]);

  const handleCommunityPress = useCallback(
    (communityId: string) => {
      navigation.navigate('CommunityDetail', { communityId });
    },
    [navigation]
  );

  const handleCreateCommunity = useCallback(() => {
    navigation.navigate('CreateCommunity');
  }, [navigation]);

  const renderCommunityCard = (community: Community) => {
    const sport = getSportById(community.sportType);

    return (
      <Card
        style={styles.communityCard}
        onPress={() => handleCommunityPress(community.id)}
      >
        <View style={styles.communityCardContent}>
          <Avatar
            uri={community.avatar}
            name={community.name}
            size="large"
            backgroundColor={sport?.color}
          />
          <View style={styles.communityInfo}>
            <Text style={styles.communityName} numberOfLines={1}>
              {community.name}
            </Text>
            <View style={styles.communityMeta}>
              <Icon
                name="account-group"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.memberCount}>
                {community.memberCount} members
              </Text>
            </View>
            <View style={styles.sportBadgeRow}>
              <Badge
                status={community.sportType}
                type="custom"
                label={sport?.name || community.sportType}
                color={sport?.color || Colors.primary}
                size="small"
              />
              {!community.isPublic && (
                <View style={styles.privateIndicator}>
                  <Icon name="lock" size={12} color={Colors.textSecondary} />
                  <Text style={styles.privateText}>Private</Text>
                </View>
              )}
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={Colors.textLight} />
        </View>
      </Card>
    );
  };

  const renderItem = ({ item }: ListRenderItemInfo<SectionData>) => {
    if (item.type === 'section_header') {
      return (
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <Text style={styles.sectionSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
      );
    }

    if (item.type === 'empty') {
      if (item.section === 'my') {
        return (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="account-group-outline"
              title="No Communities Yet"
              message="Join or create a community to connect with fellow sports enthusiasts"
              actionLabel="Create Community"
              onAction={handleCreateCommunity}
              style={styles.emptyState}
            />
          </View>
        );
      }
      return (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="compass-outline"
            title="No Communities Found"
            message={
              searchQuery
                ? 'Try a different search term'
                : 'Check back later for new communities'
            }
            style={styles.emptyState}
          />
        </View>
      );
    }

    if (item.type === 'community' && item.community) {
      return renderCommunityCard(item.community);
    }

    return null;
  };

  const keyExtractor = (item: SectionData, index: number): string => {
    if (item.type === 'section_header') return `header_${item.section}`;
    if (item.type === 'empty') return `empty_${item.section}`;
    return item.community?.id || `item_${index}`;
  };

  if (loading && myCommunities.length === 0 && discoverCommunities.length === 0) {
    return (
      <LoadingSpinner
        fullScreen
        message="Loading communities..."
      />
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search communities..."
        style={styles.searchBar}
      />

      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateCommunity}
        activeOpacity={0.8}
      >
        <Icon name="plus" size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBar: {
    paddingTop: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  communityCard: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  communityCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  communityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  memberCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  sportBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  privateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privateText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 3,
  },
  emptyContainer: {
    paddingHorizontal: 16,
    minHeight: 180,
  },
  emptyState: {
    flex: 0,
    paddingVertical: 24,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});

export default CommunitiesScreen;
