/**
 * Comprehensive validation helpers for form inputs
 * Provides real-time validation with user-friendly error messages
 */

// Validation Regex Patterns
export const ValidationPatterns = {
  // Name validations - only alphabets and spaces
  NAME_ONLY_LETTERS: /^[A-Za-z\s'-]+$/,
  NAME_NO_NUMBERS: /^[^0-9]*$/,
  
  // Email validation
  EMAIL: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  
  // Phone number validations
  PHONE_PAKISTAN: /^03\d{9}$/,
  PHONE_DIGITS_ONLY: /^\d+$/,
  
  // Address validations
  STREET_ADDRESS: /^[A-Za-z0-9\s,.-]+$/,
  CITY_NAME: /^[A-Za-z\s-]+$/,
  POSTAL_CODE: /^[A-Za-z0-9\s-]+$/,
  
  // Numeric validations
  DIGITS_ONLY: /^\d+$/,
  POSITIVE_NUMBER: /^\d*\.?\d+$/,
  INTEGER_ONLY: /^\d+$/,
  
  // Account numbers
  ACCOUNT_NUMBER: /^\d{8,16}$/,
  
  // Employee ID
  EMPLOYEE_ID: /^\d{3}$/,
  
  // Password validation
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // Alphanumeric
  ALPHANUMERIC: /^[A-Za-z0-9\s]+$/,
  
  // No special characters except specific ones
  NO_SPECIAL_CHARS: /^[A-Za-z0-9\s.,'-]+$/,
};

// Validation Functions
export const ValidationHelpers = {
  /**
   * Validate name fields (first name, last name, full name)
   */
  validateName: (value, fieldName = "Name") => {
    if (!value || value.trim() === "") {
      return { isValid: false, error: `${fieldName} is required` };
    }
    
    if (value.trim().length < 2) {
      return { isValid: false, error: `${fieldName} must be at least 2 characters` };
    }
    
    if (value.length > 100) {
      return { isValid: false, error: `${fieldName} must not exceed 100 characters` };
    }
    
    if (!ValidationPatterns.NAME_ONLY_LETTERS.test(value)) {
      return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
    }
    
    if (/\d/.test(value)) {
      return { isValid: false, error: `${fieldName} cannot contain numbers` };
    }
    
    if (/^\s|\s$/.test(value)) {
      return { isValid: false, error: `${fieldName} cannot start or end with spaces` };
    }
    
    return { isValid: true, error: null };
  },

  /**
   * Validate email addresses
   */
  validateEmail: (value) => {
    if (!value || value.trim() === "") {
      return { isValid: false, error: "Email is required" };
    }
    
    if (!ValidationPatterns.EMAIL.test(value)) {
      return { isValid: false, error: "Enter a valid email address (e.g., user@example.com)" };
    }
    
    if (value.length > 254) {
      return { isValid: false, error: "Email must not exceed 254 characters" };
    }
    
    return { isValid: true, error: null };
  },

  /**
   * Validate phone numbers
   */
  validatePhone: (value, country = "pakistan") => {
    if (!value || value.trim() === "") {
      return { isValid: false, error: "Phone number is required" };
    }
    
    if (!ValidationPatterns.PHONE_DIGITS_ONLY.test(value)) {
      return { isValid: false, error: "Phone number can only contain digits (0-9)" };
    }
    
    if (country === "pakistan") {
      if (value.length !== 11) {
        return { isValid: false, error: "Phone number must be exactly 11 digits" };
      }
      if (!ValidationPatterns.PHONE_PAKISTAN.test(value)) {
        return { isValid: false, error: "Phone number must start with 03 (e.g., 03001234567)" };
      }
    }
    
    return { isValid: true, error: null };
  },

  /**
   * Validate addresses
   */
  validateAddress: (value, fieldName = "Address") => {
    if (!value || value.trim() === "") {
      return { isValid: false, error: `${fieldName} is required` };
    }
    
    if (value.trim().length < 5) {
      return { isValid: false, error: `${fieldName} must be at least 5 characters` };
    }
    
    if (value.length > 200) {
      return { isValid: false, error: `${fieldName} must not exceed 200 characters` };
    }
    
    if (!ValidationPatterns.STREET_ADDRESS.test(value)) {
      return { isValid: false, error: `${fieldName} contains invalid characters` };
    }
    
    return { isValid: true, error: null };
  },

  /**
   * Validate city names
   */
  validateCity: (value) => {
    if (!value || value.trim() === "") {
      return { isValid: false, error: "City is required" };
    }
    
    if (!ValidationPatterns.CITY_NAME.test(value)) {
      return { isValid: false, error: "City name can only contain letters, spaces, and hyphens" };
    }
    
    if (/\d/.test(value)) {
      return { isValid: false, error: "City name cannot contain numbers" };
    }
    
    if (value.length > 50) {
      return { isValid: false, error: "City name must not exceed 50 characters" };
    }
    
    return { isValid: true, error: null };
  },

  /**
   * Validate postal codes
   */
  validatePostalCode: (value) => {
    if (!value || value.trim() === "") {
      return { isValid: false, error: "Postal code is required" };
    }
    
    if (!ValidationPatterns.POSTAL_CODE.test(value)) {
      return { isValid: false, error: "Enter a valid postal code (letters and numbers only)" };
    }
    
    if (value.length < 4 || value.length > 10) {
      return { isValid: false, error: "Postal code must be between 4 and 10 characters" };
    }
    
    return { isValid: true, error: null };
  },

  /**
   * Validate numeric inputs
   */
  validateNumber: (value, options = {}) => {
    const {
      fieldName = "Number",
      min = null,
      max = null,
      allowDecimal = false,
      required = true
    } = options;
    
    if (required && (!value || value.toString().trim() === "")) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    
    if (value && !allowDecimal && !ValidationPatterns.INTEGER_ONLY.test(value.toString())) {
      return { isValid: false, error: `${fieldName} must be a whole number (no decimals)` };
    }
    
    if (value && allowDecimal && !ValidationPatterns.POSITIVE_NUMBER.test(value.toString())) {
      return { isValid: false, error: `${fieldName} must be a valid number` };
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return { isValid: false, error: `${fieldName} must be a valid number` };
    }
    
    if (min !== null && numValue < min) {
      return { isValid: false, error: `${fieldName} must be at least ${min}` };
    }
    
    if (max !== null && numValue > max) {
      return { isValid: false, error: `${fieldName} must not exceed ${max}` };
    }
    
    return { isValid: true, error: null };
  },

  /**
   * Validate salary
   */
  validateSalary: (value) => {
    return ValidationHelpers.validateNumber(value, {
      fieldName: "Salary",
      min: 0,
      max: 10000000,
      allowDecimal: true,
      required: true
    });
  },

  /**
   * Validate account number
   */
  validateAccountNumber: (value) => {
    if (!value || value.trim() === "") {
      return { isValid: false, error: "Account number is required" };
    }
    
    if (!ValidationPatterns.DIGITS_ONLY.test(value)) {
      return { isValid: false, error: "Account number can only contain digits (0-9)" };
    }
    
    if (!ValidationPatterns.ACCOUNT_NUMBER.test(value)) {
      return { isValid: false, error: "Account number must be between 8 and 16 digits" };
    }
    
    return { isValid: true, error: null };
  },

  /**
   * Validate employee ID
   */
  validateEmployeeId: (value) => {
    if (!value || value.trim() === "") {
      return { isValid: false, error: "Employee ID is required" };
    }
    
    if (!ValidationPatterns.EMPLOYEE_ID.test(value)) {
      return { isValid: false, error: "Employee ID must be exactly 3 digits (e.g., 001, 123)" };
    }
    
    return { isValid: true, error: null };
  },

  /**
   * Validate password
   */
  validatePassword: (value, options = {}) => {
    const { requireStrong = false, minLength = 6 } = options;
    
    if (!value || value.trim() === "") {
      return { isValid: false, error: "Password is required" };
    }
    
    if (value.length < minLength) {
      return { isValid: false, error: `Password must be at least ${minLength} characters` };
    }
    
    if (requireStrong && !ValidationPatterns.PASSWORD_STRONG.test(value)) {
      return { 
        isValid: false, 
        error: "Password must include uppercase, lowercase, number, and special character (@$!%*?&)" 
      };
    }
    
    return { isValid: true, error: null };
  },

  /**
   * Validate text with min/max length
   */
  validateText: (value, options = {}) => {
    const {
      fieldName = "Field",
      minLength = 1,
      maxLength = 500,
      required = true,
      allowNumbers = true,
      allowSpecialChars = true
    } = options;
    
    if (required && (!value || value.trim() === "")) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    
    if (!value) return { isValid: true, error: null };
    
    if (value.trim().length < minLength) {
      return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
    }
    
    if (value.length > maxLength) {
      return { isValid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
    }
    
    if (!allowNumbers && /\d/.test(value)) {
      return { isValid: false, error: `${fieldName} cannot contain numbers` };
    }
    
    if (!allowSpecialChars && !ValidationPatterns.ALPHANUMERIC.test(value)) {
      return { isValid: false, error: `${fieldName} can only contain letters and numbers` };
    }
    
    return { isValid: true, error: null };
  },

  /**
   * Validate date
   */
  validateDate: (value, options = {}) => {
    const {
      fieldName = "Date",
      required = true,
      minDate = null,
      maxDate = null,
      futureOnly = false,
      pastOnly = false
    } = options;
    
    if (required && (!value || value.trim() === "")) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    
    if (!value) return { isValid: true, error: null };
    
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(date.getTime())) {
      return { isValid: false, error: `Enter a valid ${fieldName.toLowerCase()}` };
    }
    
    if (futureOnly && date < today) {
      return { isValid: false, error: `${fieldName} must be today or in the future` };
    }
    
    if (pastOnly && date > today) {
      return { isValid: false, error: `${fieldName} must be in the past` };
    }
    
    if (minDate && date < new Date(minDate)) {
      return { isValid: false, error: `${fieldName} cannot be before ${minDate}` };
    }
    
    if (maxDate && date > new Date(maxDate)) {
      return { isValid: false, error: `${fieldName} cannot be after ${maxDate}` };
    }
    
    return { isValid: true, error: null };
  },

  /**
   * Validate description/textarea
   */
  validateDescription: (value, options = {}) => {
    const {
      fieldName = "Description",
      minLength = 10,
      maxLength = 1000,
      required = true
    } = options;
    
    return ValidationHelpers.validateText(value, {
      fieldName,
      minLength,
      maxLength,
      required,
      allowNumbers: true,
      allowSpecialChars: true
    });
  },

  /**
   * Validate subject/title
   */
  validateSubject: (value, options = {}) => {
    const {
      fieldName = "Subject",
      minLength = 5,
      maxLength = 150,
      required = true
    } = options;
    
    return ValidationHelpers.validateText(value, {
      fieldName,
      minLength,
      maxLength,
      required,
      allowNumbers: true,
      allowSpecialChars: true
    });
  },
};

// Input placeholder suggestions
export const PlaceholderText = {
  NAME: "Enter full name (letters only)",
  FIRST_NAME: "Enter first name (letters only)",
  LAST_NAME: "Enter last name (letters only)",
  EMAIL: "example@company.com",
  PHONE_PAKISTAN: "03001234567 (11 digits)",
  EMPLOYEE_ID: "001 (3 digits)",
  STREET_ADDRESS: "House/Building number, Street name",
  CITY: "City name (letters only)",
  STATE: "State/Province name",
  POSTAL_CODE: "Postal/ZIP code",
  COUNTRY: "Country name",
  ACCOUNT_NUMBER: "8-16 digit account number",
  SALARY: "Enter salary amount (numbers only)",
  PASSWORD: "Minimum 6 characters",
  PASSWORD_STRONG: "Must include uppercase, lowercase, number & special char",
  SUBJECT: "Brief subject (5-150 characters)",
  DESCRIPTION: "Detailed description (min 10 characters)",
  PHONE_NUMBER: "Phone number (digits only)",
  NUMBER: "Enter a number",
  DATE: "Select a date",
  REMARKS: "Optional remarks or notes",
};

// Helper text for common fields
export const HelperText = {
  NAME: "Only letters, spaces, hyphens, and apostrophes allowed",
  EMAIL: "We'll send important updates to this email",
  PHONE_PAKISTAN: "Format: 03XXXXXXXXX (must start with 03)",
  EMPLOYEE_ID: "3-digit unique identifier",
  ACCOUNT_NUMBER: "Bank account number without hyphens or spaces",
  PASSWORD: "Use a strong password for security",
  SALARY: "Enter monthly salary in numbers",
  DATE_FUTURE: "Select today or a future date",
  DATE_PAST: "Select a past date",
  DESCRIPTION: "Provide detailed information",
};

export default ValidationHelpers;
