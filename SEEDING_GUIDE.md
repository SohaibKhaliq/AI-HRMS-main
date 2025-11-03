# 🌱 Database Seeding Guide

Quick guide to populate your AI-HRMS database with comprehensive sample data.

## 🚀 Quick Start (Easiest Method)

Run the automated seeding script:

```bash
cd server
npm run seed
```

This single command will:
- ✅ Create admin user and base data
- ✅ Seed all HCM modules (shifts, leaves, documents, meetings, etc.)
- ✅ Generate sample employees, attendance, time entries
- ✅ Add holidays, announcements, complaints
- ✅ Populate notifications and feedback

**Default Admin Login:**
- Email: `admin@gmail.com`
- Password: `admin123`

## 📋 What Gets Seeded?

### Core System
- 1 Admin user
- 3-5 Sample employees
- 3 Departments (Marketing, HR, Sales)
- Multiple roles and designations

### Leave Management
- 8 Leave types (Annual, Sick, Casual, Maternity, Paternity, etc.)
- Leave balances for all employees
- 15 Sample leave requests with different statuses

### Shift & Time Management
- 5 Shift schedules (Morning, Evening, Night, Flexible, Weekend)
- 14 days of time entries (clock-in/out with breaks)
- 30 days of attendance records

### Document Management
- 8 Document categories
- 20-40 Employee documents with verification status

### Meetings & Collaboration
- 12 Scheduled meetings (past and upcoming)
- Participants with RSVP status
- Virtual and in-person meetings

### Communication
- 50+ Notifications across employees
- 15 Peer and manager feedback entries

### Company-Wide
- 12 Public holidays for 2025
- 8 Company announcements
- 7 Sample complaints
- 10 Termination records

## 🎯 Alternative Methods

### Method 1: Manual Server Start (Recommended for Development)

1. Edit `server/src/index.js`
2. Find the "RUN SEEDERS" section (around line 115)
3. Uncomment these lines:

```javascript
// Uncomment the import:
import { seedAllHCMData, startHrmsApplication } from "./seeders/index.js";

// Uncomment the calls:
startHrmsApplication();
seedAllHCMData();
```

4. Start the server:
```bash
npm run dev
```

The seeders will run automatically on server startup.

### Method 2: Selective Seeding

Import and run only what you need in `index.js`:

```javascript
import {
  seedShifts,
  seedLeaveTypes,
  seedMeetings,
  // ... etc
} from "./seeders/index.js";

// Call only what you need:
seedShifts();
seedLeaveTypes();
```

## 📊 Seeding Details

### Time Estimates
- Base setup: ~2 seconds
- All HCM modules: ~10 seconds
- Payroll (optional): ~30 seconds
- **Total: ~15 seconds**

### Data Volume
- **Employees**: 5-10 sample employees
- **Time Entries**: 100+ records
- **Attendance**: 200+ records
- **Notifications**: 50+ notifications
- **Documents**: 20-40 documents
- **Meetings**: 12 meetings
- **Leave Records**: 15+ requests
- **Total Records**: ~500+ across all collections

## ⚠️ Important Notes

1. **Database State**: Seeders are idempotent - they check if data exists before inserting
2. **Prerequisites**: Ensure MongoDB is running and .env is configured
3. **Clean Database**: For best results, start with an empty database
4. **Production**: **NEVER** run seeders in production environments

## 🧹 Clean Database (Optional)

To start fresh, drop the database:

```bash
# Using MongoDB shell
mongosh
use your_database_name
db.dropDatabase()
```

Or use a database GUI like MongoDB Compass.

## 🔧 Configuration

### Environment Variables Required

```env
MONGO_URI=mongodb://localhost:27017/ai-hrms
PORT=3000
JWTSECRET=your-secret-key
# ... other config
```

### Customize Seeding

Edit `server/src/seeders/comprehensive.seeder.js` to:
- Change data quantities
- Modify date ranges
- Adjust employee names
- Customize statuses

## 📚 Documentation

For detailed seeder documentation, see:
- `server/src/seeders/README.md` - Complete seeder reference
- `server/src/seeders/comprehensive.seeder.js` - Seeder source code
- `server/scripts/seedDatabase.js` - Automated script

## 🐛 Troubleshooting

### "Database connection failed"
- Check MongoDB is running: `mongosh`
- Verify `MONGO_URI` in `.env`

### "No employees found"
- Run `startHrmsApplication()` first
- Or use the automated script: `npm run seed`

### Duplicate key errors
- Data already exists
- Drop the database and re-seed
- Or let seeders skip existing data

### Seeder not running
- Ensure uncommented in `index.js`
- Check for syntax errors
- Restart the server

## 💡 Tips

- **Quick Demo**: Use `npm run seed` for instant full setup
- **Development**: Uncomment seeders in `index.js` for auto-run
- **Testing**: Use individual seeders for targeted testing
- **Clean Slate**: Drop database before seeding for fresh data

## 🎓 Next Steps

After seeding:

1. **Login**: Use admin@gmail.com / admin123
2. **Explore**: Navigate through all modules
3. **Test**: Try creating, editing, deleting records
4. **Customize**: Add your own data on top of seeded data

## 🤝 Need Help?

- Check the full documentation: `server/src/seeders/README.md`
- Review model schemas: `server/src/models/`
- Check API routes: `server/src/routes/`

---

**Last Updated**: November 2025  
**Version**: 2.0.0
