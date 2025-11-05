# 🎯 Quick Seeding Instructions

## Single Command Setup

```bash
cd server
npm run seed
```

**That's it!** Your entire HRMS database will be populated with:
- Super Admin (ID: 000, Email: admin@gmail.com, Password: 12345678)
- 10-15 employees across 3 departments
- 4+ job postings with sample applicants
- Complete leave management system
- Time tracking & attendance records
- Performance reviews
- Company announcements & holidays
- And much more...

## What You Get

| Module | Data Seeded |
|--------|-------------|
| 👤 **Users** | Super Admin + 10-15 employees |
| 🏢 **Organization** | 3 departments, 4 roles, 3 designations |
| 💼 **Recruitment** | 4+ jobs with applicants (Applied, Interview, Hired) |
| 📅 **Leave System** | 8 leave types, balances, 15+ requests |
| ⏰ **Attendance** | 200+ records over 30 days |
| 📄 **Documents** | 8 categories, 20-40 employee documents |
| 🤝 **Meetings** | 12 scheduled meetings |
| 💬 **Feedback** | 15+ feedback entries |
| 📊 **Performance** | 10+ performance reviews |
| 💰 **Payroll** | 3 years of payroll data |
| 🎉 **Company** | 12 holidays, 8+ announcements |
| 📝 **HR Ops** | Complaints, resignations, promotions, terminations |

## After Seeding

1. **Start the application**:
   ```bash
   # Terminal 1 - Server
   cd server
   npm run dev

   # Terminal 2 - Client
   cd client
   npm run dev
   ```

2. **Login as admin**:
   - Go to: http://localhost:8001
   - Employee ID: `000`
   - Email: `admin@gmail.com`
   - Password: `12345678`

3. **Test features**:
   - Browse employees in the system
   - Check recruitment → job openings (you'll see applicant counts)
   - View attendance records
   - Generate reports with seeded data
   - Test the careers page: http://localhost:8001/careers

## Re-seeding

The seeder is idempotent (safe to run multiple times). It checks for existing data and skips duplicates. To completely re-seed:

1. Drop the database or delete collections
2. Run `npm run seed` again

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot connect to database" | Check `MONGO_URI` in `.env` |
| Cloudinary errors | Automatic fallback to local storage (no action needed) |
| Duplicate key errors | Data already exists (seeder will continue) |
| No applicants showing | Click refresh button or wait 10 seconds (auto-refresh) |

## Notes

- ✅ **Local file storage** is automatically enabled if Cloudinary is not configured
- ✅ **Auto-refresh** in admin panel updates applicant counts every 10 seconds
- ✅ **Sample applicants** are included in job postings
- ✅ **All modules** are fully populated and ready to test

---

**Need more details?** Check `SEEDING_GUIDE.md` for comprehensive documentation.
