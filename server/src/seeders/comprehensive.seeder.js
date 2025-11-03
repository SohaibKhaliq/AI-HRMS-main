import Employee from "../models/employee.model.js";
import Department from "../models/department.model.js";
import Shift from "../models/shift.model.js";
import LeaveType from "../models/leaveType.model.js";
import LeaveBalance from "../models/leaveBalance.model.js";
import Leave from "../models/leave.model.js";
import Meeting from "../models/meeting.model.js";
import DocumentCategory from "../models/documentCategory.model.js";
import EmployeeDocument from "../models/employeeDocument.model.js";
import TimeEntry from "../models/timeEntry.model.js";
import Notification from "../models/notification.model.js";
import Attendance from "../models/attendance.model.js";
import Feedback from "../models/feedback.model.js";

/**
 * Comprehensive HRMS Data Seeder
 * Seeds all major modules with realistic sample data
 */

export const seedShifts = async () => {
  try {
    const existingShifts = await Shift.countDocuments();
    if (existingShifts > 0) {
      console.log("✓ Shifts already exist, skipping...");
      return;
    }

    const shifts = [
      {
        name: "Morning Shift",
        startTime: "09:00",
        endTime: "17:00",
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        breakDuration: 60, // 1 hour lunch break
        isActive: true,
        description: "Standard morning shift for office employees, 9 AM to 5 PM",
      },
      {
        name: "Evening Shift",
        startTime: "14:00",
        endTime: "22:00",
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        breakDuration: 45,
        isActive: true,
        description: "Evening shift for customer support and operations team",
      },
      {
        name: "Night Shift",
        startTime: "22:00",
        endTime: "06:00",
        workingDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        breakDuration: 30,
        isActive: true,
        description: "Night shift with premium allowance for 24/7 operations",
      },
      {
        name: "Flexible Hours",
        startTime: "08:00",
        endTime: "20:00",
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        breakDuration: 60,
        isActive: true,
        description: "Flexible working hours - employees can choose their 8-hour window",
      },
      {
        name: "Weekend Shift",
        startTime: "10:00",
        endTime: "18:00",
        workingDays: ["Saturday", "Sunday"],
        breakDuration: 45,
        isActive: true,
        description: "Weekend shift with compensatory off during weekdays",
      },
    ];

    await Shift.insertMany(shifts);
    console.log("✓ Successfully seeded 5 shifts");
  } catch (error) {
    console.error("✗ Error seeding shifts:", error.message);
  }
};

export const seedLeaveTypes = async () => {
  try {
    const existingLeaveTypes = await LeaveType.countDocuments();
    if (existingLeaveTypes > 0) {
      console.log("✓ Leave types already exist, skipping...");
      return;
    }

    const leaveTypes = [
      {
        name: "Annual Leave",
        code: "AL",
        description: "Paid annual vacation leave for all employees",
        defaultDays: 20,
        maxDays: 30,
        carryForward: true,
        carryForwardDays: 10,
        requiresApproval: true,
        isPaid: true,
        isActive: true,
        color: "#3B82F6",
      },
      {
        name: "Sick Leave",
        code: "SL",
        description: "Leave for medical illness and recovery",
        defaultDays: 12,
        maxDays: 15,
        carryForward: false,
        carryForwardDays: 0,
        requiresApproval: true,
        isPaid: true,
        isActive: true,
        color: "#EF4444",
      },
      {
        name: "Casual Leave",
        code: "CL",
        description: "Short-term leave for personal matters",
        defaultDays: 10,
        maxDays: 12,
        carryForward: false,
        carryForwardDays: 0,
        requiresApproval: true,
        isPaid: true,
        isActive: true,
        color: "#10B981",
      },
      {
        name: "Maternity Leave",
        code: "ML",
        description: "Paid leave for expecting mothers",
        defaultDays: 90,
        maxDays: 180,
        carryForward: false,
        carryForwardDays: 0,
        requiresApproval: true,
        isPaid: true,
        isActive: true,
        color: "#EC4899",
      },
      {
        name: "Paternity Leave",
        code: "PL",
        description: "Leave for new fathers",
        defaultDays: 15,
        maxDays: 21,
        carryForward: false,
        carryForwardDays: 0,
        requiresApproval: true,
        isPaid: true,
        isActive: true,
        color: "#8B5CF6",
      },
      {
        name: "Unpaid Leave",
        code: "UL",
        description: "Leave without pay for extended personal needs",
        defaultDays: 0,
        maxDays: 90,
        carryForward: false,
        carryForwardDays: 0,
        requiresApproval: true,
        isPaid: false,
        isActive: true,
        color: "#6B7280",
      },
      {
        name: "Bereavement Leave",
        code: "BL",
        description: "Compassionate leave for family loss",
        defaultDays: 5,
        maxDays: 7,
        carryForward: false,
        carryForwardDays: 0,
        requiresApproval: true,
        isPaid: true,
        isActive: true,
        color: "#1F2937",
      },
      {
        name: "Study Leave",
        code: "STL",
        description: "Leave for professional development and exams",
        defaultDays: 7,
        maxDays: 15,
        carryForward: false,
        carryForwardDays: 0,
        requiresApproval: true,
        isPaid: true,
        isActive: true,
        color: "#F59E0B",
      },
    ];

    await LeaveType.insertMany(leaveTypes);
    console.log("✓ Successfully seeded 8 leave types");
  } catch (error) {
    console.error("✗ Error seeding leave types:", error.message);
  }
};

export const seedLeaveBalances = async () => {
  try {
    const existingBalances = await LeaveBalance.countDocuments();
    if (existingBalances > 0) {
      console.log("✓ Leave balances already exist, skipping...");
      return;
    }

    const employees = await Employee.find({ status: "Active" }).limit(20);
    const leaveTypes = await LeaveType.find({ isActive: true });
    const currentYear = new Date().getFullYear();

    if (employees.length === 0 || leaveTypes.length === 0) {
      console.log("✗ No employees or leave types found. Seed those first.");
      return;
    }

    const balances = [];

    for (const employee of employees) {
      for (const leaveType of leaveTypes) {
        const used = Math.floor(Math.random() * (leaveType.defaultDays / 2));
        const pending = Math.floor(Math.random() * 3);
        const available = leaveType.defaultDays - used - pending;

        balances.push({
          employee: employee._id,
          leaveType: leaveType._id,
          year: currentYear,
          allocated: leaveType.defaultDays,
          used,
          pending,
          available: Math.max(0, available),
          carriedForward: leaveType.carryForward ? Math.floor(Math.random() * 5) : 0,
        });
      }
    }

    await LeaveBalance.insertMany(balances);
    console.log(`✓ Successfully seeded ${balances.length} leave balances`);
  } catch (error) {
    console.error("✗ Error seeding leave balances:", error.message);
  }
};

export const seedLeaves = async () => {
  try {
    const existingLeaves = await Leave.countDocuments();
    if (existingLeaves > 15) {
      console.log("✓ Leave requests already exist, skipping...");
      return;
    }

    const employees = await Employee.find({ status: "Active" }).limit(10);
    const leaveTypes = await LeaveType.find({ isActive: true });

    if (employees.length === 0 || leaveTypes.length === 0) {
      console.log("✗ No employees or leave types found.");
      return;
    }

    const statuses = ["Pending", "Approved", "Rejected"];
    const reasons = [
      "Family emergency",
      "Personal vacation",
      "Medical appointment",
      "Attending wedding ceremony",
      "Home renovation",
      "Child's school event",
      "Out of city travel",
      "Health checkup",
      "Religious observance",
      "Mental health day",
    ];

    const leaves = [];

    for (let i = 0; i < 15; i++) {
      const employee = employees[Math.floor(Math.random() * employees.length)];
      const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60) - 30);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1);
      
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      leaves.push({
        employee: employee._id,
        leaveType: leaveType._id,
        startDate,
        endDate,
        days,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        appliedDate: new Date(startDate.getTime() - 1000 * 60 * 60 * 24 * 3),
      });
    }

    await Leave.insertMany(leaves);
    console.log(`✓ Successfully seeded ${leaves.length} leave requests`);
  } catch (error) {
    console.error("✗ Error seeding leaves:", error.message);
  }
};

export const seedDocumentCategories = async () => {
  try {
    const existingCategories = await DocumentCategory.countDocuments();
    if (existingCategories > 0) {
      console.log("✓ Document categories already exist, skipping...");
      return;
    }

    const categories = [
      {
        name: "Identity Documents",
        description: "Government-issued identification documents",
        required: true,
        isActive: true,
      },
      {
        name: "Educational Certificates",
        description: "Academic degrees, diplomas, and transcripts",
        required: true,
        isActive: true,
      },
      {
        name: "Employment Records",
        description: "Previous employment letters and experience certificates",
        required: false,
        isActive: true,
      },
      {
        name: "Tax Documents",
        description: "Tax identification and related financial documents",
        required: true,
        isActive: true,
      },
      {
        name: "Medical Records",
        description: "Health certificates and medical fitness reports",
        required: false,
        isActive: true,
      },
      {
        name: "Bank Details",
        description: "Bank account information and cancelled cheques",
        required: true,
        isActive: true,
      },
      {
        name: "Contracts & Agreements",
        description: "Employment contracts, NDAs, and other legal agreements",
        required: true,
        isActive: true,
      },
      {
        name: "Training Certificates",
        description: "Professional certifications and training completion certificates",
        required: false,
        isActive: true,
      },
    ];

    await DocumentCategory.insertMany(categories);
    console.log("✓ Successfully seeded 8 document categories");
  } catch (error) {
    console.error("✗ Error seeding document categories:", error.message);
  }
};

export const seedEmployeeDocuments = async () => {
  try {
    const existingDocs = await EmployeeDocument.countDocuments();
    if (existingDocs > 10) {
      console.log("✓ Employee documents already exist, skipping...");
      return;
    }

    const employees = await Employee.find({ status: "Active" }).limit(10);
    const categories = await DocumentCategory.find({ isActive: true });

    if (employees.length === 0 || categories.length === 0) {
      console.log("✗ No employees or categories found.");
      return;
    }

    const statuses = ["Pending", "Verified", "Rejected"];
    const documents = [];

    for (const employee of employees) {
      // Each employee gets 2-4 documents
      const numDocs = Math.floor(Math.random() * 3) + 2;
      const selectedCategories = categories
        .sort(() => 0.5 - Math.random())
        .slice(0, numDocs);

      for (const category of selectedCategories) {
        documents.push({
          employee: employee._id,
          category: category._id,
          documentName: `${category.name} - ${employee.name}`,
          documentUrl: `https://example.com/documents/${employee.employeeId}/${category.name.replace(/\s+/g, '_')}.pdf`,
          uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          expiryDate: category.name.includes("Identity") 
            ? new Date(Date.now() + 365 * 5 * 24 * 60 * 60 * 1000) // 5 years
            : null,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          remarks: Math.random() > 0.5 ? "Document verified and approved" : "",
        });
      }
    }

    await EmployeeDocument.insertMany(documents);
    console.log(`✓ Successfully seeded ${documents.length} employee documents`);
  } catch (error) {
    console.error("✗ Error seeding employee documents:", error.message);
  }
};

export const seedMeetings = async () => {
  try {
    const existingMeetings = await Meeting.countDocuments();
    if (existingMeetings > 10) {
      console.log("✓ Meetings already exist, skipping...");
      return;
    }

    const employees = await Employee.find({ status: "Active" }).limit(15);
    const departments = await Department.find();

    if (employees.length < 3) {
      console.log("✗ Not enough employees for meetings.");
      return;
    }

    const meetingTitles = [
      "Q4 Performance Review",
      "Sprint Planning - Project Alpha",
      "Client Presentation Rehearsal",
      "Team Building Activity Planning",
      "Budget Discussion 2024",
      "New Hire Onboarding Session",
      "Marketing Strategy Brainstorm",
      "Product Roadmap Review",
      "HR Policy Updates",
      "Department Sync Meeting",
    ];

    const meetingTypes = ["In-Person", "Virtual", "Hybrid"];
    const statuses = ["Scheduled", "Completed", "Cancelled", "Rescheduled"];

    const meetings = [];

    for (let i = 0; i < 12; i++) {
      const organizer = employees[Math.floor(Math.random() * Math.min(5, employees.length))];
      
      // Select 3-8 random participants
      const numParticipants = Math.floor(Math.random() * 6) + 3;
      const participants = employees
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(numParticipants, employees.length))
        .map(emp => ({
          employee: emp._id,
          rsvpStatus: ["Accepted", "Declined", "Pending"][Math.floor(Math.random() * 3)],
          responseDate: Math.random() > 0.3 ? new Date() : null,
        }));

      const startTime = new Date();
      startTime.setDate(startTime.getDate() + Math.floor(Math.random() * 30) - 10);
      startTime.setHours(9 + Math.floor(Math.random() * 8), [0, 15, 30, 45][Math.floor(Math.random() * 4)]);

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + Math.floor(Math.random() * 2) + 1);

      meetings.push({
        title: meetingTitles[i % meetingTitles.length],
        description: `Important ${meetingTitles[i % meetingTitles.length]} discussion. Please review the agenda beforehand.`,
        organizer: organizer._id,
        participants,
        startTime,
        endTime,
        location: meetingTypes[Math.floor(Math.random() * meetingTypes.length)] === "In-Person"
          ? `Conference Room ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`
          : null,
        meetingLink: meetingTypes[Math.floor(Math.random() * meetingTypes.length)] !== "In-Person"
          ? `https://meet.example.com/room-${Math.random().toString(36).substring(7)}`
          : null,
        meetingType: meetingTypes[Math.floor(Math.random() * meetingTypes.length)],
        agenda: "1. Opening remarks\n2. Main discussion points\n3. Action items\n4. Q&A\n5. Closing",
        status: statuses[Math.floor(Math.random() * statuses.length)],
        reminderSent: Math.random() > 0.5,
      });
    }

    await Meeting.insertMany(meetings);
    console.log(`✓ Successfully seeded ${meetings.length} meetings`);
  } catch (error) {
    console.error("✗ Error seeding meetings:", error.message);
  }
};

export const seedTimeEntries = async () => {
  try {
    const existingEntries = await TimeEntry.countDocuments();
    if (existingEntries > 20) {
      console.log("✓ Time entries already exist, skipping...");
      return;
    }

    const employees = await Employee.find({ status: "Active" }).limit(10);

    if (employees.length === 0) {
      console.log("✗ No employees found.");
      return;
    }

    const entries = [];
    const statuses = ["Approved", "Pending", "Rejected"];

    // Create entries for the past 14 days
    for (let day = 14; day >= 0; day--) {
      for (const employee of employees) {
        // 80% chance of clocking in each day
        if (Math.random() > 0.2) {
          const date = new Date();
          date.setDate(date.getDate() - day);
          date.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));

          const clockIn = new Date(date);
          const clockOut = new Date(clockIn);
          clockOut.setHours(clockOut.getHours() + 8 + Math.floor(Math.random() * 2));

          const breaks = [];
          
          // Add 1-2 breaks
          const numBreaks = Math.floor(Math.random() * 2) + 1;
          for (let b = 0; b < numBreaks; b++) {
            const breakStart = new Date(clockIn);
            breakStart.setHours(breakStart.getHours() + 3 + b * 2);
            const breakEnd = new Date(breakStart);
            breakEnd.setMinutes(breakEnd.getMinutes() + 15 + Math.floor(Math.random() * 30));
            
            breaks.push({ startTime: breakStart, endTime: breakEnd });
          }

          const totalBreakMinutes = breaks.reduce((sum, brk) => {
            return sum + (brk.endTime - brk.startTime) / (1000 * 60);
          }, 0);

          const totalMinutes = (clockOut - clockIn) / (1000 * 60) - totalBreakMinutes;

          entries.push({
            employee: employee._id,
            date,
            clockIn,
            clockOut,
            breaks,
            totalHours: (totalMinutes / 60).toFixed(2),
            status: day < 7 ? statuses[Math.floor(Math.random() * statuses.length)] : "Approved",
            notes: Math.random() > 0.7 ? "Worked on urgent project deliverables" : "",
          });
        }
      }
    }

    await TimeEntry.insertMany(entries);
    console.log(`✓ Successfully seeded ${entries.length} time entries`);
  } catch (error) {
    console.error("✗ Error seeding time entries:", error.message);
  }
};

export const seedAttendance = async () => {
  try {
    const existingAttendance = await Attendance.countDocuments();
    if (existingAttendance > 50) {
      console.log("✓ Attendance records already exist, skipping...");
      return;
    }

    const employees = await Employee.find({ status: "Active" }).limit(10);

    if (employees.length === 0) {
      console.log("✗ No employees found.");
      return;
    }

    const records = [];
    const statuses = ["Present", "Absent", "Late", "Half Day"];

    // Create attendance for the past 30 days
    for (let day = 30; day >= 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const employee of employees) {
        const status = statuses[Math.floor(Math.random() * 100) < 85 ? 0 : Math.floor(Math.random() * statuses.length)];
        
        const checkIn = new Date(date);
        checkIn.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));

        const checkOut = status === "Half Day" 
          ? new Date(checkIn.getTime() + 4 * 60 * 60 * 1000)
          : new Date(checkIn.getTime() + 8 * 60 * 60 * 1000 + Math.random() * 2 * 60 * 60 * 1000);

        records.push({
          employee: employee._id,
          date,
          status,
          checkIn: status !== "Absent" ? checkIn : null,
          checkOut: status !== "Absent" ? checkOut : null,
          remarks: status === "Absent" ? "Unplanned absence" : status === "Late" ? "Traffic delay" : "",
        });
      }
    }

    await Attendance.insertMany(records);
    console.log(`✓ Successfully seeded ${records.length} attendance records`);
  } catch (error) {
    console.error("✗ Error seeding attendance:", error.message);
  }
};

export const seedNotifications = async () => {
  try {
    const existingNotifications = await Notification.countDocuments();
    if (existingNotifications > 20) {
      console.log("✓ Notifications already exist, skipping...");
      return;
    }

    const employees = await Employee.find({ status: "Active" }).limit(15);

    if (employees.length === 0) {
      console.log("✗ No employees found.");
      return;
    }

    const notificationTypes = [
      "Leave Request Approved",
      "Meeting Scheduled",
      "Document Uploaded",
      "Performance Review Due",
      "Payroll Processed",
      "Time Entry Reminder",
      "Policy Update",
      "Birthday Wish",
      "Task Assignment",
      "System Maintenance",
    ];

    const notifications = [];

    for (const employee of employees) {
      // 3-7 notifications per employee
      const numNotifications = Math.floor(Math.random() * 5) + 3;

      for (let i = 0; i < numNotifications; i++) {
        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        
        notifications.push({
          recipient: employee._id,
          type,
          title: type,
          message: `You have a new notification regarding: ${type}. Please check your dashboard for details.`,
          isRead: Math.random() > 0.5,
          priority: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
          createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
        });
      }
    }

    await Notification.insertMany(notifications);
    console.log(`✓ Successfully seeded ${notifications.length} notifications`);
  } catch (error) {
    console.error("✗ Error seeding notifications:", error.message);
  }
};

export const seedFeedback = async () => {
  try {
    const existingFeedback = await Feedback.countDocuments();
    if (existingFeedback > 10) {
      console.log("✓ Feedback already exists, skipping...");
      return;
    }

    const employees = await Employee.find({ status: "Active" }).limit(10);

    if (employees.length < 2) {
      console.log("✗ Not enough employees found.");
      return;
    }

    const feedbackTopics = [
      "Work Environment",
      "Management Support",
      "Team Collaboration",
      "Career Growth",
      "Work-Life Balance",
      "Training Opportunities",
      "Compensation & Benefits",
      "Communication",
    ];

    const feedbacks = [];

    for (let i = 0; i < 15; i++) {
      const fromEmployee = employees[Math.floor(Math.random() * employees.length)];
      let toEmployee = employees[Math.floor(Math.random() * employees.length)];
      
      // Ensure from and to are different
      while (toEmployee._id.equals(fromEmployee._id)) {
        toEmployee = employees[Math.floor(Math.random() * employees.length)];
      }

      const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars

      feedbacks.push({
        from: fromEmployee._id,
        to: toEmployee._id,
        feedbackType: Math.random() > 0.5 ? "Peer" : "Manager",
        subject: feedbackTopics[Math.floor(Math.random() * feedbackTopics.length)],
        message: rating >= 4 
          ? "Great work! Your contributions have been valuable to the team."
          : "There's room for improvement. Let's discuss how I can support you better.",
        rating,
        isAnonymous: Math.random() > 0.7,
        status: ["Pending", "Reviewed", "Acknowledged"][Math.floor(Math.random() * 3)],
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      });
    }

    await Feedback.insertMany(feedbacks);
    console.log(`✓ Successfully seeded ${feedbacks.length} feedback entries`);
  } catch (error) {
    console.error("✗ Error seeding feedback:", error.message);
  }
};

/**
 * Master seeder function - runs all seeders in sequence
 */
export const seedAllHCMData = async () => {
  console.log("\n========================================");
  console.log("🌱 Starting Comprehensive HCM Data Seeding");
  console.log("========================================\n");

  try {
    await seedShifts();
    await seedLeaveTypes();
    await seedLeaveBalances();
    await seedLeaves();
    await seedDocumentCategories();
    await seedEmployeeDocuments();
    await seedMeetings();
    await seedTimeEntries();
    await seedAttendance();
    await seedNotifications();
    await seedFeedback();

    console.log("\n========================================");
    console.log("✅ Comprehensive HCM Data Seeding Complete!");
    console.log("========================================\n");
  } catch (error) {
    console.error("\n❌ Error during seeding process:", error);
  }
};

// Export individual seeders for selective use
export default {
  seedShifts,
  seedLeaveTypes,
  seedLeaveBalances,
  seedLeaves,
  seedDocumentCategories,
  seedEmployeeDocuments,
  seedMeetings,
  seedTimeEntries,
  seedAttendance,
  seedNotifications,
  seedFeedback,
  seedAllHCMData,
};
