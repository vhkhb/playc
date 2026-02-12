import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import SlotCard from '../../components/venue/SlotCard';
import Colors from '../../constants/colors';
import { SPORTS, SportItem } from '../../constants/sports';
import { AppDispatch, RootState } from '../../store';
import { hostGame, clearGameError } from '../../store/slices/gameSlice';
import { fetchVenueSlots } from '../../store/slices/venueSlice';
import {
  HostStackParamList,
  SportType,
  Slot,
  ExtraService,
  HostGamePayload,
} from '../../types';

type Props = NativeStackScreenProps<HostStackParamList, 'HostGame'>;

interface SelectedService {
  serviceId: string;
  quantity: number;
}

const HostGameScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { createLoading, error: gameError } = useSelector(
    (state: RootState) => state.games
  );
  const { venues, venueSlots, slotsLoading } = useSelector(
    (state: RootState) => state.venues
  );

  const [title, setTitle] = useState('');
  const [selectedSport, setSelectedSport] = useState<SportType | null>(null);
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [showVenuePicker, setShowVenuePicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [maxPlayers, setMaxPlayers] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedVenue = useMemo(
    () => venues.find((v) => v.id === selectedVenueId) || null,
    [venues, selectedVenueId]
  );

  const filteredVenues = useMemo(
    () =>
      selectedSport
        ? venues.filter((v) => v.sportType === selectedSport)
        : venues,
    [venues, selectedSport]
  );

  useEffect(() => {
    if (gameError) {
      Alert.alert('Error', gameError);
      dispatch(clearGameError());
    }
  }, [gameError, dispatch]);

  useEffect(() => {
    if (selectedVenueId) {
      const today = new Date().toISOString().split('T')[0];
      dispatch(fetchVenueSlots({ venueId: selectedVenueId, date: today }));
      setSelectedSlot(null);
    }
  }, [dispatch, selectedVenueId]);

  const handleServiceToggle = useCallback((service: ExtraService) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.serviceId === service.id);
      if (exists) {
        return prev.filter((s) => s.serviceId !== service.id);
      }
      return [...prev, { serviceId: service.id, quantity: 1 }];
    });
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Game title is required';
    if (!selectedSport) newErrors.sport = 'Please select a sport';
    if (!selectedVenueId) newErrors.venue = 'Please select a venue';
    if (!selectedSlot) newErrors.slot = 'Please select a time slot';
    if (!maxPlayers.trim()) {
      newErrors.maxPlayers = 'Max players is required';
    } else if (isNaN(Number(maxPlayers)) || Number(maxPlayers) < 2) {
      newErrors.maxPlayers = 'Must be at least 2 players';
    }
    if (!description.trim()) newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleHostGame = async () => {
    if (!validateForm()) return;

    const payload: HostGamePayload = {
      venueId: selectedVenueId!,
      slotId: selectedSlot!.id,
      title: title.trim(),
      description: description.trim(),
      sportType: selectedSport!,
      maxPlayers: Number(maxPlayers),
      isPublic,
      extraServices: selectedServices,
    };

    try {
      const result = await dispatch(hostGame(payload)).unwrap();
      Alert.alert('Success', 'Game hosted successfully!', [
        {
          text: 'View Game',
          onPress: () =>
            navigation.replace('GameDetail', { gameId: result.id }),
        },
        {
          text: 'Invite Players',
          onPress: () =>
            navigation.replace('InvitePlayers', { gameId: result.id }),
        },
      ]);
    } catch {
      // Error handled via gameError state
    }
  };

  const renderSportItem = (sport: SportItem) => {
    const isSelected = selectedSport === sport.id;
    return (
      <TouchableOpacity
        key={sport.id}
        style={[styles.sportItem, isSelected && styles.sportItemSelected]}
        onPress={() => {
          setSelectedSport(sport.id);
          setShowSportPicker(false);
          setSelectedVenueId(null);
          setSelectedSlot(null);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.sportEmoji}>{sport.emoji}</Text>
        <Text
          style={[styles.sportName, isSelected && styles.sportNameSelected]}
        >
          {sport.name}
        </Text>
        {isSelected && (
          <Icon name="check-circle" size={20} color={Colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.screenTitle}>Host a Game</Text>
          <Text style={styles.screenSubtitle}>
            Set up your game and invite players to join
          </Text>

          {/* Game Title */}
          <Input
            label="Game Title"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) setErrors((e) => ({ ...e, title: '' }));
            }}
            placeholder="e.g., Weekend Cricket Match"
            leftIcon="trophy-outline"
            error={errors.title}
            required
          />

          {/* Sport Type Picker */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Sport Type <Text style={styles.requiredMark}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                errors.sport ? styles.pickerError : null,
              ]}
              onPress={() => setShowSportPicker(!showSportPicker)}
              activeOpacity={0.7}
            >
              {selectedSport ? (
                <View style={styles.pickerSelectedRow}>
                  <Text style={styles.pickerSelectedEmoji}>
                    {SPORTS.find((s) => s.id === selectedSport)?.emoji}
                  </Text>
                  <Text style={styles.pickerSelectedText}>
                    {SPORTS.find((s) => s.id === selectedSport)?.name}
                  </Text>
                </View>
              ) : (
                <Text style={styles.pickerPlaceholder}>Select a sport</Text>
              )}
              <Icon
                name={showSportPicker ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={Colors.textLight}
              />
            </TouchableOpacity>
            {errors.sport && (
              <Text style={styles.errorText}>{errors.sport}</Text>
            )}

            {showSportPicker && (
              <Card style={styles.pickerDropdown}>
                {SPORTS.map(renderSportItem)}
              </Card>
            )}
          </View>

          {/* Venue Picker */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Select Venue <Text style={styles.requiredMark}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                errors.venue ? styles.pickerError : null,
              ]}
              onPress={() => setShowVenuePicker(!showVenuePicker)}
              activeOpacity={0.7}
            >
              {selectedVenue ? (
                <View style={styles.pickerSelectedRow}>
                  <Icon
                    name="office-building"
                    size={18}
                    color={Colors.primary}
                  />
                  <Text style={styles.pickerSelectedText}>
                    {selectedVenue.name}
                  </Text>
                </View>
              ) : (
                <Text style={styles.pickerPlaceholder}>
                  {selectedSport
                    ? 'Select a venue'
                    : 'Select a sport first'}
                </Text>
              )}
              <Icon
                name={showVenuePicker ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={Colors.textLight}
              />
            </TouchableOpacity>
            {errors.venue && (
              <Text style={styles.errorText}>{errors.venue}</Text>
            )}

            {showVenuePicker && filteredVenues.length > 0 && (
              <Card style={styles.pickerDropdown}>
                {filteredVenues.map((venue) => (
                  <TouchableOpacity
                    key={venue.id}
                    style={[
                      styles.venuePickerItem,
                      selectedVenueId === venue.id &&
                        styles.venuePickerItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedVenueId(venue.id);
                      setShowVenuePicker(false);
                      if (errors.venue)
                        setErrors((e) => ({ ...e, venue: '' }));
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.venuePickerInfo}>
                      <Text style={styles.venuePickerName}>{venue.name}</Text>
                      <Text style={styles.venuePickerAddress}>
                        {venue.address}, {venue.city}
                      </Text>
                    </View>
                    {selectedVenueId === venue.id && (
                      <Icon
                        name="check-circle"
                        size={20}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </Card>
            )}
            {showVenuePicker && filteredVenues.length === 0 && (
              <Card style={styles.pickerDropdown}>
                <Text style={styles.noVenuesText}>
                  No venues found for the selected sport.
                </Text>
              </Card>
            )}
          </View>

          {/* Slot Selection */}
          {selectedVenueId && (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Select Slot <Text style={styles.requiredMark}>*</Text>
              </Text>
              {slotsLoading ? (
                <LoadingSpinner message="Loading available slots..." />
              ) : venueSlots.length === 0 ? (
                <EmptyState
                  icon="clock-alert-outline"
                  title="No Slots Available"
                  message="No slots available for today. Check back later."
                  style={styles.emptySlots}
                />
              ) : (
                <View style={styles.slotsGrid}>
                  {venueSlots.map((slot) => (
                    <View key={slot.id} style={styles.slotWrapper}>
                      <SlotCard
                        slot={slot}
                        selected={selectedSlot?.id === slot.id}
                        onPress={() => {
                          setSelectedSlot(slot);
                          if (errors.slot)
                            setErrors((e) => ({ ...e, slot: '' }));
                        }}
                      />
                    </View>
                  ))}
                </View>
              )}
              {errors.slot && (
                <Text style={styles.errorText}>{errors.slot}</Text>
              )}
            </View>
          )}

          {/* Max Players */}
          <Input
            label="Max Players"
            value={maxPlayers}
            onChangeText={(text) => {
              setMaxPlayers(text.replace(/[^0-9]/g, ''));
              if (errors.maxPlayers)
                setErrors((e) => ({ ...e, maxPlayers: '' }));
            }}
            placeholder="e.g., 10"
            keyboardType="number-pad"
            leftIcon="account-group-outline"
            error={errors.maxPlayers}
            required
          />

          {/* Description */}
          <Input
            label="Description"
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description)
                setErrors((e) => ({ ...e, description: '' }));
            }}
            placeholder="Describe your game, rules, skill level expected..."
            multiline
            numberOfLines={4}
            leftIcon="text-box-outline"
            error={errors.description}
            required
            containerStyle={styles.descriptionInput}
          />

          {/* Public/Private Toggle */}
          <Card style={styles.toggleCard}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <View style={styles.toggleLabelRow}>
                  <Icon
                    name={isPublic ? 'earth' : 'lock'}
                    size={20}
                    color={isPublic ? Colors.primary : Colors.warning}
                  />
                  <Text style={styles.toggleLabel}>
                    {isPublic ? 'Public Game' : 'Private Game'}
                  </Text>
                </View>
                <Text style={styles.toggleDescription}>
                  {isPublic
                    ? 'Anyone can discover and join your game'
                    : 'Only invited players can join your game'}
                </Text>
              </View>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{
                  false: Colors.border,
                  true: Colors.primaryLight,
                }}
                thumbColor={isPublic ? Colors.primary : Colors.textLight}
              />
            </View>
          </Card>

          {/* Extra Services */}
          {selectedVenue?.extraServices &&
            selectedVenue.extraServices.filter((s) => s.isAvailable).length >
              0 && (
              <View style={styles.servicesSection}>
                <Text style={styles.fieldLabel}>Extra Services</Text>
                <Text style={styles.servicesSubtitle}>
                  Add optional services for your game
                </Text>
                {selectedVenue.extraServices
                  .filter((s) => s.isAvailable)
                  .map((service) => {
                    const isSelected = selectedServices.some(
                      (s) => s.serviceId === service.id
                    );
                    return (
                      <TouchableOpacity
                        key={service.id}
                        style={[
                          styles.serviceItem,
                          isSelected && styles.serviceItemSelected,
                        ]}
                        onPress={() => handleServiceToggle(service)}
                        activeOpacity={0.7}
                      >
                        <Icon
                          name={
                            isSelected
                              ? 'checkbox-marked'
                              : 'checkbox-blank-outline'
                          }
                          size={22}
                          color={
                            isSelected ? Colors.primary : Colors.textLight
                          }
                        />
                        <View style={styles.serviceItemInfo}>
                          <Text style={styles.serviceItemName}>
                            {service.name}
                          </Text>
                          <Text style={styles.serviceItemDesc}>
                            {service.description}
                          </Text>
                        </View>
                        <Text style={styles.serviceItemPrice}>
                          Rs. {service.price}/{service.unit}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            )}

          {/* Host Button */}
          <View style={styles.submitSection}>
            <Button
              title="Host Game"
              onPress={handleHostGame}
              loading={createLoading}
              fullWidth
              size="large"
              icon={
                <Icon
                  name="gamepad-variant-outline"
                  size={22}
                  color={Colors.white}
                />
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
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
  requiredMark: {
    color: Colors.error,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  pickerError: {
    borderColor: Colors.error,
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: Colors.placeholder,
  },
  pickerSelectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerSelectedEmoji: {
    fontSize: 18,
  },
  pickerSelectedText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  pickerDropdown: {
    marginTop: 4,
    maxHeight: 300,
  },
  sportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sportItemSelected: {
    backgroundColor: Colors.successLight,
  },
  sportEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  sportName: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  sportNameSelected: {
    fontWeight: '600',
    color: Colors.primary,
  },
  venuePickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  venuePickerItemSelected: {
    backgroundColor: Colors.successLight,
  },
  venuePickerInfo: {
    flex: 1,
  },
  venuePickerName: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  venuePickerAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  noVenuesText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  slotWrapper: {
    width: '50%',
  },
  emptySlots: {
    paddingVertical: 24,
  },
  descriptionInput: {
    marginBottom: 16,
  },
  toggleCard: {
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  toggleDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 28,
  },
  servicesSection: {
    marginBottom: 16,
  },
  servicesSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  serviceItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.successLight,
  },
  serviceItemInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  serviceItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  serviceItemDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  serviceItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  submitSection: {
    marginTop: 8,
  },
});

export default HostGameScreen;
