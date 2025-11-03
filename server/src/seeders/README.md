# 🌱 HRMS Data Seeders

Comprehensive data seeding utilities for populating the AI-HRMS system with realistic sample data across all modules.

## 📋 Overview

This directory contains seeder functions that generate sample data for testing, development, and demonstration purposes. The seeders are organized into:

1. **Comprehensive HCM Seeder** - New, modern seeding for all HCM modules
2. **Legacy Seeders** - Original seeders for base functionality

## 🚀 Quick Start

### Seed All Data at Once

The easiest way to populate your entire system:

```javascript
// In server/src/index.js, uncomment:
import { seedAllHCMData } from "./seeders/index.js";

// Then call it (after DB connection):
seedAllHCMData();
```

This will seed:
- ✅ Shifts (5 different work schedules)
- ✅ Leave Types (8 types including AL, SL, ML, PL, etc.)
- ✅ Leave Balances (for all active employees)
- ✅ Leave Requests (15 sample requests)
- ✅ Document Categories (8 categories)
- ✅ Employee Documents (20-40 documents)
- ✅ Meetings (12 scheduled meetings)
- ✅ Time Entries (14 days of clock-in/out data)
- ✅ Attendance (30 days of attendance records)
- ✅ Notifications (50+ notifications)
- ✅ Feedback (15 peer/manager feedback entries)

## 📦 Individual Seeders

For selective seeding, import and use individual functions:

### Shift Management
```javascript
import { seedShifts } from "./seeders/index.js";
seedShifts(); // Creates: Morning, Evening, Night, Flexible, Weekend shifts
```

### Leave Management
```javascript
import { seedLeaveTypes, seedLeaveBalances, seedLeaves } from "./seeders/index.js";

seedLeaveTypes();      // 8 leave types (AL, SL, CL, ML, PL, etc.)
seedLeaveBalances();   // Balances for all employees
seedLeaves();          // 15 sample leave requests
```

### Document Management
```javascript
import { seedDocumentCategories, seedEmployeeDocuments } from "./seeders/index.js";

seedDocumentCategories();  // 8 document categories
seedEmployeeDocuments();   // 20-40 employee documents
```

### Meeting Management
```javascript
import { seedMeetings } from "./seeders/index.js";
seedMeetings(); // 12 meetings with participants, RSVP, etc.
```

### Time Tracking
```javascript
import { seedTimeEntries, seedAttendance } from "./seeders/index.js";

seedTimeEntries();  // 14 days of clock-in/out data
seedAttendance();   // 30 days of attendance records
```

### Communication
```javascript
import { seedNotifications, seedFeedback } from "./seeders/index.js";

seedNotifications(); // 50+ notifications for employees
seedFeedback();      // 15 peer/manager feedback entries
```

### Legacy Data (Holidays, Announcements, etc.)
```javascript
import { 
  generateHolidayData,
  generateAnnouncementData,
  generateComplaintData,
  generateTerminationData 
} from "./seeders/index.js";

generateHolidayData();        // 12 holidays for 2025
generateAnnouncementData();   // 8 company announcements
generateComplaintData();      // 7 employee complaints
generateTerminationData();    // 10 termination records
```

## 🔧 Usage Instructions

### Method 1: Uncomment in index.js (Recommended)

1. Open `server/src/index.js`
2. Find the "RUN SEEDERS" section (around line 115)
3. Uncomment the import statements at the top
4. Uncomment the seeder function you want to run
5. Restart the server - seeders run automatically on startup

```javascript
// Uncomment these lines in index.js:
import { seedAllHCMData } from "./seeders/index.js";

// In the seeders section:
seedAllHCMData();
```

### Method 2: Manual Execution

Create a separate script file:

```javascript
// server/scripts/seed.js
import { connectDB } from "../src/config/index.js";
import { seedAllHCMData } from "../src/seeders/index.js";

connectDB()
  .then(() => {
    console.log("Connected to database");
    return seedAllHCMData();
  })
  .then(() => {
    console.log("Seeding complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```

Run with: `node server/scripts/seed.js`

### Method 3: Via npm script

Add to `package.json`:

```json
{
  "scripts": {
    "seed": "node scripts/seed.js",
    "seed:all": "node scripts/seedAll.js"
  }
}
```

## 📊 Data Generated

### Shifts (5 records)
- Morning Shift (9 AM - 5 PM, Mon-Fri)
- Evening Shift (2 PM - 10 PM, Mon-Fri)
- Night Shift (10 PM - 6 AM, Sun-Thu)
- Flexible Hours (8 AM - 8 PM window, Mon-Fri)
- Weekend Shift (10 AM - 6 PM, Sat-Sun)

### Leave Types (8 records)
- Annual Leave (20 days, carry forward: 10 days)
- Sick Leave (12 days)
- Casual Leave (10 days)
- Maternity Leave (90 days)
- Paternity Leave (15 days)
- Unpaid Leave (up to 90 days)
- Bereavement Leave (5 days)
- Study Leave (7 days)

### Document Categories (8 records)
- Identity Documents (required)
- Educational Certificates (required)
- Employment Records
- Tax Documents (required)
- Medical Records
- Bank Details (required)
- Contracts & Agreements (required)
- Training Certificates

### Meetings (12 records)
- Various meeting types: In-Person, Virtual, Hybrid
- With participants, RSVP statuses
- Scheduled across past and future dates
- Includes organizer, location/link, agenda

### Time Entries (100+ records)
- 14 days of clock-in/out data
- Multiple employees
- Break times included
- Total hours calculated
- Various approval statuses

### Attendance (200+ records)
- 30 days of attendance
- Status: Present, Absent, Late, Half Day
- Check-in/check-out times
- 85% attendance rate (realistic)

### Notifications (50+ records)
- Different types: Leave, Meeting, Document, etc.
- Read/Unread status
- Priority levels
- Distributed across employees

### Feedback (15 records)
- Peer-to-peer feedback
- Manager feedback
- Ratings (3-5 stars)
- Anonymous and identified feedback

## ⚠️ Important Notes

1. **Prerequisites**: Ensure you have employees and departments seeded first (use `startHrmsApplication()`)

2. **Idempotency**: Most seeders check if data already exists and skip if found

3. **Data Relationships**: The seeders respect foreign key relationships:
   - Leave balances reference employees and leave types
   - Meetings reference employees as organizers and participants
   - Documents reference employees and categories
   - Time entries reference employees

4. **Realistic Data**: All seeders generate realistic, varied data:
   - Random dates within reasonable ranges
   - Different statuses (pending, approved, rejected)
   - Varied quantities per employee
   - Realistic work patterns

5. **Performance**: Seeding large amounts of data may take 10-30 seconds

## 🧹 Cleanup Utilities

### Delete Payroll Records
```javascript
import { deleteAllPayrollRecords } from "./seeders/index.js";
deleteAllPayrollRecords();
```

### Delete Today's Attendance
```javascript
import { deleteTodayAttendanceRecords } from "./seeders/index.js";
deleteTodayAttendanceRecords();
```

## 🔄 Recommended Seeding Order

For a fresh database, seed in this order:

1. `startHrmsApplication()` - Creates admin, departments, roles, basic employees
2. `generateHolidayData()` - Public holidays
3. `generateAnnouncementData()` - Company announcements
4. `seedAllHCMData()` - All HCM modules (shifts, leaves, documents, etc.)
5. `generatePayrollDataForYear(2025)` - Payroll records (optional)

## 🐛 Troubleshooting

### "No employees found"
Run `startHrmsApplication()` first to create base employees.

### "Document already exists" errors
The seeders are idempotent - they check before inserting. If you see this, data already exists.

### Seeder not running
Make sure:
1. You've uncommented the import statement
2. You've uncommented the function call
3. The server has restarted
4. Database connection is established

### Foreign key errors
Ensure parent records exist:
- Employees must exist before creating leaves, documents, etc.
- Leave types must exist before creating leave balances
- Document categories must exist before creating documents

## 📝 Example Complete Setup

```javascript
// In server/src/index.js

// 1. Import seeders
import {
  startHrmsApplication,
  seedAllHCMData,
  generateHolidayData,
  generateAnnouncementData,
  generatePayrollDataForYear
} from "./seeders/index.js";

// 2. After DB connection, in the .then():
connectDB()
  .then(async () => {
    // Seed in order
    await startHrmsApplication();      // Base data
    await generateHolidayData();       // Holidays
    await generateAnnouncementData();  // Announcements
    await seedAllHCMData();            // All HCM modules
    await generatePayrollDataForYear(2025); // Payroll (optional)
    
    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  });
```

## 💡 Tips

- **Development**: Use `seedAllHCMData()` for quick full setup
- **Testing**: Use individual seeders to test specific modules
- **Production**: Never run seeders in production! Use migrations instead
- **Customization**: Edit seeder files to adjust quantities, dates, or data patterns
- **Clean Slate**: Drop collections before seeding for a fresh start

## 📚 Further Reading

- Main application setup: See `startHrmsApplication()` in `index.js`
- Model definitions: Check `server/src/models/`
- API routes: See `server/src/routes/`

---

**Last Updated**: November 2025  
**Version**: 2.0.0  
**Maintained by**: AI-HRMS Development Team
