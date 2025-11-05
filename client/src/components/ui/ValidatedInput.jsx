import { useState } from 'react';
import PropTypes from 'prop-types';
import { ValidationHelpers, PlaceholderText, HelperText } from '../../utils/validationHelpers';

/**
 * ValidatedInput Component
 * A reusable input component with built-in validation and user guidance
 */
const ValidatedInput = ({
  type = 'text',
  value,
  onChange,
  validationType,
  validationOptions = {},
  label,
  placeholder,
  helperText,
  required = false,
  showErrors = true,
  validateOnBlur = false,
  className = '',
  disabled = false,
  name,
  id,
  ...rest
}) => {
  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Auto-generate placeholder if not provided
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    switch (validationType) {
      case 'name':
        return PlaceholderText.NAME;
      case 'firstName':
        return PlaceholderText.FIRST_NAME;
      case 'lastName':
        return PlaceholderText.LAST_NAME;
      case 'email':
        return PlaceholderText.EMAIL;
      case 'phone':
        return PlaceholderText.PHONE_PAKISTAN;
      case 'employeeId':
        return PlaceholderText.EMPLOYEE_ID;
      case 'address':
        return PlaceholderText.STREET_ADDRESS;
      case 'city':
        return PlaceholderText.CITY;
      case 'postalCode':
        return PlaceholderText.POSTAL_CODE;
      case 'accountNumber':
        return PlaceholderText.ACCOUNT_NUMBER;
      case 'salary':
        return PlaceholderText.SALARY;
      case 'password':
        return validationOptions.requireStrong ? PlaceholderText.PASSWORD_STRONG : PlaceholderText.PASSWORD;
      case 'subject':
        return PlaceholderText.SUBJECT;
      case 'description':
        return PlaceholderText.DESCRIPTION;
      case 'number':
        return PlaceholderText.NUMBER;
      default:
        return '';
    }
  };

  // Auto-generate helper text if not provided
  const getHelperText = () => {
    if (helperText) return helperText;
    
    switch (validationType) {
      case 'name':
      case 'firstName':
      case 'lastName':
        return HelperText.NAME;
      case 'email':
        return HelperText.EMAIL;
      case 'phone':
        return HelperText.PHONE_PAKISTAN;
      case 'employeeId':
        return HelperText.EMPLOYEE_ID;
      case 'accountNumber':
        return HelperText.ACCOUNT_NUMBER;
      case 'password':
        return HelperText.PASSWORD;
      case 'salary':
        return HelperText.SALARY;
      case 'description':
        return HelperText.DESCRIPTION;
      default:
        return null;
    }
  };

  // Validate input based on type
  const validateInput = (inputValue) => {
    if (!validationType) return { isValid: true, error: null };

    let result;
    
    switch (validationType) {
      case 'name':
      case 'firstName':
      case 'lastName':
        result = ValidationHelpers.validateName(inputValue, validationOptions.fieldName || label || 'Name');
        break;
      case 'email':
        result = ValidationHelpers.validateEmail(inputValue);
        break;
      case 'phone':
        result = ValidationHelpers.validatePhone(inputValue, validationOptions.country);
        break;
      case 'address':
        result = ValidationHelpers.validateAddress(inputValue, validationOptions.fieldName || label || 'Address');
        break;
      case 'city':
        result = ValidationHelpers.validateCity(inputValue);
        break;
      case 'postalCode':
        result = ValidationHelpers.validatePostalCode(inputValue);
        break;
      case 'number':
        result = ValidationHelpers.validateNumber(inputValue, {
          fieldName: validationOptions.fieldName || label || 'Number',
          ...validationOptions
        });
        break;
      case 'salary':
        result = ValidationHelpers.validateSalary(inputValue);
        break;
      case 'accountNumber':
        result = ValidationHelpers.validateAccountNumber(inputValue);
        break;
      case 'employeeId':
        result = ValidationHelpers.validateEmployeeId(inputValue);
        break;
      case 'password':
        result = ValidationHelpers.validatePassword(inputValue, validationOptions);
        break;
      case 'text':
        result = ValidationHelpers.validateText(inputValue, {
          fieldName: validationOptions.fieldName || label || 'Field',
          ...validationOptions
        });
        break;
      case 'subject':
        result = ValidationHelpers.validateSubject(inputValue, {
          fieldName: validationOptions.fieldName || label || 'Subject',
          ...validationOptions
        });
        break;
      case 'description':
        result = ValidationHelpers.validateDescription(inputValue, {
          fieldName: validationOptions.fieldName || label || 'Description',
          ...validationOptions
        });
        break;
      case 'date':
        result = ValidationHelpers.validateDate(inputValue, {
          fieldName: validationOptions.fieldName || label || 'Date',
          ...validationOptions
        });
        break;
      default:
        result = { isValid: true, error: null };
    }
    
    return result;
  };

  // Handle input change
  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Prevent invalid characters based on type
    if (validationType === 'name' || validationType === 'firstName' || validationType === 'lastName' || validationType === 'city') {
      // Block numbers immediately
      if (/\d/.test(newValue)) {
        return; // Don't update if contains numbers
      }
    }
    
    if (validationType === 'phone' || validationType === 'accountNumber' || validationType === 'employeeId') {
      // Only allow digits
      if (newValue && !/^\d*$/.test(newValue)) {
        return; // Don't update if contains non-digits
      }
    }
    
    if (validationType === 'number' || validationType === 'salary') {
      // Only allow numbers and decimal point
      if (newValue && !/^\d*\.?\d*$/.test(newValue)) {
        return; // Don't update if invalid number format
      }
    }
    
    // Update value
    onChange(e);
    
    // Validate if not validateOnBlur or if already touched
    if (!validateOnBlur || touched) {
      const validation = validateInput(newValue);
      setValidationError(validation.error);
    }
  };

  // Handle blur event
  const handleBlur = () => {
    setTouched(true);
    const validation = validateInput(value);
    setValidationError(validation.error);
  };

  // Determine if we should show error
  const shouldShowError = showErrors && touched && validationError;
  const helper = getHelperText();

  const inputClasses = `
    w-full p-3 rounded-lg border transition-all duration-200
    ${shouldShowError 
      ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
    ${className}
  `;

  const textareaClasses = `
    w-full p-3 rounded-lg border transition-all duration-200 min-h-[100px] resize-y
    ${shouldShowError 
      ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={getPlaceholder()}
          disabled={disabled}
          required={required}
          className={textareaClasses}
          name={name}
          id={id}
          {...rest}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={getPlaceholder()}
          disabled={disabled}
          required={required}
          className={inputClasses}
          name={name}
          id={id}
          {...rest}
        />
      )}
      
      {/* Helper text or error message */}
      <div className="mt-1 min-h-[20px]">
        {shouldShowError ? (
          <p className="text-xs text-red-600 flex items-start">
            <svg className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {validationError}
          </p>
        ) : helper ? (
          <p className="text-xs text-gray-500 flex items-start">
            <svg className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {helper}
          </p>
        ) : null}
      </div>
    </div>
  );
};

ValidatedInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  validationType: PropTypes.string,
  validationOptions: PropTypes.object,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  showErrors: PropTypes.bool,
  validateOnBlur: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  name: PropTypes.string,
  id: PropTypes.string,
};

export default ValidatedInput;
