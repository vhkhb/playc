import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { COLORS } from '../../constants/colors';

type Props = NativeStackScreenProps<any, 'ManageServices'>;

interface ExtraService {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  venueId: string;
}

const ManageServicesScreen: React.FC<Props> = ({ navigation }) => {
  const { myVenues } = useSelector((state: RootState) => state.vendor);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(
    myVenues.length > 0 ? (myVenues[0] as any).id : null
  );
  const [services, setServices] = useState<ExtraService[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<ExtraService | null>(null);

  // Form state
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceAvailable, setServiceAvailable] = useState(true);

  const openAddModal = () => {
    setEditingService(null);
    setServiceName('');
    setServiceDesc('');
    setServicePrice('');
    setServiceAvailable(true);
    setModalVisible(true);
  };

  const openEditModal = (service: ExtraService) => {
    setEditingService(service);
    setServiceName(service.name);
    setServiceDesc(service.description);
    setServicePrice(service.price.toString());
    setServiceAvailable(service.isAvailable);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!serviceName.trim() || !servicePrice.trim()) {
      Alert.alert('Error', 'Name and price are required');
      return;
    }
    // dispatch save service action
    setModalVisible(false);
  };

  const handleDelete = (serviceId: string) => {
    Alert.alert('Delete Service', 'Are you sure you want to delete this service?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { /* dispatch delete */ } },
    ]);
  };

  const toggleAvailability = (service: ExtraService) => {
    // dispatch update availability
  };

  const renderServiceItem = ({ item }: { item: ExtraService }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.servicePrice}>${item.price.toFixed(2)}</Text>
        </View>
        <Switch
          value={item.isAvailable}
          onValueChange={() => toggleAvailability(item)}
          trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
          thumbColor={item.isAvailable ? COLORS.primary : COLORS.textSecondary}
        />
      </View>
      {item.description && (
        <Text style={styles.serviceDesc}>{item.description}</Text>
      )}
      <View style={styles.serviceActions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Venue Selector */}
      {myVenues.length > 1 && (
        <View style={styles.venueSelector}>
          <Text style={styles.selectorLabel}>Select Venue</Text>
          <FlatList
            horizontal
            data={myVenues}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }: { item: any }) => (
              <TouchableOpacity
                style={[styles.venueChip, selectedVenueId === item.id && styles.venueChipActive]}
                onPress={() => setSelectedVenueId(item.id)}
              >
                <Text style={[styles.venueChipText, selectedVenueId === item.id && styles.venueChipTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.venueChips}
          />
        </View>
      )}

      {/* Services List */}
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderServiceItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="🛎️"
            title="No Services"
            message="Add extra services that players can opt for during bookings"
            actionLabel="Add Service"
            onAction={openAddModal}
          />
        }
      />

      {/* FAB */}
      {services.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={openAddModal}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingService ? 'Edit Service' : 'Add Service'}
            </Text>

            <Input
              label="Service Name"
              value={serviceName}
              onChangeText={setServiceName}
              placeholder="e.g., Equipment Rental, Refreshments"
            />
            <Input
              label="Description"
              value={serviceDesc}
              onChangeText={setServiceDesc}
              placeholder="Describe the service"
              multiline
            />
            <Input
              label="Price ($)"
              value={servicePrice}
              onChangeText={setServicePrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Available</Text>
              <Switch
                value={serviceAvailable}
                onValueChange={setServiceAvailable}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={serviceAvailable ? COLORS.primary : COLORS.textSecondary}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Button title="Save" onPress={handleSave} style={styles.modalSaveBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  venueSelector: { backgroundColor: COLORS.white, padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  selectorLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  venueChips: { gap: 8 },
  venueChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
  },
  venueChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  venueChipText: { fontSize: 13, color: COLORS.textSecondary },
  venueChipTextActive: { color: COLORS.white },
  listContent: { padding: 16, paddingBottom: 80 },
  serviceCard: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceInfo: { flex: 1, marginRight: 12 },
  serviceName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  servicePrice: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginTop: 2 },
  serviceDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 8, lineHeight: 18 },
  serviceActions: { flexDirection: 'row', gap: 12, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  editBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6, backgroundColor: COLORS.primaryLight },
  editBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  deleteBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6, backgroundColor: '#FDE8E8' },
  deleteBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.error },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6,
  },
  fabText: { fontSize: 28, color: COLORS.white, fontWeight: '300', marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  toggleLabel: { fontSize: 15, fontWeight: '500', color: COLORS.text },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  modalSaveBtn: { flex: 1 },
});

export default ManageServicesScreen;
