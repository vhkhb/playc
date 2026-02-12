import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import Colors from '../../constants/colors';
import { getInitials } from '../../utils/helpers';

type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: AvatarSize;
  style?: ViewStyle;
  backgroundColor?: string;
}

const SIZES: Record<AvatarSize, { container: number; text: number }> = {
  small: { container: 32, text: 12 },
  medium: { container: 44, text: 16 },
  large: { container: 64, text: 22 },
  xlarge: { container: 96, text: 32 },
};

const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 'medium',
  style,
  backgroundColor,
}) => {
  const dimensions = SIZES[size];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            width: dimensions.container,
            height: dimensions.container,
            borderRadius: dimensions.container / 2,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: dimensions.container,
          height: dimensions.container,
          borderRadius: dimensions.container / 2,
          backgroundColor: backgroundColor || Colors.primaryMuted,
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: dimensions.text }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: Colors.white,
    fontWeight: '600',
  },
});

export default Avatar;
