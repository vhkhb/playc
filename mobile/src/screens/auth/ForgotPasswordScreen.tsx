import React, { useState } from 'react';
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
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants/colors';
import { forgotPassword } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import { validateEmail } from '../../utils/validators';
import { AuthStackParamList } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSendResetLink = async () => {
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    setEmailError(null);
    try {
      const message = await dispatch(forgotPassword(email)).unwrap();
      setIsSubmitted(true);
      Alert.alert('Success', message);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err || 'Failed to send reset link. Please try again.'
      );
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconWrapper}>
            <Icon name="email-check-outline" size={64} color={COLORS.primary} />
          </View>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successMessage}>
            We've sent a password reset link to{' '}
            <Text style={styles.emailHighlight}>{email}</Text>. Please check
            your inbox and follow the instructions to reset your password.
          </Text>
          <Text style={styles.spamNote}>
            Didn't receive the email? Check your spam folder or try again.
          </Text>
          <Button
            title="Resend Link"
            onPress={handleSendResetLink}
            variant="outline"
            loading={loading}
            style={styles.resendButton}
          />
          <TouchableOpacity
            onPress={handleBackToLogin}
            style={styles.backToLoginButton}
          >
            <Icon name="arrow-left" size={18} color={COLORS.primary} />
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={handleBackToLogin}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Icon name="lock-reset" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            No worries! Enter your registered email address and we'll send you a
            link to reset your password.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email Address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError(null);
            }}
            placeholder="Enter your registered email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={emailError}
            leftIcon="email-outline"
            required
          />

          <Button
            title="Send Reset Link"
            onPress={handleSendResetLink}
            loading={loading}
            fullWidth
            style={styles.submitButton}
          />
        </View>

        <TouchableOpacity
          onPress={handleBackToLogin}
          style={styles.footerLink}
        >
          <Icon name="arrow-left" size={16} color={COLORS.primary} />
          <Text style={styles.footerLinkText}>Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButton: {
    marginTop: 8,
  },
  footerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  footerLinkText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Success state styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  emailHighlight: {
    fontWeight: '600',
    color: COLORS.text,
  },
  spamNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  resendButton: {
    marginBottom: 16,
    minWidth: 160,
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backToLoginText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default ForgotPasswordScreen;
