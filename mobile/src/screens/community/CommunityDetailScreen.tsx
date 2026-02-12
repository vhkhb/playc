import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ListRenderItemInfo,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Colors from '../../constants/colors';
import { getSportById } from '../../constants/sports';
import { AppDispatch, RootState } from '../../store';
import {
  getCommunityById,
  fetchPosts,
  createPost,
  likePost,
  clearSelectedCommunity,
} from '../../store/slices/communitySlice';
import { Community, CommunityPost, CommunityStackParamList } from '../../types';

type Props = NativeStackScreenProps<CommunityStackParamList, 'CommunityDetail'>;

const CommunityDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { communityId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedCommunity, posts, postsLoading, loading } = useSelector(
    (state: RootState) => state.communities
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [postText, setPostText] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    dispatch(getCommunityById(communityId));
    dispatch(fetchPosts(communityId));

    return () => {
      dispatch(clearSelectedCommunity());
    };
  }, [communityId, dispatch]);

  useEffect(() => {
    if (selectedCommunity) {
      navigation.setOptions({
        headerTitle: () => (
          <TouchableOpacity
            style={styles.headerTitleContainer}
            onPress={() => setShowDescription((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Avatar
              uri={selectedCommunity.avatar}
              name={selectedCommunity.name}
              size="small"
              backgroundColor={getSportById(selectedCommunity.sportType)?.color}
            />
            <View style={styles.headerTitleText}>
              <Text style={styles.headerName} numberOfLines={1}>
                {selectedCommunity.name}
              </Text>
              <Text style={styles.headerSubtitle}>
                {selectedCommunity.memberCount} members
              </Text>
            </View>
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MemberList', { communityId })
            }
            style={styles.headerRightBtn}
          >
            <Icon name="account-group" size={24} color={Colors.primary} />
          </TouchableOpacity>
        ),
      });
    }
  }, [selectedCommunity, navigation, communityId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(getCommunityById(communityId)),
      dispatch(fetchPosts(communityId)),
    ]);
    setRefreshing(false);
  }, [communityId, dispatch]);

  const handleSendPost = useCallback(async () => {
    const trimmed = postText.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await dispatch(
        createPost({
          communityId,
          content: trimmed,
        })
      ).unwrap();
      setPostText('');
      inputRef.current?.blur();
    } catch {
      // error handled by slice
    } finally {
      setSending(false);
    }
  }, [postText, communityId, dispatch, sending]);

  const handleLikePost = useCallback(
    (postId: string) => {
      dispatch(likePost({ communityId, postId }));
    },
    [communityId, dispatch]
  );

  const formatTimestamp = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const renderDescriptionHeader = () => {
    if (!selectedCommunity || !showDescription) return null;
    const sport = getSportById(selectedCommunity.sportType);

    return (
      <Card style={styles.descriptionCard}>
        <View style={styles.descriptionHeader}>
          <Avatar
            uri={selectedCommunity.avatar}
            name={selectedCommunity.name}
            size="xlarge"
            backgroundColor={sport?.color}
          />
          <Text style={styles.descriptionName}>{selectedCommunity.name}</Text>
          <View style={styles.descriptionMeta}>
            <Badge
              status={selectedCommunity.sportType}
              type="custom"
              label={sport?.name || selectedCommunity.sportType}
              color={sport?.color || Colors.primary}
              size="small"
            />
            <View style={styles.descriptionMembers}>
              <Icon
                name="account-group"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.descriptionMemberText}>
                {selectedCommunity.memberCount} members
              </Text>
            </View>
          </View>
        </View>
        {selectedCommunity.description ? (
          <Text style={styles.descriptionText}>
            {selectedCommunity.description}
          </Text>
        ) : null}
        <View style={styles.descriptionDivider} />
      </Card>
    );
  };

  const renderPostItem = ({ item }: ListRenderItemInfo<CommunityPost>) => {
    return (
      <Card style={styles.postCard}>
        <View style={styles.postHeader}>
          <Avatar
            uri={item.author?.avatar}
            name={item.author?.name || 'User'}
            size="medium"
          />
          <View style={styles.postAuthorInfo}>
            <Text style={styles.postAuthorName}>
              {item.author?.name || 'Unknown User'}
            </Text>
            <Text style={styles.postTimestamp}>
              {formatTimestamp(item.createdAt)}
            </Text>
          </View>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        {item.images && item.images.length > 0 && (
          <View style={styles.postImagesContainer}>
            {item.images.map((imageUri, index) => (
              <View key={index} style={styles.postImageWrapper}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
        )}

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.postActionBtn}
            onPress={() => handleLikePost(item.id)}
            activeOpacity={0.6}
          >
            <Icon
              name={item.isLikedByMe ? 'heart' : 'heart-outline'}
              size={20}
              color={item.isLikedByMe ? Colors.error : Colors.textSecondary}
            />
            <Text
              style={[
                styles.postActionText,
                item.isLikedByMe && { color: Colors.error },
              ]}
            >
              {item.likeCount > 0 ? item.likeCount : 'Like'}
            </Text>
          </TouchableOpacity>

          <View style={styles.postActionBtn}>
            <Icon
              name="comment-outline"
              size={20}
              color={Colors.textSecondary}
            />
            <Text style={styles.postActionText}>
              {item.commentCount > 0 ? item.commentCount : 'Comment'}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderListEmpty = () => {
    if (postsLoading) return null;
    return (
      <EmptyState
        icon="message-text-outline"
        title="No Posts Yet"
        message="Be the first to post in this community!"
        style={styles.emptyState}
      />
    );
  };

  if (loading && !selectedCommunity) {
    return <LoadingSpinner fullScreen message="Loading community..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderDescriptionHeader}
        ListEmptyComponent={renderListEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />

      {postsLoading && posts.length === 0 && (
        <LoadingSpinner message="Loading posts..." />
      )}

      <View style={styles.inputBar}>
        <View style={styles.inputRow}>
          <Avatar
            uri={user?.avatar}
            name={user?.name || 'Me'}
            size="small"
          />
          <TextInput
            ref={inputRef}
            style={styles.postInput}
            value={postText}
            onChangeText={setPostText}
            placeholder="Write something..."
            placeholderTextColor={Colors.placeholder}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={styles.imagePickerBtn}
            activeOpacity={0.6}
            onPress={() => {
              // Image picker placeholder - to be implemented
            }}
          >
            <Icon name="image-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!postText.trim() || sending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSendPost}
            disabled={!postText.trim() || sending}
            activeOpacity={0.7}
          >
            <Icon
              name="send"
              size={20}
              color={
                postText.trim() && !sending ? Colors.white : Colors.disabled
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitleText: {
    marginLeft: 10,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    maxWidth: 180,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  headerRightBtn: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  descriptionCard: {
    margin: 0,
    borderRadius: 0,
    marginBottom: 8,
  },
  descriptionHeader: {
    alignItems: 'center',
    paddingTop: 8,
  },
  descriptionName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  descriptionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  descriptionMembers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  descriptionMemberText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 12,
    textAlign: 'center',
  },
  descriptionDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginTop: 16,
  },
  postCard: {
    marginHorizontal: 0,
    borderRadius: 0,
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postAuthorInfo: {
    flex: 1,
    marginLeft: 10,
  },
  postAuthorName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  postTimestamp: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  postContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  postImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  postImageWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  postImage: {
    width: 160,
    height: 120,
    borderRadius: 8,
    backgroundColor: Colors.skeleton,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: 24,
  },
  postActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postActionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  emptyState: {
    marginTop: 60,
  },
  inputBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  postInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    minHeight: 40,
  },
  imagePickerBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.borderLight,
  },
});

export default CommunityDetailScreen;
