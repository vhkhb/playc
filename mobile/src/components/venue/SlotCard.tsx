import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Slot } from '../../types';
import Colors from '../../constants/colors';
import { formatTime, formatCurrency } from '../../utils/helpers';

interface SlotCardProps {
  slot: Slot;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  selected = false,
  onPress,
  disabled = false,
}) => {
  const isAvailable = slot.isAvailable && slot.bookedPlayers < slot.maxPlayers;
  const isDisabled = disabled || !isAvailable;
  const spotsLeft = slot.maxPlayers - slot.bookedPlayers;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.selectedCard,
        isDisabled && styles.disabledCard,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <View style={styles.timeRow}>
        <Icon
          name="clock-outline"
          size={16}
          color={selected ? Colors.white : isDisabled ? Colors.disabled : Colors.primary}
        />
        <Text
          style={[
            styles.time,
            selected && styles.selectedText,
            isDisabled && styles.disabledText,
          ]}
        >
          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
        </Text>
      </View>
      <Text
        style={[
          styles.price,
          selected && styles.selectedText,
          isDisabled && styles.disabledText,
        ]}
      >
        {formatCurrency(slot.price)}
      </Text>
      <View style={styles.availabilityRow}>
        <Icon
          name="account-group-outline"
          size={14}
          color={
            selected
              ? Colors.white
              : isAvailable
              ? Colors.success
              : Colors.error
          }
        />
        <Text
          style={[
            styles.availability,
            selected && styles.selectedText,
            { color: isAvailable ? Colors.success : Colors.error },
            selected && { color: Colors.white },
          ]}
        >
          {isAvailable ? `${spotsLeft} spots left` : 'Full'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 4,
    width: '47%',
  },
  selectedCard: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  disabledCard: {
    backgroundColor: Colors.borderLight,
    borderColor: Colors.borderLight,
    opacity: 0.6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  time: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availability: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  selectedText: {
    color: Colors.white,
  },
  disabledText: {
    color: Colors.disabled,
  },
});

export default SlotCard;
