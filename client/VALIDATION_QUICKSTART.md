# Quick Start Guide - Form Validation

## Import the Component

```jsx
import ValidatedInput from '../components/ui/ValidatedInput';
```

## Common Usage Examples

### Name Input (No Numbers Allowed)
```jsx
<ValidatedInput
  validationType="name"
  value={name}
  onChange={handleChange}
  label="Full Name"
  required
/>
```

### Email Input
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

### Phone Number (Pakistan Format)
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

### Employee ID (3 Digits)
```jsx
<ValidatedInput
  validationType="employeeId"
  value={employeeId}
  onChange={handleChange}
  label="Employee ID"
  required
/>
```

### City/State/Country (Letters Only)
```jsx
<ValidatedInput
  validationType="city"
  value={city}
  onChange={handleChange}
  label="City"
  required
/>
```

### Salary (Numbers Only)
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

### Account Number (8-16 Digits)
```jsx
<ValidatedInput
  validationType="accountNumber"
  value={accountNumber}
  onChange={handleChange}
  label="Bank Account Number"
  required
/>
```

### Subject (5-150 Characters)
```jsx
<ValidatedInput
  validationType="subject"
  value={subject}
  onChange={handleChange}
  label="Subject"
  required
/>
```

### Description/Textarea
```jsx
<ValidatedInput
  type="textarea"
  validationType="description"
  value={description}
  onChange={handleChange}
  label="Description"
  required
/>
```

### Custom Text with Options
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

### Optional Field
```jsx
<ValidatedInput
  type="textarea"
  validationType="description"
  validationOptions={{
    minLength: 10,
    maxLength: 500,
    required: false
  }}
  value={remarks}
  onChange={handleChange}
  label="Remarks"
  required={false}
/>
```

## Validation Types Reference

| Type | Rules | Example |
|------|-------|---------|
| `name` | Letters only, 2-100 chars | John Doe, Mary-Jane |
| `email` | Valid email format | user@example.com |
| `phone` | 11 digits, starts with 03 | 03001234567 |
| `employeeId` | Exactly 3 digits | 001, 123 |
| `city` | Letters only, no numbers | New York, Islamabad |
| `address` | Alphanumeric, 5-200 chars | 123 Main Street |
| `postalCode` | Alphanumeric, 4-10 chars | 54000, A1B 2C3 |
| `salary` | Numbers, 0-10M | 50000, 75000.50 |
| `accountNumber` | 8-16 digits only | 1234567890 |
| `number` | Configurable min/max | Custom range |
| `subject` | 5-150 chars | Brief subject line |
| `description` | 10-1000 chars | Detailed text |
| `password` | Min 6 chars | secure123 |
| `date` | Valid date format | 2025-01-15 |

## What Gets Blocked Automatically

- ❌ Numbers in name fields → Typing blocked
- ❌ Letters in phone fields → Typing blocked  
- ❌ Letters in account numbers → Typing blocked
- ❌ Numbers in city names → Typing blocked
- ❌ Special chars in names (except - and ') → Typing blocked

## Props Reference

```jsx
<ValidatedInput
  type="text"              // text, email, number, tel, date, password, textarea
  name="fieldName"         // Form field name
  value={value}            // Current value
  onChange={handler}       // Change handler
  validationType="name"    // Type of validation
  validationOptions={{}}   // Custom options
  label="Label"           // Field label
  placeholder="..."       // Auto-generated if not provided
  helperText="..."        // Auto-generated if not provided
  required={true}         // Is required
  disabled={false}        // Disable input
  className="..."         // Additional CSS classes
  showErrors={true}       // Show validation errors
  validateOnBlur={false}  // Validate only on blur
/>
```

## Full Documentation

See `VALIDATION_GUIDE.md` for complete documentation.
