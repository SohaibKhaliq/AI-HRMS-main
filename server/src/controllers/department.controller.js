import { myCache } from "../utils/index.js";
import { catchErrors } from "../utils/index.js";
import Employee from "../models/employee.model.js";
import Department from "../models/department.model.js";

const createDepartment = catchErrors(async (req, res) => {
  const { name, description, status, createdAt } = req.body;

  if (!name) throw new Error("Please provide department name");

  const departmentData = {
    name,
    status: status || "Active",
  };

  if (description) departmentData.description = description;
  if (createdAt) departmentData.createdAt = new Date(createdAt);

  const department = await Department.create(departmentData);

  myCache.del("insights");
  myCache.del("department");

  return res.status(201).json({
    success: true,
    message: "Department created successfully",
    department,
  });
});

const getAllDepartments = catchErrors(async (req, res) => {
  const cacheKey = "department";

  const cachedDepartments = myCache.get(cacheKey);
  if (cachedDepartments) {
    return res.status(200).json({
      success: true,
      message: "Departments fetched successfully (from cache)",
      department: cachedDepartments,
    });
  }

  const department = await Department.find().lean();

  myCache.set(cacheKey, department);

  if (!department) throw new Error("No departments found");

  return res.status(200).json({
    success: true,
    message: "Departments fetched successfully",
    department,
  });
});

// Function to get department employees is deprecated when head was removed.

const getDepartmentById = catchErrors(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Error("Please provide department Id");

  const department = await Department.findById(id).lean();

  return res.status(200).json({
    success: true,
    message: "Department fetched successfully",
    department,
  });
});

// getDepartmentEmployees removed — department head concept removed

const deleteDepartment = catchErrors(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Error("Please provide departmed Id");

  await Department.findByIdAndDelete(id);

  myCache.del("insights");
  myCache.del("department");

  return res.status(200).json({
    success: true,
    message: "Department deleted successfuly",
  });
});

const updateDepartment = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { name, head, description, status, createdAt } = req.body;

  if (!id) throw new Error("Please provide departmed Id");

  const updateData = { name, description, status };
  if (createdAt) updateData.createdAt = new Date(createdAt);

  const department = await Department.findByIdAndUpdate(id, updateData, {
    new: true,
  }).lean();

  myCache.del("insights");
  myCache.del("department");

  return res.status(200).json({
    success: true,
    message: "Department updated successfuly",
    department,
  });
});

const getDepartmentEmployees = catchErrors(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Error("Please provide department Id");

  const cacheKey = `department_employees_${id}`;
  const cachedEmployees = myCache.get(cacheKey);
  if (cachedEmployees) {
    return res.status(200).json({
      success: true,
      message: "Department employees fetched successfully (from cache)",
      employees: cachedEmployees,
    });
  }

  const department = await Department.findById(id).lean();
  if (!department) throw new Error("Department not found");

  const employees = await Employee.find({ department: id }).lean();

  myCache.set(cacheKey, employees);

  return res.status(200).json({
    success: true,
    message: "Department employees fetched successfully",
    employees,
  });
});

export {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  deleteDepartment,
  updateDepartment,
  getDepartmentEmployees,
};
