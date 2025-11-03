# Time Tracking Seeder

This seeder populates the database with realistic time entry data for testing and development purposes.

## Features

### Realistic Work Patterns
- **Standard Hours**: 9:00 AM - 5:30 PM with 30-minute lunch break
- **Early Bird**: 8:00 AM - 4:30 PM for morning people
- **Late Start**: 10:00 AM - 6:30 PM for flexible schedules
- **Overtime**: Extended hours (9:00 AM - 8:00 PM) for busy periods
- **Half Day**: 9:00 AM - 1:00 PM for partial days

### Smart Break Management
- Automatically adds 1-2 breaks per day
- Break durations range from 15-45 minutes
- Lunch breaks at midday (longer duration)
- Coffee breaks in morning/afternoon

### Realistic Data Generation
- **45 days** of historical data
- **85% attendance rate** (some days off)
- Skips weekends automatically
- Work patterns vary by day:
  - Mondays: More likely to have overtime
  - Fridays: More likely to be half-days
  - Random variations throughout the week

### Project & Task Tracking
Includes realistic projects:
- HRMS Development
- Client Portal
- Mobile App
- API Integration
- Database Optimization
- Security Audit
- UI/UX Redesign
- Payment Gateway
- Reporting Module
- Performance Testing

With common tasks:
- Frontend/Backend Development
- Bug Fixing & Testing
- Code Review & Documentation
- Client Meetings
- Sprint Planning
- Performance Optimization

### Status Management
- **Recent entries (0-3 days)**: Stay pending for approval
- **Mid-range (3-7 days)**: 60% approved, 40% pending
- **Older entries (7+ days)**: 90% approved, 5% rejected, 5% pending

### Automated Calculations
The seeder creates entries that will trigger the TimeEntry model's pre-save hook to automatically calculate:
- Total hours worked
- Break hours
- Net work hours (total - breaks)
- Overtime hours (work hours > 8)

## Usage

### Run the Seeder

```bash
# Using npm script
npm run seed:time

# Or directly
node src/seeders/timeTracking.seeder.js

# Or using the runner
node src/seeders/runTimeSeeder.js
```

### Output Example

```
🕐 Starting Time Tracking Seeder...
✓ Found 11 active employees
  ✓ Generated 28 entries for Super Admin
  ✓ Generated 27 entries for Ahmed Khan
  ✓ Generated 30 entries for Fatima Ahmed
  ...

✅ Successfully seeded 305 time entries

📊 Seeding Statistics:
   Approved: 245 (80.3%)
   Pending: 43 (14.1%)
   Rejected: 17 (5.6%)
   Date Range: 45 days ago to today
   Employees: 11
```

## Data Generated

For each employee over 45 days (excluding weekends):
- **Clock in/out times** with realistic variations
- **Break periods** with start and end times
- **Project assignments** from predefined list
- **Task descriptions** for daily work
- **Work notes** (70% of entries include notes)
- **Approval status** based on entry age
- **Approved by** field for approved entries
- **Approval timestamp** for approved entries

## Database Schema

The seeder works with the `TimeEntry` model:

```javascript
{
  employee: ObjectId (ref: Employee),
  date: Date,
  clockIn: Date,
  clockOut: Date,
  breaks: [{
    startTime: Date,
    endTime: Date
  }],
  totalHours: Number,      // Auto-calculated
  breakHours: Number,      // Auto-calculated
  workHours: Number,       // Auto-calculated
  overtimeHours: Number,   // Auto-calculated
  project: String,
  task: String,
  notes: String,
  status: String,          // pending, approved, rejected
  approvedBy: ObjectId,
  approvedAt: Date
}
```

## Configuration

You can customize the seeder by modifying constants in `timeTracking.seeder.js`:

```javascript
const daysToSeed = 45;           // Number of days to seed
const PROJECTS = [...];          // Add/remove projects
const TASKS = [...];             // Add/remove tasks
const NOTES_TEMPLATES = [...];   // Add/remove note templates
```

## Skip Conditions

The seeder will skip if:
- More than 50 time entries already exist in the database
- No active employees are found

## Requirements

- Active employees in the database
- At least one admin user (for approvals)
- MongoDB connection configured in `.env`

## Integration

This seeder can be:
1. Run standalone for testing
2. Integrated into main seeder script
3. Run as part of CI/CD pipeline
4. Used for demo data generation

## Notes

- The seeder uses realistic work patterns to generate data
- All calculations (hours, overtime) are handled by model middleware
- Approval workflow mimics real-world scenarios
- Data is suitable for testing reports, analytics, and payroll calculations

## Author

AI HRMS Development Team
