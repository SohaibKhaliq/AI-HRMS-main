import Leave from "../models/leave.model.js";
import Payroll from "../models/payroll.model.js";
import Employee from "../models/employee.model.js";
import LeaveType from "../models/leaveType.model.js";
import LeaveBalance from "../models/leaveBalance.model.js";
import { getSubstitute } from "../predictions/index.js";
import { enqueueAnalysisJob } from "../services/analysisQueue.service.js";
import { broadcastNotification } from "../socket/index.js";
import { catchErrors, formatDate, myCache } from "../utils/index.js";
import { leaveRespond, notifySubstituteEmployee } from "../templates/index.js";
import { createUpdate } from "./update.controller.js";
import {
  sendFullNotification,
  createBulkNotifications,
} from "../services/notification.service.js";
import { sendNotificationToUser } from "../socket/index.js";

const getLeaves = catchErrors(async (req, res) => {
  const { status = "pending" } = req.query;

  const leaves = await Leave.find({ status: { $regex: status, $options: "i" } })
    .populate({
      path: "employee",
      select: "name employeeId department role",
      populate: [
        { path: "department", select: "name" },
        { path: "role", select: "name" },
      ],
    })
    .populate("leaveType", "name")
    .populate({
      path: "substitute",
      select: "name department role",
      populate: [
        { path: "department", select: "name" },
        { path: "role", select: "name" },
      ],
    });

  return res.status(200).json({
    success: true,
    message: "Leaves fetched successfully",
    leaves,
  });
});

const getEmployeesOnLeave = catchErrors(async (req, res) => {
  const { date } = req.query;

  const formattedDate = new Date(date);

  const leaves = await Leave.find({
    status: "Approved",
    $or: [
      { fromDate: { $lte: formattedDate }, toDate: { $gte: formattedDate } },
      { fromDate: { $lte: formattedDate }, toDate: null },
    ],
  })
    .populate({
      path: "employee",
      select: "name employeeId department role shift",
      populate: [
        { path: "department", select: "name" },
        { path: "role", select: "name" },
      ],
    })
    .populate({
      path: "leaveType",
      select: "name",
    })
    .populate("substitute", "name");

  return res.status(200).json({
    success: true,
    message: "Leaves fetched successfully",
    leaves,
  });
});

const getMyLeaves = catchErrors(async (req, res) => {
  const employeeId = req.user.id;

  const leaves = await Leave.find({ employee: employeeId })
    .populate("leaveType", "name")
    .populate("substitute", "name")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "Your leaves fetched successfully",
    leaves,
  });
});

const applyLeave = catchErrors(async (req, res) => {
  const employeeId = req.user.id;
  const { leaveType, duration, fromDate, toDate, description } = req.body;

  if (!employeeId || !leaveType || !fromDate || !toDate)
    throw new Error("All fields are required");

  // Validate leave type exists
  const leaveTypeDoc = await LeaveType.findById(leaveType);
  if (!leaveTypeDoc) {
    throw new Error("Invalid leave type selected");
  }

  // Check leave balance for the current year
  const currentYear = new Date(fromDate).getFullYear();
  const leaveBalance = await LeaveBalance.findOne({
    employee: employeeId,
    leaveType: leaveType,
    year: currentYear,
  });

  if (!leaveBalance) {
    throw new Error(
      `Leave balance not initialized for ${leaveTypeDoc.name}. Please contact HR to initialize your leave balances.`
    );
  }

  // Validate sufficient available days
  if (leaveBalance.available < duration) {
    throw new Error(
      `Insufficient leave balance. You have ${leaveBalance.available} days available for ${leaveTypeDoc.name}, but requested ${duration} days.`
    );
  }

  // Update pending leave days
  leaveBalance.pending += duration;
  await leaveBalance.save();

  const leave = await Leave.create({
    employee: employeeId,
    leaveType,
    fromDate,
    toDate,
    duration,
    description,
    status: "Pending",
  });

  // Populate leave for response
  const populatedLeave = await Leave.findById(leave._id)
    .populate("leaveType", "name")
    .populate("employee", "name email");

  // Get employee details
  const employee = await Employee.findById(employeeId);

  // Send notification to employee
  if (employee) {
    sendFullNotification({
      employee,
      title: "Leave Application Submitted",
      message: `Your ${leaveTypeDoc.name} application for ${duration} days has been submitted successfully and is pending approval.`,
      type: "leave",
      priority: "medium",
      link: "/leave",
      emailSubject: "Leave Application Submitted",
      emailTemplate: "leaveApplied",
      emailData: {
        leaveType: leaveTypeDoc.name,
        fromDate: formatDate(fromDate),
        toDate: formatDate(toDate),
        duration: duration,
      },
    }).catch((e) =>
      console.warn(
        "Non-fatal: leave apply notification failed:",
        e && e.message ? e.message : e
      )
    );
  }

  // Notify all admins about new leave application
  try {
    const admins = await Employee.find({ admin: true }).select("_id name");
    if (admins && admins.length > 0) {
      // Create in-app notifications for all admins
      const adminNotifications = await createBulkNotifications(
        admins.map((admin) => admin._id),
        {
          title: "New Leave Application",
          message: `${employee?.name || "An employee"} has applied for ${
            leaveTypeDoc.name
          } (${duration} days) from ${formatDate(fromDate)} to ${formatDate(
            toDate
          )}.`,
          type: "leave",
          priority: "high",
          link: "/admin/leave",
          metadata: {
            leaveId: leave._id,
            employeeId: employeeId,
            employeeName: employee?.name,
            leaveType: leaveTypeDoc.name,
            duration: duration,
          },
        }
      );

      // Send real-time socket notifications to online admins
      admins.forEach((admin) => {
        try {
          sendNotificationToUser(admin._id.toString(), "notification", {
            _id: adminNotifications[0]?._id,
            title: "New Leave Application",
            message: `${employee?.name || "An employee"} has applied for ${
              leaveTypeDoc.name
            } (${duration} days)`,
            type: "leave",
            priority: "high",
            link: "/admin/leave",
            createdAt: new Date(),
          });
        } catch (socketError) {
          console.log(`Admin ${admin._id} not connected via socket`);
        }
      });
    }
  } catch (notifyError) {
    console.warn("Non-fatal: admin notification failed:", notifyError.message);
  }

  myCache.del("insights");

  return res.status(201).json({
    success: true,
    message: "Leave applied successfully",
    leave: populatedLeave,
  });
});

const rejectLeave = async (leave, remarks) => {
  leave.status = "Rejected";
  if (remarks) leave.remarks = remarks;
  await leave.save();

  // Update leave balance - remove from pending
  const currentYear = new Date(leave.fromDate).getFullYear();
  const leaveBalance = await LeaveBalance.findOne({
    employee: leave.employee._id,
    leaveType: leave.leaveType._id,
    year: currentYear,
  });

  if (leaveBalance) {
    leaveBalance.pending = Math.max(0, leaveBalance.pending - leave.duration);
    await leaveBalance.save();
  }

  await createUpdate({
    employee: leave.employee._id,
    status: leave.status,
    type: `Leave - ${leave.leaveType?.name || leave.leaveType}`,
    remarks: leave.remarks || "--",
  });

  // Send notification with email using new service
  const employee = await Employee.findById(leave.employee._id);
  if (employee) {
    sendFullNotification({
      employee,
      title: "Leave Application Rejected",
      message: `Your ${
        leave.leaveType?.name || "leave"
      } application has been rejected. ${remarks || ""}`,
      type: "leave",
      priority: "high",
      link: "/leave",
      emailSubject: "Leave Application Not Approved",
      emailTemplate: "leaveRejected",
      emailData: {
        leaveType: leave.leaveType?.name || "Leave",
        fromDate: formatDate(leave.fromDate),
        toDate: formatDate(leave.toDate),
        reason: remarks || "No specific reason provided",
      },
    }).catch((e) =>
      console.warn(
        "Non-fatal: leave rejection notification failed:",
        e && e.message ? e.message : e
      )
    );
  }

  return {
    success: true,
    message: "Leave rejected successfully",
    leave,
  };
};

const deductFromLeaveBalance = (employee, duration) => {
  const daysFromBalance = Math.min(employee.leaveBalance, duration);
  const daysFromSalary = duration - daysFromBalance;

  if (daysFromBalance > 0) {
    employee.leaveBalance -= daysFromBalance;
  }

  return { daysFromBalance, daysFromSalary };
};

const deductFromSalary = async (
  employeeId,
  fromDate,
  days,
  existingRemarks = ""
) => {
  const date = new Date(fromDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const payrollData = await Payroll.findOne({
    employee: employeeId,
    year,
    month,
  });

  if (!payrollData) {
    // If no payroll record exists for this month, skip deduction
    return `${existingRemarks}No payroll record found for ${month}/${year}. Deduction will be applied when payroll is generated.`;
  }

  const deductionAmount = 1000 * days;
  payrollData.deductions += deductionAmount;
  payrollData.netSalary -= deductionAmount;
  await payrollData.save();

  return `${existingRemarks}Pay deducted for ${days} days (${deductionAmount.toFixed(
    2
  )}).`;
};

const approveLeave = async (leave, employee) => {
  leave.status = "Approved";

  // Update leave balance - move from pending to used
  const currentYear = new Date(leave.fromDate).getFullYear();
  const leaveBalance = await LeaveBalance.findOne({
    employee: leave.employee,
    leaveType: leave.leaveType._id,
    year: currentYear,
  });

  if (leaveBalance) {
    leaveBalance.pending = Math.max(0, leaveBalance.pending - leave.duration);
    leaveBalance.used += leave.duration;
    await leaveBalance.save();
    leave.remarks = `${leave.duration} days deducted from ${
      leave.leaveType?.name || "leave"
    } balance. `;
  } else {
    // Fallback to old system if leave balance not found
    if (employee.leaveBalance > 0) {
      const { daysFromBalance, daysFromSalary } = deductFromLeaveBalance(
        employee,
        leave.duration
      );

      if (daysFromBalance > 0) {
        leave.remarks = `${daysFromBalance} days deducted from leave balance. `;
      }

      if (daysFromSalary > 0) {
        leave.remarks = await deductFromSalary(
          leave.employee,
          leave.fromDate,
          daysFromSalary,
          leave.remarks
        );
      }
    } else {
      leave.remarks = await deductFromSalary(
        leave.employee,
        leave.fromDate,
        leave.duration
      );
    }
  }

  // Get shift name (handle both populated object and string)
  const shiftName = employee.shift?.name || employee.shift || "Morning";

  // Do NOT auto-assign substitute here. Instead, enqueue a substitute analysis job
  // and notify admins so they can review and assign the substitute manually.
  let subsMsg = "Substitute will be assigned by admin";

  try {
    // Build payload for substitute analysis (prefer department/skills from employee)
    const payload = {
      targetEmployeeId: String(leave.employee),
      topK: 5,
      scope: {},
    };

    const empFull = await Employee.findById(payload.targetEmployeeId)
      .select("department skills")
      .lean();
    if (empFull) {
      if (empFull.department) payload.scope.department = empFull.department;
      if (Array.isArray(empFull.skills) && empFull.skills.length)
        payload.requiredSkills = empFull.skills;
    }

    // Enqueue background analysis job to compute substitute candidates
    const job = await enqueueAnalysisJob(
      "substitute",
      String(leave._id),
      payload
    );

    // Mark leave as requiring admin-assigned substitute
    leave.substituteRequested = true;
    leave.substituteRequestedAt = new Date();

    // Broadcast a simple analysis:progress event so UIs can react to the new job
    try {
      broadcastNotification("analysis:progress", {
        job: {
          id: job._id,
          status: job.status || "pending",
          type: job.type,
          refId: job.refId,
        },
      });
    } catch (e) {
      console.warn(
        "Failed to broadcast analysis job event:",
        e && e.message ? e.message : e
      );
    }

    // Notify admins to assign substitute (create in-app notifications)
    try {
      const admins = await Employee.find({ admin: true }).select(
        "_id name email"
      );
      if (admins && admins.length > 0) {
        await createBulkNotifications(
          admins.map((a) => a._id),
          {
            title: "Substitute Assignment Required",
            message: `${
              employee?.name || "An employee"
            } has an approved leave. Please assign a substitute.`,
            type: "leave",
            priority: "high",
            link: `/admin/leave`,
            metadata: { leaveId: leave._id },
          }
        );

        // Real-time notify online admins
        admins.forEach((admin) => {
          try {
            sendNotificationToUser(admin._id.toString(), "notification", {
              title: "Substitute Assignment Required",
              message: `${
                employee?.name || "An employee"
              } has an approved leave. Please assign a substitute.`,
              type: "leave",
              priority: "high",
              link: `/admin/leave`,
              createdAt: new Date(),
              metadata: { leaveId: leave._id },
            });
          } catch (socketErr) {
            // ignore socket errors
          }
        });
      }
    } catch (notifyErr) {
      console.warn(
        "Non-fatal: admin notification for substitute assignment failed:",
        notifyErr && notifyErr.message ? notifyErr.message : notifyErr
      );
    }
  } catch (enqueueErr) {
    console.error(
      "Failed to enqueue substitute analysis job:",
      enqueueErr && enqueueErr.message ? enqueueErr.message : enqueueErr
    );
  }

  await leave.save();

  // Save only the leaveBalance field without the populated shift
  if (employee.isModified("leaveBalance")) {
    await Employee.findByIdAndUpdate(employee._id, {
      leaveBalance: employee.leaveBalance,
    });
  }

  await createUpdate({
    employee: leave.employee._id,
    status: leave.status,
    type: `Leave - ${leave.leaveType?.name || leave.leaveType}`,
    remarks: leave.remarks || "--",
  });

  // Send notification with email using new service
  const empData = await Employee.findById(leave.employee._id);
  if (empData) {
    sendFullNotification({
      employee: empData,
      title: "Leave Application Approved",
      message: `Your ${
        leave.leaveType?.name || "leave"
      } application has been approved. ${subsMsg}.`,
      type: "leave",
      priority: "high",
      link: "/leave",
      emailSubject: "Leave Application Approved",
      emailTemplate: "leaveApproved",
      emailData: {
        leaveType: leave.leaveType?.name || "Leave",
        fromDate: formatDate(leave.fromDate),
        toDate: formatDate(leave.toDate),
        duration: leave.duration,
        approverName: "HR Department",
      },
    }).catch((e) =>
      console.warn(
        "Non-fatal: leave approval notification failed:",
        e && e.message ? e.message : e
      )
    );
  }

  myCache.del("insights");

  return {
    success: true,
    message: `Leave approved successfully - ${subsMsg}`,
    leave,
  };
};

const respondLeave = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { remarks, status } = req.body;

  // Don't populate employee in the initial fetch to avoid nested save issues
  const leave = await Leave.findById(id).populate("leaveType", "name");

  if (!leave) throw new Error("Leave not found");

  if (leave.status === "Rejected") throw new Error("Leave already rejected");

  if (!status) throw new Error("Leave status is required");

  // Fetch employee separately for both approve and reject
  const employee = await Employee.findById(leave.employee)
    .populate("department")
    .populate("shift");

  if (!employee) throw new Error("Employee not found");

  // Manually set employee data on leave for response functions
  leave.employee = {
    _id: employee._id,
    name: employee.name,
    email: employee.email,
  };

  if (status === "Rejected") {
    const result = await rejectLeave(leave, remarks);
    return res.status(200).json(result);
  }

  if (status === "Approved") {
    const result = await approveLeave(leave, employee);
    return res.status(200).json(result);
  }
});

const assignSustitute = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { employee } = req.body;

  if (!employee) throw new Error("Substitue required");

  const leave = await Leave.findById(id);
  const substitute = await Employee.findById(employee);

  const isOnLeave = await Leave.findOne({
    employee: substitute._id,
    status: "Approved",
    fromDate: { $lte: leave.toDate },
    toDate: { $gte: leave.fromDate },
  });

  if (isOnLeave)
    throw new Error("Substitute employee is on leave during this period");

  const updatedLeave = await Leave.findByIdAndUpdate(
    id,
    { substitute: employee },
    { new: true }
  )
    .populate({
      path: "employee",
      select: "name employeeId department role shift",
      populate: [
        {
          path: "department",
          select: "name",
        },
        {
          path: "role",
          select: "name",
        },
      ],
    })
    .populate("substitute", "name");

  await notifySubstituteEmployee({
    email: substitute.email,
    duration: leave.duration,
    subsName: substitute.name,
    toDate: formatDate(leave.toDate),
    name: updatedLeave.employee.name,
    shift: updatedLeave.employee.shift,
    fromDate: formatDate(leave.fromDate),
    department: updatedLeave.employee.department.name,
  });

  myCache.del("insights");

  return res.status(201).json({
    success: true,
    message: "Leave applied successfully",
    leave: updatedLeave,
  });
});

const deleteLeave = async (employee) => {
  if (!employee) throw new Error("Please provide employee Id");

  const leave = await Leave.deleteOne({ employee });

  if (leave.deletedCount) return;

  return "Leave deleted successfuly";
};

async function getEmployeeLeaveStatus(employeeId, date = new Date()) {
  const activeLeave = await Leave.findOne({
    employee: employeeId,
    status: "Approved",
    fromDate: { $lte: date },
    toDate: { $gte: date },
  });

  return activeLeave ? "On Leave" : "Active";
}

export {
  getLeaves,
  applyLeave,
  deleteLeave,
  respondLeave,
  assignSustitute,
  getEmployeesOnLeave,
  getEmployeeLeaveStatus,
  getMyLeaves,
};
