import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

interface MemberItemProps {
  member: {
    id: string;
    role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
    user: {
      id: string;
      name: string;
      avatar?: string;
      phone?: string;
      email?: string;
    };
    joinedAt: string;
  };
  showContactInfo?: boolean;
  onPress?: () => void;
}

const roleVariant: Record<string, 'primary' | 'warning' | 'default'> = {
  ADMIN: 'primary',
  MODERATOR: 'warning',
  MEMBER: 'default',
};

const MemberItem: React.FC<MemberItemProps> = ({ member, showContactInfo = false, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Avatar name={member.user.name} uri={member.user.avatar} size={44} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{member.user.name}</Text>
          <Badge
            label={member.role}
            variant={roleVariant[member.role] || 'default'}
          />
        </View>
        {showContactInfo && member.user.phone && (
          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactText}>{member.user.phone}</Text>
          </View>
        )}
        {showContactInfo && member.user.email && (
          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>✉️</Text>
            <Text style={styles.contactText}>{member.user.email}</Text>
          </View>
        )}
        {!showContactInfo && (
          <Text style={styles.joinedAt}>
            Joined {new Date(member.joinedAt).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  joinedAt: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  contactIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  contactText: {
    fontSize: 13,
    color: COLORS.secondary,
  },
});

export default MemberItem;
