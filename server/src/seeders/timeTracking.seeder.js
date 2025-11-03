import mongoose from "mongoose";
import dotenv from "dotenv";
import Employee from "../models/employee.model.js";
import TimeEntry from "../models/timeEntry.model.js";

dotenv.config();

/**
 * Comprehensive Time Tracking Seeder
 * Seeds realistic time entry data with various work patterns, projects, and tasks
 */

// Sample projects and tasks for realistic time entries
const PROJECTS = [
  "HRMS Development",
  "Client Portal",
  "Mobile App",
  "API Integration",
  "Database Optimization",
  "Security Audit",
  "UI/UX Redesign",
  "Payment Gateway",
  "Reporting Module",
  "Performance Testing",
];

const TASKS = [
  "Frontend Development",
  "Backend Development",
  "Bug Fixing",
  "Code Review",
  "Testing",
  "Documentation",
  "Client Meeting",
  "Sprint Planning",
  "Database Migration",
  "API Development",
  "Design Implementation",
  "Performance Optimization",
  "Security Implementation",
  "Unit Testing",
  "Integration Testing",
];

const NOTES_TEMPLATES = [
  "Completed feature implementation as per requirements",
  "Fixed critical bugs in production",
  "Attended team standup and sprint planning",
  "Worked on high-priority client deliverables",
  "Reviewed and merged pull requests",
  "Conducted code review session",
  "Implemented new API endpoints",
  "Updated documentation and user guides",
  "Optimized database queries for performance",
  "Participated in client demo and feedback session",
  "Worked on urgent production hotfix",
  "Collaborated with design team on UI improvements",
  "Conducted testing and QA activities",
  "Resolved technical debt items",
  "Mentored junior team members",
];

/**
 * Generate realistic clock in/out times based on shift and work pattern
 */
const generateWorkTimes = (date, pattern = "standard") => {
  const clockIn = new Date(date);
  let clockOut = new Date(date);
  let breaks = [];

  switch (pattern) {
    case "early-bird":
      // 8:00 AM - 4:30 PM
      clockIn.setHours(8, Math.floor(Math.random() * 15), 0, 0);
      clockOut.setHours(16, 30 + Math.floor(Math.random() * 20), 0, 0);
      breaks = [
        {
          startTime: new Date(clockIn.getTime() + 4 * 60 * 60 * 1000),
          endTime: new Date(clockIn.getTime() + 4 * 60 * 60 * 1000 + 30 * 60 * 1000),
        },
      ];
      break;

    case "late-start":
      // 10:00 AM - 6:30 PM
      clockIn.setHours(10, Math.floor(Math.random() * 15), 0, 0);
      clockOut.setHours(18, 30 + Math.floor(Math.random() * 20), 0, 0);
      breaks = [
        {
          startTime: new Date(clockIn.getTime() + 3.5 * 60 * 60 * 1000),
          endTime: new Date(clockIn.getTime() + 3.5 * 60 * 60 * 1000 + 45 * 60 * 1000),
        },
      ];
      break;

    case "overtime":
      // 9:00 AM - 8:00 PM (overtime)
      clockIn.setHours(9, Math.floor(Math.random() * 15), 0, 0);
      clockOut.setHours(20, Math.floor(Math.random() * 30), 0, 0);
      breaks = [
        {
          startTime: new Date(clockIn.getTime() + 3 * 60 * 60 * 1000),
          endTime: new Date(clockIn.getTime() + 3 * 60 * 60 * 1000 + 30 * 60 * 1000),
        },
        {
          startTime: new Date(clockIn.getTime() + 6.5 * 60 * 60 * 1000),
          endTime: new Date(clockIn.getTime() + 6.5 * 60 * 60 * 1000 + 45 * 60 * 1000),
        },
      ];
      break;

    case "half-day":
      // 9:00 AM - 1:00 PM
      clockIn.setHours(9, Math.floor(Math.random() * 15), 0, 0);
      clockOut.setHours(13, Math.floor(Math.random() * 30), 0, 0);
      breaks = [
        {
          startTime: new Date(clockIn.getTime() + 2 * 60 * 60 * 1000),
          endTime: new Date(clockIn.getTime() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000),
        },
      ];
      break;

    default: // "standard"
      // 9:00 AM - 5:30 PM
      clockIn.setHours(9, Math.floor(Math.random() * 15), 0, 0);
      clockOut.setHours(17, 30 + Math.floor(Math.random() * 20), 0, 0);
      breaks = [
        {
          startTime: new Date(clockIn.getTime() + 3.5 * 60 * 60 * 1000),
          endTime: new Date(clockIn.getTime() + 3.5 * 60 * 60 * 1000 + 30 * 60 * 1000),
        },
      ];
      break;
  }

  return { clockIn, clockOut, breaks };
};

/**
 * Determine work pattern based on day of week and random factors
 */
const getWorkPattern = (dayOfWeek, randomFactor) => {
  // Monday - more likely to have overtime
  if (dayOfWeek === 1 && randomFactor > 0.7) return "overtime";
  
  // Friday - more likely to be half day
  if (dayOfWeek === 5 && randomFactor > 0.85) return "half-day";
  
  // Random patterns
  if (randomFactor > 0.9) return "early-bird";
  if (randomFactor > 0.8) return "late-start";
  if (randomFactor > 0.7) return "overtime";
  
  return "standard";
};

/**
 * Main seeder function
 */
export const seedTimeTracking = async () => {
  try {
    console.log("\n🕐 Starting Time Tracking Seeder...");

    // Check if already seeded
    const existingCount = await TimeEntry.countDocuments();
    if (existingCount > 50) {
      console.log(`✓ Time entries already exist (${existingCount}), skipping...`);
      return;
    }

    // Get active employees
    const employees = await Employee.find({ status: "Active" }).limit(15);
    
    if (employees.length === 0) {
      console.log("✗ No active employees found. Please seed employees first.");
      return;
    }

    console.log(`✓ Found ${employees.length} active employees`);

    const timeEntries = [];
    const today = new Date();
    const daysToSeed = 45; // Seed 45 days of data

    // Get an admin for approvals
    const admin = await Employee.findOne({ admin: true });

    // Generate time entries for each employee
    for (const employee of employees) {
      let employeeEntries = 0;

      for (let daysAgo = daysToSeed; daysAgo >= 0; daysAgo--) {
        const entryDate = new Date(today);
        entryDate.setDate(entryDate.getDate() - daysAgo);
        
        const dayOfWeek = entryDate.getDay();
        
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        // 85% attendance rate (some days off)
        if (Math.random() > 0.85) continue;

        // Determine work pattern
        const randomFactor = Math.random();
        const pattern = getWorkPattern(dayOfWeek, randomFactor);
        
        // Generate work times
        const { clockIn, clockOut, breaks } = generateWorkTimes(entryDate, pattern);

        // Select random project and task
        const project = PROJECTS[Math.floor(Math.random() * PROJECTS.length)];
        const task = TASKS[Math.floor(Math.random() * TASKS.length)];
        
        // Generate notes (70% of the time)
        const notes = Math.random() > 0.3 
          ? NOTES_TEMPLATES[Math.floor(Math.random() * NOTES_TEMPLATES.length)]
          : "";

        // Determine status based on how old the entry is
        let status = "pending";
        let approvedBy = null;
        let approvedAt = null;

        if (daysAgo > 7) {
          // Entries older than 7 days: 90% approved, 5% rejected, 5% pending
          const statusRoll = Math.random();
          if (statusRoll > 0.95) {
            status = "pending";
          } else if (statusRoll > 0.9) {
            status = "rejected";
          } else {
            status = "approved";
            approvedBy = admin ? admin._id : null;
            approvedAt = new Date(clockOut.getTime() + 24 * 60 * 60 * 1000);
          }
        } else if (daysAgo > 3) {
          // Entries 3-7 days old: 60% approved, 40% pending
          if (Math.random() > 0.4) {
            status = "approved";
            approvedBy = admin ? admin._id : null;
            approvedAt = new Date(clockOut.getTime() + 24 * 60 * 60 * 1000);
          }
        }
        // Recent entries (0-3 days): stay pending

        timeEntries.push({
          employee: employee._id,
          date: entryDate,
          clockIn,
          clockOut,
          breaks,
          project,
          task,
          notes,
          status,
          approvedBy,
          approvedAt,
        });

        employeeEntries++;
      }

      console.log(`  ✓ Generated ${employeeEntries} entries for ${employee.name}`);
    }

    // Insert all time entries
    if (timeEntries.length > 0) {
      await TimeEntry.insertMany(timeEntries);
      console.log(`\n✅ Successfully seeded ${timeEntries.length} time entries`);
      
      // Show statistics
      const approved = timeEntries.filter(e => e.status === "approved").length;
      const pending = timeEntries.filter(e => e.status === "pending").length;
      const rejected = timeEntries.filter(e => e.status === "rejected").length;
      
      console.log("\n📊 Seeding Statistics:");
      console.log(`   Approved: ${approved} (${((approved/timeEntries.length)*100).toFixed(1)}%)`);
      console.log(`   Pending: ${pending} (${((pending/timeEntries.length)*100).toFixed(1)}%)`);
      console.log(`   Rejected: ${rejected} (${((rejected/timeEntries.length)*100).toFixed(1)}%)`);
      console.log(`   Date Range: ${daysToSeed} days ago to today`);
      console.log(`   Employees: ${employees.length}`);
    } else {
      console.log("⚠️  No time entries generated");
    }

  } catch (error) {
    console.error("✗ Error seeding time tracking data:", error);
    throw error;
  }
};

/**
 * Run seeder if called directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✓ Connected to MongoDB");
      
      await seedTimeTracking();
      
      console.log("\n✅ Time tracking seeding completed!");
      process.exit(0);
    } catch (error) {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    }
  })();
}

export default seedTimeTracking;
