# Form Validation System Documentation

## Overview

The AI-HRMS application now includes a comprehensive form validation system that provides:
- **Real-time validation** with immediate user feedback
- **Strict input rules** to prevent invalid data entry
- **User-friendly error messages** that guide users on what to enter
- **Consistent validation** across all forms in the application

---

## Components

### 1. ValidatedInput Component
Location: `client/src/components/ui/ValidatedInput.jsx`

A reusable input component that automatically validates user input and displays helpful feedback.

#### Usage Example:

```jsx
import ValidatedInput from '../../components/ui/ValidatedInput';

<ValidatedInput
  type="text"
  name="firstName"
  value={formData.firstName}
  onChange={handleChange}
  validationType="name"
  label="First Name"
  required
/>
```

#### Props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | 'text' | Input type (text, email, number, tel, date, password, textarea) |
| `value` | string/number | - | Current input value |
| `onChange` | function | - | Change handler function |
| `validationType` | string | - | Type of validation to apply (see validation types below) |
| `validationOptions` | object | {} | Additional validation options |
| `label` | string | - | Label text for the input |
| `placeholder` | string | auto-generated | Placeholder text (auto-generated based on validationType) |
| `helperText` | string | auto-generated | Helper text shown below input |
| `required` | boolean | false | Whether field is required |
| `showErrors` | boolean | true | Whether to display validation errors |
| `validateOnBlur` | boolean | false | Validate only on blur instead of real-time |
| `className` | string | '' | Additional CSS classes |
| `disabled` | boolean | false | Disable the input |

---

## Validation Types

### Name Validations

#### `validationType="name"` or `"firstName"` or `"lastName"`

**Rules:**
- Only letters, spaces, hyphens (-), and apostrophes (')
- **No numbers allowed**
- Minimum 2 characters
- Maximum 100 characters
- Cannot start or end with spaces

**Example:**
```jsx
<ValidatedInput
  validationType="name"
  value={name}
  onChange={handleChange}
  label="Full Name"
  required
/>
```

**Valid:** `John Doe`, `Mary-Jane`, `O'Brien`  
**Invalid:** `John123`, `123`, `John  ` (trailing spaces)

---

### Email Validation

#### `validationType="email"`

**Rules:**
- Valid email format (user@domain.com)
- Maximum 254 characters

**Example:**
```jsx
<ValidatedInput
  type="email"
  validationType="email"
  value={email}
  onChange={handleChange}
  label="Email Address"
  required
/>
```

**Valid:** `user@example.com`, `john.doe@company.co.uk`  
**Invalid:** `user@`, `@domain.com`, `user domain.com`

---

### Phone Number Validation

#### `validationType="phone"`

**Rules (Pakistan format):**
- Exactly 11 digits
- Must start with '03'
- Only digits allowed (no spaces, dashes, or parentheses)

**Example:**
```jsx
<ValidatedInput
  type="tel"
  validationType="phone"
  value={phone}
  onChange={handleChange}
  label="Phone Number"
  required
/>
```

**Valid:** `03001234567`  
**Invalid:** `0300-123-4567`, `3001234567`, `03001234` (too short)

---

### Address Validations

#### `validationType="address"`

**Rules:**
- Minimum 5 characters
- Maximum 200 characters
- Allows letters, numbers, spaces, commas, periods, and hyphens

**Example:**
```jsx
<ValidatedInput
  validationType="address"
  value={address}
  onChange={handleChange}
  label="Street Address"
  required
/>
```

#### `validationType="city"`

**Rules:**
- Only letters, spaces, and hyphens
- **No numbers allowed**
- Maximum 50 characters

**Example:**
```jsx
<ValidatedInput
  validationType="city"
  value={city}
  onChange={handleChange}
  label="City"
  required
/>
```

**Valid:** `New York`, `San Francisco`, `Islamabad`  
**Invalid:** `City123`, `123City`

#### `validationType="postalCode"`

**Rules:**
- Alphanumeric only
- 4-10 characters

---

### Number Validations

#### `validationType="number"`

**Rules:**
- Only numeric values
- Configurable min/max values
- Can allow or disallow decimals

**Example:**
```jsx
<ValidatedInput
  type="number"
  validationType="number"
  validationOptions={{
    fieldName: "Age",
    min: 18,
    max: 100,
    allowDecimal: false
  }}
  value={age}
  onChange={handleChange}
  label="Age"
  required
/>
```

#### `validationType="salary"`

**Rules:**
- Only numeric values (decimals allowed)
- Minimum: 0
- Maximum: 10,000,000

**Example:**
```jsx
<ValidatedInput
  type="number"
  validationType="salary"
  value={salary}
  onChange={handleChange}
  label="Monthly Salary"
  required
/>
```

---

### Account Number

#### `validationType="accountNumber"`

**Rules:**
- Only digits (0-9)
- 8-16 digits long
- **No letters or special characters**

**Example:**
```jsx
<ValidatedInput
  validationType="accountNumber"
  value={accountNumber}
  onChange={handleChange}
  label="Bank Account Number"
  required
/>
```

---

### Employee ID

#### `validationType="employeeId"`

**Rules:**
- Exactly 3 digits
- Format: 001, 002, 123, etc.

**Example:**
```jsx
<ValidatedInput
  validationType="employeeId"
  value={employeeId}
  onChange={handleChange}
  label="Employee ID"
  required
/>
```

**Valid:** `001`, `123`, `999`  
**Invalid:** `1`, `12`, `1234`, `abc`

---

### Text Fields

#### `validationType="text"`

**Rules:**
- Configurable min/max length
- Can allow/disallow numbers
- Can allow/disallow special characters

**Example:**
```jsx
<ValidatedInput
  validationType="text"
  validationOptions={{
    fieldName: "Department",
    minLength: 2,
    maxLength: 50,
    allowNumbers: false,
    allowSpecialChars: false
  }}
  value={department}
  onChange={handleChange}
  label="Department"
  required
/>
```

---

### Subject/Title

#### `validationType="subject"`

**Rules:**
- Minimum 5 characters
- Maximum 150 characters

**Example:**
```jsx
<ValidatedInput
  validationType="subject"
  value={subject}
  onChange={handleChange}
  label="Subject"
  required
/>
```

---

### Description/Textarea

#### `validationType="description"`

**Rules:**
- Minimum 10 characters
- Maximum 1000 characters (configurable)

**Example:**
```jsx
<ValidatedInput
  type="textarea"
  validationType="description"
  validationOptions={{
    minLength: 10,
    maxLength: 500
  }}
  value={description}
  onChange={handleChange}
  label="Description"
  required
/>
```

---

### Password

#### `validationType="password"`

**Rules:**
- Minimum 6 characters (configurable)
- Optional: Strong password requirement (uppercase, lowercase, number, special character)

**Example:**
```jsx
<ValidatedInput
  type="password"
  validationType="password"
  validationOptions={{
    minLength: 8,
    requireStrong: true
  }}
  value={password}
  onChange={handleChange}
  label="Password"
  required
/>
```

---

### Date

#### `validationType="date"`

**Rules:**
- Valid date format
- Can restrict to future/past only
- Can set min/max dates

**Example:**
```jsx
<ValidatedInput
  type="date"
  validationType="date"
  validationOptions={{
    fieldName: "Date of Birth",
    pastOnly: true
  }}
  value={dob}
  onChange={handleChange}
  label="Date of Birth"
  required
/>
```

---

## Validation Helpers

Location: `client/src/utils/validationHelpers.js`

Direct validation functions available for custom use:

```javascript
import { ValidationHelpers } from '../utils/validationHelpers';

// Validate a name
const result = ValidationHelpers.validateName("John Doe", "First Name");
// Returns: { isValid: true, error: null }

// Validate an email
const result = ValidationHelpers.validateEmail("user@example.com");
// Returns: { isValid: true, error: null }

// Validate a phone number
const result = ValidationHelpers.validatePhone("03001234567");
// Returns: { isValid: true, error: null }
```

Available Functions:
- `validateName(value, fieldName)`
- `validateEmail(value)`
- `validatePhone(value, country)`
- `validateAddress(value, fieldName)`
- `validateCity(value)`
- `validatePostalCode(value)`
- `validateNumber(value, options)`
- `validateSalary(value)`
- `validateAccountNumber(value)`
- `validateEmployeeId(value)`
- `validatePassword(value, options)`
- `validateText(value, options)`
- `validateSubject(value, options)`
- `validateDescription(value, options)`
- `validateDate(value, options)`

---

## Zod Schema Validation

Location: `client/src/validations/index.js`

Enhanced Zod schemas for server-side and form-level validation:

```javascript
import { createEmployeeSchema } from '../validations';

// Validate entire form
try {
  const validatedData = createEmployeeSchema.parse(formData);
  // Data is valid, proceed
} catch (error) {
  // Handle validation errors
  error.errors.forEach((err) => {
    console.log(err.path, err.message);
  });
}
```

---

## Features

### 1. Real-Time Prevention
The ValidatedInput component **prevents** invalid characters from being typed:

- **Name fields**: Typing numbers is blocked immediately
- **Phone fields**: Only digits can be typed
- **Account numbers**: Only digits can be entered

### 2. Visual Feedback

- **Success state**: Blue border when focused and valid
- **Error state**: Red border with error icon and message
- **Helper text**: Gray text with helpful guidance

### 3. User Guidance

Every field provides:
- **Auto-generated placeholders**: "Enter full name (letters only)"
- **Helper text**: "Only letters, spaces, hyphens, and apostrophes allowed"
- **Error messages**: "Name cannot contain numbers"

---

## Migration Guide

### Converting Existing Forms

**Before:**
```jsx
<input
  type="text"
  name="name"
  value={formData.name}
  onChange={handleChange}
  placeholder="Name"
  className="w-full p-3 rounded-lg"
  required
/>
```

**After:**
```jsx
<ValidatedInput
  type="text"
  name="name"
  value={formData.name}
  onChange={handleChange}
  validationType="name"
  label="Full Name"
  className="w-full p-3 rounded-lg"
  required
/>
```

---

## Common Validation Patterns

### Employee Form
```jsx
// Name
<ValidatedInput validationType="name" label="Full Name" required />

// Email
<ValidatedInput type="email" validationType="email" label="Email" required />

// Phone
<ValidatedInput type="tel" validationType="phone" label="Phone Number" required />

// Employee ID
<ValidatedInput validationType="employeeId" label="Employee ID" required />

// Address
<ValidatedInput validationType="address" label="Street Address" required />
<ValidatedInput validationType="city" label="City" required />
<ValidatedInput validationType="postalCode" label="Postal Code" required />

// Salary
<ValidatedInput type="number" validationType="salary" label="Salary" required />

// Account Number
<ValidatedInput validationType="accountNumber" label="Account Number" required />
```

### Complaint/Feedback Form
```jsx
// Subject
<ValidatedInput validationType="subject" label="Subject" required />

// Description
<ValidatedInput 
  type="textarea" 
  validationType="description" 
  validationOptions={{ minLength: 10, maxLength: 1000 }}
  label="Details" 
  required 
/>
```

### Department/Designation Form
```jsx
// Name (letters only)
<ValidatedInput
  validationType="name"
  validationOptions={{ fieldName: "Department name" }}
  label="Department Name"
  required
/>

// Description
<ValidatedInput
  type="textarea"
  validationType="description"
  validationOptions={{ required: false, minLength: 10, maxLength: 500 }}
  label="Description"
  required={false}
/>
```

---

## Best Practices

1. **Always use `validationType`** for automatic validation
2. **Set appropriate `validationOptions`** for custom requirements
3. **Use descriptive labels** to help users understand what to enter
4. **Mark required fields** with the `required` prop
5. **Test edge cases** like copy-paste, special characters, etc.
6. **Provide clear error messages** through custom fieldName in options

---

## Testing Validation

### Manual Testing Checklist

For each validated input:
- [ ] Try entering invalid characters (e.g., numbers in name field)
- [ ] Test minimum length validation
- [ ] Test maximum length validation
- [ ] Try copy-pasting invalid data
- [ ] Test with leading/trailing spaces
- [ ] Verify error messages are clear and helpful
- [ ] Check that helper text appears correctly
- [ ] Test disabled state
- [ ] Test with and without required flag

---

## Troubleshooting

### Issue: Validation not working
- Check that `validationType` prop is set correctly
- Verify `onChange` handler updates state properly
- Ensure component is imported correctly

### Issue: Error messages not showing
- Set `showErrors={true}` (default)
- Check that field has been touched (user interacted with it)
- Verify validation is actually failing

### Issue: Can't type anything
- Check if `disabled` prop is set
- Verify validation logic isn't too restrictive
- Check browser console for JavaScript errors

---

## Support

For issues or questions about the validation system, please:
1. Check this documentation first
2. Review existing form implementations
3. Check `validationHelpers.js` for available functions
4. Test with the ValidatedInput component examples

---

## Change Log

### Version 1.0.0
- Initial implementation
- Added ValidatedInput component
- Enhanced Zod schemas
- Created validation helper functions
- Added real-time character blocking
- Implemented user guidance system
