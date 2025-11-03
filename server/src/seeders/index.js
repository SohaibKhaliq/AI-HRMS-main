import Role from "../models/role.model.js";
import Payroll from "../models/payroll.model.js";
import { getMonthName } from "../utils/index.js";
import Employee from "../models/employee.model.js";
import Department from "../models/department.model.js";
import Performance from "../models/performance.model.js";
import Termination from "../models/termination.model.js";
import { calculateAverageAttendance } from "../controllers/attendance.controller.js";
import Attendance from "../models/attendance.model.js";


const startHrmsApplication = async () => {
  try {
    // First create the role
    const role = await Role.create({
      name: "Supervisor",
      description: "Dummy data entry of position by seeder function",
    });

    // Create the employee without department first
    const employee = await Employee.create({
      employeeId: "000",
      name: "Admin",
      dob: "1990-05-15T00:00:00.000Z",
      email: "admin@gmail.com",
      password: "$2b$10$k.1v4SeBsR.UYT4chI/O8OTkK5CO.MilaR8yCACtodqTZKm429rWG",
      profilePicture: "https://metrohrms.netlify.app/unknown.jpeg",
      qrCode: "",
      phoneNumber: "+1234567890",
      address: {
        street: "Kachupura",
        city: "Lahore",
        state: "Punjab",
        postalCode: "10001",
        country: "Pakistan",
      },
      role: role._id,
      department: "681146faec6adc26293c7466",
      dateOfJoining: "2020-01-10T00:00:00.000Z",
      gender: "Male",
      martialStatus: "Married",
      employmentType: "Full-Time",
      shift: "Morning",
      status: "Active",
      salary: 75000,
      bankDetails: {
        accountNumber: "123456789012",
        bankName: "Example Bank",
      },
      emergencyContact: {
        name: "Dummy User",
        relationship: "Spouse",
        phoneNumber: "+1987654321",
      },
      leaveBalance: 15,
      admin: true,
      forgetPasswordToken: null,
    });

    const department = await Department.create({
      name: "Marketing",
      description: "Dummy data entry of department by seeder function",
      head: employee._id,
    });

    // additional dummy departments
    await Department.create({
      name: "Human Resources",
      description: "Handles recruitment, onboarding and employee relations",
      head: employee._id,
      status: "Active",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
    });

    await Department.create({
      name: "Sales",
      description: "Responsible for sales and client relationships",
      head: employee._id,
      status: "Inactive",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    });

    await Employee.findByIdAndUpdate(employee._id, {
      department: department._id,
    });

    // Create some dummy document types
    const { default: DocumentType } = await import("../models/documentType.model.js");
    await DocumentType.create({
      name: "Identity Proof",
      description: "Government issued identity document such as passport, driver license, or national ID",
      required: true,
      status: "Active",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40),
    });
    await DocumentType.create({
      name: "Address Proof",
      description: "Document verifying current residential address like utility bill or bank statement",
      required: true,
      status: "Active",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
    });
    await DocumentType.create({
      name: "Educational Certificates",
      description: "Academic certificates, degrees, diplomas, and transcripts",
      required: true,
      status: "Active",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    });
    await DocumentType.create({
      name: "Experience Letters",
      description: "Previous employment experience and recommendation letters from former employers",
      required: false,
      status: "Active",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    });

    // Create some dummy designations
    const { default: Designation } = await import("../models/designation.model.js");
    const des1 = await Designation.create({
      name: "Marketing Executive",
      description: "Handles campaigns and social media",
      department: department._id,
      status: "Active",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    });

    const des2 = await Designation.create({
      name: "HR Officer",
      description: "Handles recruitment and employee relations",
      department: department._id,
      status: "Active",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
    });

    const des3 = await Designation.create({
      name: "Senior Marketing Manager",
      description: "Manages marketing team and strategies",
      department: department._id,
      status: "Active",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    });

    // Create a couple of dummy employees for UI/demo
    const emp1 = await Employee.create({
      employeeId: "001",
      name: "Ayesha Khan",
      dob: "1992-07-12T00:00:00.000Z",
      email: "ayesha.khan@example.com",
      password: "$2b$10$k.1v4SeBsR.UYT4chI/O8OTkK5CO.MilaR8yCACtodqTZKm429rWG",
      profilePicture: "https://metrohrms.netlify.app/unknown.jpeg",
      phoneNumber: "+923001112233",
      address: { street: "Street 1", city: "Lahore", state: "Punjab", postalCode: "54000", country: "Pakistan" },
      role: role._id,
      department: department._id,
      dateOfJoining: "2021-03-15T00:00:00.000Z",
      status: "Active",
      salary: 50000,
    });

    const emp2 = await Employee.create({
      employeeId: "002",
      name: "Omar Malik",
      dob: "1988-11-02T00:00:00.000Z",
      email: "omar.malik@example.com",
      password: "$2b$10$k.1v4SeBsR.UYT4chI/O8OTkK5CO.MilaR8yCACtodqTZKm429rWG",
      profilePicture: "https://metrohrms.netlify.app/unknown.jpeg",
      phoneNumber: "+923009998877",
      address: { street: "Street 2", city: "Karachi", state: "Sindh", postalCode: "75500", country: "Pakistan" },
      role: role._id,
      department: department._id,
      dateOfJoining: "2019-08-01T00:00:00.000Z",
      status: "Active",
      salary: 45000,
    });

    // Create some dummy promotions
    const { default: Promotion } = await import("../models/promotion.model.js");
    await Promotion.create({
      employee: emp1._id,
      previousDesignation: des1._id,
      newDesignation: des3._id,
      promotionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      effectiveDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      salaryAdjustment: 10000,
      status: "Approved",
      remarks: "Well deserved promotion based on performance",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    });

    await Promotion.create({
      employee: emp2._id,
      previousDesignation: des2._id,
      newDesignation: des3._id,
      promotionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      effectiveDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      salaryAdjustment: 8000,
      status: "Pending",
      remarks: "Under review",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    });

    // Create some dummy resignations
    const { default: Resignation } = await import("../models/resignation.model.js");
    await Resignation.create({
      employee: emp1._id,
      resignationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      lastWorkingDay: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
      noticePeriod: 30,
      reason: "Seeking better opportunities in corporate sector",
      status: "Approved",
      documentUrl: "https://example.com/resignation-ayesha.pdf",
      remarks: "Approved by HR on 2024-10-25. Employee will transition roles smoothly.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    });

    await Resignation.create({
      employee: emp2._id,
      resignationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      lastWorkingDay: new Date(Date.now() + 1000 * 60 * 60 * 24 * 27),
      noticePeriod: 30,
      reason: "Relocation to Dubai for family reasons",
      status: "Pending",
      documentUrl: "https://example.com/resignation-omar.pdf",
      remarks: "Pending HR director approval. Awaiting exit interview scheduling.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    });

    const emp3 = await Employee.create({
      employeeId: "003",
      name: "Fatima Ahmed",
      dob: "1995-03-20T00:00:00.000Z",
      email: "fatima.ahmed@example.com",
      password: "$2b$10$k.1v4SeBsR.UYT4chI/O8OTkK5CO.MilaR8yCACtodqTZKm429rWG",
      profilePicture: "https://metrohrms.netlify.app/unknown.jpeg",
      phoneNumber: "+923017776644",
      address: { street: "Street 3", city: "Islamabad", state: "Federal", postalCode: "44000", country: "Pakistan" },
      role: role._id,
      department: department._id,
      dateOfJoining: "2022-01-10T00:00:00.000Z",
      status: "Active",
      salary: 40000,
    });

    await Resignation.create({
      employee: emp3._id,
      resignationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      lastWorkingDay: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
      noticePeriod: 30,
      reason: "Further education and career change",
      status: "Rejected",
      documentUrl: "https://example.com/resignation-fatima.pdf",
      remarks: "Rejected by management due to ongoing critical project. Negotiating extension.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    });

    await Employee.create({
      employeeId: "002",
      name: "Omar Malik",
      dob: "1988-11-02T00:00:00.000Z",
      email: "omar.malik@example.com",
      password: "$2b$10$k.1v4SeBsR.UYT4chI/O8OTkK5CO.MilaR8yCACtodqTZKm429rWG",
      profilePicture: "https://metrohrms.netlify.app/unknown.jpeg",
      phoneNumber: "+923009998877",
      address: { street: "Street 2", city: "Karachi", state: "Sindh", postalCode: "75500", country: "Pakistan" },
      role: role._id,
      department: department._id,
      dateOfJoining: "2019-08-01T00:00:00.000Z",
      status: "Inactive",
      salary: 45000,
    });

    console.log("HRMS is ready to run, Have a nice day.");
  } catch (error) {
    console.error("Error setting up HRMS:", error);
    process.exit(1);
  }
};

const generateRandomKPI = () => ({
  attendance: 0,
  rating: 0,
});

const generatePerformanceData = async () => {
  try {
    const employees = await Employee.find();

    if (!employees.length) {
      console.log("No employees found.");
      return;
    }

    const performanceData = [];

    for (const employee of employees) {
      const kpis = generateRandomKPI();
      kpis.attendance = await calculateAverageAttendance(employee._id);
      kpis.rating = 0;

      const kpiScore = kpis.attendance * 0.3 + kpis.rating * 0.7;

      performanceData.push({
        employee: employee._id,
        kpis,
        kpiScore,
        feedback: "",
      });
    }

    await Performance.insertMany(performanceData);
    console.log("Performance records added for all employees.");
  } catch (error) {
    console.error("Error generating performance data:", error);
  }
};

const deleteAllPerformanceRecords = async () => {
  try {
    await Performance.deleteMany({});
    console.log("All performance records deleted successfully.");
  } catch (error) {
    console.error("Error deleting performance records:", error);
  }
};

const generatePayrollDataForMonths = async (month) => {
  try {
    if (month < 1 || month > 12) {
      throw new Error("Month must be between 1 (January) and 12 (December).");
    }

    const employees = await Employee.find();
    if (!employees.length) {
      console.log("No employees found.");
      return;
    }

    const currentYear = new Date().getFullYear();
    const payrollData = [];

    for (const employee of employees) {
      const baseSalary = employee.salary || 30000;
      const allowances = 0;
      const deductions = 0;
      const bonuses = 0;
      const netSalary = baseSalary;

      payrollData.push({
        employee: employee._id,
        month: month,
        year: currentYear,
        baseSalary,
        allowances,
        deductions,
        bonuses,
        netSalary,
        isPaid: false,
        paymentDate: null,
      });
    }

    await Payroll.insertMany(payrollData);
    console.log(
      `Generated payroll data for ${getMonthName(month)} ${currentYear} for ${
        employees.length
      } employees.`
    );
  } catch (error) {
    console.error("Error generating payroll data:", error);
  }
};

const generatePayrollDataForYear = async (year) => {
  try {
    const currentYear = new Date().getFullYear();
    if (year < 2024 || year > currentYear + 1) {
      throw new Error(`Year must be between 2000 and ${currentYear + 1}.`);
    }

    const employees = await Employee.find();
    if (!employees.length) {
      console.log("No employees found.");
      return;
    }

    const payrollData = [];

    for (const employee of employees) {
      const baseSalary = employee.salary || 30000;

      for (let month = 1; month <= 12; month++) {
        payrollData.push({
          employee: employee._id,
          month: month,
          year: year,
          baseSalary,
          allowances: 0,
          deductions: 0,
          bonuses: 0,
          netSalary: baseSalary,
          isPaid: false,
          paymentDate: null,
        });
      }
    }

    await Payroll.insertMany(payrollData);
    console.log(
      `Generated payroll data for all 12 months of ${year} for ${employees.length} employees.`
    );
  } catch (error) {
    console.error("Error generating yearly payroll data:", error);
  }
};

const deleteAllPayrollRecords = async () => {
  try {
    await Payroll.deleteMany({});
    console.log("All payroll records deleted successfully.");
  } catch (error) {
    console.error("Error deleting performance records:", error);
  }
};

const deleteTodayAttendanceRecords = async () => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    await Attendance.deleteMany({
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    console.log("Today's attendance records deleted successfully.");
  } catch (error) {
    console.error("Error deleting today's attendance records:", error);
  }
};

const alterEmployeeData = async () => {
  await Employee.updateMany(
    { profilePicture: "https://via.placeholder.com/50" },
    {
      $set: {
        profilePicture: "https://metrohrms.netlify.app/unknown.jpeg",
      },
    }
  );
  console.log("Altered");
};

const generateTerminationData = async () => {
  try {
    // Get first 10 active employees
    const employees = await Employee.find({ status: "Active" }).limit(10);

    const terminationTypes = [
      "retirement",
      "resignation",
      "termination",
      "redundancy",
      "voluntary",
      "involuntary",
    ];
    const reasons = [
      "Normal Retirement",
      "Early Retirement Benefits",
      "Voluntary Resignation",
      "Performance Issues",
      "Restructuring",
      "Cost Reduction",
      "Position Elimination",
      "Lack of Skills",
    ];
    const statuses = ["In progress", "Completed", "Cancelled"];

    for (let i = 0; i < employees.length; i++) {
      const terminationDate = new Date();
      terminationDate.setDate(terminationDate.getDate() + Math.floor(Math.random() * 180));

      const noticeDate = new Date();
      noticeDate.setDate(noticeDate.getDate() + Math.floor(Math.random() * 90));

      await Termination.create({
        employee: employees[i]._id,
        type: terminationTypes[Math.floor(Math.random() * terminationTypes.length)],
        terminationDate,
        noticeDate,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        remarks: `Termination processed for employee ${employees[i].employeeId}`,
      });
    }

    console.log("Termination data generated successfully");
  } catch (error) {
    console.error("Error generating termination data:", error);
  }
};

const generateComplaintData = async () => {
  try {
    const Complaint = (await import("../models/complaint.model.js")).default;
    const employees = await Employee.find({ status: "Active" }).limit(15);

    if (employees.length < 2) {
      console.log("Not enough employees to generate complaints");
      return;
    }

    const complaintTypes = [
      "Leave",
      "Workplace",
      "Payroll",
      "Harassment",
      "Scheduling",
      "Misconduct",
      "Discrimination",
      "Safety",
      "Other",
    ];

    const subjects = [
      "Racial Discrimination",
      "Sexual Harassment",
      "Poor Communication",
      "Unsafe Working Conditions",
      "Unfair Leave Policy",
      "Payroll Discrepancy",
      "Workplace Bullying",
      "Lack of Resources",
      "Unequal Treatment",
      "Overtime Payment Issue",
    ];

    const complaints = [
      "I believe I have been treated unfairly due to my ethnicity in the recent promotion process.",
      "There have been several instances of inappropriate behavior and comments from my supervisor.",
      "The management fails to communicate decisions effectively, causing confusion and frustration.",
      "The office lacks basic safety equipment and proper ventilation.",
      "My leave request was rejected unfairly despite meeting all company requirements.",
      "There is a significant discrepancy in my salary payment this month.",
      "I have witnessed bullying behavior towards junior employees.",
      "The department lacks essential resources to complete projects on time.",
      "I feel I am being treated differently based on my background.",
      "Overtime hours are not being compensated as per company policy.",
    ];

    const statuses = ["Pending", "In Progress", "Resolved", "Closed", "Escalated"];
    const assignees = employees.slice(0, 3); // Assign to first 3 employees

    for (let i = 0; i < 7; i++) {
      const complainantIdx = Math.floor(Math.random() * employees.length);
      let againstIdx = Math.floor(Math.random() * employees.length);
      while (againstIdx === complainantIdx) {
        againstIdx = Math.floor(Math.random() * employees.length);
      }

      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 60));

      await Complaint.create({
        employee: employees[complainantIdx]._id,
        againstEmployee: Math.random() > 0.3 ? employees[againstIdx]._id : null,
        complainType: complaintTypes[Math.floor(Math.random() * complaintTypes.length)],
        complainSubject: subjects[Math.floor(Math.random() * subjects.length)],
        complaintDetails: complaints[Math.floor(Math.random() * complaints.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        assignComplaint: assignees[Math.floor(Math.random() * assignees.length)]._id,
        remarks: "Complaint received and logged in the system for review and investigation.",
        createdAt: createdDate,
      });
    }

    console.log("Complaint data generated successfully");
  } catch (error) {
    console.error("Error generating complaint data:", error);
  }
};

const generateHolidayData = async () => {
  try {
    const Holiday = (await import("../models/holiday.model.js")).default;

    const holidays = [
      {
        holidayName: "New Year's Day",
        date: new Date("2025-01-01"),
        category: "National",
        type: "Full Day",
        description: "Celebrate the beginning of the new year with a day off.",
        isPaid: true,
      },
      {
        holidayName: "Republic Day",
        date: new Date("2025-01-26"),
        category: "National",
        type: "Full Day",
        description: "National holiday celebrating the adoption of the Constitution.",
        isPaid: true,
      },
      {
        holidayName: "Holi",
        date: new Date("2025-03-14"),
        category: "Religious",
        type: "Full Day",
        description: "Festival of colors - a joyful celebration of spring.",
        isPaid: true,
      },
      {
        holidayName: "Good Friday",
        date: new Date("2025-04-18"),
        category: "Religious",
        type: "Full Day",
        description: "Christian holiday commemorating the crucifixion of Jesus.",
        isPaid: true,
      },
      {
        holidayName: "Eid ul-Fitr",
        date: new Date("2025-04-01"),
        category: "Religious",
        type: "Full Day",
        description: "Islamic festival marking the end of Ramadan.",
        isPaid: true,
      },
      {
        holidayName: "Labour Day",
        date: new Date("2025-05-01"),
        category: "National",
        type: "Full Day",
        description: "International holiday celebrating workers and their contributions.",
        isPaid: true,
      },
      {
        holidayName: "Independence Day",
        date: new Date("2025-08-15"),
        category: "National",
        type: "Full Day",
        description: "National holiday celebrating India's independence.",
        isPaid: true,
      },
      {
        holidayName: "Janmashtami",
        date: new Date("2025-08-26"),
        category: "Religious",
        type: "Full Day",
        description: "Hindu festival celebrating the birth of Lord Krishna.",
        isPaid: true,
      },
      {
        holidayName: "Diwali",
        date: new Date("2025-11-01"),
        category: "Religious",
        type: "Full Day",
        description: "Festival of lights - one of the most important Hindu festivals.",
        isPaid: true,
      },
      {
        holidayName: "Company Foundation Day",
        date: new Date("2025-06-15"),
        category: "Company Specific",
        type: "Half Day",
        description: "Special half-day holiday celebrating the company's foundation anniversary.",
        isPaid: true,
      },
      {
        holidayName: "Christmas",
        date: new Date("2025-12-25"),
        category: "Religious",
        type: "Full Day",
        description: "Christian holiday celebrating the birth of Jesus Christ.",
        isPaid: true,
      },
      {
        holidayName: "Mahatma Gandhi Jayanti",
        date: new Date("2025-10-02"),
        category: "National",
        type: "Full Day",
        description: "National holiday celebrating the birth of Mahatma Gandhi.",
        isPaid: true,
      },
    ];

    // Check if holidays already exist
    const existingHolidays = await Holiday.countDocuments();
    if (existingHolidays > 0) {
      console.log("Holidays already exist in the database");
      return;
    }

    await Holiday.insertMany(holidays);
    console.log("Holiday data generated successfully");
  } catch (error) {
    console.error("Error generating holiday data:", error);
  }
};

const generateAnnouncementData = async () => {
  try {
    const Announcement = (await import("../models/announcement.model.js")).default;
    
    // Check if announcements already exist
    const existingAnnouncements = await Announcement.countDocuments();
    if (existingAnnouncements > 0) {
      console.log("Announcements already exist in the database");
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
        targetDepartments: departments.slice(0, Math.min(3, departments.length)).map(dept => dept._id),
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
        targetDepartments: departments.map(dept => dept._id),
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
        targetDepartments: departments.map(dept => dept._id),
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
        targetDepartments: departments.map(dept => dept._id),
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
        targetDepartments: departments.map(dept => dept._id),
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
        targetDepartments: departments.map(dept => dept._id),
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
        targetDepartments: departments.slice(0, Math.min(2, departments.length)).map(dept => dept._id),
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
        targetDepartments: departments.length > 3 ? departments.slice(1, 4).map(dept => dept._id) : departments.map(dept => dept._id),
      }
    ];

    // Insert the seed data
    const createdAnnouncements = await Announcement.insertMany(announcementData);
    
    console.log(`Successfully seeded ${createdAnnouncements.length} announcements`);
  } catch (error) {
    console.error("Error generating announcement data:", error);
  }
};

// Export comprehensive HCM seeders
export {
  seedAllHCMData,
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
} from "./comprehensive.seeder.js";

export {
  alterEmployeeData,
  startHrmsApplication,
  generatePerformanceData,
  deleteAllPayrollRecords,
  generatePayrollDataForYear,
  deleteTodayAttendanceRecords,
  deleteAllPerformanceRecords,
  generatePayrollDataForMonths,
  generateTerminationData,
  generateComplaintData,
  generateHolidayData,
  generateAnnouncementData,
};
