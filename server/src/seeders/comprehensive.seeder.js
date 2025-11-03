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
import bcrypt from "bcrypt";

/**
 * Comprehensive HRMS Data Seeder
 * Seeds all major modules with realistic sample data
 */

export const seedAdditionalEmployees = async () => {
  try {
    const existingEmployees = await Employee.countDocuments();
    if (existingEmployees >= 10) {
      console.log("✓ Sufficient employees already exist, skipping...");
      return;
    }

    const departments = await Department.find().limit(3);
    const Role = (await import("../models/role.model.js")).default;
    const Designation = (await import("../models/designation.model.js")).default;
    
    const employeeRole = await Role.findOne({ name: "Employee" });
    const designations = await Designation.find().limit(3);
    const shifts = await Shift.find().limit(3);

    if (!employeeRole || departments.length === 0 || designations.length === 0) {
      console.log("✗ Missing required data for employee seeding (roles, departments, designations)");
      return;
    }

    const firstNames = ["Ahmed", "Fatima", "Ali", "Ayesha", "Hassan", "Zainab", "Usman", "Khadija", "Bilal", "Maryam"];
    const lastNames = ["Khan", "Ahmed", "Ali", "Hussain", "Hassan", "Malik", "Sheikh", "Raza", "Iqbal", "Siddiqui"];
    
    const employees = [];
    const employeeIdStart = 101;

    for (let i = 0; i < 10; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@company.com`;
      
      employees.push({
        employeeId: String(employeeIdStart + i),
        name: `${firstName} ${lastName}`,
        email,
        password: await bcrypt.hash("password123", 10),
        department: departments[i % departments.length]._id,
        designation: designations[i % designations.length]._id,
        role: employeeRole._id,
        shift: shifts.length > 0 ? shifts[i % shifts.length]._id : null,
        phoneNumber: `+92300${Math.floor(1000000 + Math.random() * 9000000)}`,
        dob: new Date(1990 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: i % 2 === 0 ? "Male" : "Female",
        martialStatus: i % 3 === 0 ? "Married" : "Single",
        dateOfJoining: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        employmentType: ["Full-Time", "Part-Time", "Contract"][i % 3],
        status: "Active",
        address: {
          street: `House ${Math.floor(Math.random() * 100)}, Street ${Math.floor(Math.random() * 50)}`,
          city: ["Lahore", "Karachi", "Islamabad"][i % 3],
          state: ["Punjab", "Sindh", "ICT"][i % 3],
          postalCode: String(54000 + Math.floor(Math.random() * 1000)),
          country: "Pakistan",
        },
        salary: 50000 + Math.floor(Math.random() * 50000),
        admin: false,
      });
    }

    await Employee.insertMany(employees);
    console.log(`✓ Successfully seeded ${employees.length} additional employees`);
  } catch (error) {
    console.error("✗ Error seeding additional employees:", error.message);
  }
};


  export const syncEmployeeSalariesFromDesignation = async () => {
    try {
      const Designation = (await import("../models/designation.model.js")).default;
      const employees = await Employee.find();

      let updated = 0;
      for (const emp of employees) {
        if (!emp.designation) continue;
        const designation = await Designation.findById(emp.designation).lean();
        if (designation && designation.salary !== undefined && emp.salary !== designation.salary) {
          await Employee.findByIdAndUpdate(emp._id, { salary: designation.salary });
          updated++;
        }
      }

      console.log(`✓ Synced salaries from designation for ${updated} employees`);
    } catch (err) {
      console.error("✗ Error syncing employee salaries:", err.message);
    }
  };
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
        maxDaysPerYear: 20,
        carryForward: true,
        carryForwardLimit: 10,
        requiresApproval: true,
        isPaid: true,
        isActive: true,
        color: "#3B82F6",
        minDaysNotice: 3,
        allowHalfDay: true,
      },
      {
        name: "Sick Leave",
        code: "SL",
        description: "Leave for medical illness and recovery",
        maxDaysPerYear: 12,
        carryForward: false,
        carryForwardLimit: 0,
        requiresApproval: true,
        requiresDocument: true,
        isPaid: true,
        isActive: true,
        color: "#EF4444",
        minDaysNotice: 0,
        allowHalfDay: true,
      },
      {
        name: "Casual Leave",
        code: "CL",
        description: "Short-term leave for personal matters",
        maxDaysPerYear: 10,
        carryForward: false,
        carryForwardLimit: 0,
        requiresApproval: true,
        isPaid: true,
        isActive: true,
        color: "#10B981",
        minDaysNotice: 1,
        allowHalfDay: true,
      },
      {
        name: "Maternity Leave",
        code: "ML",
        description: "Paid leave for expecting mothers",
        maxDaysPerYear: 90,
        carryForward: false,
        carryForwardLimit: 0,
        requiresApproval: true,
        requiresDocument: true,
        isPaid: true,
        isActive: true,
        color: "#EC4899",
        minDaysNotice: 30,
        allowHalfDay: false,
      },
      {
        name: "Paternity Leave",
        code: "PL",
        description: "Leave for new fathers",
        maxDaysPerYear: 15,
        carryForward: false,
        carryForwardLimit: 0,
        requiresApproval: true,
        requiresDocument: true,
        isPaid: true,
        isActive: true,
        color: "#8B5CF6",
        minDaysNotice: 15,
        allowHalfDay: false,
      },
      {
        name: "Unpaid Leave",
        code: "UL",
        description: "Leave without pay for extended personal needs",
        maxDaysPerYear: 90,
        carryForward: false,
        carryForwardLimit: 0,
        requiresApproval: true,
        isPaid: false,
        isActive: true,
        color: "#6B7280",
        minDaysNotice: 7,
        allowHalfDay: true,
      },
      {
        name: "Bereavement Leave",
        code: "BL",
        description: "Compassionate leave for family loss",
        maxDaysPerYear: 5,
        carryForward: false,
        carryForwardLimit: 0,
        requiresApproval: true,
        isPaid: true,
        isActive: true,
        color: "#1F2937",
        minDaysNotice: 0,
        allowHalfDay: false,
      },
      {
        name: "Study Leave",
        code: "STL",
        description: "Leave for professional development and exams",
        maxDaysPerYear: 7,
        carryForward: false,
        carryForwardLimit: 0,
        requiresApproval: true,
        isPaid: true,
        isActive: true,
        color: "#F59E0B",
        minDaysNotice: 14,
        allowHalfDay: true,
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
        const totalAllotted = leaveType.maxDaysPerYear || 15;
        const used = Math.floor(Math.random() * (totalAllotted / 3));
        const pending = Math.floor(Math.random() * 3);
        const carriedForward = Math.floor(Math.random() * 5);

        balances.push({
          employee: employee._id,
          leaveType: leaveType._id,
          year: currentYear,
          totalAllotted,
          used,
          pending,
          carriedForward,
          // available will be calculated by pre-save hook
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
      
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() + Math.floor(Math.random() * 60) - 30);
      
      const toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + Math.floor(Math.random() * 5) + 1);
      
      const duration = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      leaves.push({
        employee: employee._id,
        leaveType: leaveType._id,
        fromDate,
        toDate,
        duration,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        status,
        appliedOn: new Date(fromDate.getTime() - 1000 * 60 * 60 * 24 * 3),
        approvedBy: status === "Approved" ? employees[0]._id : null,
        approvedOn: status === "Approved" ? new Date() : null,
      });
    }

    await Leave.insertMany(leaves);
    console.log(`✓ Successfully seeded ${leaves.length} leave requests`);
  } catch (error) {
    console.error("✗ Error seeding leaves:", error.message);
  }
};

export const seedLeaveBalancesForYear = async (year) => {
  try {
    const employees = await Employee.find({ status: "Active" }).limit(50);
    const leaveTypes = await LeaveType.find({ isActive: true });

    if (employees.length === 0 || leaveTypes.length === 0) {
      console.log("✗ No employees or leave types found for leave balance seeding.");
      return;
    }

    const ops = [];

    for (const employee of employees) {
      for (const leaveType of leaveTypes) {
        const existing = await LeaveBalance.findOne({ employee: employee._id, leaveType: leaveType._id, year });
        if (existing) continue; // skip if already exists

        const totalAllotted = leaveType.maxDaysPerYear || 15;
        const used = Math.floor(Math.random() * (totalAllotted / 3));
        const pending = Math.floor(Math.random() * 3);
        const carriedForward = Math.floor(Math.random() * 5);

        ops.push({
          employee: employee._id,
          leaveType: leaveType._id,
          year,
          totalAllotted,
          used,
          pending,
          carriedForward,
        });
      }
    }

    if (ops.length) {
      await LeaveBalance.insertMany(ops);
      console.log(`✓ Seeded ${ops.length} leave balances for year ${year}`);
    } else {
      console.log(`✓ No new leave balances needed for year ${year}`);
    }
  } catch (error) {
    console.error("✗ Error seeding leave balances for year:", error.message);
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

    const statuses = ["pending", "verified", "rejected"];
    const documents = [];

    for (const employee of employees) {
      // Each employee gets 2-4 documents
      const numDocs = Math.floor(Math.random() * 3) + 2;
      const selectedCategories = categories
        .sort(() => 0.5 - Math.random())
        .slice(0, numDocs);

      for (const category of selectedCategories) {
        const fileName = `${category.name.replace(/\s+/g, '_')}_${employee.employeeId}.pdf`;
        documents.push({
          employee: employee._id,
          category: category._id,
          title: `${category.name} - ${employee.name}`,
          description: `Official ${category.name} for ${employee.name}`,
          fileUrl: `https://example.com/documents/${employee.employeeId}/${fileName}`,
          fileName: fileName,
          fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
          fileType: "application/pdf",
          uploadedBy: employee._id,
          issueDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          expiryDate: category.name.includes("Identity") 
            ? new Date(Date.now() + 365 * 5 * 24 * 60 * 60 * 1000) // 5 years
            : null,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          verifiedBy: Math.random() > 0.5 ? employees[0]._id : null,
          verifiedAt: Math.random() > 0.5 ? new Date() : null,
          tags: category.required ? ["required", "official"] : ["optional"],
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
      "Budget Discussion 2025",
      "New Hire Onboarding Session",
      "Marketing Strategy Brainstorm",
      "Product Roadmap Review",
      "HR Policy Updates",
      "Department Sync Meeting",
    ];

    const meetingTypes = ["In-Person", "Virtual", "Hybrid"];
    const statuses = ["scheduled", "completed", "cancelled"];

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
          status: ["pending", "accepted", "declined"][Math.floor(Math.random() * 3)],
          attendance: "not_marked",
        }));

      const startTime = new Date();
      startTime.setDate(startTime.getDate() + Math.floor(Math.random() * 30) - 10);
      startTime.setHours(9 + Math.floor(Math.random() * 8), [0, 15, 30, 45][Math.floor(Math.random() * 4)]);

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + Math.floor(Math.random() * 2) + 1);

      const meetingType = meetingTypes[Math.floor(Math.random() * meetingTypes.length)];

      meetings.push({
        title: meetingTitles[i % meetingTitles.length],
        description: `Important ${meetingTitles[i % meetingTitles.length]} discussion. Please review the agenda beforehand.`,
        organizer: organizer._id,
        participants,
        startTime,
        endTime,
        location: meetingType === "In-Person"
          ? `Conference Room ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`
          : meetingType === "Hybrid" ? "Main Office - Conference Hall" : "",
        meetingLink: meetingType !== "In-Person"
          ? `https://meet.example.com/room-${Math.random().toString(36).substring(7)}`
          : "",
        agenda: "1. Opening remarks\n2. Main discussion points\n3. Action items\n4. Q&A\n5. Closing",
        status: statuses[Math.floor(Math.random() * statuses.length)],
        isRecurring: Math.random() > 0.7,
        recurrencePattern: Math.random() > 0.7 ? ["daily", "weekly", "monthly"][Math.floor(Math.random() * 3)] : "none",
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
    const statuses = ["approved", "pending", "rejected"];

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

          const statusValue = day < 7 ? statuses[Math.floor(Math.random() * statuses.length)] : "approved";
          entries.push({
            employee: employee._id,
            date,
            clockIn,
            clockOut,
            breaks,
            totalHours: parseFloat((totalMinutes / 60).toFixed(2)),
            status: statusValue,
            notes: Math.random() > 0.7 ? "Worked on urgent project deliverables" : "",
            approvedBy: statusValue === "approved" ? employees[0]._id : null,
            approvedAt: statusValue === "approved" ? new Date() : null,
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
    const statuses = ["Present", "Absent", "Late", "Half-Day"];

    // Create attendance for the past 30 days
    for (let day = 30; day >= 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const employee of employees) {
        const status = statuses[Math.floor(Math.random() * 100) < 85 ? 0 : Math.floor(Math.random() * statuses.length)];
        
        const checkInTime = new Date(date);
        checkInTime.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));

        const checkOutTime = status === "Half-Day" 
          ? new Date(checkInTime.getTime() + 4 * 60 * 60 * 1000)
          : new Date(checkInTime.getTime() + 8 * 60 * 60 * 1000 + Math.random() * 2 * 60 * 60 * 1000);

        const workHours = status !== "Absent" 
          ? ((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2) 
          : 0;

        records.push({
          employee: employee._id,
          date,
          status,
          checkIn: status !== "Absent" ? { time: checkInTime, method: "legacy" } : { time: null, method: "legacy" },
          checkOut: status !== "Absent" ? { time: checkOutTime, method: "legacy" } : { time: null, method: "legacy" },
          workHours: parseFloat(workHours),
          isLate: status === "Late",
          lateByMinutes: status === "Late" ? Math.floor(Math.random() * 30) + 5 : 0,
          notes: status === "Absent" ? "Unplanned absence" : status === "Late" ? "Traffic delay" : "",
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
      { type: "leave", title: "Leave Request Update" },
      { type: "meeting", title: "Meeting Scheduled" },
      { type: "document", title: "Document Uploaded" },
      { type: "performance", title: "Performance Review Due" },
      { type: "payroll", title: "Payroll Processed" },
      { type: "attendance", title: "Attendance Reminder" },
      { type: "announcement", title: "New Announcement" },
      { type: "general", title: "System Notification" },
      { type: "feedback", title: "Feedback Received" },
      { type: "holiday", title: "Upcoming Holiday" },
    ];

    const priorities = ["low", "medium", "high", "urgent"];
    const notifications = [];

    for (const employee of employees) {
      // 3-7 notifications per employee
      const numNotifications = Math.floor(Math.random() * 5) + 3;

      for (let i = 0; i < numNotifications; i++) {
        const notif = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const isRead = Math.random() > 0.5;
        
        notifications.push({
          recipient: employee._id,
          type: notif.type,
          title: notif.title,
          message: `You have a new notification regarding: ${notif.title}. Please check your dashboard for details.`,
          read: isRead,
          readAt: isRead ? new Date() : null,
          priority: priorities[Math.floor(Math.random() * priorities.length)],
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

    const feedbackReviews = [
      "Quarterly Performance Review",
      "Project Completion Feedback",
      "Team Collaboration Assessment",
      "Leadership Skills Evaluation",
      "Technical Skills Review",
      "Communication Skills Feedback",
    ];

    const feedbackDescriptions = [
      "Employee has consistently demonstrated strong work ethic and dedication to project deliverables.",
      "Shows excellent collaboration skills and willingness to help team members.",
      "Could improve time management and prioritization of tasks.",
      "Demonstrates good technical knowledge and problem-solving abilities.",
      "Actively participates in team meetings and contributes valuable ideas.",
      "Maintains professional conduct and adheres to company policies.",
    ];

    const feedbackSuggestions = [
      "Continue with current performance level. Consider taking on more leadership responsibilities.",
      "Attend time management workshops to improve productivity.",
      "Focus on developing technical skills through online courses and certifications.",
      "Improve communication with stakeholders and provide regular project updates.",
      "Seek mentorship opportunities to enhance leadership skills.",
      "Maintain work-life balance while meeting project deadlines.",
    ];

    const feedbacks = [];

    for (let i = 0; i < 15; i++) {
      const employee = employees[i % employees.length];
      const rating = Math.floor(Math.random() * 3) + 3; // 3-5 rating

      feedbacks.push({
        employee: employee._id,
        review: feedbackReviews[Math.floor(Math.random() * feedbackReviews.length)],
        rating,
        description: feedbackDescriptions[Math.floor(Math.random() * feedbackDescriptions.length)],
        suggestion: feedbackSuggestions[Math.floor(Math.random() * feedbackSuggestions.length)],
      });
    }

    await Feedback.insertMany(feedbacks);
    console.log(`✓ Successfully seeded ${feedbacks.length} feedback entries`);
  } catch (error) {
    console.error("✗ Error seeding feedback:", error.message);
  }
};

export const seedRecruitmentData = async () => {
  try {
    const JobCategory = (await import("../models/jobCategory.model.js")).default;
    const JobType = (await import("../models/jobType.model.js")).default;
    const JobLocation = (await import("../models/jobLocation.model.js")).default;
    const Recruitment = (await import("../models/recruitment.model.js")).default;

    // Check if already seeded
    const existingJobs = await Recruitment.countDocuments();
    if (existingJobs > 5) {
      console.log("✓ Recruitment data already exists, skipping...");
      return;
    }

    // Seed Job Categories (check for existing to avoid duplicate key errors)
    let categories = await JobCategory.find();
    if (categories.length === 0) {
      categories = await JobCategory.insertMany([
        { name: "Engineering", description: "Software and technical roles" },
        { name: "Marketing", description: "Marketing and branding positions" },
        { name: "Sales", description: "Sales and business development" },
        { name: "Human Resources", description: "HR and talent management" },
        { name: "Finance", description: "Accounting and finance roles" },
      ]);
    }

    // Seed Job Types (check for existing)
    let types = await JobType.find();
    if (types.length === 0) {
      types = await JobType.insertMany([
        { name: "Full-Time", description: "Permanent full-time position" },
        { name: "Part-Time", description: "Part-time employment" },
        { name: "Contract", description: "Fixed-term contract" },
        { name: "Internship", description: "Internship program" },
      ]);
    }

    // Seed Job Locations (check for existing)
    let locations = await JobLocation.find();
    if (locations.length === 0) {
      locations = await JobLocation.insertMany([
        { name: "Lahore Office", description: "Main office in Lahore" },
        { name: "Karachi Office", description: "Branch office in Karachi" },
        { name: "Remote", description: "Work from anywhere" },
        { name: "Islamabad Office", description: "Capital office" },
      ]);
    }

    const employees = await Employee.find({ admin: true }).limit(2);
    const departments = await Department.find().limit(3);

    if (employees.length === 0 || departments.length === 0) {
      console.log("✗ No employees or departments for recruitment");
      return;
    }

    // Create job postings
    const jobs = [
      {
        title: "Senior Software Engineer",
        department: departments[0]._id,
        location: "Lahore Office - Main Campus",
        type: "Full-time",
        minSalary: "80,000 PKR",
        maxSalary: "120,000 PKR",
        description: "Looking for experienced software engineers proficient in MERN stack. Bachelor's degree in CS, 3+ years experience, React/Node.js expertise required. Responsibilities include developing and maintaining web applications, mentoring junior developers.",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "Open",
        postedBy: employees[0]._id,
      },
      {
        title: "Marketing Manager",
        department: departments[1]._id,
        location: "Lahore Office",
        type: "Full-time",
        minSalary: "100,000 PKR",
        maxSalary: "150,000 PKR",
        description: "Lead marketing initiatives and brand strategy. MBA preferred, proven track record in digital marketing. Develop marketing campaigns, manage team, analyze metrics. Performance bonuses, health insurance, gym membership included.",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: "Open",
        postedBy: employees[0]._id,
      },
      {
        title: "HR Intern",
        department: departments[2]._id,
        location: "Remote",
        type: "Contract",
        minSalary: "25,000 PKR",
        maxSalary: "35,000 PKR",
        description: "Internship opportunity in Human Resources. Recent graduate in HR or related field. Assist in recruitment, maintain employee records, organize events. Learning opportunity with potential full-time offer.",
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: "Open",
        postedBy: employees[0]._id,
      },
      {
        title: "Part-time Sales Associate",
        department: departments[0]._id,
        location: "Karachi Office",
        type: "Part-time",
        minSalary: "30,000 PKR",
        maxSalary: "45,000 PKR",
        description: "Part-time sales position for weekends and evenings. Great communication skills required. Handle customer inquiries, process sales, maintain inventory.",
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: "Open",
        postedBy: employees[0]._id,
      },
    ];

    await Recruitment.insertMany(jobs);
    console.log("✓ Successfully seeded recruitment data (categories, types, locations, jobs)");
  } catch (error) {
    console.error("✗ Error seeding recruitment data:", error.message);
  }
};

export const seedPerformanceReviews = async () => {
  try {
    const Performance = (await import("../models/performance.model.js")).default;
    
    const existingReviews = await Performance.countDocuments();
    if (existingReviews > 10) {
      console.log("✓ Performance reviews already exist, skipping...");
      return;
    }

    const employees = await Employee.find({ status: "Active", admin: false }).limit(10);
    
    if (employees.length === 0) {
      console.log("✗ No employees found for performance reviews");
      return;
    }

    const reviews = [];

    for (const employee of employees) {
      const attendanceScore = 85 + Math.floor(Math.random() * 15); // 85-100
      const performanceRating = 3 + Math.random() * 2; // 3-5

      reviews.push({
        employee: employee._id,
        reviewPeriod: {
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
        },
        kpis: {
          attendance: attendanceScore,
          rating: performanceRating,
          projectCompletion: 70 + Math.floor(Math.random() * 30),
          teamwork: 3 + Math.random() * 2,
          communication: 3 + Math.random() * 2,
        },
        kpiScore: (attendanceScore * 0.3 + performanceRating * 20 * 0.7),
        feedback: performanceRating >= 4 
          ? "Excellent performance. Consistently meets and exceeds expectations."
          : "Good performance with room for improvement in some areas.",
        goals: "Continue professional development, take on leadership responsibilities",
        status: "Completed",
      });
    }

    await Performance.insertMany(reviews);
    console.log(`✓ Successfully seeded ${reviews.length} performance reviews`);
  } catch (error) {
    console.error("✗ Error seeding performance reviews:", error.message);
  }
};

export const seedUpdates = async () => {
  try {
    const Update = (await import("../models/update.model.js")).default;
    
    const existingUpdates = await Update.countDocuments();
    if (existingUpdates > 5) {
      console.log("✓ Employee updates already exist, skipping...");
      return;
    }

    const employees = await Employee.find({ status: "Active", admin: false }).limit(5);
    
    if (employees.length === 0) {
      console.log("✗ No employees found for updates");
      return;
    }

    const updateTypes = [
      "Promotion",
      "Transfer",
      "Department Change",
      "Role Change",
      "Salary Adjustment",
      "Status Change",
    ];

    const statuses = [
      "Pending Approval",
      "Approved",
      "Implemented",
      "Rejected",
    ];

    const updates = employees.map((employee, index) => ({
      employee: employee._id,
      type: updateTypes[index % updateTypes.length],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      remarks: `Employee ${updateTypes[index % updateTypes.length].toLowerCase()} processed. Updated effective from ${new Date().toLocaleDateString()}.`,
    }));

    await Update.insertMany(updates);
    console.log(`✓ Successfully seeded ${updates.length} employee updates`);
  } catch (error) {
    console.error("✗ Error seeding employee updates:", error.message);
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
    await seedAdditionalEmployees(); // Seed more employees first for testing
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
    await seedRecruitmentData();
    await seedPerformanceReviews();
    await seedUpdates();

    console.log("\n========================================");
    console.log("✅ Comprehensive HCM Data Seeding Complete!");
    console.log("========================================\n");
  } catch (error) {
    console.error("\n❌ Error during seeding process:", error);
  }
};

// Export individual seeders for selective use
export default {
  seedAdditionalEmployees,
  seedShifts,
  seedLeaveTypes,
  seedLeaveBalances,
  seedLeaveBalancesForYear,
  seedLeaves,
  seedDocumentCategories,
  seedEmployeeDocuments,
  seedMeetings,
  seedTimeEntries,
  seedAttendance,
  seedNotifications,
  seedFeedback,
  seedRecruitmentData,
  seedPerformanceReviews,
  seedUpdates,
  seedAllHCMData,
};
