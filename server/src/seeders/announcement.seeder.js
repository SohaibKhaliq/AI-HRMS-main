const { Announcement } = require("../models/announcement.model");
const { Employee } = require("../models/employee.model");
const { Department } = require("../models/department.model");

async function seedAnnouncements() {
  try {
    // Check if announcements already exist
    const existingAnnouncements = await Announcement.countDocuments();
    if (existingAnnouncements > 0) {
      console.log("Announcements already exist. Skipping seeding.");
      return;
    }

    // Get the first admin user for createdBy field
    const adminUser = await Employee.findOne({ admin: true });
    if (!adminUser) {
      console.log("No admin user found. Please create an admin user first.");
      return;
    }

    // Get all departments for targeting
    const departments = await Department.find();

    const announcementData = [
      {
        title: "New Remote Work Policy Implementation",
        category: "Policy",
        description: "We are implementing a new remote work policy effective January 1st, 2024. This policy allows employees to work from home up to 3 days per week with manager approval. Please review the attached guidelines and submit your remote work requests through the HR portal.",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-03-31"),
        priority: "High",
        isActive: true,
        createdBy: adminUser._id,
        targetDepartments: departments.slice(0, 3).map(dept => dept._id), // First 3 departments
      },
      {
        title: "Annual Performance Review Cycle Begins",
        category: "General",
        description: "The annual performance review cycle for 2024 has officially begun. All employees are required to complete their self-assessments by February 15th. Manager reviews will be conducted from February 16th to March 1st. HR will schedule individual review meetings during the first week of March.",
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-03-15"),
        priority: "Medium",
        isActive: true,
        createdBy: adminUser._id,
        targetDepartments: departments.map(dept => dept._id), // All departments
      },
      {
        title: "Company Annual Day Celebration",
        category: "Event",
        description: "Join us for our Annual Day celebration on March 15th, 2024, at the Grand Ballroom. The event includes awards ceremony, cultural performances, and networking dinner. Dress code is formal. Please confirm your attendance by March 10th through the employee portal.",
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-03-15"),
        priority: "Medium",
        isActive: true,
        createdBy: adminUser._id,
        targetDepartments: departments.map(dept => dept._id), // All departments
      },
      {
        title: "Cybersecurity Training - Mandatory for All",
        category: "Training",
        description: "All employees must complete the mandatory cybersecurity training by January 31st, 2024. This training covers password security, phishing awareness, and data protection protocols. The training takes approximately 2 hours and can be completed online. Certificates will be issued upon completion.",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
        priority: "High",
        isActive: true,
        createdBy: adminUser._id,
        targetDepartments: departments.map(dept => dept._id), // All departments
      },
      {
        title: "System Maintenance - Email Services Downtime",
        category: "Urgent",
        description: "URGENT: Email services will be temporarily unavailable on Saturday, January 20th, 2024, from 6:00 AM to 10:00 AM for scheduled maintenance. Please plan accordingly and use alternative communication methods during this period. Normal services will resume by 10:00 AM.",
        startDate: new Date("2024-01-18"),
        endDate: new Date("2024-01-20"),
        priority: "Critical",
        isActive: true,
        createdBy: adminUser._id,
        targetDepartments: departments.map(dept => dept._id), // All departments
      },
      {
        title: "New Health Insurance Benefits Package",
        category: "Benefits",
        description: "We are excited to announce our enhanced health insurance benefits package effective April 1st, 2024. The new package includes dental coverage, mental health support, and fitness reimbursements. Enrollment period is from March 1st to March 15th. Information sessions will be held every Tuesday and Thursday at 2:00 PM.",
        startDate: new Date("2024-02-15"),
        endDate: new Date("2024-04-30"),
        priority: "Medium",
        isActive: true,
        createdBy: adminUser._id,
        targetDepartments: departments.map(dept => dept._id), // All departments
      },
      {
        title: "Employee of the Quarter Recognition",
        category: "Recognition",
        description: "Congratulations to Sarah Johnson from Marketing for being selected as Employee of the Quarter! Sarah's innovative campaign strategies increased client engagement by 40%. The recognition ceremony will be held on February 1st at 3:00 PM in the main conference room. Join us to celebrate her achievements!",
        startDate: new Date("2024-01-25"),
        endDate: new Date("2024-02-15"),
        priority: "Low",
        isActive: true,
        createdBy: adminUser._id,
        targetDepartments: departments.slice(0, 2).map(dept => dept._id), // First 2 departments
      },
      {
        title: "Professional Development Workshop Series",
        category: "Training",
        description: "Join our quarterly professional development workshop series starting February 5th, 2024. Topics include Leadership Skills, Project Management, and Communication Excellence. Each workshop is 4 hours long and will be conducted over 3 consecutive Mondays. Limited seats available - register by January 30th.",
        startDate: new Date("2024-01-20"),
        endDate: new Date("2024-02-26"),
        priority: "Medium",
        isActive: true,
        createdBy: adminUser._id,
        targetDepartments: departments.slice(1, 4).map(dept => dept._id), // Middle departments
      },
      {
        title: "Office Relocation Notice - IT Department",
        category: "General",
        description: "The IT Department will be relocating to the newly renovated 5th floor effective March 1st, 2024. The move will take place over the weekend of February 24-25. IT services may experience brief interruptions during the transition. New office layout maps and contact information will be distributed by February 20th.",
        startDate: new Date("2024-02-10"),
        endDate: new Date("2024-03-10"),
        priority: "High",
        isActive: true,
        createdBy: adminUser._id,
        targetDepartments: departments.slice(0, 1).map(dept => dept._id), // Just first department (likely IT)
      },
      {
        title: "Updated Expense Reimbursement Policy",
        category: "Policy",
        description: "The expense reimbursement policy has been updated effective immediately. Key changes include increased meal allowances for business travel, streamlined approval process for expenses under $100, and new requirements for digital receipts. Please review the updated policy document and direct questions to the Finance team.",
        startDate: new Date("2024-01-10"),
        endDate: new Date("2024-12-31"),
        priority: "Medium",
        isActive: true,
        createdBy: adminUser._id,
        targetDepartments: departments.map(dept => dept._id), // All departments
      }
    ];

    // Insert the seed data
    const createdAnnouncements = await Announcement.insertMany(announcementData);
    
    console.log(`Successfully seeded ${createdAnnouncements.length} announcements`);
    console.log("Sample announcements:");
    createdAnnouncements.slice(0, 3).forEach(announcement => {
      console.log(`- ${announcement.title} (${announcement.category}, ${announcement.priority})`);
    });

    return createdAnnouncements;
  } catch (error) {
    console.error("Error seeding announcements:", error);
    throw error;
  }
}

module.exports = { seedAnnouncements };