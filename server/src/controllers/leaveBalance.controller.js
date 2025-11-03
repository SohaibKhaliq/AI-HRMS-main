import { catchErrors, myCache } from "../utils/index.js";
import LeaveBalance from "../models/leaveBalance.model.js";
import LeaveType from "../models/leaveType.model.js";
import Employee from "../models/employee.model.js";

const initializeEmployeeBalance = catchErrors(async (req, res) => {
  const { employeeId, year } = req.body;

  if (!employeeId) throw new Error("Employee ID is required");

  const currentYear = year || new Date().getFullYear();

  // Check if employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) throw new Error("Employee not found");

  // Get all active leave types
  const leaveTypes = await LeaveType.find({ isActive: true });

  if (leaveTypes.length === 0) {
    throw new Error("No active leave types found. Please create leave types first.");
  }

  const balances = [];

  for (const leaveType of leaveTypes) {
    // Check if balance already exists
    const existing = await LeaveBalance.findOne({
      employee: employeeId,
      leaveType: leaveType._id,
      year: currentYear,
    });

    if (existing) {
      balances.push(existing);
      continue;
    }

    // Create new balance
    const balance = await LeaveBalance.create({
      employee: employeeId,
      leaveType: leaveType._id,
      year: currentYear,
      totalAllotted: leaveType.maxDaysPerYear,
      used: 0,
      pending: 0,
      available: leaveType.maxDaysPerYear,
      carriedForward: 0,
    });

    balances.push(balance);
  }

  myCache.del(`leaveBalance-${employeeId}-${currentYear}`);

  return res.status(201).json({
    success: true,
    message: "Leave balances initialized successfully",
    balances,
    count: balances.length,
  });
});

const getEmployeeBalance = catchErrors(async (req, res) => {
  const { employeeId } = req.params;
  const { year } = req.query;

  if (!employeeId) throw new Error("Employee ID is required");

  const currentYear = year ? parseInt(year) : new Date().getFullYear();

  const cacheKey = `leaveBalance-${employeeId}-${currentYear}`;
  const cached = myCache.get(cacheKey);
  if (cached) {
    return res.status(200).json({
      success: true,
      message: "Leave balances fetched (cache)",
      balances: cached,
    });
  }

  const balances = await LeaveBalance.find({
    employee: employeeId,
    year: currentYear,
  })
    .populate("leaveType", "name code color isPaid")
    .lean();

  myCache.set(cacheKey, balances);

  return res.status(200).json({
    success: true,
    message: "Leave balances fetched successfully",
    balances,
    year: currentYear,
  });
});

const getMyBalance = catchErrors(async (req, res) => {
  const employeeId = req.user.id;
  const { year } = req.query;

  const currentYear = year ? parseInt(year) : new Date().getFullYear();

  const balances = await LeaveBalance.find({
    employee: employeeId,
    year: currentYear,
  })
    .populate("leaveType", "name code color isPaid")
    .lean();

  return res.status(200).json({
    success: true,
    message: "Your leave balances fetched successfully",
    balances,
    year: currentYear,
  });
});

const updateBalance = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { used, pending, carriedForward } = req.body;

  if (!id) throw new Error("Balance ID is required");

  const balance = await LeaveBalance.findById(id);
  if (!balance) throw new Error("Leave balance not found");

  if (used !== undefined) balance.used = used;
  if (pending !== undefined) balance.pending = pending;
  if (carriedForward !== undefined) balance.carriedForward = carriedForward;

  await balance.save(); // This triggers pre-save hook to recalculate available

  const populated = await LeaveBalance.findById(id)
    .populate("leaveType", "name code color")
    .populate("employee", "name employeeId");

  myCache.del(`leaveBalance-${balance.employee}-${balance.year}`);

  return res.status(200).json({
    success: true,
    message: "Leave balance updated successfully",
    balance: populated,
  });
});

const adjustBalance = catchErrors(async (req, res) => {
  const { employeeId, leaveTypeId, year, adjustment, reason } = req.body;

  if (!employeeId || !leaveTypeId || !adjustment) {
    throw new Error("Employee ID, leave type ID, and adjustment are required");
  }

  const currentYear = year || new Date().getFullYear();

  let balance = await LeaveBalance.findOne({
    employee: employeeId,
    leaveType: leaveTypeId,
    year: currentYear,
  });

  if (!balance) {
    // Create if doesn't exist
    const leaveType = await LeaveType.findById(leaveTypeId);
    if (!leaveType) throw new Error("Leave type not found");

    balance = await LeaveBalance.create({
      employee: employeeId,
      leaveType: leaveTypeId,
      year: currentYear,
      totalAllotted: leaveType.maxDaysPerYear + adjustment,
      used: 0,
      pending: 0,
      available: leaveType.maxDaysPerYear + adjustment,
      carriedForward: 0,
    });
  } else {
    balance.totalAllotted += adjustment;
    await balance.save();
  }

  const populated = await LeaveBalance.findById(balance._id)
    .populate("leaveType", "name code")
    .populate("employee", "name");

  myCache.del(`leaveBalance-${employeeId}-${currentYear}`);

  return res.status(200).json({
    success: true,
    message: `Leave balance adjusted by ${adjustment} days. Reason: ${reason || "N/A"}`,
    balance: populated,
  });
});

const carryForwardBalances = catchErrors(async (req, res) => {
  const { fromYear, toYear } = req.body;

  if (!fromYear || !toYear) {
    throw new Error("From year and to year are required");
  }

  // Get all balances from previous year
  const previousBalances = await LeaveBalance.find({ year: fromYear })
    .populate("leaveType")
    .populate("employee");

  const results = [];

  for (const prevBalance of previousBalances) {
    const leaveType = prevBalance.leaveType;

    // Skip if carry forward not allowed
    if (!leaveType.carryForward) {
      results.push({
        employee: prevBalance.employee._id,
        leaveType: leaveType._id,
        carriedForward: 0,
        reason: "Carry forward not allowed for this leave type",
      });
      continue;
    }

    // Calculate carry forward amount
    const availableToCarry = Math.min(
      prevBalance.available,
      leaveType.carryForwardLimit || prevBalance.available
    );

    // Check if balance exists for new year
    let newBalance = await LeaveBalance.findOne({
      employee: prevBalance.employee._id,
      leaveType: leaveType._id,
      year: toYear,
    });

    if (newBalance) {
      // Update existing
      newBalance.carriedForward = availableToCarry;
      await newBalance.save();
    } else {
      // Create new
      newBalance = await LeaveBalance.create({
        employee: prevBalance.employee._id,
        leaveType: leaveType._id,
        year: toYear,
        totalAllotted: leaveType.maxDaysPerYear,
        used: 0,
        pending: 0,
        available: leaveType.maxDaysPerYear + availableToCarry,
        carriedForward: availableToCarry,
      });
    }

    results.push({
      employee: prevBalance.employee._id,
      leaveType: leaveType._id,
      carriedForward: availableToCarry,
      newBalance: newBalance._id,
    });

    myCache.del(`leaveBalance-${prevBalance.employee._id}-${toYear}`);
  }

  return res.status(200).json({
    success: true,
    message: `Carried forward balances from ${fromYear} to ${toYear}`,
    results,
    count: results.length,
  });
});

const deleteBalance = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Balance ID is required");

  const balance = await LeaveBalance.findByIdAndDelete(id);
  if (!balance) throw new Error("Leave balance not found");

  myCache.del(`leaveBalance-${balance.employee}-${balance.year}`);

  return res.status(200).json({
    success: true,
    message: "Leave balance deleted successfully",
  });
});

const getAllBalances = catchErrors(async (req, res) => {
  const { year } = req.query;
  const currentYear = year ? parseInt(year) : new Date().getFullYear();

  const balances = await LeaveBalance.find({ year: currentYear })
    .populate("employee", "name employeeId email")
    .populate("leaveType", "name code color")
    .sort({ employee: 1 })
    .lean();

  return res.status(200).json({
    success: true,
    message: "All leave balances fetched successfully",
    balances,
    year: currentYear,
    count: balances.length,
  });
});

export {
  initializeEmployeeBalance,
  getEmployeeBalance,
  getMyBalance,
  updateBalance,
  adjustBalance,
  carryForwardBalances,
  deleteBalance,
  getAllBalances,
};
