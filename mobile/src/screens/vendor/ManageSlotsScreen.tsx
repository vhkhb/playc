import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Colors from '../../constants/colors';
import { AppDispatch, RootState } from '../../store';
import {
  fetchVenueSlots,
  createSlot,
  updateSlot,
  deleteSlot,
} from '../../store/slices/vendorSlice';
import { VendorStackParamList, Slot, CreateSlotPayload } from '../../types';

type Props = NativeStackScreenProps<VendorStackParamList, 'ManageSlots'>;

type RecurrenceType = 'none' | 'daily' | 'weekly';

interface SlotFormData {
  startTime: string;
  endTime: string;
  price: string;
  maxPlayers: string;
  recurrence: RecurrenceType;
}

const RECURRENCE_OPTIONS: { label: string; value: RecurrenceType }[] = [
  { label: 'None', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
];

const ManageSlotsScreen: React.FC<Props> = ({ route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { venueId } = route.params;
  const { slots, loading, createLoading } = useSelector(
    (state: RootState) => state.vendor
  );

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [showRecurrencePicker, setShowRecurrencePicker] = useState(false);
  const [formData, setFormData] = useState<SlotFormData>({
    startTime: '',
    endTime: '',
    price: '',
    maxPlayers: '',
    recurrence: 'none',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const calendarDates = useMemo(() => {
    const dates: { date: string; dayLabel: string; dayNum: string; isToday: boolean }[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate().toString();
      dates.push({
        date: dateStr,
        dayLabel,
        dayNum,
        isToday: i === 0,
      });
    }
    return dates;
  }, []);

  useEffect(() => {
    dispatch(fetchVenueSlots({ venueId, date: selectedDate }));
  }, [dispatch, venueId, selectedDate]);

  const filteredSlots = slots.filter((s) => s.date === selectedDate);

  const openAddModal = () => {
    setEditingSlot(null);
    setFormData({
      startTime: '',
      endTime: '',
      price: '',
      maxPlayers: '',
      recurrence: 'none',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (slot: Slot) => {
    setEditingSlot(slot);
    setFormData({
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price.toString(),
      maxPlayers: slot.maxPlayers.toString(),
      recurrence: slot.isRecurring
        ? (slot.recurrencePattern as RecurrenceType) || 'none'
        : 'none',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!formData.startTime.trim() || !timeRegex.test(formData.startTime)) {
      newErrors.startTime = 'Valid start time required (HH:MM)';
    }
    if (!formData.endTime.trim() || !timeRegex.test(formData.endTime)) {
      newErrors.endTime = 'Valid end time required (HH:MM)';
    }
    if (
      formData.startTime &&
      formData.endTime &&
      formData.startTime >= formData.endTime
    ) {
      newErrors.endTime = 'End time must be after start time';
    }
    if (!formData.price.trim() || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (
      !formData.maxPlayers.trim() ||
      isNaN(Number(formData.maxPlayers)) ||
      Number(formData.maxPlayers) <= 0
    ) {
      newErrors.maxPlayers = 'Valid player count is required';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSlot = async () => {
    if (!validateForm()) return;

    const isRecurring = formData.recurrence !== 'none';
    const payload: CreateSlotPayload = {
      venueId,
      date: selectedDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      price: parseFloat(formData.price),
      maxPlayers: parseInt(formData.maxPlayers, 10),
      isRecurring,
      recurrencePattern: isRecurring
        ? (formData.recurrence as 'daily' | 'weekly')
        : undefined,
    };

    try {
      if (editingSlot) {
        await dispatch(
          updateSlot({ slotId: editingSlot.id, data: payload })
        ).unwrap();
      } else {
        await dispatch(createSlot(payload)).unwrap();
      }
      setShowModal(false);
      dispatch(fetchVenueSlots({ venueId, date: selectedDate }));
    } catch (err: any) {
      Alert.alert('Error', err || 'Failed to save slot.');
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    Alert.alert('Delete Slot', 'Are you sure you want to delete this slot?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteSlot(slotId)).unwrap();
          } catch (err: any) {
            Alert.alert('Error', err || 'Failed to delete slot.');
          }
        },
      },
    ]);
  };

  const handleToggleAvailability = async (slot: Slot) => {
    try {
      await dispatch(
        updateSlot({
          slotId: slot.id,
          data: { ...slot, isAvailable: !slot.isAvailable } as any,
        })
      ).unwrap();
    } catch (err: any) {
      Alert.alert('Error', err || 'Failed to update availability.');
    }
  };

  const renderCalendarDate = ({
    item,
  }: {
    item: (typeof calendarDates)[0];
  }) => {
    const isSelected = item.date === selectedDate;
    return (
      <TouchableOpacity
        style={[
          styles.calendarDateItem,
          isSelected && styles.calendarDateItemSelected,
          item.isToday && !isSelected && styles.calendarDateItemToday,
        ]}
        onPress={() => setSelectedDate(item.date)}
      >
        <Text
          style={[
            styles.calendarDayLabel,
            isSelected && styles.calendarDayLabelSelected,
          ]}
        >
          {item.dayLabel}
        </Text>
        <Text
          style={[
            styles.calendarDayNum,
            isSelected && styles.calendarDayNumSelected,
          ]}
        >
          {item.dayNum}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSlotItem = ({ item }: { item: Slot }) => (
    <Card style={styles.slotCard}>
      <View style={styles.slotCardContent}>
        <View style={styles.slotTimeSection}>
          <Icon name="clock-outline" size={18} color={Colors.primary} />
          <Text style={styles.slotTimeText}>
            {item.startTime} - {item.endTime}
          </Text>
        </View>
        <View style={styles.slotDetailsRow}>
          <View style={styles.slotDetail}>
            <Icon name="currency-inr" size={14} color={Colors.textSecondary} />
            <Text style={styles.slotDetailText}>{item.price}</Text>
          </View>
          <View style={styles.slotDetail}>
            <Icon name="account-group-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.slotDetailText}>
              {item.bookedPlayers}/{item.maxPlayers}
            </Text>
          </View>
          {item.isRecurring && (
            <View style={styles.recurrenceBadge}>
              <Icon name="repeat" size={12} color={Colors.secondary} />
              <Text style={styles.recurrenceText}>
                {item.recurrencePattern || 'Recurring'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.slotActions}>
          <View style={styles.availabilityToggle}>
            <Text style={styles.availabilityLabel}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
            <Switch
              value={item.isAvailable}
              onValueChange={() => handleToggleAvailability(item)}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={item.isAvailable ? Colors.primary : Colors.textLight}
            />
          </View>
          <View style={styles.slotActionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openEditModal(item)}
            >
              <Icon name="pencil-outline" size={18} color={Colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteSlot(item.id)}
            >
              <Icon name="trash-can-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Calendar Strip */}
      <View style={styles.calendarStrip}>
        <FlatList
          data={calendarDates}
          renderItem={renderCalendarDate}
          keyExtractor={(item) => item.date}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarContent}
        />
      </View>

      <Text style={styles.dateHeading}>
        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      </Text>

      {/* Slots List */}
      {loading && filteredSlots.length === 0 ? (
        <LoadingSpinner message="Loading slots..." />
      ) : filteredSlots.length === 0 ? (
        <EmptyState
          icon="clock-alert-outline"
          title="No slots for this date"
          message="Add a new slot by tapping the button below."
          actionLabel="Add Slot"
          onAction={openAddModal}
        />
      ) : (
        <FlatList
          data={filteredSlots}
          renderItem={renderSlotItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Icon name="plus" size={28} color={Colors.white} />
      </TouchableOpacity>

      {/* Add/Edit Slot Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingSlot ? 'Edit Slot' : 'Add New Slot'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalRow}>
                <View style={styles.modalRowHalf}>
                  <Input
                    label="Start Time"
                    value={formData.startTime}
                    onChangeText={(v) =>
                      setFormData((prev) => ({ ...prev, startTime: v }))
                    }
                    placeholder="09:00"
                    leftIcon="clock-start"
                    error={formErrors.startTime}
                    required
                  />
                </View>
                <View style={styles.modalRowHalf}>
                  <Input
                    label="End Time"
                    value={formData.endTime}
                    onChangeText={(v) =>
                      setFormData((prev) => ({ ...prev, endTime: v }))
                    }
                    placeholder="10:00"
                    leftIcon="clock-end"
                    error={formErrors.endTime}
                    required
                  />
                </View>
              </View>

              <View style={styles.modalRow}>
                <View style={styles.modalRowHalf}>
                  <Input
                    label="Price (INR)"
                    value={formData.price}
                    onChangeText={(v) =>
                      setFormData((prev) => ({ ...prev, price: v }))
                    }
                    placeholder="500"
                    keyboardType="numeric"
                    leftIcon="currency-inr"
                    error={formErrors.price}
                    required
                  />
                </View>
                <View style={styles.modalRowHalf}>
                  <Input
                    label="Max Players"
                    value={formData.maxPlayers}
                    onChangeText={(v) =>
                      setFormData((prev) => ({ ...prev, maxPlayers: v }))
                    }
                    placeholder="12"
                    keyboardType="numeric"
                    leftIcon="account-group"
                    error={formErrors.maxPlayers}
                    required
                  />
                </View>
              </View>

              {/* Recurrence Dropdown */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Recurrence</Text>
                <TouchableOpacity
                  style={styles.recurrenceDropdown}
                  onPress={() =>
                    setShowRecurrencePicker(!showRecurrencePicker)
                  }
                >
                  <Text style={styles.recurrenceDropdownText}>
                    {RECURRENCE_OPTIONS.find(
                      (o) => o.value === formData.recurrence
                    )?.label || 'None'}
                  </Text>
                  <Icon
                    name={
                      showRecurrencePicker ? 'chevron-up' : 'chevron-down'
                    }
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
                {showRecurrencePicker && (
                  <View style={styles.recurrenceOptions}>
                    {RECURRENCE_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.recurrenceOption,
                          formData.recurrence === option.value &&
                            styles.recurrenceOptionSelected,
                        ]}
                        onPress={() => {
                          setFormData((prev) => ({
                            ...prev,
                            recurrence: option.value,
                          }));
                          setShowRecurrencePicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.recurrenceOptionText,
                            formData.recurrence === option.value &&
                              styles.recurrenceOptionTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <Button
                title={editingSlot ? 'Update Slot' : 'Create Slot'}
                onPress={handleSaveSlot}
                loading={createLoading}
                fullWidth
                style={styles.modalSaveButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  calendarStrip: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  calendarContent: {
    paddingHorizontal: 12,
  },
  calendarDateItem: {
    width: 54,
    height: 68,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  calendarDateItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  calendarDateItemToday: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  calendarDayLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  calendarDayLabelSelected: {
    color: Colors.white,
  },
  calendarDayNum: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  calendarDayNumSelected: {
    color: Colors.white,
  },
  dateHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  slotCard: {
    marginBottom: 12,
  },
  slotCardContent: {},
  slotTimeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotTimeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 8,
  },
  slotDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  slotDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  recurrenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  recurrenceText: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  slotActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
    paddingTop: 10,
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availabilityLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  slotActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.infoLight,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.errorLight,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalRowHalf: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6,
  },
  recurrenceDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  recurrenceDropdownText: {
    fontSize: 15,
    color: Colors.text,
  },
  recurrenceOptions: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  recurrenceOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  recurrenceOptionSelected: {
    backgroundColor: Colors.successLight,
  },
  recurrenceOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  recurrenceOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  modalSaveButton: {
    marginTop: 8,
    marginBottom: 16,
  },
});

export default ManageSlotsScreen;
