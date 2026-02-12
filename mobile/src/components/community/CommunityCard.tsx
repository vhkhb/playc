import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    description?: string;
    avatar?: string;
    sportType?: string;
    memberCount: number;
    isAutoCreated: boolean;
    isPublic: boolean;
  };
  onPress?: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Avatar name={community.name} uri={community.avatar} size={50} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{community.name}</Text>
          {community.isAutoCreated && (
            <Badge label="Game" variant="primary" />
          )}
        </View>
        {community.description && (
          <Text style={styles.description} numberOfLines={2}>
            {community.description}
          </Text>
        )}
        <View style={styles.metaRow}>
          {community.sportType && (
            <Text style={styles.metaText}>{community.sportType}</Text>
          )}
          <Text style={styles.metaDot}> &bull; </Text>
          <Text style={styles.metaText}>{community.memberCount} members</Text>
          {!community.isPublic && (
            <>
              <Text style={styles.metaDot}> &bull; </Text>
              <Text style={styles.privateText}>Private</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metaDot: {
    fontSize: 12,
    color: COLORS.border,
  },
  privateText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '500',
  },
});

export default CommunityCard;
