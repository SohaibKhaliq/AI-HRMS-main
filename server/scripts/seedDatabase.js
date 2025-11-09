import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../src/config/index.js";
import {
  startHrmsApplication,
  seedAllHCMData,
  seedEmployeeSkills,
  generateHolidayData,
  generateAnnouncementData,
  generateComplaintData,
  generateTerminationData,
  generatePayrollDataForYear,
  seedLeaveBalances,
  seedLeaveBalancesForYear,
  syncEmployeeSalariesFromDesignation,
} from "../src/seeders/index.js";

/**
 * Complete HRMS Database Seeding Script
 *
 * This script populates the database with comprehensive sample data
 * across all modules for testing and development purposes.
 *
 * Usage: node server/scripts/seedDatabase.js
 */

const seedDatabase = async () => {
  try {
    console.log("\n╔════════════════════════════════════════════════════╗");
    console.log("║   🌱 AI-HRMS Complete Database Seeding Script    ║");
    console.log("╚════════════════════════════════════════════════════╝\n");

    // Connect to database
    console.log("📡 Connecting to database...");
    await connectDB();
    console.log("✅ Database connected successfully\n");

    // Step 1: Base application setup
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📦 Step 1: Setting up base application data");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    await startHrmsApplication();
    console.log("✅ Base setup complete (Admin, Departments, Roles)\n");

    // Step 2: Company-wide data
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🏢 Step 2: Seeding company-wide data");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    await generateHolidayData();
    await generateAnnouncementData();
    await generateComplaintData();
    await generateTerminationData();
    console.log("✅ Company data seeded\n");

    // Step 3: Comprehensive HCM modules
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎯 Step 3: Seeding all HCM modules");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    await seedAllHCMData();
    // Seed employee skills after HCM modules (assigns sample skills to employees)
    try {
      await seedEmployeeSkills();
      console.log("✅ Employee skills seeded\n");
    } catch (e) {
      console.warn(
        "Could not seed employee skills:",
        e && e.message ? e.message : e
      );
    }
    console.log("✅ All HCM modules seeded\n");

    // Step 4: Payroll (optional - can be time-consuming)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💰 Step 4: Generating payroll data (optional)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    const currentYear = new Date().getFullYear();
    console.log(
      `📊 Generating payroll for previous, current and upcoming year around ${currentYear}...`
    );
    // Generate payroll for previous year (if supported), current year and next year
    const yearsToGenerate = [];
    if (currentYear - 1 >= 2024) yearsToGenerate.push(currentYear - 1);
    yearsToGenerate.push(currentYear);
    yearsToGenerate.push(currentYear + 1);

    // Sync employee salaries from designation before generating payroll
    console.log(
      "🔁 Syncing employee salaries from designation where applicable..."
    );
    await syncEmployeeSalariesFromDesignation();

    for (const y of yearsToGenerate) {
      console.log(`→ Generating payroll for year ${y}...`);
      await generatePayrollDataForYear(y);
    }

    // Ensure leave balances exist (will skip if already present)
    console.log("📌 Seeding leave balances (current year)...");
    await seedLeaveBalances();

    // Also ensure leave balances for generated payroll years
    for (const y of yearsToGenerate) {
      await seedLeaveBalancesForYear(y);
    }

    // Summary
    console.log("\n╔════════════════════════════════════════════════════╗");
    console.log("║              ✨ Seeding Complete! ✨              ║");
    console.log("╚════════════════════════════════════════════════════╝");
    console.log("\n📊 Database Summary:");
    console.log("   ✅ Base System: Super Admin, Roles (4), Departments (3)");
    console.log("   ✅ Employees: 5-10 sample employees");
    console.log("   ✅ Shifts: 5 work schedules");
    console.log("   ✅ Leave Management: 8 Types, Balances, 15+ Requests");
    console.log("   ✅ Documents: 8 Categories & 20-40 Employee Documents");
    console.log("   ✅ Meetings: 12 scheduled meetings with participants");
    console.log("   ✅ Time Tracking: 100+ clock-in/out entries");
    console.log("   ✅ Attendance: 200+ records (30 days)");
    console.log("   ✅ Notifications: 50+ system notifications");
    console.log("   ✅ Feedback: 15+ peer & manager feedback");
    console.log(
      "   ✅ Recruitment: Job categories, types, locations, postings"
    );
    console.log("   ✅ Performance: 10+ performance reviews");
    console.log("   ✅ Holidays: 12 public holidays for 2025");
    console.log("   ✅ Announcements: 8+ company announcements");
    console.log("   ✅ Complaints: 7+ complaint records");
    console.log("   ✅ Terminations: 10+ termination records");
    console.log("   ✅ Updates: Company updates & news");
    console.log("\n🚀 Your AI-HRMS system is ready to use!");
    console.log("\n╔════════════════════════════════════════════════════╗");
    console.log("║              🔑 SUPER USER CREDENTIALS             ║");
    console.log("╠════════════════════════════════════════════════════╣");
    console.log("║  Employee ID: 000                                  ║");
    console.log("║  Email:       admin@gmail.com                      ║");
    console.log("║  Password:    12345678                             ║");
    console.log("╚════════════════════════════════════════════════════╝\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during seeding process:");
    console.error(error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
