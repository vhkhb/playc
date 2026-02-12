import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import VenueCard from '../../components/venue/VenueCard';
import { COLORS } from '../../constants/colors';

type Props = NativeStackScreenProps<any, 'MapView'>;

const MapViewScreen: React.FC<Props> = ({ navigation }) => {
  const { nearbyVenues } = useSelector((state: RootState) => state.venues);

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapIcon}>🗺️</Text>
        <Text style={styles.mapTitle}>Map View</Text>
        <Text style={styles.mapSubtitle}>
          Configure react-native-maps with your Google Maps API key for full map experience
        </Text>
        <View style={styles.pinRow}>
          <View style={[styles.pin, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.pinLabel}>Venues near you</Text>
        </View>
        <View style={styles.pinRow}>
          <View style={[styles.pin, { backgroundColor: COLORS.secondary }]} />
          <Text style={styles.pinLabel}>Your location</Text>
        </View>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Nearby Venues ({nearbyVenues.length})</Text>
        <FlatList
          data={nearbyVenues}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VenueCard
              venue={item}
              onPress={() => navigation.navigate('VenueDetail', { venueId: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📍</Text>
              <Text style={styles.emptyText}>No venues found nearby</Text>
              <Text style={styles.emptySubtext}>Try expanding your search radius</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  mapPlaceholder: {
    height: 250,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  mapIcon: { fontSize: 48, marginBottom: 12 },
  mapTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  mapSubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  pinRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  pin: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  pinLabel: { fontSize: 13, color: COLORS.textSecondary },
  listSection: { flex: 1, paddingTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, paddingHorizontal: 16, marginBottom: 12 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  emptySubtext: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
});

export default MapViewScreen;
