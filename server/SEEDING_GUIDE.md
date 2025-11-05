# 🌱 HRMS Database Seeding Guide

## Quick Start

To populate your database with complete sample data, simply run:

```bash
npm run seed
```

This single command will seed your entire HRMS system with realistic data across all modules!

---

## What Gets Seeded?

### 🔐 **Authentication & Access**
- **Super Admin User**
  - Employee ID: `000`
  - Email: `admin@gmail.com`
  - Password: `12345678`
  - Full system access

### 👥 **Core Data** (Base System)
- **Roles**: 4 roles (Supervisor, Manager, Employee, HR)
- **Departments**: 3 departments (Marketing, Human Resources, Sales)
- **Designations**: 3 job titles with salary ranges
- **Employees**: 10-15 sample employees across departments
- **Document Types**: 4 essential document categories

### 📋 **Leave Management**
- **Leave Types**: 8 types (Annual, Sick, Casual, Maternity, Paternity, etc.)
- **Leave Balances**: Auto-assigned to all employees for current and upcoming years
- **Leave Requests**: 15+ sample leave applications with various statuses

### 📅 **Time & Attendance**
- **Shifts**: 5 different work schedules (Morning, Evening, Night, Flexible, Weekend)
- **Time Entries**: 100+ clock-in/clock-out records
- **Attendance**: 200+ attendance records spanning 30 days

### 📄 **Document Management**
- **Categories**: 8 document categories (Contracts, Certifications, etc.)
- **Employee Documents**: 20-40 documents assigned to employees

### 🤝 **Meetings & Collaboration**
- **Meetings**: 12 scheduled meetings with participants and agendas

### 🔔 **Notifications**
- **System Notifications**: 50+ notifications across various types

### 💬 **Feedback System**
- **Feedback Records**: 15+ peer and manager feedback entries

### 💼 **Recruitment**
- **Job Categories**: Engineering, Marketing, Sales, HR, Finance
- **Job Types**: Full-Time, Part-Time, Contract, Internship
- **Locations**: Multiple office locations and remote options
- **Job Postings**: 4+ open positions with sample applicants
- **Applications**: Pre-populated applicants with various statuses (Applied, Under Review, Interview, Hired)

### 📊 **Performance Management**
- **Performance Reviews**: 10+ completed performance evaluations
- **KPIs**: Attendance, ratings, project completion metrics

### 📰 **Company Updates**
- **Holidays**: 12 public holidays for 2025
- **Announcements**: 8+ company-wide announcements
- **Updates**: Company news and policy changes

### 💰 **Payroll**
- **Payroll Records**: Generated for previous year, current year, and next year
- **Salary Sync**: Employee salaries synced from designations

### 📝 **HR Operations**
- **Complaints**: 7+ complaint records with various categories
- **Promotions**: Sample promotion records
- **Resignations**: 3 resignation requests (Approved, Pending, Rejected)
- **Terminations**: 10+ termination records

---

## Seeder Architecture

### Main Seeder Script
- **Location**: `server/scripts/seedDatabase.js`
- **Purpose**: Orchestrates all seeding operations
- **Execution**: Runs sequentially to ensure data dependencies

### Module Seeders
- **Location**: `server/src/seeders/`
- **Files**:
  - `index.js` - Base system setup
  - `comprehensive.seeder.js` - All HCM modules
  - `timeTracking.seeder.js` - Time tracking specific data
  - `designation.seeder.js` - Designation specific data

---

## Available Commands

### Primary Command
```bash
npm run seed          # Seeds entire database with all modules
```

### Specialized Commands
```bash
npm run seed:time           # Seed time tracking data only
npm run seed:designations   # Seed designations only
npm run seed:help          # Show seeding help information
```

---

## Seeding Process

When you run `npm run seed`, the script executes in this order:

1. **Database Connection** - Connects to MongoDB
2. **Base Setup** - Creates admin user, roles, departments
3. **Company Data** - Holidays, announcements, complaints, terminations
4. **HCM Modules** - All employee-related modules (leaves, attendance, documents, etc.)
5. **Payroll** - Generates payroll for 3 years (previous, current, next)
6. **Summary** - Displays complete data summary

---

## Post-Seeding

After successful seeding, you'll see a summary like this:

```
╔════════════════════════════════════════════════════╗
║              ✨ Seeding Complete! ✨              ║
╚════════════════════════════════════════════════════╝

📊 Database Summary:
   ✅ Base System: Super Admin, Roles (4), Departments (3)
   ✅ Employees: 10-15 sample employees
   ✅ Shifts: 5 work schedules
   ✅ Leave Management: 8 Types, Balances, 15+ Requests
   ✅ Documents: 8 Categories & 20-40 Employee Documents
   ✅ Meetings: 12 scheduled meetings
   ✅ Time Tracking: 100+ clock-in/out entries
   ✅ Attendance: 200+ records (30 days)
   ✅ Notifications: 50+ system notifications
   ✅ Feedback: 15+ peer & manager feedback
   ✅ Recruitment: Jobs, categories, types, locations, applicants
   ✅ Performance: 10+ performance reviews
   ✅ Company Data: Holidays, announcements, complaints, terminations

🚀 Your AI-HRMS system is ready to use!
```

---

## Testing the Seeded Data

### Login as Super Admin
1. Go to: `http://localhost:8001/login` (or your configured port)
2. **Employee ID**: `000`
3. **Email**: `admin@gmail.com`
4. **Password**: `12345678`

### Explore Features
- **Dashboard**: View company-wide statistics
- **Employees**: See 10-15 employees with complete profiles
- **Recruitment**: Check job postings with applicants
- **Leave Management**: Review leave requests and balances
- **Attendance**: View attendance records and patterns
- **Payroll**: Check generated payroll data
- **Reports**: Generate various reports with seeded data

### Test Public Features
- **Careers Page**: `http://localhost:8001/careers`
  - Browse open positions
  - Submit applications (with local file storage)
  - See sample applicants in admin panel

---

## Re-seeding

To re-seed the database:

1. **Clear existing data** (optional):
   ```bash
   # Connect to MongoDB and drop the database, or
   # Delete specific collections manually
   ```

2. **Run the seeder again**:
   ```bash
   npm run seed
   ```

**Note**: The seeder has built-in checks to avoid duplicates. Running it multiple times will skip existing data in most cases.

---

## Troubleshooting

### Issue: "No employees found"
**Solution**: Ensure base setup runs first. The seeder handles this automatically.

### Issue: "Cloudinary storage errors"
**Solution**: The system automatically falls back to local file storage. No action needed.

### Issue: "Duplicate key error"
**Solution**: Some data already exists. The seeder will skip and continue.

### Issue: "Cannot connect to database"
**Solution**: Check your `.env` file for correct `MONGO_URI` configuration.

---

## Customization

To customize seeding data:

1. **Edit seeder files** in `server/src/seeders/`
2. **Modify data arrays** (employee names, job titles, etc.)
3. **Adjust quantities** (number of records to generate)
4. **Add new modules** by creating new seeder functions

Example:
```javascript
// server/src/seeders/comprehensive.seeder.js
const employees = [
  { name: "Your Name", email: "your.email@example.com", ... },
  // Add more...
];
```

---

## Support

For issues or questions:
- Check the console output for detailed error messages
- Review the seeder code in `server/src/seeders/`
- Ensure MongoDB is running and accessible
- Verify environment variables in `.env`

---

## Summary

✅ **One command**: `npm run seed`  
✅ **Complete data**: All modules populated  
✅ **Ready to test**: Login and explore immediately  
✅ **Realistic data**: Sample data mimics real-world scenarios  
✅ **Re-runnable**: Safe to run multiple times  

**Start seeding now and get your HRMS ready in minutes!** 🚀
