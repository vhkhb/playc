import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../../constants/colors';
import Avatar from '../common/Avatar';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    images?: string[];
    likesCount: number;
    createdAt: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  onAuthorPress?: () => void;
  onLike?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onAuthorPress, onLike }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    onLike?.();
  };

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.authorRow} onPress={onAuthorPress}>
          <Avatar name={post.author.name} uri={post.author.avatar} size={36} />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{post.author.name}</Text>
            <Text style={styles.timestamp}>{formatTimeAgo(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.images && post.images.length > 0 && (
        <View style={styles.imagesContainer}>
          {post.images.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img }}
              style={[
                styles.image,
                post.images!.length === 1 && styles.singleImage,
              ]}
              resizeMode="cover"
            />
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Text style={[styles.actionIcon, liked && styles.likedIcon]}>
            {liked ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionText, liked && styles.likedText]}>
            {likesCount > 0 ? likesCount : ''} {likesCount === 1 ? 'Like' : 'Likes'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  header: {
    padding: 14,
    paddingBottom: 0,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorInfo: {
    marginLeft: 10,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  content: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    padding: 14,
    paddingTop: 10,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 4,
  },
  image: {
    width: '48%',
    height: 150,
    borderRadius: 8,
  },
  singleImage: {
    width: '100%',
    height: 200,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 8,
    paddingHorizontal: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginRight: 24,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  actionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  likedIcon: {},
  likedText: {
    color: COLORS.error,
    fontWeight: '500',
  },
});

export default PostCard;
