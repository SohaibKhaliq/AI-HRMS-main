import dotenv from "dotenv";
dotenv.config();

import * as bcrypt from "bcrypt";
// cloudinary removed - using local file storage helpers
import { myCache, formatDate } from "../utils/index.js";
import Employee from "../models/employee.model.js";
import Shift from "../models/shift.model.js";
import Department from "../models/department.model.js";
import Designation from "../models/designation.model.js";
import { catchErrors, getPublicIdFromUrl } from "../utils/index.js";
import {
  addPerformanceWithKPI,
  deletePerformance,
} from "./performance.controller.js";
import {
  deletePayroll,
  generateEmployeeYearlyPayroll,
} from "./payroll.controller.js";
import { deleteFeedback } from "./feedback.controller.js";
import { deleteComplaint } from "./complaint.controller.js";
import { deleteLeave, getEmployeeLeaveStatus } from "./leave.controller.js";
import { sendEmailNotification } from "../services/notification.service.js";

const clearEmployeeCache = () => {
  const cacheKeys = myCache.keys();
  cacheKeys.forEach((key) => {
    if (key.startsWith("employees:")) {
      myCache.del(key);
    }
  });
};

// Helper function to convert shift strings to ObjectIds
const convertShiftToObjectId = async (shiftValue) => {
  if (!shiftValue) return null;

  // If already an ObjectId, return as is
  if (typeof shiftValue !== "string") return shiftValue;

  // If it's a shift name string, convert to ObjectId
  if (["Morning", "Evening", "Night"].includes(shiftValue)) {
    // Try both formats: "Morning" and "Morning Shift"
    let shiftDoc = await Shift.findOne({ name: shiftValue });
    if (!shiftDoc) {
      shiftDoc = await Shift.findOne({ name: `${shiftValue} Shift` });
    }
    return shiftDoc ? shiftDoc._id : null;
  }

  // If it's already an ObjectId string, return it
  return shiftValue;
};

const bulkCreateEmployees = catchErrors(async (req, res) => {
  const employeesRecords = req.body;

  if (!Array.isArray(employeesRecords)) {
    throw new Error("Please provide an array of employee data.");
  }

  employeesRecords.forEach((employee) => {
    if (
      !employee.employeeId ||
      !employee.name ||
      !employee.dob ||
      !employee.email ||
      !employee.phoneNumber ||
      !employee.department ||
      !employee.role ||
      !employee.gender ||
      !employee.martialStatus ||
      !employee.employmentType ||
      !employee.shift ||
      !employee.salary
    ) {
      throw new Error("Please provide all required fields for each employee.");
    }
  });

  const hashedEmployeesData = await Promise.all(
    employeesRecords.map(async (employee) => {
      const hashedPassword = await bcrypt.hash("password", 10);
      const shiftId = await convertShiftToObjectId(employee.shift);
      return { ...employee, password: hashedPassword, shift: shiftId };
    })
  );

  const insertedEmployees = await Employee.insertMany(hashedEmployeesData);

  const result = await Employee.find({
    _id: { $in: insertedEmployees.map((emp) => emp._id) },
  })
    .populate("department", "name")
    .populate("role", "name");

  clearEmployeeCache();

  return res.status(201).json({
    success: true,
    message: `${result.length} employees uploaded successfully.`,
    employees: result,
  });
});

const createEmployee = catchErrors(async (req, res) => {
  const {
    employeeId,
    name,
    dob,
    email,
    password,
    profilePicture,
    phoneNumber,
    address,
    department,
    role,
    dateOfJoining,
    gender,
    martialStatus,
    employmentType,
    shift,
    status,
    salary,
    bankDetails,
    emergencyContact,
    leaveBalance,
    admin,
  } = req.body;

  if (
    !employeeId ||
    !name ||
    !dob ||
    !email ||
    !password ||
    !phoneNumber ||
    !address ||
    !department ||
    !role ||
    !dateOfJoining ||
    !gender ||
    !martialStatus ||
    !employmentType ||
    !shift ||
    !salary
  ) {
    throw new Error("Please provide all required fields.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const shiftId = await convertShiftToObjectId(shift);

  const employee = await Employee.create({
    employeeId,
    name,
    dob,
    email,
    password: hashedPassword,
    profilePicture,
    phoneNumber,
    address,
    department,
    role,
    dateOfJoining,
    gender,
    martialStatus,
    employmentType,
    shift: shiftId,
    status: status || "Active",
    salary,
    bankDetails,
    emergencyContact,
    leaveBalance: leaveBalance || 0,
    admin: admin || false,
  });

  await addPerformanceWithKPI(employee._id);
  await generateEmployeeYearlyPayroll(employee);
  clearEmployeeCache();

  // Send welcome email to new employee
  try {
    // Fetch the created employee with populated fields
    const createdEmployee = await Employee.findById(employee._id)
      .populate("department", "name")
      .populate("designation", "name");

    await sendEmailNotification({
      email: email,
      subject: "Welcome to Metro HRMS!",
      templateName: "employeeOnboarding",
      templateData: {
        employeeName: name,
        employeeId: employeeId,
        department: createdEmployee?.department?.name || "N/A",
        designation: createdEmployee?.designation?.name || "N/A",
        startDate: formatDate(dateOfJoining),
        email: email,
        temporaryPassword: "Please check with HR for your password",
      },
    });
  } catch (err) {
    console.error("Failed to send onboarding email:", err);
  }

  return res.status(201).json({
    success: true,
    message: "Employee created successfully",
    employee,
  });
});

const getAllEmployees = catchErrors(async (req, res) => {
  const { role, name, department, status, page = 1, limit = 12 } = req.query;

  const cacheKey = `employees:${role || "all"}:${name || "all"}:${
    department || "all"
  }:${status || "all"}:page${page}:limit${limit}`;

  const cachedData = myCache.get(cacheKey);
  if (cachedData) {
    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully (from cache)",
      ...cachedData,
    });
  }

  const query = {};
  if (role) query.role = role;
  if (status && status !== "On Leave") query.status = status;
  if (department) query.department = department;
  if (name) query.name = { $regex: name, $options: "i" };

  const pageNumber = Math.max(parseInt(page), 1);
  const limitNumber = Math.max(parseInt(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  let employees = await Employee.find(query)
    .populate("department", "name")
    .populate("role", "name")
    .select("-password")
    .skip(skip)
    .limit(limitNumber)
    .lean();

  employees = await Promise.all(
    employees.map(async (emp) => {
      const leaveStatus = await getEmployeeLeaveStatus(emp._id);
      return {
        ...emp,
        status: leaveStatus === "On Leave" ? "On Leave" : emp.status,
      };
    })
  );

  if (status === "On Leave") {
    employees = employees.filter((emp) => emp.status === "On Leave");
  }

  const totalEmployees = await Employee.countDocuments(query);
  const totalPages = Math.ceil(totalEmployees / limitNumber);

  const responseData = {
    employees,
    pagination: {
      currentPage: pageNumber,
      totalPages,
      totalEmployees,
      limit: limitNumber,
    },
  };

  myCache.set(cacheKey, responseData);

  return res.status(200).json({
    success: true,
    message: "Employees fetched successfully",
    ...responseData,
  });
});

const getEmployeeById = catchErrors(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Error("Please provide employee Id");

  const employee = await Employee.findById(id)
    .populate("department", "name")
    .populate("role", "name")
    .select("-password");

  return res.status(200).json({
    success: true,
    message: "Employee fetched successfuly",
    employee,
  });
});

const deleteEmployee = catchErrors(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Error("Please provide employee Id");

  await Employee.findByIdAndDelete(id);

  await Promise.all([
    deleteLeave(id),
    deletePayroll(id),
    deleteFeedback(id),
    deleteComplaint(id),
    deletePerformance(id),
  ]);

  myCache.del("insights");
  clearEmployeeCache();

  return res.status(200).json({
    success: true,
    message: "Employee deleted successfuly",
  });
});

const updateEmployee = catchErrors(async (req, res) => {
  const { id } = req.params;
  const {
    employeeId,
    name,
    dob,
    email,
    profilePicture,
    phoneNumber,
    address,
    department,
    role,
    dateOfJoining,
    gender,
    martialStatus,
    employmentType,
    shift,
    status,
    salary,
    bankDetails,
    emergencyContact,
    leaveBalance,
    admin,
  } = req.body;

  if (!id) throw new Error("Please provide employee Id");

  const shiftId = await convertShiftToObjectId(shift);

  const employee = await Employee.findByIdAndUpdate(
    id,
    {
      employeeId,
      name,
      dob,
      email,
      profilePicture,
      phoneNumber,
      address,
      department,
      role,
      dateOfJoining,
      gender,
      martialStatus,
      employmentType,
      shift: shiftId,
      status,
      salary,
      bankDetails,
      emergencyContact,
      leaveBalance,
      admin,
    },
    { new: true }
  )
    .populate("department", "name")
    .populate("role", "name")
    .select("-password");

  myCache.del("insights");
  clearEmployeeCache();

  return res.status(200).json({
    success: true,
    message: "Employee updated successfuly",
    employee,
  });
});

const updateProfile = catchErrors(async (req, res) => {
  const id = req.user.id;
  const { name, email } = req.body;

  const employee = await Employee.findById(id);

  if (
    req.file &&
    employee.profilePicture !== `${process.env.CLIENT_URL}/unknown.jpeg`
  ) {
    try {
      const { deleteUploadedFile } = await import("../utils/index.js");
      await deleteUploadedFile(employee.profilePicture);
    } catch (err) {
      console.log("Error deleting old profile image file:", err.message);
    }
  }

  if (name) employee.name = name;
  if (email) employee.email = email;
  if (req.file) employee.profilePicture = req.file.path;

  await employee.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    updatedProfile: {
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      position: employee.role,
      department: employee.department,
      employeeId: employee.employeeId,
      profilePicture: employee.profilePicture,
      authority: employee.admin ? "admin" : "employee",
    },
  });
});

const changeEmployeePassword = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!id) throw new Error("Please provide employee Id");
  if (!password || password.length < 6)
    throw new Error("Password must be at least 6 characters");

  const hashed = await bcrypt.hash(password, 10);
  await Employee.findByIdAndUpdate(id, { password: hashed });
  clearEmployeeCache();

  return res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
});

export {
  updateProfile,
  updateEmployee,
  deleteEmployee,
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  bulkCreateEmployees,
  changeEmployeePassword,
};
