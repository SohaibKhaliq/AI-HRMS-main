import { catchErrors, myCache } from "../utils/index.js";
import LeaveType from "../models/leaveType.model.js";

const createLeaveType = catchErrors(async (req, res) => {
  const {
    name,
    code,
    description,
    maxDaysPerYear,
    carryForward,
    carryForwardLimit,
    isPaid,
    requiresApproval,
    requiresDocument,
    minDaysNotice,
    allowHalfDay,
    color,
  } = req.body;

  if (!name || !code || maxDaysPerYear === undefined) {
    throw new Error("Name, code, and maxDaysPerYear are required");
  }

  // Check for duplicate leave type name
  const existingName = await LeaveType.findOne({ name });
  if (existingName) {
    const error = new Error(
      `Leave type name '${name}' is already in use. Please use a different name.`
    );
    error.statusCode = 409;
    throw error;
  }

  // Check for duplicate leave type code
  const upperCode = code.toUpperCase();
  const existingCode = await LeaveType.findOne({ code: upperCode });
  if (existingCode) {
    const error = new Error(
      `Leave type code '${upperCode}' is already in use. Please use a different code.`
    );
    error.statusCode = 409;
    throw error;
  }

  const leaveType = await LeaveType.create({
    name,
    code: upperCode,
    description: description || "",
    maxDaysPerYear,
    carryForward: carryForward || false,
    carryForwardLimit: carryForwardLimit || 0,
    isPaid: isPaid !== undefined ? isPaid : true,
    requiresApproval: requiresApproval !== undefined ? requiresApproval : true,
    requiresDocument: requiresDocument || false,
    minDaysNotice: minDaysNotice || 0,
    allowHalfDay: allowHalfDay !== undefined ? allowHalfDay : true,
    color: color || "#3B82F6",
  });

  myCache.del("leaveTypes");

  return res.status(201).json({
    success: true,
    message: "Leave type created successfully",
    leaveType,
  });
});

const getAllLeaveTypes = catchErrors(async (req, res) => {
  const cacheKey = "leaveTypes";
  const cached = myCache.get(cacheKey);
  if (cached) {
    return res.status(200).json({
      success: true,
      message: "Leave types fetched (cache)",
      leaveTypes: cached,
    });
  }

  const leaveTypes = await LeaveType.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();
  myCache.set(cacheKey, leaveTypes);

  return res.status(200).json({
    success: true,
    message: "Leave types fetched successfully",
    leaveTypes,
  });
});

const getLeaveTypeById = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Leave type ID is required");

  const leaveType = await LeaveType.findById(id);
  if (!leaveType) throw new Error("Leave type not found");

  return res.status(200).json({
    success: true,
    message: "Leave type fetched successfully",
    leaveType,
  });
});

const updateLeaveType = catchErrors(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) throw new Error("Leave type ID is required");

  // Check for duplicate leave type name (excluding current record)
  if (updateData.name) {
    const existingName = await LeaveType.findOne({
      name: updateData.name,
      _id: { $ne: id },
    });
    if (existingName) {
      const error = new Error(
        `Leave type name '${updateData.name}' is already in use. Please use a different name.`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  // Check for duplicate leave type code (excluding current record)
  if (updateData.code) {
    updateData.code = updateData.code.toUpperCase();
    const existingCode = await LeaveType.findOne({
      code: updateData.code,
      _id: { $ne: id },
    });
    if (existingCode) {
      const error = new Error(
        `Leave type code '${updateData.code}' is already in use. Please use a different code.`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  const leaveType = await LeaveType.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!leaveType) throw new Error("Leave type not found");

  myCache.del("leaveTypes");

  return res.status(200).json({
    success: true,
    message: "Leave type updated successfully",
    leaveType,
  });
});

const deleteLeaveType = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Leave type ID is required");

  const leaveType = await LeaveType.findByIdAndDelete(id);
  if (!leaveType) throw new Error("Leave type not found");

  myCache.del("leaveTypes");

  return res.status(200).json({
    success: true,
    message: "Leave type deleted successfully",
  });
});

export {
  createLeaveType,
  getAllLeaveTypes,
  getLeaveTypeById,
  updateLeaveType,
  deleteLeaveType,
};
