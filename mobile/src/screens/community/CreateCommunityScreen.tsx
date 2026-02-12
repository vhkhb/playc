import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Colors from '../../constants/colors';
import { SPORTS, SportItem } from '../../constants/sports';
import { AppDispatch, RootState } from '../../store';
import { createCommunity } from '../../store/slices/communitySlice';
import { CommunityStackParamList, SportType } from '../../types';

type Props = NativeStackScreenProps<CommunityStackParamList, 'CreateCommunity'>;

interface FormErrors {
  name?: string;
  description?: string;
  sportType?: string;
}

const CreateCommunityScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { createLoading, error } = useSelector(
    (state: RootState) => state.communities
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSport, setSelectedSport] = useState<SportType | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Community name is required';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!selectedSport) {
      newErrors.sportType = 'Please select a sport';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = useCallback(async () => {
    if (!validate()) return;

    try {
      const result = await dispatch(
        createCommunity({
          name: name.trim(),
          description: description.trim(),
          sportType: selectedSport!,
          isPublic,
        })
      ).unwrap();

      Alert.alert('Success', 'Community created successfully!', [
        {
          text: 'OK',
          onPress: () =>
            navigation.replace('CommunityDetail', {
              communityId: result.id,
            }),
        },
      ]);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.message || 'Failed to create community. Please try again.'
      );
    }
  }, [name, description, selectedSport, isPublic, dispatch, navigation]);

  const renderSportItem = (sport: SportItem) => {
    const isSelected = selectedSport === sport.id;

    return (
      <TouchableOpacity
        key={sport.id}
        style={[
          styles.sportItem,
          isSelected && { borderColor: sport.color, backgroundColor: `${sport.color}10` },
        ]}
        onPress={() => {
          setSelectedSport(sport.id);
          if (errors.sportType) {
            setErrors((prev) => ({ ...prev, sportType: undefined }));
          }
        }}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.sportIconCircle,
            { backgroundColor: isSelected ? sport.color : Colors.background },
          ]}
        >
          <Text style={styles.sportEmoji}>{sport.emoji}</Text>
        </View>
        <Text
          style={[
            styles.sportName,
            isSelected && { color: sport.color, fontWeight: '600' },
          ]}
        >
          {sport.name}
        </Text>
        {isSelected && (
          <Icon name="check-circle" size={18} color={sport.color} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Picker */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarPicker}
            activeOpacity={0.7}
            onPress={() => {
              // Image picker placeholder - to be implemented
            }}
          >
            <Icon name="camera-plus" size={36} color={Colors.textSecondary} />
            <Text style={styles.avatarPickerText}>Add Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <Card style={styles.formCard}>
          <Input
            label="Community Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            placeholder="Enter community name"
            leftIcon="account-group"
            error={errors.name}
            required
            maxLength={50}
          />

          <Input
            label="Description"
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            placeholder="What is this community about?"
            leftIcon="text"
            error={errors.description}
            required
            multiline
            numberOfLines={4}
            maxLength={500}
            containerStyle={styles.descriptionInput}
          />
        </Card>

        {/* Sport Type Picker */}
        <Card style={styles.sportCard}>
          <Text style={styles.sectionLabel}>
            Sport Type <Text style={styles.requiredStar}>*</Text>
          </Text>
          {errors.sportType && (
            <Text style={styles.sportError}>{errors.sportType}</Text>
          )}
          <View style={styles.sportList}>
            {SPORTS.map(renderSportItem)}
          </View>
        </Card>

        {/* Public/Private Toggle */}
        <Card style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Icon
                name={isPublic ? 'earth' : 'lock'}
                size={24}
                color={isPublic ? Colors.primary : Colors.textSecondary}
              />
              <View style={styles.toggleText}>
                <Text style={styles.toggleLabel}>
                  {isPublic ? 'Public Community' : 'Private Community'}
                </Text>
                <Text style={styles.toggleDescription}>
                  {isPublic
                    ? 'Anyone can find and join this community'
                    : 'Members can only join via invitation'}
                </Text>
              </View>
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

        {/* Error Message */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Create Button */}
        <Button
          title="Create Community"
          onPress={handleCreate}
          loading={createLoading}
          disabled={createLoading}
          fullWidth
          size="large"
          style={styles.createButton}
          icon={
            <Icon name="plus-circle" size={20} color={Colors.white} />
          }
        />
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
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  avatarPicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPickerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  formCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  descriptionInput: {
    marginBottom: 0,
  },
  sportCard: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 12,
  },
  requiredStar: {
    color: Colors.error,
  },
  sportError: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: 8,
    marginLeft: 4,
  },
  sportList: {
    gap: 8,
  },
  sportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  sportIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportEmoji: {
    fontSize: 18,
  },
  sportName: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    marginLeft: 12,
  },
  toggleCard: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  toggleText: {
    marginLeft: 12,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  toggleDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 12,
  },
  createButton: {
    marginHorizontal: 16,
    marginTop: 24,
  },
});

export default CreateCommunityScreen;
