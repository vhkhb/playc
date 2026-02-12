import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { getBookingStatusColor, getGameStatusColor, getStatusLabel } from '../../utils/helpers';
import Colors from '../../constants/colors';

type BadgeType = 'booking' | 'game' | 'custom';

interface BadgeProps {
  status: string;
  type?: BadgeType;
  color?: string;
  backgroundColor?: string;
  label?: string;
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

const Badge: React.FC<BadgeProps> = ({
  status,
  type = 'custom',
  color,
  backgroundColor,
  label,
  size = 'medium',
  style,
}) => {
  const getColor = (): string => {
    if (color) return color;
    switch (type) {
      case 'booking':
        return getBookingStatusColor(status as any);
      case 'game':
        return getGameStatusColor(status as any);
      default:
        return Colors.primary;
    }
  };

  const badgeColor = getColor();
  const bgColor = backgroundColor || `${badgeColor}20`;
  const displayLabel = label || getStatusLabel(status);
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          paddingHorizontal: isSmall ? 6 : 10,
          paddingVertical: isSmall ? 2 : 4,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: badgeColor }]} />
      <Text
        style={[
          styles.text,
          { color: badgeColor, fontSize: isSmall ? 10 : 12 },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontWeight: '600',
  },
});

export default Badge;
