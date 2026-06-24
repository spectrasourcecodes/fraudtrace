/**
 * Email validation
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Password strength validation
 */
export const isStrongPassword = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: password.length >= minLength && hasUppercase && hasLowercase && hasNumber,
    strength: [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length,
    errors: [
      password.length < minLength && `At least ${minLength} characters`,
      !hasUppercase && 'One uppercase letter',
      !hasLowercase && 'One lowercase letter',
      !hasNumber && 'One number',
    ].filter(Boolean),
  };
};

/**
 * URL validation
 */
export const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Phone number validation
 */
export const isValidPhone = (phone) => {
  const regex = /^\+?[\d\s-()]{7,}$/;
  return regex.test(phone);
};

/**
 * Crypto wallet validation
 */
export const isValidWallet = (address) => {
  // Bitcoin
  const btcRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/;
  // Ethereum
  const ethRegex = /^0x[a-fA-F0-9]{40}$/;
  // Solana
  const solRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

  return btcRegex.test(address) || ethRegex.test(address) || solRegex.test(address);
};

/**
 * Amount validation
 */
export const isValidAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

/**
 * Required field validation
 */
export const isRequired = (value) => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
};

/**
 * Form validation helper
 */
export const validateForm = (values, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const value = values[field];
    const fieldRules = rules[field];

    if (fieldRules.required && !isRequired(value)) {
      errors[field] = fieldRules.message || `${field} is required`;
      return;
    }

    if (value && fieldRules.email && !isValidEmail(value)) {
      errors[field] = 'Invalid email address';
      return;
    }

    if (value && fieldRules.url && !isValidUrl(value)) {
      errors[field] = 'Invalid URL';
      return;
    }

    if (value && fieldRules.phone && !isValidPhone(value)) {
      errors[field] = 'Invalid phone number';
      return;
    }

    if (value && fieldRules.wallet && !isValidWallet(value)) {
      errors[field] = 'Invalid wallet address';
      return;
    }

    if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `Must be at least ${fieldRules.minLength} characters`;
      return;
    }

    if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = `Must not exceed ${fieldRules.maxLength} characters`;
      return;
    }

    if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors[field] = fieldRules.patternMessage || 'Invalid format';
      return;
    }

    if (fieldRules.custom && typeof fieldRules.custom === 'function') {
      const customError = fieldRules.custom(value, values);
      if (customError) {
        errors[field] = customError;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};