import dotenv from "dotenv";
dotenv.config();

import * as bcrypt from "bcrypt";
// cloudinary removed - using local file storage helpers
import { myCache, formatDate, buildPublicUrl } from "../utils/index.js";
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

  // Validate required fields and return a clear field-specific error for UX
  const requiredFields = [
    ["employeeId", employeeId],
    ["name", name],
    ["dob", dob],
    ["email", email],
    ["password", password],
    ["phoneNumber", phoneNumber],
    ["address", address],
    ["department", department],
    ["role", role],
    ["dateOfJoining", dateOfJoining],
    ["gender", gender],
    ["martialStatus", martialStatus],
    ["employmentType", employmentType],
    ["shift", shift],
    ["salary", salary],
  ];

  for (const [fieldName, value] of requiredFields) {
    if (value === undefined || value === null || value === "" || (typeof value === "object" && Object.keys(value).length === 0)) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} is required`,
        field: fieldName,
      });
    }
  }

  // If address is present, validate subfields
  if (address) {
    const addressFields = ["street", "city", "state", "postalCode", "country"];
    for (const f of addressFields) {
      if (!address[f] || String(address[f]).trim() === "") {
        return res.status(400).json({
          success: false,
          message: `address.${f} is required`,
          field: `address.${f}`,
        });
      }
    }
  }

  // Check if email already exists
  const existingEmailEmployee = await Employee.findOne({ email });
  if (existingEmailEmployee) {
    return res.status(409).json({
      success: false,
      message: `Email '${email}' is already registered. Please use a different email.`,
      error: "Duplicate Entry",
      field: "email",
    });
  }

  // Check if employeeId already exists
  const existingIdEmployee = await Employee.findOne({ employeeId });
  if (existingIdEmployee) {
    return res.status(409).json({
      success: false,
      message: `Employee ID '${employeeId}' is already in use. Please use a different ID.`,
      error: "Duplicate Entry",
      field: "employeeId",
    });
  }

  // Check if phoneNumber already exists
  const existingPhoneEmployee = await Employee.findOne({ phoneNumber });
  if (existingPhoneEmployee) {
    return res.status(409).json({
      success: false,
      message: `Phone number '${phoneNumber}' is already registered. Please use a different phone number.`,
      error: "Duplicate Entry",
      field: "phoneNumber",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const shiftId = await convertShiftToObjectId(shift);

  const employee = await Employee.create({
    employeeId,
    name,
    dob,
    email,
    password: hashedPassword,
    profilePicture: req.file
      ? buildPublicUrl(req, `/uploads/images/${req.file.filename}`)
      : profilePicture,
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

// Public-facing employee list for authenticated employees (minimal fields)
const getPublicEmployees = catchErrors(async (req, res) => {
  const { role, name, department, status, page = 1, limit = 50 } = req.query;

  const cacheKey = `publicEmployees:${role || "all"}:${name || "all"}:${
    department || "all"
  }:${status || "all"}:page${page}:limit${limit}`;
  const cached = myCache.get(cacheKey);
  if (cached) {
    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully (cache)",
      ...cached,
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

  const employees = await Employee.find(query)
    .select("name employeeId profilePicture designation role department")
    .populate("designation", "name")
    .populate("role", "name")
    .populate("department", "name")
    .skip(skip)
    .limit(limitNumber)
    .lean();

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
    .populate("shift", "name startTime endTime graceTime")
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

  // Check if email is being changed and if it's already in use by another employee
  if (email) {
    const existingEmployee = await Employee.findOne({
      email,
      _id: { $ne: id },
    });
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: `Email '${email}' is already in use by another employee. Please use a different email.`,
        error: "Duplicate Entry",
        field: "email",
      });
    }
  }

  // Check if employeeId is being changed and if it's already in use by another employee
  if (employeeId) {
    const existingEmployee = await Employee.findOne({
      employeeId,
      _id: { $ne: id },
    });
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: `Employee ID '${employeeId}' is already in use by another employee. Please use a different ID.`,
        error: "Duplicate Entry",
        field: "employeeId",
      });
    }
  }

  // Check if phoneNumber is being changed and if it's already in use by another employee
  if (phoneNumber) {
    const existingEmployee = await Employee.findOne({
      phoneNumber,
      _id: { $ne: id },
    });
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: `Phone number '${phoneNumber}' is already in use by another employee. Please use a different phone number.`,
        error: "Duplicate Entry",
        field: "phoneNumber",
      });
    }
  }

  const shiftId = await convertShiftToObjectId(shift);

  const employee = await Employee.findByIdAndUpdate(
    id,
    {
      employeeId,
      name,
      dob,
      email,
      // if a file was uploaded, prefer its public URL; otherwise use incoming value
      profilePicture: req.file
        ? buildPublicUrl(req, `/uploads/images/${req.file.filename}`)
        : profilePicture,
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
    .populate("shift", "name startTime endTime graceTime")
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
    employee.profilePicture !== buildPublicUrl(req, `/unknown.jpeg`)
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
  if (req.file)
    employee.profilePicture = buildPublicUrl(
      req,
      `/uploads/images/${req.file.filename}`
    );

  await employee.save();

  // re-fetch with populated fields for a richer response
  const refreshed = await Employee.findById(id)
    .populate("department", "name")
    .populate("role", "name")
    .populate("shift", "name startTime endTime graceTime")
    .select("-password");

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    updatedProfile: {
      _id: refreshed._id,
      name: refreshed.name,
      email: refreshed.email,
      position: refreshed.role,
      department: refreshed.department,
      shift: refreshed.shift,
      employeeId: refreshed.employeeId,
      profilePicture: refreshed.profilePicture,
      authority: refreshed.admin ? "admin" : "employee",
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

export { getPublicEmployees };
