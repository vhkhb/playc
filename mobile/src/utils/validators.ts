export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) {
    return 'Phone number is required';
  }
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
    return 'Please enter a valid 10-digit phone number';
  }
  return null;
};

export const validateRequired = (
  value: string,
  fieldName: string
): string | null => {
  if (!value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): string | null => {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): string | null => {
  if (value.length > maxLength) {
    return `${fieldName} must be at most ${maxLength} characters`;
  }
  return null;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export const validatePrice = (price: string): string | null => {
  if (!price.trim()) {
    return 'Price is required';
  }
  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice < 0) {
    return 'Please enter a valid price';
  }
  return null;
};

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateLoginForm = (
  email: string,
  password: string
): ValidationResult => {
  const errors: Record<string, string> = {};
  const emailError = validateEmail(email);
  const passwordError = validateRequired(password, 'Password');
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateRegisterForm = (
  name: string,
  email: string,
  phone: string,
  password: string,
  confirmPassword: string
): ValidationResult => {
  const errors: Record<string, string> = {};
  const nameError = validateRequired(name, 'Name');
  const emailError = validateEmail(email);
  const phoneError = validatePhone(phone);
  const passwordError = validatePassword(password);
  const confirmError = validateConfirmPassword(password, confirmPassword);
  if (nameError) errors.name = nameError;
  if (emailError) errors.email = emailError;
  if (phoneError) errors.phone = phoneError;
  if (passwordError) errors.password = passwordError;
  if (confirmError) errors.confirmPassword = confirmError;
  return { isValid: Object.keys(errors).length === 0, errors };
};
