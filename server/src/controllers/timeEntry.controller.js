import { catchErrors, myCache } from "../utils/index.js";
import TimeEntry from "../models/timeEntry.model.js";
import Employee from "../models/employee.model.js";
import { sendFullNotification } from "../services/notification.service.js";

const clockIn = catchErrors(async (req, res) => {
  const employeeId = req.employee._id;
  const { project, task, notes } = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already clocked in today
  const existingEntry = await TimeEntry.findOne({
    employee: employeeId,
    date: { $gte: today },
    clockOut: null,
  });

  if (existingEntry) {
    throw new Error("Already clocked in. Please clock out first.");
  }

  const timeEntry = await TimeEntry.create({
    employee: employeeId,
    date: new Date(),
    clockIn: new Date(),
    project: project || "",
    task: task || "",
    notes: notes || "",
  });

  const populated = await TimeEntry.findById(timeEntry._id).populate(
    "employee",
    "name employeeId"
  );

  myCache.del(`timeEntries-${employeeId}`);

  // Notify admins that an employee has clocked in
  try {
    const admins = await Employee.find({ admin: true }).select(
      "_id name email"
    );
    if (admins && admins.length > 0) {
      const notifyPromises = admins.map((admin) =>
        sendFullNotification({
          employee: admin,
          title: `Employee Clocked In: ${populated.employee.name}`,
          message: `${populated.employee.name} has clocked in at ${new Date(
            populated.clockIn
          ).toLocaleTimeString()}.`,
          type: "general",
          priority: "low",
          link: "/time-tracking",
          metadata: { timeEntryId: populated._id },
        }).catch((e) => {
          // log and continue
          console.warn("Failed to notify admin:", admin._id, e?.message || e);
        })
      );

      await Promise.allSettled(notifyPromises);
    }
  } catch (notifyErr) {
    console.warn(
      "Admin notification error (non-fatal):",
      notifyErr.message || notifyErr
    );
  }

  return res.status(201).json({
    success: true,
    message: "Clocked in successfully",
    timeEntry: populated,
  });
});

const clockOut = catchErrors(async (req, res) => {
  const employeeId = req.employee._id;
  const { notes } = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find active clock-in for today
  const timeEntry = await TimeEntry.findOne({
    employee: employeeId,
    date: { $gte: today },
    clockOut: null,
  });

  if (!timeEntry) {
    throw new Error("No active clock-in found. Please clock in first.");
  }

  timeEntry.clockOut = new Date();
  if (notes) timeEntry.notes = notes;
  await timeEntry.save(); // This triggers the pre-save hook to calculate hours

  const populated = await TimeEntry.findById(timeEntry._id).populate(
    "employee",
    "name employeeId"
  );

  myCache.del(`timeEntries-${employeeId}`);

  return res.status(200).json({
    success: true,
    message: "Clocked out successfully",
    timeEntry: populated,
  });
});

const startBreak = catchErrors(async (req, res) => {
  const employeeId = req.employee._id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find active clock-in for today
  const timeEntry = await TimeEntry.findOne({
    employee: employeeId,
    date: { $gte: today },
    clockOut: null,
  });

  if (!timeEntry) {
    throw new Error("No active clock-in found. Please clock in first.");
  }

  // Check if there's an active break
  const activeBreak = timeEntry.breaks.find((b) => !b.endTime);
  if (activeBreak) {
    throw new Error("Break already started. Please end current break first.");
  }

  timeEntry.breaks.push({
    startTime: new Date(),
  });

  await timeEntry.save();

  return res.status(200).json({
    success: true,
    message: "Break started",
    timeEntry,
  });
});

const endBreak = catchErrors(async (req, res) => {
  const employeeId = req.employee._id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find active clock-in for today
  const timeEntry = await TimeEntry.findOne({
    employee: employeeId,
    date: { $gte: today },
    clockOut: null,
  });

  if (!timeEntry) {
    throw new Error("No active clock-in found.");
  }

  // Find active break
  const activeBreak = timeEntry.breaks.find((b) => !b.endTime);
  if (!activeBreak) {
    throw new Error("No active break found.");
  }

  activeBreak.endTime = new Date();
  await timeEntry.save();

  return res.status(200).json({
    success: true,
    message: "Break ended",
    timeEntry,
  });
});

const getMyTimeEntries = catchErrors(async (req, res) => {
  const employeeId = req.employee._id;
  const { startDate, endDate, status } = req.query;

  const query = { employee: employeeId };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (status) {
    query.status = status;
  }

  const timeEntries = await TimeEntry.find(query).sort({ date: -1 }).lean();

  return res.status(200).json({
    success: true,
    message: "Time entries fetched successfully",
    timeEntries,
  });
});

const getAllTimeEntries = catchErrors(async (req, res) => {
  const { employee, startDate, endDate, status } = req.query;

  const query = {};

  if (employee) query.employee = employee;

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (status) {
    query.status = status;
  }

  const timeEntries = await TimeEntry.find(query)
    .populate("employee", "name employeeId")
    .populate("approvedBy", "name")
    .sort({ date: -1 })
    .lean();

  return res.status(200).json({
    success: true,
    message: "Time entries fetched successfully",
    timeEntries,
  });
});

const getTimeEntryById = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Time entry ID is required");

  const timeEntry = await TimeEntry.findById(id)
    .populate("employee", "name employeeId email")
    .populate("approvedBy", "name");

  if (!timeEntry) throw new Error("Time entry not found");

  return res.status(200).json({
    success: true,
    message: "Time entry fetched successfully",
    timeEntry,
  });
});

const updateTimeEntry = catchErrors(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) throw new Error("Time entry ID is required");

  if (updateData.date) updateData.date = new Date(updateData.date);
  if (updateData.clockIn) updateData.clockIn = new Date(updateData.clockIn);
  if (updateData.clockOut) updateData.clockOut = new Date(updateData.clockOut);

  const timeEntry = await TimeEntry.findByIdAndUpdate(id, updateData, {
    new: true,
  })
    .populate("employee", "name employeeId")
    .populate("approvedBy", "name");

  if (!timeEntry) throw new Error("Time entry not found");

  myCache.del(`timeEntries-${timeEntry.employee._id}`);

  return res.status(200).json({
    success: true,
    message: "Time entry updated successfully",
    timeEntry,
  });
});

const approveTimeEntry = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const approvedBy = req.employee._id;

  if (!id) throw new Error("Time entry ID is required");
  if (!status || !["approved", "rejected"].includes(status)) {
    throw new Error("Valid status (approved/rejected) is required");
  }

  const timeEntry = await TimeEntry.findByIdAndUpdate(
    id,
    {
      status,
      approvedBy,
      approvedAt: new Date(),
    },
    { new: true }
  )
    .populate("employee", "name email")
    .populate("approvedBy", "name");

  if (!timeEntry) throw new Error("Time entry not found");

  // Send notification to employee
  const emp = await Employee.findById(timeEntry.employee._id);
  if (emp) {
    await sendFullNotification({
      employee: emp,
      title: `Timesheet ${status === "approved" ? "Approved" : "Rejected"}`,
      message: `Your timesheet for ${new Date(
        timeEntry.date
      ).toLocaleDateString()} has been ${status}.`,
      type: "general",
      priority: "medium",
      link: "/time-tracking",
      metadata: { timeEntryId: timeEntry._id },
    });
  }

  myCache.del(`timeEntries-${timeEntry.employee._id}`);

  return res.status(200).json({
    success: true,
    message: `Time entry ${status} successfully`,
    timeEntry,
  });
});

const deleteTimeEntry = catchErrors(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new Error("Time entry ID is required");

  const timeEntry = await TimeEntry.findByIdAndDelete(id);
  if (!timeEntry) throw new Error("Time entry not found");

  myCache.del(`timeEntries-${timeEntry.employee}`);

  return res.status(200).json({
    success: true,
    message: "Time entry deleted successfully",
  });
});

const getActiveClockIn = catchErrors(async (req, res) => {
  const employeeId = req.employee._id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const timeEntry = await TimeEntry.findOne({
    employee: employeeId,
    date: { $gte: today },
    clockOut: null,
  }).populate("employee", "name employeeId");

  return res.status(200).json({
    success: true,
    message: timeEntry ? "Active clock-in found" : "No active clock-in",
    timeEntry: timeEntry || null,
    isActive: !!timeEntry,
  });
});

export {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getMyTimeEntries,
  getAllTimeEntries,
  getTimeEntryById,
  updateTimeEntry,
  approveTimeEntry,
  deleteTimeEntry,
  getActiveClockIn,
};
