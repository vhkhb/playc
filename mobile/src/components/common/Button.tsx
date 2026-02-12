import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Colors from '../../constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const getBackgroundColor = (): string => {
    if (isDisabled) return Colors.disabled;
    switch (variant) {
      case 'primary':
        return Colors.primary;
      case 'secondary':
        return Colors.secondary;
      case 'outline':
        return Colors.transparent;
      case 'danger':
        return Colors.error;
      case 'ghost':
        return Colors.transparent;
      default:
        return Colors.primary;
    }
  };

  const getTextColor = (): string => {
    if (isDisabled && variant !== 'outline' && variant !== 'ghost')
      return Colors.white;
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return Colors.white;
      case 'outline':
        return isDisabled ? Colors.disabled : Colors.primary;
      case 'ghost':
        return isDisabled ? Colors.disabled : Colors.primary;
      default:
        return Colors.white;
    }
  };

  const getBorderColor = (): string => {
    if (isDisabled) return Colors.disabled;
    switch (variant) {
      case 'outline':
        return Colors.primary;
      default:
        return Colors.transparent;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'medium':
        return { paddingVertical: 12, paddingHorizontal: 24 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 32 };
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'small':
        return 13;
      case 'medium':
        return 15;
      case 'large':
        return 17;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          ...getPadding(),
        },
        variant === 'outline' && styles.outlineButton,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? Colors.primary : Colors.white}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
                marginLeft: icon ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  outlineButton: {
    borderWidth: 1.5,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Button;
