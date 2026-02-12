import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

interface ParticipantItemProps {
  participant: {
    id: string;
    status: 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'JOINED';
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
    joinedAt?: string;
  };
}

const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'primary'> = {
  JOINED: 'success',
  ACCEPTED: 'success',
  INVITED: 'warning',
  DECLINED: 'error',
};

const ParticipantItem: React.FC<ParticipantItemProps> = ({ participant }) => {
  return (
    <View style={styles.container}>
      <Avatar name={participant.user.name} uri={participant.user.avatar} size={40} />
      <View style={styles.info}>
        <Text style={styles.name}>{participant.user.name}</Text>
        {participant.joinedAt && (
          <Text style={styles.joinedAt}>Joined {participant.joinedAt}</Text>
        )}
      </View>
      <Badge
        label={participant.status}
        variant={statusVariant[participant.status] || 'default'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  joinedAt: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default ParticipantItem;
