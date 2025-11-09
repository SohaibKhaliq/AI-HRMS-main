import { catchErrors, getMonthName } from "../utils/index.js";
import Payroll from "../models/payroll.model.js";
import Employee from "../models/employee.model.js";
import { createUpdate } from "./update.controller.js";
import { sendFullNotification } from "../services/notification.service.js";

const createPayroll = catchErrors(async (req, res) => {
  const { employee, month, year, baseSalary, allowances, deductions, bonuses } =
    req.body;

  if (!employee || !month || !year || !baseSalary)
    throw new Error("Please provide all required fields");

  const payroll = await Payroll.create({
    employee,
    month,
    year,
    baseSalary,
    allowances,
    deductions,
    bonuses,
  });

  // Get employee details for notification
  const employeeData = await Employee.findById(employee);
  if (employeeData) {
    await sendFullNotification({
      employee: employeeData,
      title: "Payroll Generated",
      message: `Your payroll for ${getMonthName(
        month
      )} ${year} has been generated and is ready for review.`,
      type: "payroll",
      priority: "medium",
      link: "/payroll",
      emailSubject: "Payroll Generated",
      emailTemplate: "payrollGenerated",
      emailData: {
        month: getMonthName(month),
        year: year,
        netSalary: payroll.netSalary.toFixed(2),
        isPaid: payroll.isPaid,
      },
    });
  }

  return res.status(201).json({
    success: true,
    message: "Payroll created successfully",
    payroll,
  });
});

const getAllPayrolls = catchErrors(async (req, res) => {
  const { page = 1, limit = 12, employee, month, year, isPaid } = req.query;

  const query = {};

  // Check if user is admin by checking if they have employee populated with admin field
  const isAdmin = req.user.authority === "admin";

  // If not admin or employee query parameter matches user's ID, restrict to own payroll
  if (!isAdmin) {
    query.employee = req.user.id;
  } else if (employee) {
    query.employee = employee;
  }

  if (year) query.year = year;
  if (month) query.month = month;
  if (isPaid) query.isPaid = isPaid;

  const pageNumber = Math.max(parseInt(page), 1);
  const limitNumber = Math.max(parseInt(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const payrolls = await Payroll.find(query)
    .populate("employee", "employeeId name")
    .skip(skip)
    .limit(limitNumber)
    .sort({ year: -1, month: -1 });

  if (!payrolls) throw new Error("Payroll record not found");

  const totalPayrolls = await Payroll.countDocuments(query);
  const totalPages = Math.ceil(totalPayrolls / limitNumber);

  return res.status(200).json({
    success: true,
    payrolls,
    pagination: {
      currentPage: pageNumber,
      totalPages,
      totalPayrolls,
      limit: limitNumber,
    },
  });
});

const getPayrollByEmployee = catchErrors(async (req, res) => {
  const { employee, month, year } = req.query;

  if (!employee || !month || !year)
    throw new Error("Please provide employee, month, and year");

  const payroll = await Payroll.findOne({ employee, month, year }).populate(
    "employee",
    "name email"
  );

  if (!payroll) throw new Error("Payroll record not found");

  return res.status(200).json({
    success: true,
    payroll,
  });
});

const updatePayroll = catchErrors(async (req, res) => {
  const { payrollId } = req.params;
  const { allowances, bonuses, deductions } = req.body;

  const payroll = await Payroll.findById(payrollId).populate(
    "employee",
    "employeeId name"
  );
  if (!payroll) throw new Error("Payroll record not found");

  if (payroll.isPaid) throw new Error("Payroll already paid, can't update");

  payroll.allowances = allowances ?? payroll.allowances;
  payroll.deductions = deductions ?? payroll.deductions;
  payroll.bonuses = bonuses ?? payroll.bonuses;

  await payroll.save();

  return res.status(200).json({
    success: true,
    message: "Payroll updated successfully",
    payroll,
  });
});

const markAsPaid = catchErrors(async (req, res) => {
  const { payrollId } = req.params;

  const payroll = await Payroll.findById(payrollId).populate(
    "employee",
    "employeeId name"
  );
  if (!payroll) throw new Error("Payroll record not found");

  // Track previous state to detect status change
  const wasUnpaid = !payroll.isPaid;

  payroll.isPaid = !payroll.isPaid;

  if (payroll.isPaid) payroll.paymentDate = new Date();
  else payroll.paymentDate = null;

  await payroll.save();

  await createUpdate({
    employee: payroll.employee._id,
    status: payroll.isPaid ? "Paid" : "Not Paid",
    type: `Payroll - ${getMonthName(payroll.month)}`,
    remarks: "--",
  });

  // Send notification ONLY when transitioning from unpaid to paid
  if (payroll.isPaid && wasUnpaid) {
    const employeeData = await Employee.findById(payroll.employee._id);
    if (employeeData) {
      await sendFullNotification({
        employee: employeeData,
        title: "Salary Paid",
        message: `Your salary for ${getMonthName(payroll.month)} ${
          payroll.year
        } has been paid successfully.`,
        type: "payroll",
        priority: "high",
        link: "/payroll",
        emailSubject: "Salary Payment Confirmation",
        emailTemplate: "payrollGenerated",
        emailData: {
          month: getMonthName(payroll.month),
          year: payroll.year,
          netSalary: payroll.netSalary.toFixed(2),
          isPaid: true,
        },
      });
    }
  }

  return res.status(200).json({
    success: true,
    message: "Payroll marked status updated",
    payroll,
  });
});

const getEmployeePayrollHistory = catchErrors(async (req, res) => {
  const { employee } = req.params;

  const payrolls = await Payroll.find({ employee }).sort({
    year: -1,
    month: -1,
  });

  return res.status(200).json({
    success: true,
    payrolls,
  });
});

const deletePayroll = async (employee) => {
  if (!employee) throw new Error("Please provide employee Id");

  const payroll = await Payroll.deleteMany({ employee });

  if (payroll.deletedCount) return;

  return "Payroll deleted successfuly";
};

const generateEmployeeYearlyPayroll = async (
  employeeId,
  year = new Date().getFullYear()
) => {
  try {
    const currentYear = new Date().getFullYear();
    if (year < 2024 || year > currentYear + 1) {
      throw new Error(`Year must be between 2000 and ${currentYear + 1}`);
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) throw new Error("Employee not found");

    const existingRecords = await Payroll.countDocuments({
      employee: employeeId,
      year,
    });
    if (existingRecords > 0) {
      return;
    }

    const baseSalary = employee.salary || 30000;
    const payrollData = [];

    for (let month = 1; month <= 12; month++) {
      payrollData.push({
        employee: employee._id,
        month,
        year,
        baseSalary,
        allowances: 0,
        deductions: 0,
        bonuses: 0,
        netSalary: baseSalary,
        isPaid: false,
        paymentDate: null,
      });
    }

    await Payroll.insertMany(payrollData);

    return { success: true, recordsCreated: 12 };
  } catch (error) {
    throw error;
  }
};

const generatePayrollForNextYear = catchErrors(async (req, res) => {
  const year = currentYear + 1;
  const currentYear = new Date().getFullYear();

  if (year < 2024 || year > currentYear + 1) {
    throw new Error(`Year must be between 2024 and ${currentYear + 1}.`);
  }

  const employees = await Employee.find();
  if (!employees.length) throw new Error("No employees found.");

  const payrollData = [];

  for (const employee of employees) {
    const baseSalary = employee.salary || 0;

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

  return res.status(200).json({
    success: true,
    message: `Generated payroll data for all 12 months of ${year} for ${employees.length} employees.`,
  });
});

const generatePayrollForMonth = catchErrors(async (req, res) => {
  const { month, year } = req.body;

  if (!month || !year) throw new Error("Please provide month and year");

  const monthNum = parseInt(month);
  const yearNum = parseInt(year);

  const currentYear = new Date().getFullYear();
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12)
    throw new Error("Invalid month value");
  if (yearNum < 2024 || yearNum > currentYear + 1)
    throw new Error(`Year must be between 2024 and ${currentYear + 1}.`);

  const employees = await Employee.find();
  if (!employees.length) throw new Error("No employees found.");

  const payrollData = [];
  const createdEmployeeIds = [];
  let createdCount = 0;

  for (const employee of employees) {
    // skip if payroll already exists for this employee/month/year
    const exists = await Payroll.findOne({
      employee: employee._id,
      month: monthNum,
      year: yearNum,
    });
    if (exists) continue;

    const baseSalary = employee.salary || 0;
    payrollData.push({
      employee: employee._id,
      month: monthNum,
      year: yearNum,
      baseSalary,
      allowances: 0,
      deductions: 0,
      bonuses: 0,
      netSalary: baseSalary,
      isPaid: false,
      paymentDate: null,
    });
    createdEmployeeIds.push(employee._id);
    createdCount++;
  }

  if (payrollData.length > 0) {
    await Payroll.insertMany(payrollData);

    // Send per-employee notifications/email for newly created payrolls
    for (const empId of createdEmployeeIds) {
      try {
        const employeeData = await Employee.findById(empId).select(
          "name email salary"
        );
        if (!employeeData) continue;

        await sendFullNotification({
          employee: employeeData,
          title: "Payroll Generated",
          message: `Your payroll for ${getMonthName(
            monthNum
          )} ${yearNum} has been generated and is ready for review.`,
          type: "payroll",
          priority: "medium",
          link: "/payroll",
          emailSubject: "Payroll Generated",
          emailTemplate: "payrollGenerated",
          emailData: {
            month: getMonthName(monthNum),
            year: yearNum,
            netSalary: (employeeData.salary || 0).toFixed(2),
            isPaid: false,
          },
        });
      } catch (notifyErr) {
        // Log and continue - do not fail the whole generation because of notification error
        console.error(
          `Failed to notify employee ${empId}:`,
          notifyErr.message || notifyErr
        );
      }
    }
  }

  return res.status(200).json({
    success: true,
    message: `Generated payroll data for ${getMonthName(
      monthNum
    )} ${yearNum} for ${createdCount} employees (skipped existing records).`,
    created: createdCount,
  });
});

export {
  markAsPaid,
  deletePayroll,
  createPayroll,
  getAllPayrolls,
  updatePayroll,
  getPayrollByEmployee,
  getEmployeePayrollHistory,
  generatePayrollForNextYear,
  generatePayrollForMonth,
  generateEmployeeYearlyPayroll,
};
