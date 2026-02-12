import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Colors from '../../constants/colors';
import { SPORTS, SportItem } from '../../constants/sports';
import { AppDispatch, RootState } from '../../store';
import { ProfileStackParamList, SportType } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional';

interface SkillOption {
  value: SkillLevel;
  label: string;
}

const SKILL_LEVELS: SkillOption[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'professional', label: 'Pro' },
];

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [fullName, setFullName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedSports, setSelectedSports] = useState<SportType[]>([]);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
  }>({});

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.headerCancelText}>Cancel</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ],
      { cancelable: true }
    );
  };

  const handleAvatarPress = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => {} },
        { text: 'Choose from Library', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const toggleSport = (sportId: SportType) => {
    setSelectedSports((prev) => {
      if (prev.includes(sportId)) {
        return prev.filter((s) => s !== sportId);
      }
      return [...prev, sportId];
    });
  };

  const validate = (): boolean => {
    const newErrors: { fullName?: string; phone?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (phone.trim() && !/^[6-9]\d{9}$/.test(phone.trim())) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      // Dispatch update profile action here
      // await dispatch(updateProfile({
      //   name: fullName.trim(),
      //   bio: bio.trim(),
      //   phone: phone.trim(),
      //   sportsPreferences: selectedSports,
      //   skillLevel,
      // })).unwrap();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Picker */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarPickerContainer}
            onPress={handleAvatarPress}
            activeOpacity={0.7}
          >
            <Avatar
              uri={user?.avatar}
              name={fullName || user?.name || 'User'}
              size="xlarge"
            />
            <View style={styles.cameraOverlay}>
              <Icon name="camera" size={20} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </View>

        {/* Form Fields */}
        <Card style={styles.formCard}>
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (errors.fullName) {
                setErrors((prev) => ({ ...prev, fullName: undefined }));
              }
            }}
            placeholder="Enter your full name"
            leftIcon="account-outline"
            error={errors.fullName}
            required
          />

          <View style={styles.textAreaContainer}>
            <Text style={styles.inputLabel}>
              Bio
            </Text>
            <View style={styles.textAreaWrapper}>
              <Input
                value={bio}
                onChangeText={setBio}
                placeholder="Tell others about yourself..."
                multiline
                numberOfLines={4}
                containerStyle={styles.textAreaInput}
              />
            </View>
            <Text style={styles.charCount}>{bio.length}/200</Text>
          </View>

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (errors.phone) {
                setErrors((prev) => ({ ...prev, phone: undefined }));
              }
            }}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            leftIcon="phone-outline"
            error={errors.phone}
            maxLength={10}
          />
        </Card>

        {/* Sports Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sports Preferences</Text>
          <Text style={styles.sectionSubtitle}>
            Select the sports you are interested in
          </Text>
          <View style={styles.chipsContainer}>
            {SPORTS.map((sport: SportItem) => {
              const isSelected = selectedSports.includes(sport.id);
              return (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.sportChip,
                    isSelected && {
                      backgroundColor: sport.color,
                      borderColor: sport.color,
                    },
                  ]}
                  onPress={() => toggleSport(sport.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.sportChipText,
                      isSelected && styles.sportChipTextSelected,
                    ]}
                  >
                    {sport.emoji} {sport.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Skill Level Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skill Level</Text>
          <Text style={styles.sectionSubtitle}>
            Select your overall skill level
          </Text>
          <View style={styles.skillLevelContainer}>
            {SKILL_LEVELS.map((level) => {
              const isSelected = skillLevel === level.value;
              return (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.skillLevelOption,
                    isSelected && styles.skillLevelOptionSelected,
                  ]}
                  onPress={() => setSkillLevel(level.value)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.skillRadio,
                      isSelected && styles.skillRadioSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.skillRadioInner} />}
                  </View>
                  <Text
                    style={[
                      styles.skillLevelLabel,
                      isSelected && styles.skillLevelLabelSelected,
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            variant="primary"
            fullWidth
            loading={saving}
            disabled={saving}
            icon={
              !saving ? (
                <Icon name="check" size={20} color={Colors.white} />
              ) : undefined
            }
            style={styles.saveButton}
          />
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="ghost"
            fullWidth
            style={styles.cancelButton}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  headerButton: {
    paddingHorizontal: 8,
  },
  headerCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.error,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPickerContainer: {
    position: 'relative',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 10,
  },
  formCard: {
    marginBottom: 24,
  },
  textAreaContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6,
  },
  textAreaWrapper: {
    minHeight: 100,
  },
  textAreaInput: {
    marginBottom: 0,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  sportChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  sportChipTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  skillLevelContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  skillLevelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  skillLevelOptionSelected: {
    backgroundColor: Colors.successLight,
  },
  skillRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  skillRadioSelected: {
    borderColor: Colors.primary,
  },
  skillRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  skillLevelLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  skillLevelLabelSelected: {
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  actionButtons: {
    marginBottom: 16,
  },
  saveButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 0,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default EditProfileScreen;
