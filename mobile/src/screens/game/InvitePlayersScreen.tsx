import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import SearchBar from '../../components/common/SearchBar';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { COLORS } from '../../constants/colors';

type Props = NativeStackScreenProps<any, 'InvitePlayers'>;

interface UserResult {
  id: string;
  name: string;
  avatar?: string;
  gamesPlayed: number;
  rating: number;
}

const InvitePlayersScreen: React.FC<Props> = ({ route, navigation }) => {
  const { gameId } = route.params as { gameId: string };
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    // API call to search users would go here
    // For now, showing placeholder behavior
    setTimeout(() => {
      setSearchResults([]);
      setLoading(false);
    }, 500);
  };

  const toggleUser = (userId: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUsers(newSet);
  };

  const handleSendInvitations = async () => {
    if (selectedUsers.size === 0) {
      Alert.alert('No Players Selected', 'Please select at least one player to invite.');
      return;
    }
    setSending(true);
    try {
      // dispatch invite action
      Alert.alert(
        'Invitations Sent',
        `Successfully invited ${selectedUsers.size} player(s)!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert('Error', 'Failed to send invitations');
    } finally {
      setSending(false);
    }
  };

  const renderUserItem = ({ item }: { item: UserResult }) => {
    const isSelected = selectedUsers.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => toggleUser(item.id)}
        activeOpacity={0.7}
      >
        <Avatar name={item.name} uri={item.avatar} size={44} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userStats}>
            {item.gamesPlayed} games played &bull; {item.rating.toFixed(1)} rating
          </Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search players by name..."
        />
      </View>

      {selectedUsers.size > 0 && (
        <View style={styles.selectedBanner}>
          <Text style={styles.selectedText}>
            {selectedUsers.size} player{selectedUsers.size > 1 ? 's' : ''} selected
          </Text>
          <TouchableOpacity onPress={() => setSelectedUsers(new Set())}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="🔍"
            title={searchQuery.length > 0 ? 'No players found' : 'Search for Players'}
            message={
              searchQuery.length > 0
                ? 'Try a different search term'
                : 'Search by name to find players and invite them to your game'
            }
          />
        }
      />

      <View style={styles.bottomBar}>
        <Button
          title={`Send Invitations${selectedUsers.size > 0 ? ` (${selectedUsers.size})` : ''}`}
          onPress={handleSendInvitations}
          loading={sending}
          disabled={selectedUsers.size === 0}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchSection: { padding: 16, backgroundColor: COLORS.white },
  selectedBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  selectedText: { fontSize: 14, fontWeight: '600', color: COLORS.primaryDark },
  clearText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  listContent: { paddingVertical: 8 },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  userItemSelected: { backgroundColor: COLORS.primaryLight },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  userStats: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  checkmark: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  bottomBar: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default InvitePlayersScreen;
