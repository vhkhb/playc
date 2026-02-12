import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ParticipantItem from '../../components/game/ParticipantItem';
import { COLORS } from '../../constants/colors';

type Props = NativeStackScreenProps<any, 'GameDetail'>;

const GameDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { gameId } = route.params as { gameId: string };
  const dispatch = useDispatch<AppDispatch>();
  const { selectedGame, loading } = useSelector((state: RootState) => state.games);
  const { user } = useSelector((state: RootState) => state.auth);
  const [joining, setJoining] = useState(false);

  const game = selectedGame;
  const isHost = game?.hostId === user?.id;
  const isFull = game ? game.currentPlayers >= game.maxPlayers : false;
  const playersPercentage = game ? (game.currentPlayers / game.maxPlayers) * 100 : 0;

  const handleJoinGame = async () => {
    setJoining(true);
    try {
      // dispatch(joinGame(gameId))
      Alert.alert('Success', 'You have joined the game!');
    } catch {
      Alert.alert('Error', 'Failed to join game');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading game details..." />;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{game?.title || 'Game'}</Text>
            <Badge
              label={game?.status || 'UPCOMING'}
              variant={game?.status === 'UPCOMING' ? 'success' : 'primary'}
            />
          </View>
          <View style={styles.badges}>
            <Badge label={game?.sportType || 'Sport'} variant="primary" />
            {game?.isPublic === false && <Badge label="Private" variant="warning" />}
          </View>
        </View>

        {/* Host Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Host</Text>
          <View style={styles.hostRow}>
            <Avatar name={game?.host?.name || 'Host'} size={48} />
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>{game?.host?.name || 'Host'}</Text>
              <Text style={styles.hostLabel}>Game Organizer</Text>
            </View>
            {!isHost && (
              <TouchableOpacity
                style={styles.viewProfileBtn}
                onPress={() => navigation.navigate('PublicProfile', { userId: game?.hostId })}
              >
                <Text style={styles.viewProfileText}>View Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Venue & Time */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Venue & Schedule</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Venue</Text>
              <Text style={styles.infoValue}>{game?.venue?.name || 'TBD'}</Text>
              <Text style={styles.infoSubvalue}>{game?.venue?.address || ''}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>
                {game?.slot?.date || 'TBD'} | {game?.slot?.startTime || ''} - {game?.slot?.endTime || ''}
              </Text>
            </View>
          </View>
        </Card>

        {/* Description */}
        {game?.description && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>About the Game</Text>
            <Text style={styles.description}>{game.description}</Text>
          </Card>
        )}

        {/* Players */}
        <Card style={styles.section}>
          <View style={styles.playerHeader}>
            <Text style={styles.sectionTitle}>Players</Text>
            <Text style={styles.playerCount}>
              {game?.currentPlayers || 0}/{game?.maxPlayers || 0}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(playersPercentage, 100)}%` }]} />
          </View>
          <View style={styles.participantsList}>
            {(game?.participants || []).map((p: any) => (
              <ParticipantItem key={p.id} participant={p} />
            ))}
            {(!game?.participants || game.participants.length === 0) && (
              <Text style={styles.noParticipants}>No participants yet. Be the first to join!</Text>
            )}
          </View>
        </Card>

        {/* Extra Services */}
        {game?.extraServices && game.extraServices.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Extra Services</Text>
            {game.extraServices.map((service: any, index: number) => (
              <View key={index} style={styles.serviceRow}>
                <Text style={styles.serviceName}>{service.name || service}</Text>
                {service.price && (
                  <Text style={styles.servicePrice}>${service.price}</Text>
                )}
              </View>
            ))}
          </Card>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {isHost ? (
          <View style={styles.hostActions}>
            <Button
              title="Invite Players"
              onPress={() => navigation.navigate('InvitePlayers', { gameId })}
              style={styles.actionButton}
            />
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.joinActions}>
            <Button
              title={isFull ? 'Game Full' : 'Join Game'}
              onPress={handleJoinGame}
              loading={joining}
              disabled={isFull}
              style={styles.actionButton}
            />
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 100 },
  header: { padding: 20, backgroundColor: COLORS.white },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, flex: 1, marginRight: 12 },
  badges: { flexDirection: 'row', gap: 8 },
  section: { marginHorizontal: 16, marginTop: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  hostRow: { flexDirection: 'row', alignItems: 'center' },
  hostInfo: { flex: 1, marginLeft: 12 },
  hostName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  hostLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  viewProfileBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.primaryLight },
  viewProfileText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  infoIcon: { fontSize: 20, marginRight: 12, marginTop: 2 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  infoSubvalue: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  description: { fontSize: 14, color: COLORS.text, lineHeight: 22 },
  playerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  playerCount: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  progressBar: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  participantsList: {},
  noParticipants: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: 16 },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  serviceName: { fontSize: 14, color: COLORS.text },
  servicePrice: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  bottomSpacer: { height: 20 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white, padding: 16,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 8,
  },
  hostActions: { flexDirection: 'row', gap: 12 },
  joinActions: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1 },
  shareButton: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderColor: COLORS.primary, justifyContent: 'center' },
  shareButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
});

export default GameDetailScreen;
