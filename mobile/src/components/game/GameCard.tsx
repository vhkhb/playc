import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

interface GameCardProps {
  game: {
    id: string;
    title: string;
    sportType: string;
    status: string;
    maxPlayers: number;
    currentPlayers: number;
    isPublic: boolean;
    createdAt: string;
    host?: { name: string; avatar?: string };
    venue?: { name: string; address: string };
    slot?: { date: string; startTime: string; endTime: string };
  };
  onPress?: () => void;
  onJoin?: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onPress, onJoin }) => {
  const playersPercentage = (game.currentPlayers / game.maxPlayers) * 100;
  const isFull = game.currentPlayers >= game.maxPlayers;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title} numberOfLines={1}>{game.title}</Text>
          <View style={styles.badges}>
            <Badge label={game.sportType} variant="primary" />
            {!game.isPublic && <Badge label="Private" variant="warning" />}
          </View>
        </View>
        <Badge
          label={game.status}
          variant={game.status === 'UPCOMING' ? 'success' : game.status === 'ONGOING' ? 'primary' : 'default'}
        />
      </View>

      {game.host && (
        <View style={styles.hostRow}>
          <Avatar name={game.host.name} uri={game.host.avatar} size={24} />
          <Text style={styles.hostName}>Hosted by {game.host.name}</Text>
        </View>
      )}

      {game.venue && (
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>
          <Text style={styles.infoText} numberOfLines={1}>{game.venue.name}</Text>
        </View>
      )}

      {game.slot && (
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          <Text style={styles.infoText}>
            {game.slot.date} | {game.slot.startTime} - {game.slot.endTime}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.playersSection}>
          <Text style={styles.playersText}>
            {game.currentPlayers}/{game.maxPlayers} Players
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(playersPercentage, 100)}%` },
                isFull && styles.progressFull,
              ]}
            />
          </View>
        </View>

        {onJoin && !isFull && game.status === 'UPCOMING' && (
          <TouchableOpacity style={styles.joinButton} onPress={onJoin}>
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        )}
        {isFull && (
          <Text style={styles.fullText}>Full</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerLeft: { flex: 1, marginRight: 8 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  badges: { flexDirection: 'row', gap: 6 },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hostName: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 8 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoIcon: { fontSize: 14, marginRight: 6 },
  infoText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  playersSection: { flex: 1, marginRight: 12 },
  playersText: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressFull: { backgroundColor: COLORS.warning },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  fullText: { fontSize: 13, color: COLORS.warning, fontWeight: '600' },
});

export default GameCard;
