import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Alert,
  Linking,
  ListRenderItemInfo,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Colors from '../../constants/colors';
import { AppDispatch, RootState } from '../../store';
import {
  fetchMembers,
  getCommunityById,
} from '../../store/slices/communitySlice';
import {
  CommunityMember,
  CommunityRole,
  CommunityStackParamList,
} from '../../types';

type Props = NativeStackScreenProps<CommunityStackParamList, 'MemberList'>;

const ROLE_CONFIG: Record<
  CommunityRole,
  { label: string; color: string; backgroundColor: string; priority: number }
> = {
  admin: {
    label: 'Admin',
    color: Colors.error,
    backgroundColor: Colors.errorLight,
    priority: 0,
  },
  moderator: {
    label: 'Moderator',
    color: Colors.accent,
    backgroundColor: Colors.accentLight,
    priority: 1,
  },
  member: {
    label: 'Member',
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    priority: 2,
  },
};

interface SwipeState {
  memberId: string | null;
  translateX: Animated.Value;
}

const MemberListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { communityId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { members, selectedCommunity, loading } = useSelector(
    (state: RootState) => state.communities
  );
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [swipeState, setSwipeState] = useState<SwipeState>({
    memberId: null,
    translateX: new Animated.Value(0),
  });

  const isCurrentUserAdmin = useMemo(() => {
    return members.some(
      (m) => m.userId === currentUser?.id && m.role === 'admin'
    );
  }, [members, currentUser]);

  useEffect(() => {
    dispatch(fetchMembers(communityId));
    if (!selectedCommunity) {
      dispatch(getCommunityById(communityId));
    }
  }, [communityId, dispatch, selectedCommunity]);

  useEffect(() => {
    if (selectedCommunity) {
      navigation.setOptions({
        headerTitle: `Members (${selectedCommunity.memberCount})`,
      });
    }
  }, [selectedCommunity, navigation]);

  const sortedFilteredMembers = useMemo(() => {
    let filtered = members;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = members.filter(
        (m) =>
          m.user?.name?.toLowerCase().includes(query) ||
          m.role.toLowerCase().includes(query)
      );
    }

    return [...filtered].sort((a, b) => {
      const aPriority = ROLE_CONFIG[a.role]?.priority ?? 99;
      const bPriority = ROLE_CONFIG[b.role]?.priority ?? 99;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return (a.user?.name || '').localeCompare(b.user?.name || '');
    });
  }, [members, searchQuery]);

  const handleSwipeOpen = useCallback(
    (memberId: string) => {
      if (swipeState.memberId === memberId) return;

      // Reset previous
      if (swipeState.memberId) {
        Animated.spring(swipeState.translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }

      const newTranslateX = new Animated.Value(0);
      setSwipeState({ memberId, translateX: newTranslateX });

      Animated.spring(newTranslateX, {
        toValue: -160,
        useNativeDriver: true,
      }).start();
    },
    [swipeState]
  );

  const handleSwipeClose = useCallback(() => {
    if (swipeState.memberId) {
      Animated.spring(swipeState.translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start(() => {
        setSwipeState({ memberId: null, translateX: new Animated.Value(0) });
      });
    }
  }, [swipeState]);

  const handleMakeModerator = useCallback(
    (member: CommunityMember) => {
      Alert.alert(
        'Make Moderator',
        `Are you sure you want to make ${member.user?.name || 'this member'} a moderator?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => {
              // API call placeholder - to be implemented
              handleSwipeClose();
            },
          },
        ]
      );
    },
    [handleSwipeClose]
  );

  const handleRemoveMember = useCallback(
    (member: CommunityMember) => {
      Alert.alert(
        'Remove Member',
        `Are you sure you want to remove ${member.user?.name || 'this member'} from the community?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              // API call placeholder - to be implemented
              handleSwipeClose();
            },
          },
        ]
      );
    },
    [handleSwipeClose]
  );

  const handleCallPhone = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Unable to make a phone call');
    });
  }, []);

  const handleSendEmail = useCallback((email: string) => {
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert('Error', 'Unable to open email client');
    });
  }, []);

  const handleInviteMembers = useCallback(() => {
    // Invite functionality placeholder - to be implemented
    Alert.alert(
      'Invite Members',
      'Share the community link to invite new members.',
      [{ text: 'OK' }]
    );
  }, []);

  const renderSwipeActions = (member: CommunityMember) => {
    if (!isCurrentUserAdmin || member.userId === currentUser?.id) return null;
    if (member.role === 'admin') return null;

    return (
      <View style={styles.swipeActionsContainer}>
        {member.role !== 'moderator' && (
          <TouchableOpacity
            style={[styles.swipeAction, styles.moderatorAction]}
            onPress={() => handleMakeModerator(member)}
            activeOpacity={0.7}
          >
            <Icon name="shield-account" size={20} color={Colors.white} />
            <Text style={styles.swipeActionText}>Moderator</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.swipeAction, styles.removeAction]}
          onPress={() => handleRemoveMember(member)}
          activeOpacity={0.7}
        >
          <Icon name="account-remove" size={20} color={Colors.white} />
          <Text style={styles.swipeActionText}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMemberItem = ({ item }: ListRenderItemInfo<CommunityMember>) => {
    const roleConfig = ROLE_CONFIG[item.role];
    const isSwiped = swipeState.memberId === item.id;
    const canSwipe =
      isCurrentUserAdmin &&
      item.userId !== currentUser?.id &&
      item.role !== 'admin';
    const showContact =
      item.canViewContact &&
      selectedCommunity?.isAutoCreated &&
      item.role === 'admin';

    return (
      <View style={styles.memberItemWrapper}>
        {canSwipe && renderSwipeActions(item)}

        <Animated.View
          style={[
            styles.memberItem,
            isSwiped && {
              transform: [{ translateX: swipeState.translateX }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.memberItemInner}
            activeOpacity={0.7}
            onPress={() => {
              if (isSwiped) {
                handleSwipeClose();
              } else {
                navigation.navigate('PublicProfile', {
                  userId: item.userId,
                });
              }
            }}
            onLongPress={() => {
              if (canSwipe) {
                if (isSwiped) {
                  handleSwipeClose();
                } else {
                  handleSwipeOpen(item.id);
                }
              }
            }}
          >
            <Avatar
              uri={item.user?.avatar}
              name={item.user?.name || 'User'}
              size="medium"
            />
            <View style={styles.memberInfo}>
              <View style={styles.memberNameRow}>
                <Text style={styles.memberName} numberOfLines={1}>
                  {item.user?.name || 'Unknown User'}
                </Text>
                {item.userId === currentUser?.id && (
                  <Text style={styles.youLabel}>(You)</Text>
                )}
              </View>
              <Badge
                status={item.role}
                type="custom"
                label={roleConfig.label}
                color={roleConfig.color}
                backgroundColor={roleConfig.backgroundColor}
                size="small"
                style={styles.roleBadge}
              />

              {showContact && item.user && (
                <View style={styles.contactRow}>
                  {item.user.phone && (
                    <TouchableOpacity
                      style={styles.contactBtn}
                      onPress={() => handleCallPhone(item.user!.phone)}
                      activeOpacity={0.6}
                    >
                      <Icon name="phone" size={14} color={Colors.primary} />
                      <Text style={styles.contactText} numberOfLines={1}>
                        {item.user.phone}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {item.user.email && (
                    <TouchableOpacity
                      style={styles.contactBtn}
                      onPress={() => handleSendEmail(item.user!.email)}
                      activeOpacity={0.6}
                    >
                      <Icon name="email" size={14} color={Colors.secondary} />
                      <Text style={styles.contactText} numberOfLines={1}>
                        {item.user.email}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
            <Icon
              name="chevron-right"
              size={22}
              color={Colors.textLight}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderListEmpty = () => {
    if (loading) return null;
    return (
      <EmptyState
        icon="account-group-outline"
        title="No Members Found"
        message={
          searchQuery
            ? 'No members match your search'
            : 'This community has no members yet'
        }
        style={styles.emptyState}
      />
    );
  };

  const renderSectionHeader = () => {
    const adminCount = members.filter((m) => m.role === 'admin').length;
    const modCount = members.filter((m) => m.role === 'moderator').length;
    const memberCount = members.filter((m) => m.role === 'member').length;

    return (
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statCount}>{adminCount}</Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statCount}>{modCount}</Text>
          <Text style={styles.statLabel}>Moderators</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statCount}>{memberCount}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
      </View>
    );
  };

  if (loading && members.length === 0) {
    return <LoadingSpinner fullScreen message="Loading members..." />;
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search members..."
        style={styles.searchBar}
      />

      {renderSectionHeader()}

      <FlatList
        data={sortedFilteredMembers}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderListEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={styles.bottomBar}>
        <Button
          title="Invite Members"
          onPress={handleInviteMembers}
          variant="primary"
          fullWidth
          size="large"
          icon={
            <Icon name="account-plus" size={20} color={Colors.white} />
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statCount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.divider,
  },
  listContent: {
    paddingBottom: 100,
  },
  memberItemWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  memberItem: {
    backgroundColor: Colors.white,
  },
  memberItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    maxWidth: '80%',
  },
  youLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  roleBadge: {
    marginTop: 4,
  },
  contactRow: {
    marginTop: 6,
    gap: 4,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  contactText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
    maxWidth: '90%',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: 72,
  },
  swipeActionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  swipeAction: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  moderatorAction: {
    backgroundColor: Colors.accent,
  },
  removeAction: {
    backgroundColor: Colors.error,
  },
  swipeActionText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyState: {
    marginTop: 40,
  },
  bottomBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
  },
});

export default MemberListScreen;
