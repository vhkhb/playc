import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Colors from '../../constants/colors';
import { SPORTS, SPORT_OPTIONS } from '../../constants/sports';
import { AppDispatch, RootState } from '../../store';
import {
  createVenue,
  updateVenue,
  deleteVenue,
  fetchMyVenues,
} from '../../store/slices/vendorSlice';
import { VendorStackParamList, Amenity, SportType } from '../../types';

type Props = NativeStackScreenProps<VendorStackParamList, 'ManageVenue'>;

interface AmenityOption {
  id: Amenity;
  label: string;
  icon: string;
}

const AMENITY_OPTIONS: AmenityOption[] = [
  { id: 'parking', label: 'Parking', icon: 'car' },
  { id: 'changing_room', label: 'Changing Room', icon: 'hanger' },
  { id: 'restroom', label: 'Washroom', icon: 'toilet' },
  { id: 'drinking_water', label: 'Water', icon: 'water' },
  { id: 'cafeteria', label: 'Canteen', icon: 'food' },
  { id: 'first_aid', label: 'First Aid', icon: 'medical-bag' },
  { id: 'wifi', label: 'WiFi', icon: 'wifi' },
  { id: 'floodlights', label: 'Floodlights', icon: 'lightbulb-on-outline' },
  { id: 'equipment_rental', label: 'Equipment Rental', icon: 'tennis-ball' },
];

const ManageVenueScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { myVenues, createLoading, loading } = useSelector(
    (state: RootState) => state.vendor
  );

  const venueId = route.params?.venueId;
  const isEditMode = !!venueId;
  const existingVenue = myVenues.find((v) => v.id === venueId);

  const [name, setName] = useState('');
  const [sportType, setSportType] = useState<SportType>('cricket');
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([]);
  const [adEnabled, setAdEnabled] = useState(false);
  const [adBannerImage, setAdBannerImage] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode && existingVenue) {
      setName(existingVenue.name);
      setSportType(existingVenue.sportType);
      setDescription(existingVenue.description);
      setAddress(existingVenue.address);
      setCity(existingVenue.city);
      setState(existingVenue.state);
      setLatitude(existingVenue.latitude?.toString() || '');
      setLongitude(existingVenue.longitude?.toString() || '');
      setImages(existingVenue.images || []);
      setSelectedAmenities(existingVenue.amenities || []);
      if (existingVenue.adBanner) {
        setAdEnabled(existingVenue.adBanner.isActive);
        setAdBannerImage(existingVenue.adBanner.imageUrl || '');
      }
    }
  }, [isEditMode, existingVenue]);

  const toggleAmenity = (amenityId: Amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((a) => a !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleUseCurrentLocation = () => {
    // Placeholder: in production, use Geolocation API
    Alert.alert(
      'Location',
      'GPS location access would be requested here. Using default coordinates for now.'
    );
    setLatitude('28.6139');
    setLongitude('77.2090');
  };

  const handleAddImage = () => {
    // Placeholder: in production, use ImagePicker
    Alert.alert('Add Image', 'Image picker would open here.');
    const placeholderUri = `https://placeholder.com/venue-${images.length + 1}.jpg`;
    setImages((prev) => [...prev, placeholderUri]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Venue name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!latitude.trim() || isNaN(Number(latitude)))
      newErrors.latitude = 'Valid latitude is required';
    if (!longitude.trim() || isNaN(Number(longitude)))
      newErrors.longitude = 'Valid longitude is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      sportType,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: '',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      images,
      amenities: selectedAmenities,
      operatingHours: [],
    };

    try {
      if (isEditMode && venueId) {
        await dispatch(updateVenue({ venueId, data: payload })).unwrap();
        Alert.alert('Success', 'Venue updated successfully.');
      } else {
        await dispatch(createVenue(payload)).unwrap();
        Alert.alert('Success', 'Venue created successfully.');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err || 'Something went wrong.');
    }
  };

  const handleDelete = () => {
    if (!venueId) return;
    Alert.alert(
      'Delete Venue',
      'Are you sure you want to delete this venue? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteVenue(venueId)).unwrap();
              Alert.alert('Deleted', 'Venue has been deleted.');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err || 'Failed to delete venue.');
            }
          },
        },
      ]
    );
  };

  const selectedSport = SPORTS.find((s) => s.id === sportType);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>
          {isEditMode ? 'Edit Venue' : 'Create New Venue'}
        </Text>

        {/* Venue Name */}
        <Input
          label="Venue Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter venue name"
          leftIcon="stadium-variant"
          error={errors.name}
          required
        />

        {/* Sport Type Picker */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Sport Type <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.pickerButton,
              showSportPicker && styles.pickerButtonFocused,
            ]}
            onPress={() => setShowSportPicker(!showSportPicker)}
          >
            <Text style={styles.pickerButtonText}>
              {selectedSport?.name || 'Select a sport'}
            </Text>
            <Icon
              name={showSportPicker ? 'chevron-up' : 'chevron-down'}
              size={22}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
          {showSportPicker && (
            <Card style={styles.dropdownContainer}>
              <ScrollView
                style={styles.dropdownScroll}
                nestedScrollEnabled
              >
                {SPORTS.map((sport) => (
                  <TouchableOpacity
                    key={sport.id}
                    style={[
                      styles.dropdownItem,
                      sport.id === sportType && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setSportType(sport.id);
                      setShowSportPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        sport.id === sportType &&
                          styles.dropdownItemTextSelected,
                      ]}
                    >
                      {sport.name}
                    </Text>
                    {sport.id === sportType && (
                      <Icon name="check" size={18} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Card>
          )}
        </View>

        {/* Description */}
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your venue, facilities, rules..."
          multiline
          numberOfLines={4}
          error={errors.description}
          required
          containerStyle={styles.textareaContainer}
        />

        {/* Address Fields */}
        <Input
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="Street address"
          leftIcon="map-marker-outline"
          error={errors.address}
          required
        />

        <View style={styles.row}>
          <View style={styles.rowHalf}>
            <Input
              label="City"
              value={city}
              onChangeText={setCity}
              placeholder="City"
              error={errors.city}
              required
            />
          </View>
          <View style={styles.rowHalf}>
            <Input
              label="State"
              value={state}
              onChangeText={setState}
              placeholder="State"
              error={errors.state}
              required
            />
          </View>
        </View>

        {/* Lat/Lng */}
        <View style={styles.row}>
          <View style={styles.rowHalf}>
            <Input
              label="Latitude"
              value={latitude}
              onChangeText={setLatitude}
              placeholder="e.g. 28.6139"
              keyboardType="numeric"
              error={errors.latitude}
              required
            />
          </View>
          <View style={styles.rowHalf}>
            <Input
              label="Longitude"
              value={longitude}
              onChangeText={setLongitude}
              placeholder="e.g. 77.2090"
              keyboardType="numeric"
              error={errors.longitude}
              required
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleUseCurrentLocation}
        >
          <Icon name="crosshairs-gps" size={18} color={Colors.primary} />
          <Text style={styles.locationButtonText}>Use Current Location</Text>
        </TouchableOpacity>

        {/* Images Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Venue Images</Text>
        </View>
        <View style={styles.imagesGrid}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageItem}>
              <View style={styles.imagePlaceholder}>
                <Icon name="image" size={28} color={Colors.textLight} />
                <Text style={styles.imageIndex}>{index + 1}</Text>
              </View>
              <TouchableOpacity
                style={styles.imageRemoveBtn}
                onPress={() => handleRemoveImage(index)}
              >
                <Icon name="close-circle" size={22} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={[styles.imageItem, styles.addImageButton]}
            onPress={handleAddImage}
          >
            <Icon name="plus" size={32} color={Colors.primary} />
            <Text style={styles.addImageText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Amenities Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Amenities</Text>
        </View>
        <View style={styles.amenitiesGrid}>
          {AMENITY_OPTIONS.map((amenity) => {
            const isSelected = selectedAmenities.includes(amenity.id);
            return (
              <TouchableOpacity
                key={amenity.id}
                style={[
                  styles.amenityChip,
                  isSelected && styles.amenityChipSelected,
                ]}
                onPress={() => toggleAmenity(amenity.id)}
              >
                <Icon
                  name={amenity.icon}
                  size={16}
                  color={isSelected ? Colors.white : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.amenityChipText,
                    isSelected && styles.amenityChipTextSelected,
                  ]}
                >
                  {amenity.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Ad Banner Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ad Banner</Text>
        </View>
        <Card style={styles.adBannerCard}>
          <View style={styles.adToggleRow}>
            <View style={styles.adToggleInfo}>
              <Text style={styles.adToggleLabel}>Enable Venue Ad</Text>
              <Text style={styles.adToggleDesc}>
                Promote your venue on the home screen
              </Text>
            </View>
            <Switch
              value={adEnabled}
              onValueChange={setAdEnabled}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={adEnabled ? Colors.primary : Colors.textLight}
            />
          </View>
          {adEnabled && (
            <TouchableOpacity
              style={styles.adBannerPicker}
              onPress={() => {
                Alert.alert(
                  'Ad Banner',
                  'Image picker for ad banner would open here.'
                );
              }}
            >
              {adBannerImage ? (
                <View style={styles.adBannerPlaceholder}>
                  <Icon name="image-check" size={32} color={Colors.primary} />
                  <Text style={styles.adBannerPlaceholderText}>
                    Banner image selected
                  </Text>
                </View>
              ) : (
                <View style={styles.adBannerPlaceholder}>
                  <Icon name="image-plus" size={32} color={Colors.textLight} />
                  <Text style={styles.adBannerPlaceholderText}>
                    Tap to upload ad banner image
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </Card>

        {/* Save/Create Button */}
        <Button
          title={isEditMode ? 'Save Venue' : 'Create Venue'}
          onPress={handleSave}
          loading={createLoading}
          fullWidth
          style={styles.saveButton}
        />

        {/* Delete Button (edit mode only) */}
        {isEditMode && (
          <Button
            title="Delete Venue"
            onPress={handleDelete}
            variant="danger"
            fullWidth
            style={styles.deleteButton}
          />
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    marginTop: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6,
  },
  required: {
    color: Colors.error,
  },
  pickerButton: {
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
  pickerButtonFocused: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  pickerButtonText: {
    fontSize: 15,
    color: Colors.text,
  },
  dropdownContainer: {
    marginTop: 4,
    maxHeight: 200,
    padding: 0,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.successLight,
  },
  dropdownItemText: {
    fontSize: 15,
    color: Colors.text,
  },
  dropdownItemTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  textareaContainer: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowHalf: {
    flex: 1,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.successLight,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 6,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  imageItem: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageIndex: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.white,
    borderRadius: 11,
  },
  addImageButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amenityChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  amenityChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginLeft: 6,
  },
  amenityChipTextSelected: {
    color: Colors.white,
  },
  adBannerCard: {
    marginBottom: 16,
  },
  adToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adToggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  adToggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  adToggleDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  adBannerPicker: {
    marginTop: 14,
    borderRadius: 10,
    overflow: 'hidden',
  },
  adBannerPlaceholder: {
    height: 120,
    backgroundColor: Colors.borderLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adBannerPlaceholderText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  saveButton: {
    marginTop: 20,
  },
  deleteButton: {
    marginTop: 12,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ManageVenueScreen;
