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
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants/colors';
import { register } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import { validateEmail, validatePassword, validatePhone, validateRequired } from '../../utils/validators';

type Props = NativeStackScreenProps<any, 'Register'>;

const ROLES = [
  { label: 'Player', value: 'PLAYER', description: 'Find venues, book slots, join games' },
  { label: 'Vendor', value: 'VENDOR', description: 'List venues, manage bookings' },
];

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('PLAYER');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};

    const nameErr = validateRequired(name, 'Name');
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;

    const phoneErr = validatePhone(phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const passErr = validatePassword(password);
    if (passErr) newErrors.password = passErr;

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      await dispatch(register({ name, email, phone, password, role: selectedRole as any })).unwrap();
    } catch (err: any) {
      Alert.alert('Registration Failed', err?.message || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>PlayC</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the sports community</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionLabel}>I am a</Text>
          <View style={styles.roleContainer}>
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role.value}
                style={[
                  styles.roleCard,
                  selectedRole === role.value && styles.roleCardActive,
                ]}
                onPress={() => setSelectedRole(role.value)}
              >
                <Text
                  style={[
                    styles.roleLabel,
                    selectedRole === role.value && styles.roleLabelActive,
                  ]}
                >
                  {role.label}
                </Text>
                <Text
                  style={[
                    styles.roleDesc,
                    selectedRole === role.value && styles.roleDescActive,
                  ]}
                >
                  {role.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            error={errors.name}
            icon="person-outline"
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            icon="mail-outline"
          />

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            error={errors.phone}
            icon="call-outline"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry
            error={errors.password}
            icon="lock-closed-outline"
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
            error={errors.confirmPassword}
            icon="lock-closed-outline"
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
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
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  roleLabelActive: {
    color: COLORS.primary,
  },
  roleDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  roleDescActive: {
    color: COLORS.primaryDark,
  },
  registerButton: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;
