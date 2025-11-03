import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../src/config/index.js";
import {
  startHrmsApplication,
  seedAllHCMData,
  generateHolidayData,
  generateAnnouncementData,
  generateComplaintData,
  generateTerminationData,
  generatePayrollDataForYear,
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
    console.log("✅ All HCM modules seeded\n");

    // Step 4: Payroll (optional - can be time-consuming)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💰 Step 4: Generating payroll data (optional)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    const currentYear = new Date().getFullYear();
    console.log(`📊 Generating payroll for year ${currentYear}...`);
    // Uncomment the line below to generate payroll data (can take 30+ seconds)
    // await generatePayrollDataForYear(currentYear);
    console.log("⚠️  Payroll generation skipped (uncomment in script to enable)\n");

    // Summary
    console.log("\n╔════════════════════════════════════════════════════╗");
    console.log("║              ✨ Seeding Complete! ✨              ║");
    console.log("╚════════════════════════════════════════════════════╝");
    console.log("\n📊 Database Summary:");
    console.log("   ✅ Base System: Admin, Roles, Departments");
    console.log("   ✅ Employees: 3-5 sample employees");
    console.log("   ✅ Shifts: 5 work schedules");
    console.log("   ✅ Leave Management: Types, Balances, Requests");
    console.log("   ✅ Documents: Categories & Employee Documents");
    console.log("   ✅ Meetings: Scheduled meetings with participants");
    console.log("   ✅ Time Tracking: Clock-in/out entries");
    console.log("   ✅ Attendance: 30 days of records");
    console.log("   ✅ Notifications: System notifications");
    console.log("   ✅ Feedback: Peer & manager feedback");
    console.log("   ✅ Holidays: 2025 public holidays");
    console.log("   ✅ Announcements: Company announcements");
    console.log("   ✅ Complaints: Sample complaint records");
    console.log("   ✅ Terminations: Sample termination records");
    console.log("\n🚀 Your AI-HRMS system is ready to use!");
    console.log("🔑 Login with: admin@gmail.com / password: admin123\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during seeding process:");
    console.error(error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
